/* ═══════════ เที่ยวใหญ่หนีน้ำท่วม · trip data + app ═══════════ */
"use strict";

/* ---------- Image fallback: crafted SVG placeholder (never a broken img) ---------- */
const FALLBACK_IMG = "data:image/svg+xml," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs>` +
  `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcebe1"/><stop offset="1" stop-color="#9dbfa9"/></linearGradient></defs>` +
  `<rect width="800" height="600" fill="url(#g)"/>` +
  `<path d="M0 440 140 300l110 90 120-160 130 170 110-110 120 130 70-60v240H0V440Z" fill="#123f31" opacity=".55"/>` +
  `<path d="M0 500 160 380l130 100 140-140 150 150 120-90 100 80v120H0V500Z" fill="#123f31" opacity=".75"/>` +
  `<circle cx="620" cy="140" r="52" fill="#dd7f2a" opacity=".85"/></svg>`
);
window.imgFallback = function (el) {
  el.onerror = null;
  el.src = FALLBACK_IMG;
};

/* ---------- Kind metadata (SVG icons, stroke style) ---------- */
const SW = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const ICONS = {
  start: `<svg viewBox="0 0 24 24" ${SW}><path d="M5 21V4m0 1h12l-2.5 4L17 13H5"/></svg>`,
  food: `<svg viewBox="0 0 24 24" ${SW}><path d="M7 2v20M4 2v7a3 3 0 0 0 6 0V2M7 15v7M17 2c-2 2-2.5 5-2.5 8.5S15.5 17 17 17v5m0-20v20M17 2c2 2 2.5 5 2.5 8.5S18.5 17 17 17"/></svg>`,
  ev: `<svg viewBox="0 0 24 24" ${SW}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>`,
  nature: `<svg viewBox="0 0 24 24" ${SW}><path d="M2 16c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 20c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M12 3c3 4 6 6 6 9H6c0-3 3-5 6-9Z"/></svg>`,
  stay: `<svg viewBox="0 0 24 24" ${SW}><path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 18h18M3 18v2m18-2v2M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>`,
  shop: `<svg viewBox="0 0 24 24" ${SW}><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.5a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L21 7H6"/></svg>`,
  cafe: `<svg viewBox="0 0 24 24" ${SW}><path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9ZM16 10h2a3 3 0 0 1 0 6h-2M7 3.5c0 1-1 1-1 2m4-2c0 1-1 1-1 2"/></svg>`,
  farm: `<svg viewBox="0 0 24 24" ${SW}><path d="M12 21v-8m0 0c0-4 3-7 9-7 0 4-3 7-9 7Zm0 0c0-4-3-7-9-7 0 4 3 7 9 7Z"/></svg>`,
  home: `<svg viewBox="0 0 24 24" ${SW}><path d="m3 11 9-8 9 8M5 9.5V21h14V9.5M10 21v-6h4v6"/></svg>`,
  car: `<svg viewBox="0 0 24 24" ${SW}><path d="M5 16 6.5 9.5A2 2 0 0 1 8.5 8h7a2 2 0 0 1 2 1.5L19 16M5 16h14M5 16v4m14-4v4M7 20v.01M17 20v.01"/></svg>`,
  nav: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 19 21l-7-4-7 4L12 2Z"/></svg>`,
  ext: `<svg viewBox="0 0 24 24" ${SW}><path d="M14 4h6v6M20 4 10 14M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/></svg>`,
};
const KIND_LABEL = { start: "ออกเดินทาง", food: "อาหาร", ev: "ชาร์จ EV", nature: "ธรรมชาติ", stay: "ที่พัก", shop: "แวะซื้อของ", cafe: "คาเฟ่", farm: "ฟาร์ม", home: "บ้าน" };
const KIND_TONE = { start: "kind-pine", food: "kind-amber", ev: "kind-sky", nature: "kind-pine", stay: "kind-amber", shop: "kind-gray", cafe: "kind-amber", farm: "kind-pine", home: "kind-pine" };

