# IntruAegis - Backend (FastAPI)

REST API untuk sistem deteksi intrusi jaringan IntruAegis. Backend menerima berkas CSV berisi aliran jaringan (*network flow*), lalu model Random Forest memprediksi kelas setiap baris: lalu lintas normal (`BENIGN`) atau salah satu dari 14 jenis serangan.

## Teknologi

- Python 3.10 atau lebih baru
- FastAPI dan Uvicorn
- **scikit-learn 1.6.1**: wajib sama dengan versi saat pelatihan, supaya `model.joblib` terbaca dengan benar
- pandas, joblib, python-multipart

## Isi folder

| Berkas | Fungsi |
|---|---|
| `main.py` | Kode API |
| `model.joblib` | Model Random Forest (69 fitur, 15 kelas), dilatih pada CIC-IDS2017 |
| `classes.json` | Daftar 15 nama kelas |
| `feature_names.json` | Daftar 69 fitur beserta urutannya saat pelatihan |
| `metrics.json` | Hasil evaluasi model (untuk halaman Model Performance) |
| `sample_flows.csv` | Contoh data 109 baris untuk pengujian |
| `requirements.txt` | Daftar pustaka |
| `test_api.py` | Pengujian otomatis (pytest), 10 skenario |

## Cara menjalankan

```bash
python -m venv venv
venv\Scripts\activate            # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Server siap jika muncul tulisan `Uvicorn running on http://127.0.0.1:8000`. Dokumentasi interaktif ada di http://localhost:8000/docs.

Catatan Windows (PowerShell):
- Pastikan di depan baris perintah muncul `(venv)`. Jika tidak, `venv` belum aktif dan perintah akan memakai Python lain yang belum memiliki FastAPI.
- Jika muncul galat *running scripts is disabled*, jalankan `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`, lalu aktifkan `venv` lagi.

## Endpoint

| Metode | Path | Fungsi |
|---|---|---|
| GET | `/health` | Memeriksa server dan model |
| GET | `/metrics` | Hasil evaluasi model (akurasi, macro F1, per kelas, confusion matrix, FP dan FN, fitur penting) |
| POST | `/predict` | Menerima CSV, mengembalikan hasil prediksi |

### POST /predict

Kirim berkas CSV pada field `file` (multipart/form-data). CSV harus memuat **69 kolom fitur** CIC-IDS2017 sesuai `feature_names.json`. Kolom tambahan (misalnya `Label`) diabaikan, dan urutan kolom tidak berpengaruh karena backend mengurutkan ulang.

Contoh respons untuk `sample_flows.csv` (dipersingkat):

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

| Field | Keterangan |
|---|---|
| `total_rows` | Jumlah baris pada berkas yang diunggah |
| `rows_dropped` | Baris yang dibuang karena berisi nilai kosong atau tak terhingga (sama seperti saat pelatihan) |
| `total`, `normal`, `attacks` | Jumlah baris yang diprediksi, serta jumlah normal dan serangan |
| `attack_ratio` | Proporsi serangan |
| `distribution` | Jumlah baris untuk setiap kelas hasil prediksi |
| `detections` | Maksimal 200 baris pertama beserta label dan `confidence` (peluang tertinggi dari model) |

Kode galat:

| Kode | Penyebab |
|---|---|
| `400` | Bukan CSV valid, kolom fitur kurang (pesan menyebut kolom yang hilang), atau tidak ada baris valid |
| `413` | Ukuran berkas lebih dari 100 MB |
| `422` | Permintaan tanpa berkas |

## Pengujian

```bash
pip install pytest httpx
pytest -v
```

Hasil yang diharapkan: **10 passed**. Pengujian berjalan dari folder `backend` dan tidak memerlukan server yang sedang menyala. Skenario yang diuji:

- `/health` dan `/metrics` memberi respons yang benar
- Berkas valid (`sample_flows.csv`) diproses seluruhnya
- Baris berisi nilai tak terhingga atau kosong dibuang
- Kolom kurang, berkas bukan CSV, seluruh baris rusak, berkas lebih dari 100 MB, dan permintaan tanpa berkas ditolak dengan kode yang sesuai
- Urutan kolom yang diacak dan spasi pada nama kolom tidak mengubah hasil

Seluruh pengujian memerlukan sekitar 20 detik karena skenario berkas 100 MB membuat data besar di memori.

## Catatan

- CORS hanya mengizinkan `http://localhost:3000` dan `http://127.0.0.1:3000` (alamat Next.js). Ubah `allow_origins` di `main.py` jika antarmuka memakai alamat lain.
- Sistem menganalisis berkas CSV yang diunggah, bukan memantau jaringan secara langsung.
- Belum ada autentikasi, sehingga belum layak dipakai di luar lingkungan lokal tanpa pengamanan tambahan.
- Berkas `model.joblib` hanya boleh berasal dari sumber tepercaya, karena format joblib (pickle) dapat menjalankan kode saat dimuat. Backend tidak menerima model dari pengguna.
- Jika model dilatih ulang, ganti `model.joblib`, `classes.json`, `feature_names.json`, dan `metrics.json` di folder ini dengan versi terbaru dari folder `ml/artifacts/`. Jika tidak, API tetap memakai model lama.

## Pemecahan masalah

| Masalah | Solusi |
|---|---|
| `ModuleNotFoundError: No module named 'fastapi'` | `venv` belum aktif. Jalankan `venv\Scripts\activate`, lalu `pip install -r requirements.txt` |
| Galat atau peringatan versi saat memuat model | Versi scikit-learn bukan 1.6.1. Pasang ulang dari `requirements.txt` di dalam `venv` |
| Respons 400 "Kolom hilang" | CSV tidak memuat 69 fitur. Gunakan `sample_flows.csv` sebagai acuan format |
| Galat CORS di konsol browser | Antarmuka berjalan di alamat selain port 3000. Tambahkan alamatnya di `allow_origins` |
| Port 8000 sudah dipakai | Tutup aplikasi lain yang memakainya, atau ganti `--port` dan sesuaikan `NEXT_PUBLIC_API_URL` di frontend |