# Wandr — Buat Itinerary Banyuwangi 🌋

[![Live Demo](https://img.shields.io/badge/demo-online-c0392b?style=flat-square)](https://ditolabs.github.io/wandr/)
[![Made with Firebase](https://img.shields.io/badge/backend-Firebase-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/status-alpha-yellow?style=flat-square)]()

Wandr adalah web app perencana perjalanan (trip planner) untuk kawasan **Banyuwangi**, Jawa Timur. Lewat wizard 4 langkah, pengguna bisa menyusun itinerary lengkap dengan destinasi, kuliner, penginapan, estimasi waktu, dan biaya — lalu mengekspornya jadi PDF.

**🔗 [Coba Live Demo](https://ditolabs.github.io/wandr/)**

> **Status: Alpha** — masih tahap uji coba internal. Tombol feedback mengambang sengaja disembunyikan sementara (`FEEDBACK_ENABLED = false` di `index.html`) sampai uji coba dibuka lagi; tracking device/funnel/error tetap berjalan di belakang layar.

<!--
📸 Tambahkan screenshot/GIF di sini biar orang yang buka repo langsung kebayang tampilannya, misal:
![Wandr screenshot](docs/screenshot.png)
-->

## Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur File](#-struktur-file)
- [Struktur Data (Firestore)](#️-struktur-data-firestore)
- [Firestore Security Rules](#-firestore-security-rules)
- [Admin Panel](#-admin-panel)
- [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)
- [Deploy](#-deploy)
- [Roadmap](#️-roadmap-ide)
- [Lisensi](#-lisensi)

---


## ✨ Fitur Utama

### Untuk Pengguna
- **Wizard 4 langkah** — Destinasi → Transport → Preferensi → Susun Itinerary
- **Drag-and-drop planner** — atur ulang urutan aktivitas per hari (via SortableJS)
- **Rule-based itinerary engine** — otomatis menangani kasus khusus seperti trekking tengah malam di Kawah Ijen dan penangkaran penyu Sukamade
- **Kuliner Populer** — rekomendasi kuliner location-aware berdasarkan kawasan yang dipilih, dengan live-search autocomplete
- **Export PDF** — hasil itinerary bisa diunduh sebagai PDF dengan pagination yang rapi
- **Desain "Kertas"** — estetika editorial minimalis, tipografi serif, aksen warna merah

### Untuk Pengelola (kamu 👋)
- **Admin panel CRUD** — kelola data wisata, penginapan, dan kuliner
- **Import/Export data** massal (JSON)
- **Geocode massal** — lengkapi lat/lng otomatis lewat Photon API
- **Deteksi & bersihkan duplikat**
- **Log & Analytics** — lacak device, funnel, error, dan feedback dari pengguna (lihat di bawah)

---

## 🧱 Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | HTML + Vanilla JS (single-file), CSS custom |
| Database | Firebase Firestore |
| Auth (admin) | Firebase Authentication |
| Drag & drop | [SortableJS](https://sortablejs.github.io/Sortable/) |
| Geocoding | [Photon API](https://photon.komoot.io/) |
| Lokasi visitor (IP) | [ipwho.is](https://ipwho.is) |
| Hosting | GitHub Pages / Cloudflare Pages |

---

## 📁 Struktur File

```
wandr/
├── index.html      # Aplikasi utama (wizard, itinerary engine, export PDF)
├── admin.html      # Panel admin (CRUD data, import/export, log & analytics)
└── README.md
```

Keduanya adalah **single-file app** — semua HTML, CSS, dan JS ada dalam satu file, memudahkan deploy ke static hosting tanpa proses build.

---

## 🗄️ Struktur Data (Firestore)

### `places`
Menyimpan data wisata, penginapan, dan kuliner dalam satu collection, dibedakan lewat field `type`.

| Field | Tipe | Keterangan |
|---|---|---|
| `nama` | string | Nama tempat |
| `type` | string | `wisata`, `penginapan` (atau `hotel`/`homestay`), `kuliner` (atau `kuliner_cafe`/`cafe`/`restoran`) |
| `kawasan` | string | Zona/kawasan (mis. Licin, Ijen, Kota) |
| `kategori` | string | Pantai, Hutan, Hotel, dst |
| `akses` | string | Mulus / Menengah / Offroad / Trekking |
| `lat`, `lng` | number | Koordinat |
| `rating` | number | Khusus kuliner (0–5) |
| `status` | string | `approved` / `pending` |
| `maps`, `catatan` | string | Link Google Maps, catatan tambahan |

### Collection Analytics (baru)
| Collection | Isi |
|---|---|
| `visitor_logs` | 1 dokumen per sesi — device, OS, browser, lokasi/IP, ref code |
| `session_events` | Event funnel — step yang dilihat, itinerary di-generate, export PDF/JPG |
| `error_logs` | Error JS otomatis (window error + unhandled rejection) beserta konteksnya |
| `feedback` | Rating bintang + pesan bebas dari tombol feedback mengambang |

---

## 🔐 Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /places/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /visitor_logs/{sessionId} {
      allow create, update: if true;
      allow read, delete: if request.auth != null;
    }

    match /session_events/{eventId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /error_logs/{errorId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /feedback/{feedbackId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> Visitor anonim boleh **menulis** log/feedback (create), tapi hanya admin yang login lewat `admin.html` yang bisa **membaca/menghapusnya**.

---

## 🔧 Admin Panel

Buka `admin.html` (perlu login Firebase Auth) untuk:

- **Wisata / Penginapan / Kuliner** — tabel CRUD lengkap dengan search & filter
- **Import** — upload JSON data massal, preview, lalu simpan lokal atau push ke Firestore
- **Export** — unduh data per kategori atau semua sekaligus (JSON)
- **Geocode Massal** — lengkapi koordinat yang kosong otomatis
- **Bersihkan Duplikat** — deteksi entri kembar berdasarkan nama & kawasan
- **📊 Log & Feedback** — dashboard baru untuk cek performa aplikasi:
  - Stat ringkas: total sesi, sesi yang berhasil generate itinerary, jumlah error, jumlah feedback
  - **Sesi & Device** — tabel device/OS/browser/lokasi/IP tiap visitor
  - **Funnel** — bar chart jumlah sesi yang mencapai tiap step (buat lihat di mana orang drop-off)
  - **Error** — daftar error JS otomatis beserta device yang mengalaminya
  - **Feedback** — rating & pesan dari pengguna
  - **Export Log** — unduh CSV per kategori (buka di Google Sheets/Excel) atau JSON gabungan untuk backup/analisis

---

## 🚀 Menjalankan Secara Lokal

```bash
git clone https://github.com/ditolabs/wandr.git
cd wandr
```

Karena single-file HTML, cukup buka `index.html` langsung di browser, atau serve statis:

```bash
# via Python
python3 -m http.server 8000

# via Node (npx)
npx serve .
```

Lalu buka `http://localhost:8000`.

### Konfigurasi Firebase
Isi `firebaseConfig` di dalam `index.html` dan `admin.html` dengan kredensial project Firebase kamu sendiri (apiKey, projectId, dll).

---

## 📦 Deploy

Project ini didesain untuk static hosting tanpa build step:

- **GitHub Pages** — push ke branch `main`/`gh-pages`, aktifkan Pages di Settings
- **Cloudflare Pages** — hubungkan repo, output directory `/` (root)

---

## 🗺️ Roadmap Ide

- [ ] Visitor/device logging via Cloudflare Worker (capture IP langsung dari header, tanpa bergantung API pihak ketiga)
- [ ] Rate limiting / App Check untuk cegah spam di collection log
- [ ] Grafik visual (bukan tabel) untuk funnel & error di admin panel

---

## 📄 Lisensi

Belum ditentukan — tambahkan file `LICENSE` kalau ingin project ini open source secara resmi (misal [MIT](https://choosealicense.com/licenses/mit/) kalau mau orang lain bebas pakai/modifikasi, atau biarkan tanpa lisensi kalau memang cuma untuk showcase pribadi).

---

*Dibuat & dikembangkan oleh [ditolabs](https://github.com/ditolabs).*