/* ---------- Trip data (coords from the plan's Google Maps links) ---------- */
const U = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=70&auto=format&fit=crop`;
const TRIP = [
  {
    day: 1, tone: "pine", title: "วันที่ 1 · ขาขึ้นเขาใหญ่", dateLabel: "เสาร์ 3 ต.ค. 2569",
    stops: [
      { t: "07:00", name: "ออกเดินทางจากบ้าน", sub: "เสนาพาร์ควิลล์ 2 · รามอินทรา–วงแหวน", kind: "start", g: "home", cover: 0, lat: 13.8424291, lng: 100.6847826, gmaps: "https://maps.app.goo.gl/Gk5FgNytaZQneTTD9", ph: [], desc: "ล้อหมุนแต่เช้า ใช้ทางด่วน–มอเตอร์เวย์มุ่งหน้าสระบุรี แวะกินกุ้งสดก่อนขึ้นเขา" },
      { t: "08:30", name: "วิชชากุ้งสด", g: "kung", sub: "ร้านขายกุ้งสด · หนองแค สระบุรี", kind: "shop", lat: 14.5238782, lng: 100.9143731, gmaps: "https://maps.app.goo.gl/TKBueBFkjfHrsPnA6", ph: [], desc: "ร้านขายกุ้งสด แวะซื้อกุ้งเป็น ๆ ติดรถไปเผากินเองที่วิลล่าตอนเย็น" },
      { t: "09:05", name: "ปตท. อีวีฮับ", g: "ptt-saraburi", sub: "ปตท.สระบุรี (น้ำมัน + EV Hub)", kind: "ev", lat: 14.553813, lng: 100.966116, gmaps: "https://maps.app.goo.gl/bPBvQ5HUsZjpwNNw8", ph: [], desc: "เสียบชาร์จ + เข้าห้องน้ำ + ซื้อกาแฟตุนก่อนขึ้นเขา ไฟเต็มแล้วเที่ยวสบาย" },
      { t: "10:40", name: "ครัวบ้านเราเอง เขาใหญ่", g: "krua", sub: "ร้านอาหารไทยบรรยากาศบ้าน ๆ", kind: "food", lat: 14.545422, lng: 101.4098583, gmaps: "https://maps.app.goo.gl/tqA8Eg5ExhYhvKrX8", ph: [], vids: ["y2rak8xoSHw", "bRiO-SOFq9o"],
        desc: "มื้อเที่ยงร้านหลักบนเขา กับข้าวรสไทยแท้ กินอิ่มแล้วค่อยไปน้ำตก",
        alt: { name: "ครัวน้ำปลาพริก เขาใหญ่", lat: 14.5638274, lng: 101.4058294, gmaps: "https://maps.app.goo.gl/4jKjARD2vo3ipkVX8", img: "https://i.ytimg.com/vi/9-Cg7FTdY2w/maxresdefault.jpg" } },
      { t: "12:40", name: "น้ำตกเหวสุวัต", g: "haew", sub: "อุทยานแห่งชาติเขาใหญ่", kind: "nature", lat: 14.4356293, lng: 101.4141619, gmaps: "https://www.google.com/maps/search/?api=1&query=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%95%E0%B8%81%E0%B9%80%E0%B8%AB%E0%B8%A7%E0%B8%AA%E0%B8%B8%E0%B8%A7%E0%B8%B1%E0%B8%95", ph: [],
        real: [{ u: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Haew_Suwat_%28I%29.jpg/960px-Haew_Suwat_%28I%29.jpg", c: "Wikimedia" }, { u: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Haew_suwat_waterfall.jpg/960px-Haew_suwat_waterfall.jpg", c: "Wikimedia" }, { u: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5d/Haew_Suwat_Waterfall_Through_the_Forest_Arch.jpg/960px-Haew_Suwat_Waterfall_Through_the_Forest_Arch.jpg", c: "Wikimedia" }, { u: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Haew_Suwat_Waterfall.jpg/960px-Haew_Suwat_Waterfall.jpg", c: "Wikimedia" }, { u: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Nam_Tok_Heo_Suwat.jpg/960px-Nam_Tok_Heo_Suwat.jpg", c: "Wikimedia" }, { u: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Khao_Yai%2C_Thailand%2C_Haew_Suwat_Waterfall%2C_Top.jpg/960px-Khao_Yai%2C_Thailand%2C_Haew_Suwat_Waterfall%2C_Top.jpg", c: "Wikimedia" }],
        desc: "น้ำตกชื่อดังกลางป่ามรดกโลก หน้าฝนน้ำเยอะ ถ่ายรูปสวย อย่าลืมรองเท้ากันลื่น" },
      { t: "14:50", name: "เข้าที่พัก", g: "everest", sub: "The Everest Pool Villa Khaoyai", kind: "stay", lat: 14.5463323, lng: 101.5186437, gmaps: "https://maps.app.goo.gl/76wVCZj7QETAhy48A", ph: [],
        desc: "เช็กอินพูลวิลล่า พักผ่อน เล่นน้ำ ดูวิวเขายามเย็น" },
      { t: "15:50", name: "แวะซื้อของ", g: "ptt-klongduea", sub: "PTT คลองเดื่อ · 7-Eleven + Café Amazon ใกล้ที่พัก", kind: "shop", lat: 14.5172835, lng: 101.4395904, gmaps: "https://www.google.com/maps/search/?api=1&query=14.5172835,101.4395904", ph: [], desc: "ตุนเสบียงมื้อเย็น–มื้อเช้า ขนม เครื่องดื่ม ที่ปั๊มก่อนกลับวิลล่า" },
      { t: "สำรอง", name: "จุดเติมแบตสำรอง", g: "ptt-charge", sub: "PTT Charging Station เขาใหญ่", kind: "ev", backup: true, lat: 14.5127829, lng: 101.3752009, gmaps: "https://maps.app.goo.gl/GtmAPYmjLGCSAtUz5", ph: [], desc: "จุดชาร์จสำรองของวันที่ 1 แบตเหลือน้อยแวะได้ตลอด ไม่ต้องรอตามเวลา" },
      { t: "สำรอง", name: "Take Me Home Park Khaoyai", g: "takemehome", sub: "คาเฟ่เครื่องบินกลางทุ่งดอกไม้ · ขนงพระ", kind: "nature", backup: true, lat: 14.6530812, lng: 101.4671596, gmaps: "https://maps.app.goo.gl/hVLY3vY1etyEJjku5", ph: [], vids: ["C9tGhhDclbI", "fuP7z3C4r4s"], desc: "เครื่องบินลำยักษ์กลางทุ่งดอกไม้ มีทั้งคาเฟ่และมุมถ่ายรูปเพียบ แวะวันไหนก็ได้ถ้ามีเวลาเหลือ" },
      { t: "สำรอง", name: "ดง เฮ้าส์ เขาใหญ่", g: "donghouse", sub: "คาเฟ่วิว 360° บนเนิน · วังกะทะ", kind: "cafe", backup: true, lat: 14.537488, lng: 101.6751633, gmaps: "https://maps.app.goo.gl/2S3ahtaCdxCAkHT47", ph: [], vids: ["DulUYYzbTdk", "nL2p8-y14aQ"], desc: "คาเฟ่มินิมอลบนเนินเขา วิวรอบด้าน พาหมาแมวมาได้ด้วย มีค่าเข้าชมแลกเครื่องดื่มได้ ทางเข้าลึกเผื่อเวลาหน่อย" },
    ],
  },
  {
    day: 2, tone: "amber", title: "วันที่ 2 · เที่ยวขากลับ", dateLabel: "อาทิตย์ 4 ต.ค. 2569",
    stops: [
      { t: "สำรอง", name: "จุดเติมแบตสำรอง", g: "ptt-station", sub: "ปตท. เขาใหญ่สเตชั่น", kind: "ev", backup: true, lat: 14.6113092, lng: 101.4041536, gmaps: "https://maps.app.goo.gl/svK9xb9AAEJuxcXe6", ph: [], desc: "จุดชาร์จสำรองของวันที่ 2 อยู่เส้นปากช่อง–เขาใหญ่" },
      { t: "11:40", name: "ออกเดินทาง", g: "everest", sub: "เช็กเอาต์จาก The Everest Pool Villa", kind: "start", lat: 14.5463323, lng: 101.5186437, gmaps: "https://maps.app.goo.gl/76wVCZj7QETAhy48A", ph: [], desc: "เช็กเอาต์เที่ยงวัน เริ่มทริปคาเฟ่–ฟาร์มขากลับ" },
      { t: "12:00", name: "BUCOLIC Khaoyai", g: "bucolic", sub: "คาเฟ่วิวทุ่ง near อุทยาน", kind: "cafe", lat: 14.5136365, lng: 101.4499219, gmaps: "https://maps.app.goo.gl/dkQbcCpzVGePJyo48", ph: [], vids: ["6vvXDBye7Fw", "Np5iR0-GLq8", "8ALyAdM0WgQ", "xo7kjb0leOE"],
        desc: "คาเฟ่บรรยากาศชนบท วิวทุ่งกว้าง กาแฟดี มุมถ่ายรูปเยอะ" },
      { t: "13:30", name: "ฟาร์มโชคชัย", g: "chokchai", sub: "ปากช่อง นครราชสีมา", kind: "farm", lat: 14.6547661, lng: 101.3485289, gmaps: "https://maps.app.goo.gl/ZKGZCahy6EgSE7Ss8", ph: [], vids: ["pOyu2UyrmdU", "B-Vy0aFyyf8", "RQe4_4-8fT0", "7rjdg_Ov7wg"],
        desc: "ฟาร์มโคนมชื่อดัง นั่งรถชมฟาร์ม ดูโชว์คาวบอย แวะซื้อของฝากนม–ไอศกรีม" },
      { t: "14:45", name: "ไร่สุวรรณวาจกกสิกิจ", g: "suwan", sub: "ปากช่อง นครราชสีมา", kind: "farm", lat: 14.6527316, lng: 101.3112606, gmaps: "https://maps.app.goo.gl/W6AN7Dwc1PstZQt19", ph: [], vids: ["pC1s1Neh4Bo", "C8lJ7All4Fo"],
        desc: "ไร่บรรยากาศดี ชมวิวทุ่ง ถ่ายรูปชิล ๆ ก่อนลงจากเขา" },
      { t: "16:00", name: "Oeimi Café", g: "oeimi", sub: "คาเฟ่สระบุรี", kind: "cafe", lat: 14.4270971, lng: 100.9169681, gmaps: "https://maps.app.goo.gl/V2L14vFGPSLY4uof9", ph: [], vids: ["l0MCINM3myM", "9b5t1RLSXCQ", "rBD1iEWtmoY", "EiIFbvWpQac"],
        desc: "แวะคาเฟ่ย่านสระบุรี กาแฟแก้วสุดท้ายของทริปก่อนยิงยาวกลับบ้าน" },
      { t: "18:30", name: "ถึงบ้าน", sub: "เสนาพาร์ควิลล์ 2 · โดยสวัสดิภาพ", kind: "home", g: "home", cover: 3, lat: 13.8424291, lng: 100.6847826, gmaps: "https://maps.app.goo.gl/Gk5FgNytaZQneTTD9", ph: [], desc: "จบทริป 2 วัน 1 คืน ถึงบ้านราวหกโมงเย็น" },
    ],
  },
];

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const dirUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
const coverOf = (s) => { const gc = s.gphotos && (s.gphotos[s._coverIdx || 0] || s.gphotos[0]); return gc ? gc.u : (s.real && s.real[0] ? s.real[0].u : (s.ph[0] ? U(s.ph[0]) : FALLBACK_IMG)); };
const photoCount = (s) => (s.gphotos ? s.gphotos.length : 0) + (s.real ? s.real.length : 0) + s.ph.length;
const allPhotos = (s) => [...(s.gphotos || []), ...(s.real || []).map((r) => ({ u: r.u, c: r.c })), ...s.ph.map((id) => ({ u: U(id, 1000) }))];
const vidThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const vidEmbed = (id, auto, mute, controls) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=${auto ? 1 : 0}&mute=${mute ? 1 : 0}&loop=1&playlist=${id}&playsinline=1&controls=${controls ? 1 : 0}&rel=0`;
const effVids = (s) => s.vids || s.gvids || [];
const vidCount = (s) => effVids(s).length;
const mediaTxt = (s) => {
  const p = photoCount(s), v = vidCount(s);
  return [p ? p + " รูป" : "", v ? v + " คลิป" : ""].filter(Boolean).join(" · ");
};
const allSlides = (s) => [...effVids(s).map((id) => ({ t: "v", id })), ...allPhotos(s).map((p) => ({ t: "p", ...p }))];
const facadeModalHTML = (id, name) => `<div class="vfacade-m" data-playvid="${id}" role="button" tabindex="0" aria-label="เล่นวิดีโอ${name}"><img src="${vidThumb(id)}" alt="วิดีโอ${name}" loading="lazy" onerror="imgFallback(this)"><span class="vplay-big" aria-hidden="true"><svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span></div>`;
function stopModalVideos() {
  $$("#mTrack figure.m-slide iframe").forEach((fr) => {
    const fig = fr.closest("figure.m-slide");
    const id = fig && fig.dataset.vid;
    if (fig && id) fig.innerHTML = facadeModalHTML(id, fig.dataset.name || "");
  });
}
const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
function observeVideos() {
  const facades = $$(".tcard .vfacade[data-vid]");
  if (!facades.length || !("IntersectionObserver" in window) || reduceMotion) return;
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const f = e.target;
      io.unobserve(f);
      const fr = document.createElement("iframe");
      fr.src = vidEmbed(f.dataset.vid, 1, 1, 0);
      fr.title = "วิดีโอสถานที่";
      fr.allow = "autoplay; encrypted-media; picture-in-picture";
      fr.tabIndex = -1;
      f.replaceWith(fr);
    });
  }, { threshold: 0.35 });
  facades.forEach((f) => io.observe(f));
}

