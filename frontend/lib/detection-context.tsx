"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { PredictResponse } from "@/types";

interface DetectionContextValue {
  result: PredictResponse | null;
  setResult: (result: PredictResponse) => void;
}

const DetectionContext = createContext<DetectionContextValue | null>(null);

export function DetectionProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<PredictResponse | null>(null);
  return <DetectionContext.Provider value={{ result, setResult }}>{children}</DetectionContext.Provider>;
}

export function useDetection() {
  const context = useContext(DetectionContext);
  if (!context) throw new Error("useDetection must be used within DetectionProvider");
  return context;
}
