"""Pengujian otomatis backend IntruAegis.

Jalankan dari folder backend:
    pip install pytest httpx
    pytest -v
"""
from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

import main

BASE = Path(__file__).parent
client = TestClient(main.app)


@pytest.fixture(scope="module")
def sample():
    return pd.read_csv(BASE / "sample_flows.csv")


def kirim(isi: bytes, nama: str = "uji.csv"):
    return client.post("/predict", files={"file": (nama, isi, "text/csv")})


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "n_features": 69, "n_classes": 15}


def test_metrics_memuat_hasil_evaluasi():
    r = client.get("/metrics")
    assert r.status_code == 200
    data = r.json()
    for kunci in ("accuracy", "macro_f1", "per_class", "confusion_matrix"):
        assert kunci in data


def test_predict_berkas_valid():
    r = kirim((BASE / "sample_flows.csv").read_bytes())
    assert r.status_code == 200
    j = r.json()
    assert j["total_rows"] == 109 and j["rows_dropped"] == 0
    assert j["normal"] + j["attacks"] == j["total"] == 109
    assert sum(j["distribution"].values()) == 109
    assert len(j["detections"]) <= 200


def test_baris_inf_dan_kosong_dibuang(sample):
    d = sample.copy()
    d.loc[0, "Flow Duration"] = np.inf
    d.loc[1, "Flow Bytes/s"] = np.nan
    j = kirim(d.to_csv(index=False).encode()).json()
    assert j["rows_dropped"] == 2 and j["total"] == 107


def test_kolom_kurang_ditolak(sample):
    d = sample.drop(columns=["Flow Duration", "Destination Port"])
    r = kirim(d.to_csv(index=False).encode())
    assert r.status_code == 400
    assert "Kolom hilang" in r.json()["detail"]


def test_urutan_kolom_dan_spasi_nama_kolom_tidak_memengaruhi_hasil(sample):
    dasar = kirim((BASE / "sample_flows.csv").read_bytes()).json()
    kolom = list(sample.columns)
    np.random.default_rng(1).shuffle(kolom)
    d = sample[kolom].copy()
    d.columns = [" " + k if i % 5 == 0 else k for i, k in enumerate(d.columns)]
    j = kirim(d.to_csv(index=False).encode()).json()
    assert j["distribution"] == dasar["distribution"]


def test_berkas_bukan_csv_ditolak():
    r = kirim(bytes(range(256)) * 20, "acak.bin")
    assert r.status_code == 400


def test_semua_baris_rusak_ditolak(sample):
    d = sample.copy()
    d["Flow Duration"] = np.inf
    r = kirim(d.to_csv(index=False).encode())
    assert r.status_code == 400
    assert r.json()["detail"] == "Tidak ada baris valid"


def test_berkas_terlalu_besar_ditolak():
    r = kirim(b"a" * (101 * 1024 * 1024))
    assert r.status_code == 413


def test_tanpa_berkas_ditolak():
    assert client.post("/predict").status_code == 422