/* ---------- Shared place entities (one entity, reused across stops) ---------- */
let PLACES = {};
const D0 = [];
function entityPhotos(key) {
  const p = PLACES[key];
  if (!p || !p.photos || !p.photos.length) return [];
  return p.photos.map((ph) => ({
    u: `/api/photo?ref=${encodeURIComponent(ph.ref)}&w=1000`,
    c: `Google · ${ph.credit}`,
  }));
}
function entityVids(key) {
  const p = PLACES[key];
  if (!p || !p.videos || !p.videos.length) return [];
  return p.videos.map((v) => v.id);
}
/* Static cards (Day 0 timeline + overview Day 0 card) pull media from the
   same shared entities as TRIP stops — each usage picks its own slice. */
function hydrateEntities() {
  $$("#timeline0 article.tcard[data-g]").forEach((card) => {
    const photos = entityPhotos(card.dataset.g);
    const vids = entityVids(card.dataset.g);
    if (!photos.length && !vids.length) return; // offline: stay text-only
    const li = card.closest("li");
    const pos = li && li.parentElement ? [...li.parentElement.children].indexOf(li) + 1 : 0;
    const h3 = $("h3", card), sub = $(".tcard-sub", card), tt = li ? li.querySelector(".ttime") : null;
    const s = {
      _n: String(pos), _coverIdx: card.dataset.cover != null ? +card.dataset.cover : 0,
      name: h3 ? h3.textContent.trim() : "",
      sub: sub ? sub.textContent.trim() : "", desc: card.dataset.desc || "",
      kind: card.dataset.kind || "shop", t: tt ? tt.textContent.trim() : "",
      lat: +card.dataset.lat, lng: +card.dataset.lng, gmaps: card.dataset.gmaps || "",
      ph: [], gphotos: photos, gvids: vids,
    };
    D0.push(s);
    card.dataset.d0 = String(D0.length - 1);
    const v = effVids(s);
    const cover = v.length
      ? `<div class="vfacade" data-vid="${v[0]}"><img src="${vidThumb(v[0])}" alt="วิดีโอ${s.name}" loading="lazy" onerror="imgFallback(this)"><span class="vplay" aria-hidden="true"><svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span></div>`
      : `<img src="${coverOf(s)}" alt="${s.name}" loading="lazy" onerror="imgFallback(this)">`;
    const mt = mediaTxt(s);
    $(".tcard-top", card).insertAdjacentHTML("afterbegin",
      `<div class="tcard-photo">${cover}<span class="tnum">${pos}</span>${mt ? `<span class="pht-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>${mt}</span>` : ""}</div>`);
  });
  $$("a.daycard[data-g]").forEach((card) => {
    const photos = entityPhotos(card.dataset.g);
    if (!photos.length) return;
    const img = photos[Number(card.dataset.cover || 0)] || photos[0];
    const box = $(".daycard-photo", card);
    if (box) box.innerHTML = `<img src="${img.u}" alt="วันที่ 0 · เตรียมแคมป์ที่บ้าน" loading="lazy" onerror="imgFallback(this)"><span class="daycard-tag">DAY 0</span>`;
  });
}

/* ---------- Google place photos (via cached /api/photo proxy) ---------- */
async function loadPlaces() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    let j;
    try {
      const res = await fetch("places.json", { signal: ctrl.signal });
      if (!res.ok) return;
      j = await res.json();
    } finally {
      clearTimeout(timer);
    }
    PLACES = j.places || {};
    TRIP.forEach((day) => day.stops.forEach((s) => {
      if (!s.g || !PLACES[s.g]) return;
      s.gphotos = entityPhotos(s.g);
      s.gvids = entityVids(s.g);
      if (s.cover != null) s._coverIdx = s.cover;
    }));
    hydrateEntities();
  } catch { /* keep curated fallback images */ }
}
const fmtKm = (m) => (m / 1000 >= 100 ? Math.round(m / 1000) : (m / 1000).toFixed(m / 1000 < 10 ? 1 : 0)) + " กม.";
const fmtClock = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(((m % 60) + 60) % 60).padStart(2, "0")}`;
const fmtMin = (s) => {
  const m = Math.round(s / 60);
  if (m < 60) return m + " นาที";
  const h = Math.floor(m / 60), r = m % 60;
  return h + " ชม." + (r ? " " + r + " นาที" : "");
};
function haversine(a, b) {
  const R = 6371000, t = Math.PI / 180;
  const dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  let el = $("#toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4200);
}

/* ---------- Timeline rendering ---------- */
function stopCard(di, day, stop, si, n) {
  const tone = day.tone, num = stop.backup ? "ส" : n, mt = mediaTxt(stop);
  const alt = stop.alt
    ? `<div class="altbox">${stop.alt.img ? `<img class="alt-thumb" src="${stop.alt.img}" alt="" loading="lazy" onerror="imgFallback(this)">` : ""}<span>หรือเลือกร้านสำรอง <strong>${stop.alt.name}</strong></span>
       <a class="abtn abtn-nav" style="background:var(--amber-700)" href="${dirUrl(stop.alt.lat, stop.alt.lng)}" target="_blank" rel="noopener">${ICONS.nav}นำทาง</a>
       <a class="abtn abtn-line" href="${stop.alt.gmaps}" target="_blank" rel="noopener">${ICONS.ext}Google Maps</a></div>`
    : "";
  return `
  <li class="tstep reveal" data-tone="${tone}" ${stop.backup ? 'data-kind="backup"' : ""}>
    <span class="ttime">${stop.t}${stop.t.includes(".") ? " น." : ""}<span class="tdwell" id="dwell-${di}-${si}"></span></span>
    <span class="trail" aria-hidden="true"><span class="tdot"></span></span>
    <article class="tcard" data-stop="${di}:${si}">
      <div class="tcard-top">
        <div class="tcard-photo">
          ${effVids(stop).length ? `<div class="vfacade" data-vid="${effVids(stop)[0]}"><img src="${vidThumb(effVids(stop)[0])}" alt="วิดีโอ${stop.name}" loading="lazy" onerror="imgFallback(this)"><span class="vplay" aria-hidden="true"><svg viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span></div>` : `<img src="${coverOf(stop)}" alt="${stop.name}" loading="lazy" onerror="imgFallback(this)">`}
          <span class="tnum">${num}</span>
          ${mt ? `<span class="pht-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>${mt}</span>` : ""}
        </div>
        <div class="tcard-body">
          <div class="tcard-kinds">
            <span class="kind ${KIND_TONE[stop.kind]}">${ICONS[stop.kind]}${KIND_LABEL[stop.kind]}</span>
            ${stop.backup ? '<span class="kind kind-gray">ไม่ตามเวลา · แวะเมื่อต้องการ</span>' : ""}
          </div>
          <h3>${stop.name}</h3>
          <p class="tcard-sub">${stop.sub}</p>
          <p class="tcard-desc">${stop.desc}</p>
          <div class="tcard-actions">
            <a class="abtn abtn-nav" href="${dirUrl(stop.lat, stop.lng)}" target="_blank" rel="noopener">${ICONS.nav}นำทาง</a>
            <a class="abtn abtn-line" href="${stop.gmaps}" target="_blank" rel="noopener">${ICONS.ext}Google Maps</a>
            <button class="abtn abtn-me" type="button" data-me="${stop.lat},${stop.lng}" data-name="${stop.name}">จากตำแหน่งฉัน</button>
          </div>
        </div>
      </div>
    </article>
    ${alt ? "" : ""}
  </li>${alt ? `<li class="tleg" data-tone="${tone}" aria-label="ตัวเลือกร้านสำรอง"><span></span><span class="trail"></span>${alt}</li>` : ""}`;
}
function legChip(dayIdx, legIdx) {
  const tone = TRIP[dayIdx].tone;
  return `<li class="tleg" data-tone="${tone}" aria-label="ช่วงขับรถ"><span></span><span class="trail"></span>
    <span class="legchip pending" id="leg-${dayIdx}-${legIdx}"><span class="spin"></span>กำลังคำนวณเส้นทาง…</span></li>`;
}
function renderTimelines() {
  TRIP.forEach((day, di) => {
    const ol = $(di === 0 ? "#timeline1" : "#timeline2");
    let html = "", n = 0;
    const mains = day.stops.filter((s) => !s.backup);
    day.stops.forEach((s, si) => {
      if (s.backup) {
        html += stopCard(di, day, s, si, 0);
        return;
      }
      n++;
      html += stopCard(di, day, s, si, n);
      if (n < mains.length) html += legChip(di, n - 1);
    });
    ol.innerHTML = html;
  });
  // main stop counts for map pins
  TRIP.forEach((d) => {
    let n = 0;
    d.stops.forEach((s) => { s._n = s.backup ? "ส" : String(++n); });
  });
  $("#statStops").textContent = TRIP.reduce((a, d) => a + d.stops.filter((s) => !s.backup).length, 0) + " จุด";
}

/* ---------- Gallery (overview tab) ---------- */
function renderGallery() {
  const g = $("#tripGallery");
  if (!g) return;
  g.innerHTML = TRIP.map((d, di) => d.stops.map((s, si) => `
    <button type="button" class="gcard reveal" data-stop="${di}:${si}" aria-label="ดูรายละเอียด${s.name}">
      <span class="g-img"><img src="${coverOf(s)}" alt="" loading="lazy" onerror="imgFallback(this)">
      <span class="g-day">วันที่ ${d.day}</span></span>
      <span class="g-cap"><b>${s.name}</b><i>${s.t === "สำรอง" ? "เวลาสำรอง" : s.t + " น."} · ${KIND_LABEL[s.kind]}${mediaTxt(s) ? ` · ${mediaTxt(s)}` : ""}</i></span>
    </button>`).join("")).join("");
}

/* ---------- Stop detail modal ---------- */
const ORDER = [];
TRIP.forEach((d, di) => d.stops.forEach((s, si) => ORDER.push([di, si])));
let mPhoto = 0, mTicking = false;
function fillModal(day, s) {
  mPhoto = 0;
  const track = $("#mTrack");
  const slides = allSlides(s);
  if (!slides.length) slides.push({ t: "p", u: FALLBACK_IMG });
  track.innerHTML = slides.map((sl, i) => sl.t === "v"
    ? `<figure class="m-slide" data-vid="${sl.id}" data-name="${s.name}">${facadeModalHTML(sl.id, s.name)}</figure>`
    : `<figure class="m-slide"><img src="${sl.u}" alt="${s.name} รูปที่ ${i + 1}"${i ? ' loading="lazy"' : ""} onerror="imgFallback(this)">${sl.c ? `<figcaption class="m-credit">${sl.c}</figcaption>` : ""}</figure>`).join("");
  track.scrollLeft = 0;
  $("#mThumbs").innerHTML = slides.map((sl, i) => sl.t === "v"
    ? `<button type="button" data-ph="${i}" class="${i ? "" : "on"}" aria-label="ดูคลิปที่ ${i + 1}"><img src="${vidThumb(sl.id)}" alt="" loading="lazy" onerror="imgFallback(this)"><span class="vtag">คลิป</span></button>`
    : `<button type="button" data-ph="${i}" class="${i ? "" : "on"}" aria-label="ดูรูปที่ ${i + 1}"><img src="${sl.u}" alt="" loading="lazy" onerror="imgFallback(this)"></button>`).join("");
  const tLabel = s.t === "สำรอง" ? "เวลาสำรอง" : /^\d{1,2}:\d{2}$/.test(s.t || "") ? "เวลา " + s.t + " น." : (s.t || "");
  $("#mKinds").innerHTML = `<span class="kind ${KIND_TONE[s.kind]}">${ICONS[s.kind]}${KIND_LABEL[s.kind]}</span>`
    + (tLabel ? `<span class="kind kind-gray">วันที่ ${day.day} · ${tLabel}</span>` : `<span class="kind kind-gray">วันที่ ${day.day}</span>`);
  $("#mTitle").textContent = (s._n === "ส" ? "" : "จุดที่ " + s._n + " · ") + s.name;
  $("#mSub").textContent = s.sub;
  $("#mDesc").textContent = s.desc;
  const alt = $("#mAlt");
  if (s.alt) {
    alt.hidden = false;
    alt.innerHTML = `${s.alt.img ? `<img class="alt-thumb" src="${s.alt.img}" alt="" loading="lazy" onerror="imgFallback(this)">` : ""}<span>หรือเลือกร้านสำรอง <strong>${s.alt.name}</strong></span>`
      + `<a class="abtn abtn-nav" style="background:var(--amber-700)" href="${dirUrl(s.alt.lat, s.alt.lng)}" target="_blank" rel="noopener">${ICONS.nav}นำทาง</a>`
      + `<a class="abtn abtn-line" href="${s.alt.gmaps}" target="_blank" rel="noopener">${ICONS.ext}Google Maps</a>`;
  } else {
    alt.hidden = true;
    alt.innerHTML = "";
  }
  const nav = $("#mNav");
  nav.href = dirUrl(s.lat, s.lng);
  nav.innerHTML = `${ICONS.nav}นำทาง`;
  const gm = $("#mGmaps");
  gm.href = s.gmaps;
  gm.innerHTML = `${ICONS.ext}Google Maps`;
  const me = $("#mMe");
  me.dataset.me = `${s.lat},${s.lng}`;
  me.dataset.name = s.name;
}

function openStop(di, si) {
  const day = TRIP[di], s = day.stops[si];
  fillModal(day, s);
  const k = ORDER.findIndex(([a, b]) => a === di && b === si);
  const pv = ORDER[(k - 1 + ORDER.length) % ORDER.length], nx = ORDER[(k + 1) % ORDER.length];
  $("#mPrevStop").textContent = "← " + TRIP[pv[0]].stops[pv[1]].name;
  $("#mNextStop").textContent = TRIP[nx[0]].stops[nx[1]].name + " →";
  $("#mPrevStop").onclick = () => openStop(pv[0], pv[1]);
  $("#mNextStop").onclick = () => openStop(nx[0], nx[1]);
  showModal();
}
function openD0(i) {
  fillModal({ day: 0 }, D0[i]);
  const n = D0.length;
  $("#mPrevStop").textContent = "← " + D0[(i - 1 + n) % n].name;
  $("#mNextStop").textContent = D0[(i + 1) % n].name + " →";
  $("#mPrevStop").onclick = () => openD0((i - 1 + n) % n);
  $("#mNextStop").onclick = () => openD0((i + 1) % n);
  showModal();
}
function showModal() {
  mCount();
  const modal = $("#stopModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function mGo(i) {
  const track = $("#mTrack"), n = track.children.length || 1;
  mPhoto = (i + n) % n;
  track.scrollTo({ left: mPhoto * track.clientWidth, behavior: "smooth" });
  mCount();
}
function mCount() {
  const n = $("#mTrack").children.length || 1;
  $("#mCount").textContent = (mPhoto + 1) + " / " + n;
  $$("#mThumbs button").forEach((b, i) => b.classList.toggle("on", i === mPhoto));
}
function closeStop() {
  const modal = $("#stopModal");
  if (!modal.classList.contains("show")) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  $("#mTrack").innerHTML = "";
}

/* ---------- Routing via OSRM (real road network) with haversine fallback ---------- */
async function fetchRoute(coords) {
  const str = coords.map((c) => `${c.lng},${c.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${str}?overview=full&geometries=geojson`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error("osrm " + res.status);
    const j = await res.json();
    if (!j.routes || !j.routes[0]) throw new Error("no route");
    return j.routes[0];
  } finally {
    clearTimeout(timer);
  }
}
function fallbackLegs(coords) {
  return coords.slice(1).map((c, i) => {
    const straight = haversine(coords[i], c);
    const dist = straight * 1.35;
    return { distance: dist, duration: (dist / 1000 / 55) * 3600 };
  });
}
const ROUTES = [null, null];
const DWELL = [0, 0]; // total visit (non-driving) seconds per day
const toMin = (t) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || "");
  return m ? (+m[1]) * 60 + (+m[2]) : null;
};
/* Dwell time per stop = scheduled gap to next stop minus real drive time.
   Skips first (departure) and last (day ends) main stops. */
function renderDwell(di) {
  const day = TRIP[di], R = ROUTES[di];
  if (!R) return;
  const kind = day.tone === "amber" ? "kind-amber" : "kind-pine";
  const mains = day.stops.map((s, si) => ({ s, si })).filter(({ s }) => !s.backup);
  let sum = 0;
  mains.forEach(({ s, si }, i) => {
    if (i === 0 || i === mains.length - 1) return;
    const t0 = toMin(s.t), t1 = toMin(mains[i + 1].s.t), leg = R.legs[i];
    if (t0 == null || t1 == null || !leg || t1 <= t0) return;
    const dwell = (t1 - t0) * 60 - leg.duration;
    if (dwell > 0) sum += dwell;
    const tw = document.getElementById(`dwell-${di}-${si}`);
    if (tw) tw.textContent = dwell < 300 ? "เวลาแน่น" : `แวะ ${fmtMin(dwell)}`;
    const el = document.querySelector(`article.tcard[data-stop="${di}:${si}"] .tcard-desc`);
    if (!el) return;
    const txt = dwell < 300 ? "เวลาแน่น แวะแป๊บเดียวแล้วไปต่อ" : `แวะที่นี่ ~${fmtMin(dwell)}`;
    el.insertAdjacentHTML("afterend", `<div class="tcard-kinds"><span class="kind ${kind}">${txt}</span></div>`);
  });
  DWELL[di] = sum;
}
async function computeRoutes() {
  const totals = { dist: 0, dur: 0 };
  await Promise.all(TRIP.map(async (day, di) => {
    const mains = day.stops.filter((s) => !s.backup);
    const coords = mains.map((s) => ({ lat: s.lat, lng: s.lng }));
    let legs, geometry = null, live = true;
    try {
      const r = await fetchRoute(coords);
      legs = r.legs;
      geometry = r.geometry;
    } catch {
      legs = fallbackLegs(coords);
      live = false;
    }
    ROUTES[di] = { legs, geometry, live };
    let dDist = 0, dDur = 0;
    legs.forEach((leg, i) => {
      dDist += leg.distance; dDur += leg.duration;
      const el = $(`#leg-${di}-${i}`);
      if (el) {
        let extra = "";
        if (i === 0) {
          const dep = toMin(mains[0].t);
          if (dep != null) extra = ` · ถึง ~${fmtClock(dep + Math.round(leg.duration / 60))}`;
        }
        el.classList.remove("pending");
        el.innerHTML = `${ICONS.car}<span>ขับรถ ${fmtKm(leg.distance)} · ${fmtMin(leg.duration)}${extra}${live ? "" : " (ประมาณ)"}</span>`;
      }
    });
    totals.dist += dDist; totals.dur += dDur;
    renderDwell(di);
    const meta = $(`#day${di + 1}Meta`);
    if (meta) meta.textContent = `${mains.length} จุด · ขับ ${fmtKm(dDist)}${live ? "" : " (ประมาณ)"}`;
    drawDayRoute(di);
  }));
  $("#statKm").textContent = fmtKm(totals.dist);
  const s1 = $(`#day1Summary`), s2 = $(`#day2Summary`);
  if (ROUTES[0]) s1.textContent = `ออกจากบ้าน 07:00 · ขับรวม ${fmtKm(sum(ROUTES[0].legs, "distance"))} ใช้เวลา ${fmtMin(sum(ROUTES[0].legs, "duration"))} · แวะเที่ยว ${fmtMin(DWELL[0])}`;
  if (ROUTES[1]) s2.textContent = `เช็กเอาต์ 11:40 · ขับรวม ${fmtKm(sum(ROUTES[1].legs, "distance"))} ใช้เวลา ${fmtMin(sum(ROUTES[1].legs, "duration"))} · แวะเที่ยว ${fmtMin(DWELL[1])}`;
}
const sum = (legs, k) => legs.reduce((a, l) => a + l[k], 0);

