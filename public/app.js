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
const U = (id) => `https://images.unsplash.com/${id}?w=800&q=70&auto=format&fit=crop`;
const TRIP = [
  {
    day: 1, tone: "pine", title: "วันที่ 1 · ขาขึ้นเขาใหญ่", dateLabel: "เสาร์ 3 ต.ค. 2569",
    stops: [
      { t: "07:00", name: "ออกเดินทางจากบ้าน", sub: "เสนา พาร์ค วิลล์ 2 · รามอินทรา–วงแหวน", kind: "start", lat: 13.8424291, lng: 100.6847826, gmaps: "https://maps.app.goo.gl/Gk5FgNytaZQneTTD9", img: U("photo-1568605114967-8130f3a36994"), desc: "ล้อหมุนแต่เช้า ใช้ทางด่วน–มอเตอร์เวย์มุ่งหน้าสระบุรี แวะกินกุ้งสดก่อนขึ้นเขา" },
      { t: "09:00", name: "วิชชากุ้งสด", sub: "น้องแดงกุ้งสด · หนองแค สระบุรี", kind: "food", lat: 14.5238782, lng: 100.9143731, gmaps: "https://maps.app.goo.gl/TKBueBFkjfHrsPnA6", img: U("photo-1467003909585-2f8a72700288"), desc: "แวะเติมพลังมื้อสาย กุ้งสดเผาตัวโต ๆ ก่อนแยกเข้าเส้นเขาใหญ่" },
      { t: "09:30", name: "ปตท. อีวีฮับ", sub: "ปตท.สระบุรี (น้ำมัน + EV Hub)", kind: "ev", lat: 14.553813, lng: 100.966116, gmaps: "https://maps.app.goo.gl/bPBvQ5HUsZjpwNNw8", img: U("photo-1593941707882-a5bba14938c7"), desc: "เสียบชาร์จ + เข้าห้องน้ำ + ซื้อกาแฟตุนก่อนขึ้นเขา ไฟเต็มแล้วเที่ยวสบาย" },
      { t: "11:00", name: "ครัวน้ำปลาพริก เขาใหญ่", sub: "ร้านอาหารไทยรสจัดจ้าน", kind: "food", lat: 14.5638274, lng: 101.4058294, gmaps: "https://maps.app.goo.gl/4jKjARD2vo3ipkVX8", img: U("photo-1414235077428-338989a2e8c0"), desc: "มื้อเที่ยงบนเขา กับข้าวรสไทยแท้ กินอิ่มแล้วค่อยไปน้ำตก",
        alt: { name: "ครัวบ้านเราเอง เขาใหญ่", lat: 14.545422, lng: 101.4098583, gmaps: "https://maps.app.goo.gl/tqA8Eg5ExhYhvKrX8" } },
      { t: "13:00", name: "น้ำตกเหวสุวัต", sub: "อุทยานแห่งชาติเขาใหญ่", kind: "nature", lat: 14.4347, lng: 101.5025, gmaps: "https://www.google.com/maps/search/?api=1&query=%E0%B8%99%E0%B9%89%E0%B8%B3%E0%B8%95%E0%B8%81%E0%B9%80%E0%B8%AB%E0%B8%A7%E0%B8%AA%E0%B8%B8%E0%B8%A7%E0%B8%B1%E0%B8%95", img: U("photo-1433086966358-54859d0ed716"), desc: "น้ำตกชื่อดังกลางป่ามรดกโลก หน้าฝนน้ำเยอะ ถ่ายรูปสวย อย่าลืมรองเท้ากันลื่น" },
      { t: "14:00", name: "เข้าที่พัก", sub: "The Everest Pool Villa Khaoyai", kind: "stay", lat: 14.5463323, lng: 101.5186437, gmaps: "https://maps.app.goo.gl/76wVCZj7QETAhy48A", img: U("photo-1566073771259-6a8506099945"), desc: "เช็กอินพูลวิลล่า พักผ่อน เล่นน้ำ ดูวิวเขายามเย็น" },
      { t: "15:00", name: "แวะซื้อของ", sub: "PTT เขาใหญ่ (มี 7-Eleven)", kind: "shop", lat: 14.5127829, lng: 101.3752009, gmaps: "https://maps.app.goo.gl/ww648rAWr9GjZutn8", img: U("photo-1578916171728-46686eac8d58"), desc: "ตุนเสบียงมื้อเย็น–มื้อเช้า ขนม เครื่องดื่ม ที่ปั๊มก่อนกลับวิลล่า" },
      { t: "สำรอง", name: "จุดเติมแบตสำรอง", sub: "PTT Charging Station เขาใหญ่", kind: "ev", backup: true, lat: 14.5127829, lng: 101.3752009, gmaps: "https://maps.app.goo.gl/GtmAPYmjLGCSAtUz5", img: U("photo-1593941707882-a5bba14938c7"), desc: "จุดชาร์จสำรองของวันที่ 1 แบตเหลือน้อยแวะได้ตลอด ไม่ต้องรอตามเวลา" },
    ],
  },
  {
    day: 2, tone: "amber", title: "วันที่ 2 · เที่ยวขากลับ", dateLabel: "อาทิตย์ 4 ต.ค. 2569",
    stops: [
      { t: "สำรอง", name: "จุดเติมแบตสำรอง", sub: "ปตท. เขาใหญ่สเตชั่น", kind: "ev", backup: true, lat: 14.6113092, lng: 101.4041536, gmaps: "https://maps.app.goo.gl/svK9xb9AAEJuxcXe6", img: U("photo-1593941707882-a5bba14938c7"), desc: "จุดชาร์จสำรองของวันที่ 2 อยู่เส้นปากช่อง–เขาใหญ่" },
      { t: "12:00", name: "ออกเดินทาง", sub: "เช็กเอาต์จาก The Everest Pool Villa", kind: "start", lat: 14.5463323, lng: 101.5186437, gmaps: "https://maps.app.goo.gl/76wVCZj7QETAhy48A", img: U("photo-1506905925346-21bda4d32df4"), desc: "เช็กเอาต์เที่ยงวัน เริ่มทริปคาเฟ่–ฟาร์มขากลับ" },
      { t: "12:20", name: "BUCOLIC Khaoyai", sub: "คาเฟ่วิวทุ่ง near อุทยาน", kind: "cafe", lat: 14.5136365, lng: 101.4499219, gmaps: "https://maps.app.goo.gl/dkQbcCpzVGePJyo48", img: U("photo-1554118811-1e0d58224f24"), desc: "คาเฟ่บรรยากาศชนบท วิวทุ่งกว้าง กาแฟดี มุมถ่ายรูปเยอะ" },
      { t: "13:30", name: "ฟาร์มโชคชัย", sub: "ปากช่อง นครราชสีมา", kind: "farm", lat: 14.6547661, lng: 101.3485289, gmaps: "https://maps.app.goo.gl/ZKGZCahy6EgSE7Ss8", img: U("photo-1500595046743-cd271d694d30"), desc: "ฟาร์มโคนมชื่อดัง นั่งรถชมฟาร์ม ดูโชว์คาวบอย แวะซื้อของฝากนม–ไอศกรีม" },
      { t: "15:00", name: "ไร่สุวรรณวาจกกสิกิจ", sub: "ปากช่อง นครราชสีมา", kind: "farm", lat: 14.6527316, lng: 101.3112606, gmaps: "https://maps.app.goo.gl/W6AN7Dwc1PstZQt19", img: U("photo-1500382017468-9049fed747ef"), desc: "ไร่บรรยากาศดี ชมวิวทุ่ง ถ่ายรูปชิล ๆ ก่อนลงจากเขา" },
      { t: "16:00", name: "Oeimi Café", sub: "คาเฟ่สระบุรี", kind: "cafe", lat: 14.4270971, lng: 100.9169681, gmaps: "https://maps.app.goo.gl/V2L14vFGPSLY4uof9", img: U("photo-1501339847302-ac426a4a7cbb"), desc: "แวะคาเฟ่ย่านสระบุรี กาแฟแก้วสุดท้ายของทริปก่อนยิงยาวกลับบ้าน" },
      { t: "18:00", name: "ถึงบ้าน", sub: "เสนาพาร์ควิลล์ 2 · โดยสวัสดิภาพ", kind: "home", lat: 13.8424291, lng: 100.6847826, gmaps: "https://maps.app.goo.gl/Gk5FgNytaZQneTTD9", img: U("photo-1568605114967-8130f3a36994"), desc: "จบทริป 2 วัน 1 คืน ถึงบ้านราวหกโมงเย็น" },
    ],
  },
];

