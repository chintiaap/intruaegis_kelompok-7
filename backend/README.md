# IntruAegis - Backend (FastAPI)

REST API untuk sistem deteksi intrusi jaringan IntruAegis. Backend menerima file CSV berisi aliran jaringan (flow), lalu model Random Forest memprediksi apakah tiap flow normal atau serangan.

## Teknologi
- Python 3.10 atau lebih baru
- FastAPI dan Uvicorn
- **scikit-learn 1.6.1** (wajib sama dengan versi saat training, supaya `model.joblib` terbaca)
- pandas, joblib

## Isi folder
| File | Fungsi |
|---|---|
| `main.py` | Kode API |
| `model.joblib` | Model Random Forest (69 fitur, 15 kelas), dilatih pada CIC-IDS2017 |
| `classes.json` | Daftar 15 nama kelas |
| `feature_names.json` | Daftar 69 fitur beserta urutannya saat training |
| `metrics.json` | Hasil evaluasi model |
| `sample_flows.csv` | Contoh data untuk pengujian |
| `requirements.txt` | Daftar library |

## Cara menjalankan
```bash
python -m venv venv
venv\Scripts\activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Server berjalan di `http://localhost:8000`. Dokumentasi interaktif ada di `http://localhost:8000/docs`.

## Endpoint
| Method | Path | Fungsi |
|---|---|---|
| GET | `/health` | Cek server hidup |
| GET | `/metrics` | Hasil evaluasi model (akurasi, F1 per kelas, confusion matrix) |
| POST | `/predict` | Upload CSV, hasilnya prediksi tiap baris |

### POST /predict
Kirim file CSV dengan field `file` (multipart/form-data). CSV harus memuat 69 kolom fitur CIC-IDS2017 (lihat `feature_names.json`). Contoh file: `sample_flows.csv`.

Contoh respons (dipersingkat):
```json
{
  "total_rows": 109,
  "rows_dropped": 0,
  "total": 109,
  "normal": 14,
  "attacks": 95,
  "attack_ratio": 0.8716,
  "distribution": {
    "BENIGN": 14,
    "DoS Hulk": 8,
    "PortScan": 8
  },
  "detections": [
    {"row": 0, "label": "BENIGN", "confidence": 1.0}
  ]
}
```

Keterangan:
- `rows_dropped`: jumlah baris yang dibuang karena berisi nilai kosong atau tak terhingga (sama seperti saat training)
- `detections`: maksimal 200 baris pertama
- `confidence`: peluang tertinggi dari model untuk label yang dipilih

Error yang mungkin muncul:
- `400`: file bukan CSV valid, kolom kurang, atau tidak ada baris valid
- `413`: ukuran file lebih dari 100 MB

## Catatan
- CORS saat ini hanya mengizinkan `http://localhost:3000` (alamat Next.js). Ubah di `main.py` jika frontend memakai alamat lain.
- Sistem menganalisis file CSV yang di-upload, bukan memantau jaringan secara langsung.
- Jika model dilatih ulang, ganti `model.joblib`, `classes.json`, `feature_names.json`, dan `metrics.json` di folder ini dengan versi terbaru dari folder `ml/`.
