export interface User {
  id: str;
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ClassificationResult {
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface SegmentationResult {
  tumor_detected: boolean;
  tumor_pixels: number;
  area_percentage: number;
  dice_score: number | null;
  iou_score: number | null;
}

export interface Visualizations {
  original: string;
  gradcam: string;
  mask: string;
  overlay: string;
}

export interface AnalysisPredictionResponse {
  analysis_id: string;
  filename: string;
  classification: ClassificationResult;
  segmentation: SegmentationResult;
  visualizations: Visualizations;
  inference_time_ms: number;
  classification_model_version: string;
  segmentation_model_version: string;
  created_at: string;
}

export interface AnalysisListItem {
  id: string;
  filename: string;
  classification: string;
  classification_confidence: number;
  tumor_detected: boolean;
  tumor_area_percentage: number;
  created_at: string;
  original_image_path: string;
  overlay_image_path: string;
  report_pdf_path?: string | null;
}

export interface ModelMetadata {
  id: string;
  name: string;
  type: string;
  framework: string;
  version: string;
  input: string;
  output: string;
  architecture: string;
  description: string;
  is_loaded: boolean;
  device: string;
  path?: string;
  class_names?: string[];
  target_layer?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AdminStats {
  metrics: {
    total_users: number;
    total_analyses: number;
    analyses_today: number;
    tumor_detected_count: number;
    no_tumor_count: number;
  };
  system_status: {
    database_connected: boolean;
    device: string;
    classification_model_loaded: boolean;
    segmentation_model_loaded: boolean;
  };
}