/* ---------- Helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const dirUrl = (lat, lng) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
const fmtKm = (m) => (m / 1000 >= 100 ? Math.round(m / 1000) : (m / 1000).toFixed(m / 1000 < 10 ? 1 : 0)) + " กม.";
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
function stopCard(day, stop, idx) {
  const tone = day.tone, num = stop.backup ? "ส" : (idx + 1);
  const alt = stop.alt
    ? `<div class="altbox"><span>หรือเลือกร้านสำรอง <strong>${stop.alt.name}</strong></span>
       <a class="abtn abtn-nav" style="background:var(--amber-700)" href="${dirUrl(stop.alt.lat, stop.alt.lng)}" target="_blank" rel="noopener">${ICONS.nav}นำทาง</a>
       <a class="abtn abtn-line" href="${stop.alt.gmaps}" target="_blank" rel="noopener">${ICONS.ext}Google Maps</a></div>`
    : "";
  return `
  <li class="tstep reveal" data-tone="${tone}" ${stop.backup ? 'data-kind="backup"' : ""}>
    <span class="ttime">${stop.t}${stop.t.includes(".") ? " น." : ""}</span>
    <span class="trail" aria-hidden="true"><span class="tdot"></span></span>
    <article class="tcard">
      <div class="tcard-top">
        <div class="tcard-photo">
          <img src="${stop.img}" alt="${stop.name}" loading="lazy" onerror="imgFallback(this)">
          <span class="tnum">${num}</span>
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
    day.stops.forEach((s) => {
      if (s.backup) {
        html += stopCard(day, s, -1);
        return;
      }
      html += stopCard(day, s, n);
      if (n < mains.length - 1) html += legChip(di, n);
      n++;
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
        el.classList.remove("pending");
        el.innerHTML = `${ICONS.car}<span>ขับรถ ${fmtKm(leg.distance)} · ${fmtMin(leg.duration)}${live ? "" : " (ประมาณ)"}</span>`;
      }
    });
    totals.dist += dDist; totals.dur += dDur;
    const meta = $(`#day${di + 1}Meta`);
    if (meta) meta.textContent = `${mains.length} จุด · ขับ ${fmtKm(dDist)} · ${fmtMin(dDur)}${live ? "" : " (ประมาณ)"}`;
    drawDayRoute(di);
  }));
  $("#statKm").textContent = fmtKm(totals.dist);
  $("#statTime").textContent = fmtMin(totals.dur);
  const s1 = $(`#day1Summary`), s2 = $(`#day2Summary`);
  if (ROUTES[0]) s1.textContent = `ออกจากบ้าน 07:00 · ขับรวม ${fmtKm(sum(ROUTES[0].legs, "distance"))} ใช้เวลา ${fmtMin(sum(ROUTES[0].legs, "duration"))}`;
  if (ROUTES[1]) s2.textContent = `เช็กเอาต์ 12:00 · ขับรวม ${fmtKm(sum(ROUTES[1].legs, "distance"))} ใช้เวลา ${fmtMin(sum(ROUTES[1].legs, "duration"))}`;
}
const sum = (legs, k) => legs.reduce((a, l) => a + l[k], 0);

/* ---------- Leaflet map ---------- */
let map, layerAll, layerD1, layerD2, meMarker = null, myPos = null;
function pinIcon(stop, tone) {
  const cls = stop.backup ? "backup" : (tone === "amber" ? "amber" : "");
  const inner = stop.backup
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
    day.stops.forEach((s) => {
      const m = L.marker([s.lat, s.lng], { icon: pinIcon(s, day.tone), title: s.name });
      m.bindPopup(`<div class="pop"><h4>${s._n === "ส" ? "สำรอง · " : "จุดที่ " + s._n + " · "}${s.name}</h4><p>${s.sub}</p>
        <div class="pop-btns"><a class="pop-nav" href="${dirUrl(s.lat, s.lng)}" target="_blank" rel="noopener">นำทาง</a>
        <a class="pop-gmaps" href="${s.gmaps}" target="_blank" rel="noopener">Google Maps</a></div></div>`);
      m.on("click", () => showSheet(day, s));
      (di === 0 ? layerD1 : layerD2).addLayer(m);
      layerAll.addLayer(m);
      bounds.push([s.lat, s.lng]);
    });
  });
  map.fitBounds(bounds, { padding: [28, 28] });
  setTimeout(() => map.invalidateSize(), 400);
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
function showSheet(day, s) {
  const el = $("#stopsheet");
  el.innerHTML = `
    <button class="sheet-x" type="button" aria-label="ปิด">×</button>
    <span class="kind ${KIND_TONE[s.kind]}">${ICONS[s.kind]}${KIND_LABEL[s.kind]} · วันที่ ${day.day}</span>
    <h4 style="margin-top:.5rem">${s._n === "ส" ? "" : "จุดที่ " + s._n + " · "}${s.name}</h4>
    <p class="sub">${s.t === "สำรอง" ? "เวลาสำรอง" : "เวลา " + s.t + " น."} · ${s.sub}</p>
    <div class="row">
      <a class="abtn abtn-nav" href="${dirUrl(s.lat, s.lng)}" target="_blank" rel="noopener">${ICONS.nav}นำทาง</a>
      <a class="abtn abtn-line" href="${s.gmaps}" target="_blank" rel="noopener">${ICONS.ext}Google Maps</a>
    </div>`;
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
  const d = $("#cdD"), h = $("#cdH"), m = $("#cdM"), label = $("#cdLabel");
  if (now >= T1) { d.textContent = "0"; h.textContent = "0"; m.textContent = "0"; label.textContent = "จบทริปแล้ว · ไว้เที่ยวกันใหม่"; return; }
  if (now >= T0) { label.textContent = "กำลังเที่ยวอยู่ · เที่ยวให้สนุก!"; }
  const target = now >= T0 ? T1 : T0;
  let s = Math.max(0, Math.floor((target - now) / 1000));
  d.textContent = Math.floor(s / 86400);
  h.textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  m.textContent = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
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

  // scroll spy
  const secs = ["overview", "day1", "day2", "map"].map((id) => document.getElementById(id));
  const links = $$("[data-nav]");
  const spy = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach((s) => s && spy.observe(s));

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
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-me]");
    if (b) {
      const [lat, lng] = b.dataset.me.split(",").map(Number);
      etaFromMe(lat, lng, b.dataset.name);
    }
  });
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderTimelines();
  initChrome();
  tickCountdown();
  setInterval(tickCountdown, 30000);
  if (window.L) initMap();
  computeRoutes();
});
