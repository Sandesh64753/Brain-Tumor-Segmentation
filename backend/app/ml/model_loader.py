import logging
from app.core.config import settings
from app.ml.classification_model import ClassificationModelAdapter
from app.ml.segmentation_model import SegmentationModelAdapter
from app.ml.gatekeeper_model import GatekeeperModelAdapter

logger = logging.getLogger(__name__)

class ModelLoader:
    _instance = None
    
    def __init__(self):
        self.classification_adapter = None
        self.segmentation_adapter = None
        self.gatekeeper_adapter = None
        self.device = settings.DEVICE
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelLoader()
        return cls._instance

    def initialize_models(self):
        logger.info("Initializing PyTorch models at application startup...")
        
        class_names = settings.get_class_names()
        num_classes = len(class_names)
        
        # 1. MRI Gatekeeper Model
        self.gatekeeper_adapter = GatekeeperModelAdapter(
            model_path=settings.GATEKEEPER_MODEL_PATH,
            threshold_path=settings.GATEKEEPER_THRESHOLD_PATH,
            device=self.device
        )
        
        # 2. Classification Model
        self.classification_adapter = ClassificationModelAdapter(
            model_path=settings.CLASSIFICATION_MODEL_PATH,
            num_classes=num_classes,
            device=self.device,
            target_layer=settings.GRADCAM_TARGET_LAYER
        )
        
        # 3. Segmentation Model
        self.segmentation_adapter = SegmentationModelAdapter(
            model_path=settings.SEGMENTATION_MODEL_PATH,
            device=self.device
        )
        
        logger.info("PyTorch models loaded and ready for inference.")

model_loader = ModelLoader.get_instance()
