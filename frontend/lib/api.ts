import type { HealthResponse, MetricsResponse, PredictResponse } from "@/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Tidak dapat terhubung ke backend. Pastikan FastAPI berjalan di http://localhost:8000.");
  }

  if (!response.ok) {
    let detail = `Permintaan gagal (${response.status}).`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<HealthResponse>("/health", { cache: "no-store" });
}

export function getMetrics() {
  return request<MetricsResponse>("/metrics", { cache: "no-store" });
}

export function predictTraffic(file: File) {
  const form = new FormData();
  form.append("file", file);
  return request<PredictResponse>("/predict", { method: "POST", body: form });
}

export { API_URL };
