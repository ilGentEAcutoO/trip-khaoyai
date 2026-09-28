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