/* ---------- Leaflet map ---------- */
let map, layerAll, layerD1, layerD2, meMarker = null, myPos = null;
function pinIcon(stop, tone) {
  const cls = stop.backup ? "backup" : (tone === "amber" ? "amber" : "");
  const inner = stop.backup && stop.kind === "ev"
    ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>`
    : `<span>${stop._n}</span>`;
  return L.divIcon({ className: "", html: `<div class="pin ${cls}">${inner}</div>`, iconSize: [37, 37], iconAnchor: [18, 34], popupAnchor: [0, -32] });
}
function initMap() {
  map = L.map("mapEl", { scrollWheelZoom: false, tap: true }).setView([14.35, 101.1], 9);
  map.on("focus", () => map.scrollWheelZoom.enable());
  map.on("blur", () => map.scrollWheelZoom.disable());
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Esri, HERE, Garmin, OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);
  layerAll = L.layerGroup().addTo(map);
  layerD1 = L.layerGroup(); layerD2 = L.layerGroup();
  const bounds = [];
  TRIP.forEach((day, di) => {
    day.stops.forEach((s, si) => {
      const m = L.marker([s.lat, s.lng], { icon: pinIcon(s, day.tone), title: s.name });
      m.bindPopup(`<div class="pop"><h4>${s._n === "ส" ? "สำรอง · " : "จุดที่ " + s._n + " · "}${s.name}</h4><p>${s.sub}</p>
        <div class="pop-btns"><a class="pop-nav" href="${dirUrl(s.lat, s.lng)}" target="_blank" rel="noopener">นำทาง</a>
        <a class="pop-gmaps" href="${s.gmaps}" target="_blank" rel="noopener">Google Maps</a></div>
        <button class="pop-detail" data-stop="${di}:${si}">ดูรูป + รายละเอียด</button></div>`);
      m.on("click", () => showSheet(di, day, s, si));
      (di === 0 ? layerD1 : layerD2).addLayer(m);
      layerAll.addLayer(m);
      bounds.push([s.lat, s.lng]);
    });
  });
  map.fitBounds(bounds, { padding: [28, 28] });
  setTimeout(() => map.invalidateSize(), 400);
  ROUTES.forEach((r, di) => { if (r) drawDayRoute(di); });
}
function drawDayRoute(di) {
  const r = ROUTES[di];
  if (!r || !map) return;
  const day = TRIP[di];
  let latlngs;
  if (r.geometry) {
    latlngs = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  } else {
    latlngs = day.stops.filter((s) => !s.backup).map((s) => [s.lat, s.lng]);
  }
  const line = L.polyline(latlngs, {
    color: di === 0 ? "#1b5c44" : "#b25a18",
    weight: 4.5, opacity: 0.85, lineJoin: "round",
    dashArray: r.geometry ? null : "6 8",
  });
  line.addTo(di === 0 ? layerD1 : layerD2);
  line.addTo(layerAll);
}
function showSheet(di, day, s, si) {
  const el = $("#stopsheet");
  el.innerHTML = `
    <button class="sheet-x" type="button" aria-label="ปิด">×</button>
    <img class="sheet-img" src="${coverOf(s)}" alt="" loading="lazy" onerror="imgFallback(this)">
    <span class="kind ${KIND_TONE[s.kind]}">${ICONS[s.kind]}${KIND_LABEL[s.kind]} · วันที่ ${day.day}</span>
    <h4 style="margin-top:.5rem">${s._n === "ส" ? "" : "จุดที่ " + s._n + " · "}${s.name}</h4>
    <p class="sub">${s.t === "สำรอง" ? "เวลาสำรอง" : "เวลา " + s.t + " น."} · ${s.sub}</p>
    <div class="row">
      <a class="abtn abtn-nav" href="${dirUrl(s.lat, s.lng)}" target="_blank" rel="noopener">${ICONS.nav}นำทาง</a>
      <a class="abtn abtn-line" href="${s.gmaps}" target="_blank" rel="noopener">${ICONS.ext}Google Maps</a>
    </div>
    <button type="button" class="sheet-detail" data-stop="${di}:${si}">${mediaTxt(s) ? `ดูรูป + รายละเอียด (${mediaTxt(s)})` : "ดูรายละเอียด"}</button>`;
  el.classList.add("show");
  el.setAttribute("aria-hidden", "false");
  $(".sheet-x", el).addEventListener("click", hideSheet);
}
function hideSheet() {
  const el = $("#stopsheet");
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
}

/* ---------- Geolocation: ETA from my position ---------- */
function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("no-geo"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000 });
  });
}
async function etaFromMe(lat, lng, name) {
  toast("กำลังหาตำแหน่งของคุณ…");
  try {
    const p = await getPosition();
    myPos = { lat: p.coords.latitude, lng: p.coords.longitude };
    let dist, dur, live = true;
    try {
      const r = await fetchRoute([myPos, { lat, lng }]);
      dist = r.legs[0].distance; dur = r.legs[0].duration;
    } catch {
      dist = haversine(myPos, { lat, lng }) * 1.35;
      dur = (dist / 1000 / 55) * 3600;
      live = false;
    }
    toast(`จากตำแหน่งคุณไป “${name}” ≈ ${fmtKm(dist)} · ${fmtMin(dur)}${live ? "" : " (ประมาณ)"}`);
    window.open(dirUrl(lat, lng), "_blank", "noopener");
  } catch {
    toast("หาตำแหน่งไม่เจอ — เปิดนำทางด้วยตำแหน่งปัจจุบันของ Google Maps แทน");
    window.open(dirUrl(lat, lng), "_blank", "noopener");
  }
}
async function locateMe() {
  const hint = $("#geoHint");
  try {
    const p = await getPosition();
    myPos = { lat: p.coords.latitude, lng: p.coords.longitude };
    if (meMarker) map.removeLayer(meMarker);
    meMarker = L.marker([myPos.lat, myPos.lng], {
      icon: L.divIcon({ className: "", html: `<div class="pin me"></div>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
      title: "ตำแหน่งของฉัน", zIndexOffset: 1000,
    }).addTo(map);
    map.flyTo([myPos.lat, myPos.lng], 11, { duration: 1.2 });
    // nearest stop
    let best = null, bestD = Infinity;
    TRIP.forEach((d) => d.stops.forEach((s) => {
      if (s.backup) return;
      const dd = haversine(myPos, s);
      if (dd < bestD) { bestD = dd; best = { s, d }; }
    }));
    hint.hidden = false;
    hint.textContent = `คุณอยู่ห่างจาก “${best.s.name}” (วันที่ ${best.d.day}) ประมาณ ${fmtKm(bestD * 1.35)} — แตะหมุดใดก็ได้เพื่อนำทางจากตำแหน่งคุณ`;
  } catch {
    hint.hidden = false;
    hint.textContent = "เปิด GPS ไม่ได้ — กรุณาอนุญาตเข้าถึงตำแหน่ง แล้วลองใหม่อีกครั้ง";
  }
}

