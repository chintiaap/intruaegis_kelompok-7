export interface HealthResponse {
  status: string;
  n_features: number;
  n_classes: number;
}

export interface Detection {
  row: number;
  label: string;
  confidence: number;
}

export interface PredictResponse {
  total_rows: number;
  rows_dropped: number;
  total: number;
  normal: number;
  attacks: number;
  attack_ratio: number;
  distribution: Record<string, number>;
  detections: Detection[];
}

export interface PerClassMetric {
  label: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface MetricsResponse {
  accuracy: number;
  macro_f1: number;
  classes: string[];
  per_class: PerClassMetric[];
  confusion_matrix: number[][];
  false_positive: number;
  false_negative: number;
  feature_importance: FeatureImportance[];
}
