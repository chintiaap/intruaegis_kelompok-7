# IntruAegis: Modul Machine Learning

Bagian ini berisi notebook pelatihan dan artefak model untuk sistem deteksi intrusi jaringan **IntruAegis** (Random Forest pada dataset CIC-IDS2017). Backend FastAPI memuat `model.joblib` dari sini untuk melakukan prediksi.

## Isi folder

```
ml/
├── notebooks/
│   └── 01_training_ids_rapi.ipynb   # kode pemuatan data, pembersihan, training, evaluasi, ekspor
├── artifacts/
│   ├── model.joblib                 # model Random Forest hasil training (±23 MB)
│   ├── classes.json                 # daftar 15 kelas, urutan sama dengan label model
│   ├── feature_names.json           # 69 nama fitur, urutan kolom wajib sama saat prediksi
│   ├── metrics.json                 # akurasi, macro F1, metrik per kelas, confusion matrix, FP/FN
│   ├── sample_flows.csv             # contoh aliran jaringan untuk pengujian (109 baris)
│   ├── confusion_matrix.png
│   ├── feature_importance.png
│   └── distribusi_kelas.png
└── README.md
```

## Dataset

CIC-IDS2017 versi *MachineLearningCSV* (8 file CSV, 78 fitur + label), diunduh dari mirror Kaggle. Dataset tidak disertakan di repositori karena ukurannya besar.

Sitasi: Sharafaldin, I., Lashkari, A. H., & Ghorbani, A. A. (2018). *Toward Generating a New Intrusion Detection Dataset and Intrusion Traffic Characterization.* ICISSP. Canadian Institute for Cybersecurity, University of New Brunswick. Lisensi CC BY 4.0.

## Ringkasan pemrosesan

1. Gabungkan 8 CSV (encoding `latin-1`), rapikan nama kolom dan label.
2. Buang kolom kembar `Fwd Header Length.1`, baris dengan `NaN`/`inf`, baris duplikat (sebelum split), dan kolom konstan.
3. Hasil: 2.830.743 baris mentah menjadi 2.520.798 baris dengan 69 fitur.
4. Split 80:20 dengan stratifikasi (`random_state=42`): 2.016.638 data latih, 504.160 data uji.
5. Model: `RandomForestClassifier(n_estimators=100, class_weight="balanced_subsample", n_jobs=-1, random_state=42)`. Tidak perlu normalisasi.

## Hasil evaluasi (data uji)

| Metrik | Nilai |
| --- | --- |
| Akurasi | 0,9983 |
| Macro F1 | 0,865 |
| False positive (normal dikira serangan) | 299 (0,07%) |
| False negative (serangan lolos jadi normal) | 417 (0,49%) |

Macro F1 lebih jujur daripada akurasi karena kelas sangat timpang. Kelas langka seperti XSS (recall 0,28), Heartbleed (2 sampel uji), dan SQL Injection (4 sampel uji) performanya lebih rendah. Detail lengkap ada di `artifacts/metrics.json`.

## Cara menjalankan notebook

1. Buka `notebooks/01_training_ids_rapi.ipynb` di Google Colab.
2. Taruh `archive.zip` (dataset dari Kaggle) di Google Drive pada `MyDrive/IntruAegis/data/archive.zip`.
3. Pilih **Runtime → Run all**.
4. Training (±17 menit) hanya berjalan jika `model.joblib` belum ada atau `RETRAIN = True`. Jika tidak, model dimuat dari Drive.
5. Hasil tersimpan di `MyDrive/IntruAegis/artifacts/`.

## Versi library (penting untuk backend)

Model dilatih dengan **scikit-learn 1.6.1**. Backend harus memakai versi yang sama agar `model.joblib` terbaca dengan benar:

```
pip install scikit-learn==1.6.1 joblib pandas numpy
```

## Cara memakai model di backend

```python
import json, joblib
import pandas as pd

model = joblib.load("ml/artifacts/model.joblib")
features = json.load(open("ml/artifacts/feature_names.json"))
classes = json.load(open("ml/artifacts/classes.json"))

# df: DataFrame dengan 69 kolom fitur
df = df[features].astype("float32")
pred = model.predict(df)
label = [classes[i] for i in pred]
```

Urutan kolom harus sama dengan `feature_names.json`. Contoh masukan ada di `artifacts/sample_flows.csv` (kolom `Label` dibuang sebelum prediksi).

## Catatan untuk frontend (Orang 3)

Data yang bisa dipakai halaman web, semuanya sudah jadi di `artifacts/`:

| Kebutuhan halaman | Sumber | Keterangan |
| --- | --- | --- |
| Halaman Performa: kartu ringkasan | `metrics.json` → `accuracy`, `macro_f1`, `false_positive`, `false_negative` | Nilai 0 sampai 1 (kalikan 100 untuk persen) |
| Halaman Performa: tabel per kelas | `metrics.json` → `per_class[]` | Tiap item: `label`, `precision`, `recall`, `f1`, `support` |
| Halaman Performa: heatmap | `metrics.json` → `confusion_matrix` dan `classes` | Matriks 15x15 jumlah mentah; baris = aktual, kolom = prediksi, urutan sama dengan `classes` |
| Halaman Performa: fitur penting | `metrics.json` → `feature_importance[]` | 15 fitur teratas: `feature`, `importance` |
| Gambar siap pakai | `confusion_matrix.png`, `feature_importance.png`, `distribusi_kelas.png` | Bisa ditampilkan langsung atau dipakai di laporan |
| Halaman Deteksi: contoh data uji | `sample_flows.csv` | 109 baris, 69 fitur + kolom `Label` (jawaban asli untuk dibandingkan dengan prediksi) |

Hal yang perlu diperhatikan:

- Model punya **15 kelas**: `BENIGN` (lalu lintas normal) dan 14 jenis serangan. Daftar lengkap dan urutannya ada di `classes.json`. Pakai file itu sebagai satu-satunya acuan nama label untuk warna, badge, dan legenda.
- Input prediksi berupa **69 angka** per aliran jaringan, urutan kolom sesuai `feature_names.json`. Untuk demo, pilih satu baris dari `sample_flows.csv`.
- Dalam pandangan IDS, hasil dikelompokkan menjadi **normal** (`BENIGN`) dan **serangan** (14 kelas lain). Kartu status di dashboard cukup memakai dua kelompok ini, sedangkan nama serangan spesifik ditampilkan sebagai detail.
- Ada kelas yang performanya lebih rendah karena datanya sedikit: XSS (recall 0,28), Heartbleed (2 sampel uji), SQL Injection (4 sampel uji). Sebaiknya halaman Performa memberi catatan kecil agar pengguna tidak salah baca.
- Jika backend ingin menampilkan tingkat keyakinan, `model.predict_proba` tersedia (Random Forest).

Jika bentuk data di atas perlu diubah (misalnya format JSON lain untuk grafik), beri tahu Orang 1, karena `metrics.json` dibuat dari notebook dan mudah disesuaikan.
