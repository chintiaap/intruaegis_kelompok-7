# IntruAegis: Sistem Deteksi Intrusi Jaringan Berbasis Random Forest pada Dataset CIC-IDS2017 dengan Antarmuka Web

> Final Project Mata Kuliah Keamanan Informasi (KP70065004), Topik 1: Defensive AI
> Program Studi Informatika, Fakultas Teknik, Universitas Siliwangi, Kelompok 7
> Dosen pengampu: Muhammad Sidik Asyaky, S.T., M.T.

**IntruAegis** adalah aplikasi web untuk mendeteksi serangan jaringan dari berkas CSV aliran jaringan (*network flow*). Model **Random Forest** yang dilatih pada dataset **CIC-IDS2017** mengklasifikasikan setiap aliran ke dalam 15 kelas: lalu lintas normal (`BENIGN`) dan 14 jenis serangan. Model dilayani oleh backend **FastAPI**, dan hasilnya ditampilkan pada dashboard **Next.js**.

## Anggota Kelompok

| Nama | NPM | Peran | Folder |
|---|---|---|---|
| Muhamad Rifqi Nurjaman | 247006111177 | Data dan ML: pengolahan dataset, pelatihan, evaluasi model | `ml/` |
| Chintia Aurizki Putri | 247006111175 | Backend: API FastAPI, endpoint prediksi, integrasi model, pengujian | `backend/` |
| Adithya Nurrahman | 247006111176 | Antarmuka web: dashboard Next.js dan TypeScript | `frontend/` |

## Fitur

- **Deteksi 15 kelas**: BENIGN, Bot, DDoS, DoS GoldenEye, DoS Hulk, DoS Slowhttptest, DoS slowloris, FTP-Patator, Heartbleed, Infiltration, PortScan, SSH-Patator, Web Attack - Brute Force, Web Attack - Sql Injection, dan Web Attack - XSS.
- **Unggah CSV** lewat dashboard, lalu hasil tampil sebagai ringkasan, grafik distribusi, dan tabel per baris.
- **Tingkat keyakinan** (*confidence*) untuk setiap prediksi.
- **Halaman evaluasi model**: akurasi, macro F1, false positive dan false negative, tabel per kelas, confusion matrix, dan fitur terpenting.
- **Validasi data** pada API: kolom wajib lengkap, baris dengan nilai kosong atau tak terhingga dibuang, dan batas ukuran berkas 100 MB.

## Cara Kerja

```
Dashboard (Next.js)  --unggah CSV-->  Backend (FastAPI)  -->  Model Random Forest
Dashboard (Next.js)  <--hasil JSON--  Backend (FastAPI)  <--  prediksi 15 kelas
```

1. Pengguna mengunggah berkas CSV di halaman **Traffic Detection**.
2. Backend memvalidasi dan membersihkan data (nama kolom, urutan 69 fitur, baris `inf` dan kosong), lalu model memprediksi setiap baris.
3. Hasil dikirim sebagai JSON, lalu ditampilkan pada **Dashboard**, **Detection Results**, dan **Model Performance**.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Machine Learning | Python, scikit-learn 1.6.1 (Random Forest), pandas, joblib |
| Backend | FastAPI, Uvicorn, pytest |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Lucide React |
| Dataset | CIC-IDS2017 (MachineLearningCSV) |

## Struktur Repositori

```
intruaegis_kelompok-7/
├── backend/     API FastAPI, model, berkas pendukung, dan pengujian
├── frontend/    dashboard Next.js
├── ml/          notebook pelatihan, model, metrik, dan gambar evaluasi
├── .gitignore
└── README.md
```

Setiap folder punya README sendiri dengan detail lebih lengkap.

## Prasyarat

- **Git**
- **Python 3.10 atau lebih baru** (cek dengan `python --version`)
- **Node.js 20 atau lebih baru** beserta npm (cek dengan `node -v`)
- **scikit-learn harus versi 1.6.1** di backend, sama dengan versi saat pelatihan. Versi lain dapat membuat model gagal dibaca atau hasilnya tidak konsisten. Versi ini otomatis terpasang lewat `requirements.txt`.

