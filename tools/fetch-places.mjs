#!/usr/bin/env node
// One-time resolver: trip stop -> Google place_id + photo refs.
// Quota cost (one run): ~10 searchText IDs-only (unlimited free)
// + ~10-15 Place Details (free tier: Essentials 10k/mo, Photos 1k/mo).
// Fetches ZERO photo bytes — photos load later via the cached Worker proxy.
// Run: node tools/fetch-places.mjs
import { readFileSync, writeFileSync } from "node:fs";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
const KEY = (envText.match(/^GOOGLE_PLACES_API_KEY=(.*)$/m)?.[1] ?? "").trim();
if (!KEY) {
  console.error("missing GOOGLE_PLACES_API_KEY in .env");
  process.exit(1);
}

// key = id used in app.js, q = Thai search query, lat/lng = expected coords
const STOPS = [
  { key: "kung", q: "วิชชากุ้งสด หนองแค สระบุรี", lat: 14.5238782, lng: 100.9143731 },
  { key: "ptt-saraburi", q: "PTT Station สระบุรี", lat: 14.553813, lng: 100.966116 },
  { key: "krua", q: "ครัวบ้านเราเอง เขาใหญ่", lat: 14.545422, lng: 101.4098583 },
  { key: "haew", q: "น้ำตกเหวสุวัต เขาใหญ่", lat: 14.4347, lng: 101.5025 },
  { key: "everest", q: "The Everest Pool Villa Khaoyai", lat: 14.5463323, lng: 101.5186437 },
  // NOTE: no ptt-khaoyai — Nearby Search found zero gas stations within 2km
  // of the plan pin (14.5127,101.3752), so that stop keeps stock fallback images.
  { key: "bucolic", q: "BUCOLIC Khaoyai", lat: 14.5136365, lng: 101.4499219 },
  { key: "chokchai", q: "ฟาร์มโชคชัย ปากช่อง", lat: 14.6547661, lng: 101.3485289 },
  { key: "suwan", q: "ไร่สุวรรณวาจกกสิกิจ ปากช่อง", lat: 14.6527316, lng: 101.3112606 },
  { key: "oeimi", q: "Oeimi Cafe สระบุรี", lat: 14.4270971, lng: 100.9169681 },
  { key: "ptt-charge", q: "PTT Charging Station", lat: 14.5127829, lng: 101.3752009 },
  { key: "ptt-station", q: "สถานีบริการน้ำมันปตท. เขาใหญ่สเตชั่น", lat: 14.6113092, lng: 101.4041536 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function haversine(a, b) {
  const R = 6371000, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function searchIds(q, lat, lng) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "places.id", // IDs-only = unlimited free
    },
    body: JSON.stringify({
      textQuery: q,
      languageCode: "th",
      maxResultCount: 5,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 3000 } },
    }),
  });
  if (!res.ok) throw new Error(`search ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  return (j.places ?? []).map((p) => p.id).filter(Boolean);
}

async function details(id) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${id}`, {
    headers: {
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location,types,photos",
      "Accept-Language": "th",
    },
  });
  if (!res.ok) throw new Error(`details ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const out = {};
let apiCalls = 0;

for (const s of STOPS) {
  const ids = await searchIds(s.q, s.lat, s.lng);
  apiCalls++;
  await sleep(250);
  if (!ids.length) {
    console.log(`[MISS] ${s.key}: no results for "${s.q}"`);
    out[s.key] = null;
    continue;
  }
  const candidates = [];
  for (const id of ids.slice(0, 3)) {
    const d = await details(id);
    apiCalls++;
    await sleep(250);
    const loc = d.location ?? {};
    const dist = loc.latitude != null
      ? haversine({ lat: s.lat, lng: s.lng }, { lat: loc.latitude, lng: loc.longitude })
      : Infinity;
    candidates.push({ d, dist });
    if (dist <= 3000) break; // good enough, stop spending calls
  }
  candidates.sort((a, b) => a.dist - b.dist);
  const { d, dist } = candidates[0];
  const photos = (d.photos ?? [])
    .map((p) => ({
      ref: p.name,
      w: p.widthPx ?? 0,
      h: p.heightPx ?? 0,
      credit: p.authorAttributions?.[0]?.displayName ?? "Google Maps",
    }))
    .sort((a, b) => Number(b.w >= b.h) - Number(a.w >= a.h) || b.w * b.h - a.w * a.h)
    .slice(0, 10); // NOTE: keep 10 candidates; public/places.json is manually curated
                   // down to verified-good photos afterward (re-running overwrites curation).
  out[s.key] = {
    placeId: d.id,
    name: d.displayName?.text ?? "",
    address: d.formattedAddress ?? "",
    types: d.types ?? [],
    distM: Math.round(dist),
    photos,
  };
  const flag = dist > 3000 ? "⚠ FAR" : photos.length === 0 ? "⚠ NO_PHOTO" : "ok";
  console.log(
    `[${flag}] ${s.key}: ${out[s.key].name} | ${out[s.key].address} | ${Math.round(dist)}m | ${photos.length} photos`
  );
}

writeFileSync(
  new URL("../public/places.json", import.meta.url),
  JSON.stringify({ generated: new Date().toISOString(), places: out }, null, 2) + "\n"
);
console.log(`\nwrote public/places.json · total API calls this run: ${apiCalls} (all within free tier)`);
