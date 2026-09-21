from fastapi import APIRouter
from app.core.config import settings
from app.ml.model_loader import model_loader

router = APIRouter(prefix="/models", tags=["Models Metadata"])

@router.get("")
def get_models_metadata():
    class_adapter = model_loader.classification_adapter
    seg_adapter = model_loader.segmentation_adapter
    gatekeeper_adapter = model_loader.gatekeeper_adapter

    return [
        {
            "id": "gatekeeper",
            "name": "MRI Scan Gatekeeper / Validator",
            "type": "Anomaly Detection",
            "framework": "PyTorch",
            "version": "v1.0",
            "input": "Uploaded Image (JPG, PNG, DICOM)",
            "output": "MRI Validity Decision & Reconstruction MSE",
            "architecture": "Deep Convolutional Autoencoder",
            "is_loaded": gatekeeper_adapter.is_loaded if gatekeeper_adapter else False,
            "device": settings.DEVICE,
            "path": settings.GATEKEEPER_MODEL_PATH,
            "threshold": gatekeeper_adapter.threshold if gatekeeper_adapter else 0.001505,
            "description": "Autoencoder-based gatekeeper that reconstructs brain MRI slices and rejects non-MRI inputs with high reconstruction error (MSE > threshold)."
        },
        {
            "id": "classification",
            "name": "Brain Tumor Classification Model",
            "type": "Classification",
            "framework": "PyTorch",
            "version": "v1.0",
            "input": "Brain MRI (JPG, PNG, DICOM)",
            "output": "4-Class Category & Confidence Score",
            "class_names": settings.get_class_names(),
            "architecture": "ResNet18 Backbone Classifier",
            "is_loaded": class_adapter.is_loaded if class_adapter else False,
            "device": settings.DEVICE,
            "path": settings.CLASSIFICATION_MODEL_PATH,
            "description": "Convolutional Neural Network trained to categorize brain MRI slices into Glioma, Meningioma, Pituitary, or No Tumor."
        },
        {
            "id": "segmentation",
            "name": "Tumor Region Segmentation Model",
            "type": "Segmentation",
            "framework": "PyTorch",
            "version": "v1.0",
            "input": "Brain MRI (JPG, PNG, DICOM)",
            "output": "Binary Segmentation Mask & Area Percentage",
            "architecture": "U-Net Encoder-Decoder with Skip Connections",
            "is_loaded": seg_adapter.is_loaded if seg_adapter else False,
            "device": settings.DEVICE,
            "path": settings.SEGMENTATION_MODEL_PATH,
            "description": "Deep U-Net architecture that localizes tumor pixel boundaries and calculates total lesion surface coverage."
        },
        {
            "id": "gradcam",
            "name": "Grad-CAM Visual Explainability Module",
            "type": "Explainable AI",
            "framework": "PyTorch",
            "version": "v1.0",
            "input": "Classification Feature Activation Maps",
            "output": "Heatmap Overlay (JET Colormap)",
            "target_layer": settings.GRADCAM_TARGET_LAYER,
            "architecture": "Gradient-weighted Class Activation Mapping",
            "description": "Visualizes key anatomical regions in the MRI scan that exerted dominant influence on model predictions."
        }
    ]
