# Track A: UI/UX Design 

Aplikasi ini dirancang khusus untuk operator mesin di lantai produksi yang sibuk. Berikut adalah alasan mengapa elemen UI/UX ditata dan berperilaku seperti itu:

### Alasan Keputusan Desain & Tata Letak:

* **Suhu Utama Sangat Besar (`text-7xl`):**
  * *Kenapa:* Operator sering bergerak dan sibuk. Angka dibuat sangat besar agar suhu aktual dapat terbaca jelas dari jarak jauh (3–5 meter) tanpa harus mendekati monitor.
* **Perubahan Warna Dinamis (Merah vs Hijau):**
  * *Kenapa:* Warna adalah stimulus visual tercepat bagi otak. 
    * **Hijau (`bg-green-50`):** Memberi kesan tenang dan aman (Normal).
    * **Merah (`bg-red-50`):** Memberi kesan urgensi/bahaya (Overheat > 80°C) agar operator langsung waspada.
* **Efek Berkedip (`animate-pulse`) & Ikon ⚠️ saat Bahaya:**
  * *Kenapa:* Di lingkungan pabrik yang bising, alarm suara sering tidak terdengar. Stimulus visual yang dinamis (kedipan) sangat efektif menarik perhatian mata operator secara instan.
* **Penyederhanaan Grafik (Tanpa Grid Vertikal):**
  * *Kenapa:* Mengurangi beban kognitif (distraksi visual). Operator hanya perlu melihat tren pergerakan suhu (naik/turun) secara makro, bukan membaca koordinat angka grafik secara presisi.
* **Tombol Jeda Aliran (`Pause/Resume`):**
  * *Kenapa:* Memberi kendali penuh kepada operator untuk membekukan tampilan guna menganalisis riwayat tren pada waktu tertentu tanpa terganggu update data baru.
* **Layar Error & Loading Khusus:**
  * *Kenapa:* Jika server mati, aplikasi tidak boleh menampilkan angka kosong atau "0°C" (karena cold/0°C adalah data valid yang menyesatkan). Layar error memberi tahu dengan jelas bahwa sistem sedang tidak terhubung.

---

# Track B: Front-End

Mengubah rancangan UI menjadi aplikasi web interaktif yang berjalan di atas React + Vite. Berikut penjelasan teknis implementasinya:

### Detail Implementasi Fitur:

* **State Management (`useState` & `useEffect`):**
  * Menggunakan React hooks untuk memantau status loading, pesan error, jeda aliran data, dan cache riwayat data sensor secara reaktif.
* **Polling Data Real-Time:**
  * Memanfaatkan `setInterval` (interval 5 detik) di dalam `useEffect`. Hook ini akan otomatis dibersihkan (`clearInterval`) saat tombol jeda diaktifkan, dan dipicu ulang secara instan ketika aliran dilanjutkan.
* **Perhitungan Statistik Dinamis:**
  * Menghitung nilai Rata-rata (`reduce`), Minimum (`Math.min`), dan Maksimum (`Math.max`) langsung dari array data sensor aktif setiap kali state diperbarui.
* **Optimasi Performa Grafik:**
  * Grafik dibatasi hanya memproses 20 data poin terbaru (dikontrol dari API backend dan disinkronkan ke state frontend) agar rendering Recharts tetap ringan dan responsif tanpa lag.
* **UX Safety (Loading & Error Handling):**
  * Menyediakan layar loading spinner saat inisialisasi awal.
  * Menyediakan tombol retry manual jika koneksi terputus sejak awal, serta banner warning di dalam dashboard jika koneksi ke backend terputus di tengah jalan (agar data lama tetap dapat dianalisis).

---

# Track C: Back-End

Menyediakan API sensor real-time yang mensimulasikan data mesin pabrik secara terstruktur:

### Detail Implementasi Fitur:

* **Framework & Middleware:**
  * Dibangun dengan Node.js dan **Express.js** pada port `3000` dengan middleware `cors` (agar bisa diakses frontend tanpa isu cross-origin) dan `express.json` (untuk parsing format body kiriman).
* **Endpoint API yang Disediakan:**
  * `GET /readings`: Mengembalikan riwayat seluruh pembacaan data sensor.
  * `GET /latest`: Mengembalikan data pembacaan suhu paling terbaru saja.
  * `POST /readings`: Menerima input data baru secara manual (berguna untuk simulasi external trigger).
* **Simulasi Data & Pengamanan Memori:**
  * Otomatis memicu pembacaan suhu acak (25°C s.d 90°C) setiap 5 detik menggunakan `setInterval`.
  * Membatasi ukuran array data maksimal hanya 20 data terakhir (`sensorData.shift()`) untuk menghindari kebocoran memori (memory leak/overflow) pada server.
* **Deteksi Anomali & Validasi:**
  * Deteksi anomali suhu jika melebihi `80` derajat Celsius langsung ditandai di sisi server (`anomali: true`).
  * Validasi input pada `POST /readings` untuk memastikan nilai suhu yang masuk berupa angka valid, serta penanganan respon error (`400 Bad Request`) jika input tidak valid.
* **Penanganan Kasus Data Kosong:**
  * Memberikan validasi pengecekan array di endpoint `GET` sehingga jika array kosong, server tidak crash melainkan merespon dengan array kosong `[]` secara elegan atau `404 Not Found`.

---

# Track D: DevOps

Menyediakan konfigurasi deployment agar aplikasi dapat dijalankan secara instan di mana saja.

### 1. Menjalankan Aplikasi Secara Lokal (Docker & Docker Compose)

Aplikasi telah dikemas dengan Docker sehingga dapat dijalankan dengan satu perintah tunggal. Pastikan Docker Desktop telah berjalan di komputer Anda, lalu ketik:
```bash
docker-compose up --build
```
* **Frontend (React + Nginx)** akan berjalan di: `http://localhost:80`
* **Backend (API Express)** akan berjalan di: `http://localhost:3000`

### 2. Catatan Deployment Production (Vercel & Render)

Untuk deployment produksi, disarankan memisahkan hosting frontend dan backend. Frontend React dideploy ke layanan statis seperti **Vercel**, sedangkan backend Express dideploy ke platform yang mendukung persistence/persistent process seperti **Render**, agar simulasi sensor in-memory dan background timer (`setInterval`) tetap berjalan stabil.

---

## 🏷️ Asal Kode & Kontribusi (AI & Starter)

* **Starter/Template**: Kerangka dasar React + Vite dan basis grafik `LineChart` dari Recharts.
* **Bantuan AI (Seluruhnya)**:
  * **Front-End (`App.jsx`)**: Logika filter status peringatan, perhitungan rata-rata/min/max, loading/error screens, mekanisme tombol jeda, dan konfigurasi API URL dinamis.
  * **Back-End (`server/server.js`)**: Setup server Express, CORS, routing API, serta logika simulasi data sensor dinamis dengan deteksi anomali.
  * **DevOps**: Pembuatan `Dockerfile` frontend, `Dockerfile` backend, konfigurasi `docker-compose.yml`, serta petunjuk deployment.