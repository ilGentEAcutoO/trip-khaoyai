# เที่ยวใหญ่ หนีน้ำท่วม · ทริปเขาใหญ่ 3–4 ต.ค. 2569

Interactive trip site — เปิดในมือถือระหว่างเดินทางได้เลย

- ภาพรวมทริป + ไทม์ไลน์รายวัน + รูปแต่ละจุด
- แผนที่รวมทุกหมุด (Leaflet) พร้อมเส้นทางขับรถรายวัน
- ปุ่มนำทาง / เปิด Google Maps ทุกจุด
- คำนวณระยะทาง + เวลาขับรถจริงจากโครงข่ายถนน (OSRM, มี fallback)

## Dev

```sh
python -m http.server 8471 --directory public
# http://127.0.0.1:8471/
```

## Deploy (Cloudflare Workers Static Assets)

```sh
wrangler deploy
```

Live: https://trip.jairukchan.com

## รูปสถานที่จริง (Google Places Photos)

- `public/places.json` — place_id + photo refs ของ 9 จุด สร้างโดย `node tools/fetch-places.mjs` (อ่าน key จาก `.env`)
- `worker.js` — proxy `/api/photo` แคชรูปที่ edge 30 วัน รูปแต่ละใบยิง Google แค่เดือนละครั้ง
- รันสคริปต์ซ้ำเมื่อต้องการรีเฟรชรูป (ครั้งละ ~20 calls อยู่ในโควต้าฟรี)

## Secrets

- Local: `.env` (สคริปต์) + `.dev.vars` (`wrangler dev`) — อยู่ใน `.gitignore` แล้ว
- Production: `wrangler secret put GOOGLE_PLACES_API_KEY` (ห้ามใส่ key ในโค้ดหรือ config)
