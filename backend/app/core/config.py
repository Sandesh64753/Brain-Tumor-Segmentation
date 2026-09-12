import os
import json
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroScan AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security
    SECRET_KEY: str = Field(default="neuroscan_super_secret_jwt_key_2026_change_in_production!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./neuroscan.db")
    
    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    # File Storage Paths
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    OUTPUT_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "outputs")
    REPORT_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")
    TRAINED_MODELS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "trained_models")
    
    # Machine Learning Settings
    CLASSIFICATION_MODEL_PATH: str = "trained_models/classification/brain_tumor_model-2.pth"
    SEGMENTATION_MODEL_PATH: str = "trained_models/segmentation/best_brisc_unet.pth"
    DEVICE: str = Field(default="cpu")
    
    CLASS_NAMES: Union[str, List[str]] = '["Glioma", "Meningioma", "No Tumor", "Pituitary"]'
    IMAGE_SIZE: int = 224
    MEAN: List[float] = [0.485, 0.456, 0.406]
    STD: List[float] = [0.229, 0.224, 0.225]
    GRADCAM_TARGET_LAYER: str = "conv4"
    
    MAX_UPLOAD_SIZE_MB: int = 10
    
    def get_allowed_origins(self) -> List[str]:
        if isinstance(self.ALLOWED_ORIGINS, list):
            return self.ALLOWED_ORIGINS
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        return ["*"]
        
    def get_class_names(self) -> List[str]:
        if isinstance(self.CLASS_NAMES, list):
            return self.CLASS_NAMES
        if isinstance(self.CLASS_NAMES, str):
            try:
                return json.loads(self.CLASS_NAMES)
            except Exception:
                return ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
        return ["Glioma", "Meningioma", "No Tumor", "Pituitary"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.REPORT_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.TRAINED_MODELS_DIR, "classification"), exist_ok=True)
os.makedirs(os.path.join(settings.TRAINED_MODELS_DIR, "segmentation"), exist_ok=True)
