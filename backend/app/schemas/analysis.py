from datetime import datetime
from typing import Dict, Optional
from pydantic import BaseModel

class ClassificationResult(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]

class SegmentationResult(BaseModel):
    tumor_detected: bool
    tumor_pixels: int
    area_percentage: float
    dice_score: Optional[float] = None
    iou_score: Optional[float] = None

class Visualizations(BaseModel):
    original: str
    gradcam: str
    mask: str
    overlay: str

class AnalysisPredictionResponse(BaseModel):
    analysis_id: str
    filename: str
    classification: ClassificationResult
    segmentation: SegmentationResult
    visualizations: Visualizations
    inference_time_ms: int
    classification_model_version: str
    segmentation_model_version: str
    created_at: datetime

class AnalysisListItem(BaseModel):
    id: str
    filename: str
    classification: str
    classification_confidence: float
    tumor_detected: bool
    tumor_area_percentage: float
    created_at: datetime
    original_image_path: str
    overlay_image_path: str
    report_pdf_path: Optional[str] = None

    class Config:
        from_attributes = True
