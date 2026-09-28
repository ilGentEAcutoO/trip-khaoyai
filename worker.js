// trip-khaoyai Worker: cached Google Places photo proxy + static assets.
//
// GET /api/photo?ref=<places photo name>&w=<width> → photo bytes from Google,
// cached at the edge for 30 days (each unique photo hits Google ~once/month,
// keeping usage inside the Places Photos free tier).
// Every other path → static files from ./public via the ASSETS binding.
"use strict";

const GOOGLE_MEDIA = "https://places.googleapis.com/v1";
const REF_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;
const CACHE_TTL = 2592000; // 30 days

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}

async function photo(request, env, ctx) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") ?? "";
  const w = Math.min(1600, Math.max(100, Number(url.searchParams.get("w")) || 800));
  if (!REF_RE.test(ref)) return json(400, { error: "bad ref" });
  if (!env.GOOGLE_PLACES_API_KEY) {
    console.error(JSON.stringify({ message: "missing secret GOOGLE_PLACES_API_KEY", route: "/api/photo" }));
    return json(500, { error: "server misconfigured" });
  }
  const cache = caches.default;
  const cacheKey = new Request(`https://trip-photos.local/${encodeURIComponent(ref)}?w=${w}`);
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  let res;
  try {
    res = await fetch(`${GOOGLE_MEDIA}/${ref}/media?maxWidthPx=${w}&key=${encodeURIComponent(env.GOOGLE_PLACES_API_KEY)}`, {
      redirect: "follow",
    });
  } catch (e) {
    console.error(JSON.stringify({ message: "upstream fetch failed", error: String(e) }));
    return json(502, { error: "photo upstream unreachable" });
  }
  if (!res.ok) {
    console.error(JSON.stringify({ message: "upstream photo error", status: res.status }));
    return json(502, { error: "photo unavailable" });
  }
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    console.error(JSON.stringify({ message: "unexpected content-type", type }));
    return json(502, { error: "photo unavailable" });
  }
  // Stream bytes straight through (no buffering); cache a clone in background.
  const headers = new Headers(res.headers);
  headers.set("cache-control", `public, max-age=${CACHE_TTL}`);
  headers.set("x-robots-tag", "noindex, nofollow");
  const out = new Response(res.body, { status: 200, headers });
  ctx.waitUntil(cache.put(cacheKey, out.clone()));
  console.log(JSON.stringify({ message: "photo cached", w }));
  return out;
}

function noIndex(res) {
  const headers = new Headers(res.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(res.body, { status: res.status, headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/photo") {
      return photo(request, env, ctx);
    }
    return noIndex(await env.ASSETS.fetch(request));
  },
};