/* ---------- Countdown ---------- */
const T0 = new Date("2026-10-03T07:00:00+07:00").getTime();
const T1 = new Date("2026-10-04T20:00:00+07:00").getTime();
function tickCountdown() {
  const now = Date.now();
  const d = $("#cdD"), h = $("#cdH"), m = $("#cdM"), sec = $("#cdS"), label = $("#cdLabel");
  const pad = (n) => String(n).padStart(2, "0");
  if (now >= T1) {
    d.textContent = "0"; h.textContent = "00"; m.textContent = "00"; sec.textContent = "00";
    label.textContent = "จบทริปแล้ว · ไว้เที่ยวกันใหม่";
    return;
  }
  const ontrip = now >= T0;
  const target = ontrip ? T1 : T0;
  const s = Math.max(0, Math.floor((target - now) / 1000));
  d.textContent = Math.floor(s / 86400);
  h.textContent = pad(Math.floor((s % 86400) / 3600));
  m.textContent = pad(Math.floor((s % 3600) / 60));
  sec.textContent = pad(s % 60);
  label.textContent = ontrip ? "กำลังเที่ยวอยู่ · นับถอยหลังก่อนถึงบ้าน" : "นับถอยหลัง · ออกเดินทาง เสาร์ 3 ต.ค. 07:00 น.";
}

