# IntruAegis Frontend

Frontend Next.js untuk dashboard deteksi intrusi jaringan IntruAegis.

## Teknologi

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts
- React Context untuk menyimpan hasil analisis terakhir pada sesi browser

## Instalasi

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

## Environment

`NEXT_PUBLIC_API_URL` default-nya adalah `http://localhost:8000`.

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Integrasi hanya menggunakan:

- `GET /health`
- `GET /metrics`
- `POST /predict` dengan multipart field `file`

File CSV harus berisi 69 kolom fitur yang tercantum pada `backend/feature_names.json`. Hasil prediksi disimpan di React state untuk sesi browser dan tidak dibuat histori permanen.

## Halaman

- `/dashboard`: status backend/model, ringkasan hasil terakhir, distribusi, dan empty state.
- `/detection`: validasi, drag/drop, upload CSV, loading, error, dan ringkasan respons API.
- `/results`: tabel hasil prediksi, pencarian, filter, status normal/attack, confidence, dan pagination.
- `/performance`: akurasi, macro F1, FP/FN, tabel per kelas, confusion matrix, dan feature importance.
- `/about`: profil tiga developer dan teknologi proyek.

## Struktur

```text
app/                 route dan halaman
components/layout/   sidebar dan shell
lib/api.ts           service API tunggal
lib/detection-context.tsx
 types/index.ts      interface TypeScript
```

## Perintah

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```