## Cara Menjalankan

Jalankan backend dan frontend di **dua terminal terpisah**, dan biarkan keduanya tetap terbuka.

### 1. Clone repositori

```bash
git clone https://github.com/chintiaap/intruaegis_kelompok-7.git
cd intruaegis_kelompok-7
```

### 2. Terminal 1: backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend siap jika muncul tulisan `Uvicorn running on http://127.0.0.1:8000`. Dokumentasi API interaktif ada di http://localhost:8000/docs.

Pastikan di depan baris perintah muncul `(venv)` sebelum menjalankan `pip` dan `uvicorn`. Jika tidak, perintah memakai Python lain yang belum memiliki FastAPI.

### 3. Terminal 2: frontend (Next.js)

```bash
cd frontend
npm install
copy .env.local.example .env.local   # Mac/Linux: cp .env.local.example .env.local
npm run dev
```

Berkas `.env.local` berisi `NEXT_PUBLIC_API_URL=http://localhost:8000`. Langkah menyalin ini boleh dilewati jika backend berjalan di alamat tersebut, karena itu nilai bawaannya.

### 4. Buka aplikasi

Buka http://localhost:3000 di browser. Pada halaman **Dashboard**, status harus menunjukkan **Backend: Connected** dan **Model: Available**.

### 5. Coba dengan data contoh

1. Buka halaman **Traffic Detection**.
2. Unggah `backend/sample_flows.csv` (salinannya juga ada di `frontend/public/sample_flows.csv`).
3. Hasil yang diharapkan: **109 baris** diproses, **14 normal** dan **95 serangan** (rasio serangan 87,16%).
4. Lihat detail per baris di **Detection Results**, dan metrik model di **Model Performance**.

## Halaman Dashboard

| Halaman | Rute | Isi |
|---|---|---|
| Dashboard | `/dashboard` | Status backend dan model, ringkasan hasil terakhir, distribusi |
| Traffic Detection | `/detection` | Unggah CSV (seret dan lepas), validasi, ringkasan respons |
| Detection Results | `/results` | Tabel prediksi, pencarian, filter, status, dan *confidence* |
| Model Performance | `/performance` | Akurasi, macro F1, FP dan FN, tabel per kelas, confusion matrix, feature importance |
| About Developers | `/about` | Profil developer dan teknologi |

Hasil analisis disimpan di sesi browser dan tidak disimpan permanen.

## API

| Metode | Path | Fungsi |
|---|---|---|
| GET | `/health` | Memeriksa server dan model |
| GET | `/metrics` | Hasil evaluasi model |
| POST | `/predict` | Menerima CSV (field `file`, multipart/form-data), mengembalikan hasil prediksi |

Contoh respons `/predict` (dipersingkat):

```json
{
  "total_rows": 109,
  "rows_dropped": 0,
  "total": 109,
  "normal": 14,
  "attacks": 95,
  "attack_ratio": 0.8716,
  "distribution": { "BENIGN": 14, "DoS Hulk": 8, "PortScan": 8 },
  "detections": [ { "row": 0, "label": "BENIGN", "confidence": 1.0 } ]
}
```

Kode galat: `400` (bukan CSV valid, kolom kurang, atau tidak ada baris valid), `413` (berkas lebih dari 100 MB), dan `422` (tanpa berkas). Berkas CSV harus memuat **69 kolom fitur** CIC-IDS2017 sesuai `backend/feature_names.json`. Detail lengkap ada di `backend/README.md`.

## Pengujian

Pengujian otomatis backend ada di `backend/test_api.py` (10 skenario):

```bash
cd backend
pip install pytest httpx
pytest -v
```

Hasil yang diharapkan: **10 passed**.

## Hasil Evaluasi Model

Dievaluasi pada 504.160 baris data uji (pembagian 80:20 terstratifikasi).