/* ---------- Nav / menu / spy / reveal ---------- */
function initChrome() {
  const burger = $("#burger"), menu = $("#mobilemenu");
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("#mobilemenu a, #menuGoBtn").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }));
  const first = TRIP[0].stops[1]; // วิชชากุ้งสด (จุดแรกหลังออกจากบ้าน)
  const goFirst = () => window.open(dirUrl(first.lat, first.lng), "_blank", "noopener");
  ["navGoBtn", "heroGoBtn", "menuGoBtn"].forEach((id) => $("#" + id).addEventListener("click", goFirst));

  // tab switching
  activateTab((location.hash || "").slice(1), { push: false });
  window.addEventListener("hashchange", () => activateTab(location.hash.slice(1), { push: false }));

  // reveal
  const ro = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
  }, { threshold: 0.08 });
  $$(".reveal").forEach((el) => ro.observe(el));

  // map filter
  $$("[data-mapfilter]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-mapfilter]").forEach((x) => { x.classList.remove("on"); x.setAttribute("aria-selected", "false"); });
    b.classList.add("on"); b.setAttribute("aria-selected", "true");
    const f = b.dataset.mapfilter;
    [layerAll, layerD1, layerD2].forEach((l) => map.removeLayer(l));
    (f === "all" ? layerAll : f === "1" ? layerD1 : layerD2).addTo(map);
    hideSheet();
  }));
  $("#locateBtn").addEventListener("click", locateMe);
  observeVideos();
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      const id = a.getAttribute("href").slice(1);
      if (TABS.includes(id)) {
        e.preventDefault();
        activateTab(id);
        return;
      }
      if (id === "top") {
        e.preventDefault();
        activateTab("overview");
        return;
      }
    }
    const card = e.target.closest("[data-stop]");
    if (card) {
      const inner = e.target.closest("a,button");
      if (!inner || inner === card) {
        const [di, si] = card.dataset.stop.split(":").map(Number);
        openStop(di, si);
        return;
      }
    }
    const d0c = e.target.closest("[data-d0]");
    if (d0c) {
      if (!e.target.closest("a,button")) {
        openD0(Number(d0c.dataset.d0));
        return;
      }
    }
    const pv = e.target.closest("[data-playvid]");
    if (pv) {
      const fig = pv.closest("figure.m-slide");
      if (fig) fig.innerHTML = `<div class="vwrap"><iframe src="${vidEmbed(pv.dataset.playvid, 1, 0, 1)}" title="วิดีโอสถานที่" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
      return;
    }
    const b = e.target.closest("[data-me]");
    if (b) {
      const [lat, lng] = b.dataset.me.split(",").map(Number);
      etaFromMe(lat, lng, b.dataset.name);
    }
  });

  // modal wiring
  $("#mPrev").addEventListener("click", () => mGo(mPhoto - 1));
  $("#mNext").addEventListener("click", () => mGo(mPhoto + 1));
  $("#mThumbs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-ph]");
    if (t) mGo(Number(t.dataset.ph));
  });
  $$("#stopModal [data-close]").forEach((el) => el.addEventListener("click", closeStop));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeStop(); });
  $("#mTrack").addEventListener("scroll", () => {
    if (mTicking) return;
    mTicking = true;
    requestAnimationFrame(() => {
      const t = $("#mTrack");
      if (t.clientWidth) {
        mPhoto = Math.min(t.children.length - 1, Math.round(t.scrollLeft / t.clientWidth));
        mCount();
        stopModalVideos();
      }
      mTicking = false;
    });
  }, { passive: true });
}

/* ---------- Join tab Lottie (lazy-loaded player + local animation) ---------- */
let lottieDone = false;
function initJoinLottie() {
  if (lottieDone) return;
  lottieDone = true;
  const box = $("#joinLottie");
  if (!box) return;
  const hide = () => { const w = box.closest(".lottie-wrap"); if (w) w.style.display = "none"; };
  const s = document.createElement("script");
  s.src = "https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js";
  s.async = true;
  s.onload = () => {
    try {
      const anim = window.lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: !reduceMotion, path: "lottie/join-trip.json" });
      anim.addEventListener("data_failed", hide);
      anim.addEventListener("DOMLoaded", () => { try { anim.resize(); } catch { /* ignore */ } });
    } catch { hide(); }
  };
  s.onerror = hide;
  document.head.appendChild(s);
}

/* ---------- Tabs ---------- */
const TABS = ["overview", "day0", "day1", "day2", "map", "join"];
let currentTab = null, mapInited = false;
function activateTab(name, { push = true } = {}) {
  if (!TABS.includes(name)) name = "overview";
  if (name === currentTab) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  currentTab = name;
  if (name === "join") initJoinLottie();
  $$(".tabpanel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + name));
  $$("[data-nav]").forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + name));
  window.scrollTo({ top: 0, behavior: "auto" });
  if (name === "map" && window.L) {
    if (!mapInited) {
      initMap();
      mapInited = true;
    } else if (map) {
      setTimeout(() => map.invalidateSize(), 60);
    }
  }
  if (push) {
    try { history.pushState(null, "", "#" + name); } catch { /* ignore */ }
  }
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  loadPlaces().finally(() => {
    renderTimelines();
    renderGallery();
    initChrome();
    tickCountdown();
    setInterval(tickCountdown, 1000);
    computeRoutes();
  });
});
