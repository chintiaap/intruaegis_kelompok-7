import io, json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BASE = Path(__file__).parent
MODEL = joblib.load(BASE / "model.joblib")
CLASSES = json.loads((BASE / "classes.json").read_text())          # index -> nama label
FEATURES = json.loads((BASE / "feature_names.json").read_text())   # 69 fitur, urutan training
METRICS = json.loads((BASE / "metrics.json").read_text())
BENIGN = "BENIGN"
MAX_BYTES = 100 * 1024 * 1024  # batas upload 100 MB

app = FastAPI(title="IntruAegis API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],   # alamat Next.js
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "n_features": len(FEATURES), "n_classes": len(CLASSES)}


@app.get("/metrics")
def metrics():
    return METRICS


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(413, "File terlalu besar (maks 100 MB)")
    try:
        df = pd.read_csv(io.BytesIO(raw), encoding="latin-1")
    except Exception:
        raise HTTPException(400, "File bukan CSV yang valid")

    df.columns = df.columns.str.strip()          # sama seperti saat training
    missing = [c for c in FEATURES if c not in df.columns]
    if missing:
        raise HTTPException(400, f"Kolom hilang ({len(missing)}): {missing[:5]}")

    X = df[FEATURES].apply(pd.to_numeric, errors="coerce")
    bad = np.isinf(X).any(axis=1) | X.isna().any(axis=1)   # training membuang baris inf/NaN
    X = X[~bad].astype("float32")
    if X.empty:
        raise HTTPException(400, "Tidak ada baris valid")

    proba = MODEL.predict_proba(X)
    idx = proba.argmax(axis=1)
    labels = np.array(CLASSES)[MODEL.classes_[idx]]   # model mengeluarkan angka 0-14, bukan teks
    conf = proba.max(axis=1)

    counts = pd.Series(labels).value_counts()
    total = len(labels)
    attacks = int((labels != BENIGN).sum())
    return {
        "total_rows": int(len(df)),
        "rows_dropped": int(bad.sum()),
        "total": total,
        "normal": total - attacks,
        "attacks": attacks,
        "attack_ratio": round(attacks / total, 4),
        "distribution": {k: int(v) for k, v in counts.items()},
        "detections": [
            {"row": int(i), "label": str(l), "confidence": round(float(c), 4)}
            for i, l, c in list(zip(X.index, labels, conf))[:200]
        ],
    }
