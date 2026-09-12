import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    
    filename = Column(String(255), nullable=False)
    original_image_path = Column(String(512), nullable=False)
    gradcam_image_path = Column(String(512), nullable=True)
    mask_image_path = Column(String(512), nullable=True)
    overlay_image_path = Column(String(512), nullable=True)
    report_pdf_path = Column(String(512), nullable=True)
    
    classification = Column(String(100), nullable=False)
    classification_confidence = Column(Float, nullable=False)
    class_probabilities = Column(Text, nullable=False) # JSON string representation
    
    tumor_detected = Column(Boolean, nullable=False, default=False)
    tumor_pixels = Column(Integer, nullable=False, default=0)
    tumor_area_percentage = Column(Float, nullable=False, default=0.0)
    dice_score = Column(Float, nullable=True) # None when ground truth unavailable
    iou_score = Column(Float, nullable=True) # None when ground truth unavailable
    
    inference_time_ms = Column(Integer, nullable=False)
    classification_model_version = Column(String(100), default="NeuroScan-Classify-v1.0")
    segmentation_model_version = Column(String(100), default="NeuroScan-Segment-v1.0")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="analyses")