| Metrik | Nilai |
|---|---|
| Akurasi | 99,83% |
| Macro F1 | 0,8650 |
| False positive (normal dikira serangan) | 299 (0,07%) |
| False negative (serangan lolos) | 417 (0,49%) |

Kelas dengan data banyak terdeteksi hampir sempurna (misalnya DDoS, DoS Hulk, FTP-Patator, SSH-Patator). Kelas yang jarang muncul lebih lemah, terutama **Web Attack - XSS** (F1 0,3380), **Web Attack - Sql Injection** (F1 0,4000, hanya 4 data uji), dan **Heartbleed** (hanya 2 data uji). Angka lengkap per kelas ada di `ml/artifacts/metrics.json`.

## Dataset dan Pelatihan Ulang

- Dataset: CIC-IDS2017 versi *MachineLearningCSV* (8 berkas CSV). Dataset **tidak disertakan** di repositori karena ukurannya besar. Tautan: [tempel tautan Google Drive atau sumber dataset]
- Notebook pelatihan: `ml/notebooks/01_training_ids_rapi.ipynb` (dijalankan di Google Colab). Panduan lengkap ada di `ml/README.md`.
- Jika model dilatih ulang, ganti empat berkas berikut di `backend/` dengan versi baru dari `ml/artifacts/`: `model.joblib`, `classes.json`, `feature_names.json`, dan `metrics.json`. Jika tidak, API tetap memakai model lama.

## Pemecahan Masalah

| Masalah | Penyebab dan solusi |
|---|---|
| Dashboard menampilkan "Tidak dapat terhubung ke backend" | Backend belum berjalan atau tidak di port 8000. Jalankan Terminal 1 dan cek http://localhost:8000/health |
| `ModuleNotFoundError: No module named 'fastapi'` | `venv` belum aktif. Jalankan `venv\Scripts\activate`, lalu `pip install -r requirements.txt` |
| PowerShell: *running scripts is disabled* | Jalankan `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, lalu aktifkan `venv` lagi |
| Galat CORS di konsol browser | Frontend berjalan di alamat selain `localhost:3000` atau `127.0.0.1:3000`. Tambahkan alamatnya di `allow_origins` pada `backend/main.py` |
| Galat saat memuat `model.joblib` atau peringatan versi | Versi scikit-learn bukan 1.6.1. Pasang ulang dari `requirements.txt` di dalam `venv` |
| Respons 400 "Kolom hilang" | CSV tidak memuat 69 fitur. Gunakan `sample_flows.csv` sebagai acuan format |
| `npm run build` gagal mengunduh font | Build memerlukan internet karena font diunduh dari Google Fonts. `npm run dev` tetap berjalan tanpa internet |
| Port 8000 atau 3000 sudah dipakai | Tutup aplikasi lain yang memakai port tersebut, atau ganti port lalu sesuaikan `NEXT_PUBLIC_API_URL` |

## Batasan

- Sistem menganalisis berkas CSV yang diunggah, **bukan memantau lalu lintas jaringan secara langsung**.
- Masukan harus berupa fitur hasil ekstraksi CICFlowMeter (69 kolom).
- Kinerja pada kelas serangan yang jarang muncul masih rendah.
- Evaluasi memakai satu kali pembagian data dan belum memakai validasi silang.
- Belum ada autentikasi pada API, dan konfigurasi CORS baru untuk lingkungan lokal.

## Etika

Proyek ini hanya memakai dataset publik dan dijalankan di lingkungan terkendali, tanpa menyerang sistem pihak lain. Seluruh kode dan teknik yang dihasilkan hanya digunakan untuk keperluan proyek ini.

## Tautan

- Video demo: [tempel tautan YouTube]
- Dataset CIC-IDS2017: Sharafaldin, I., Lashkari, A. H., & Ghorbani, A. A. (2018). Toward generating a new intrusion detection dataset and intrusion traffic characterization. *ICISSP 2018*.
