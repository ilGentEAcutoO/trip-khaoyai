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

// Best-effort per-isolate rate limit for /api/photo (each isolate keeps its
// own counters; use the Cloudflare Rate Limiting API for exact global limits).
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60;
const rateHits = new Map();

function rateLimitRemaining(ip) {
  const now = Date.now();
  let e = rateHits.get(ip);
  if (!e || now >= e.reset) {
    e = { count: 0, reset: now + RATE_WINDOW_MS };
    rateHits.set(ip, e);
  }
  e.count += 1;
  if (rateHits.size > 5000 && Math.random() < 0.01) {
    for (const [k, v] of rateHits) if (now >= v.reset) rateHits.delete(k);
  }
  return e.count > RATE_MAX ? Math.max(1, Math.ceil((e.reset - now) / 1000)) : 0;
}

// CSP allowlist mirrors the page's real third parties: unpkg (leaflet,
// lottie), Google Fonts, Wikimedia/Unsplash/YouTube thumbs, ArcGIS tiles,
// OSRM routing, youtube-nocookie embeds. script-src-attr is left
// 'unsafe-inline' only because <img onerror="imgFallback(this)"> handlers are
// used throughout; no inline <script> blocks exist.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com",
  "script-src-attr 'unsafe-inline'",
  "style-src 'self' https://fonts.googleapis.com https://unpkg.com 'unsafe-inline'",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://thumb.wikimedia.org https://images.unsplash.com https://i.ytimg.com https://server.arcgisonline.com",
  "connect-src 'self' https://router.project-osrm.org",
  "frame-src https://www.youtube-nocookie.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

function secure(res) {
  const headers = new Headers(res.headers);
  headers.set("content-security-policy", CSP);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(self)");
  return new Response(res.body, { status: res.status, headers });
}

function json(status, obj, extra) {
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" };
  if (extra) for (const [k, v] of Object.entries(extra)) headers[k] = v;
  return secure(
    new Response(JSON.stringify(obj), { status, headers })
  );
}

async function photo(request, env, ctx) {
  const url = new URL(request.url);
  const retryAfter = rateLimitRemaining(request.headers.get("cf-connecting-ip") || "unknown");
  if (retryAfter) {
    return json(429, { error: "rate limited" }, { "retry-after": String(retryAfter) });
  }
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
  if (hit) return secure(hit);

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
  return secure(out);
}

function noIndex(res) {
  const headers = new Headers(res.headers);
  headers.set("x-robots-tag", "noindex, nofollow");
  return secure(new Response(res.body, { status: res.status, headers }));
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
