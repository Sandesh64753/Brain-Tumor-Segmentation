import os
import logging
import torch
import torch.nn as nn
import timm

logger = logging.getLogger(__name__)

def get_last_conv_layer(model: nn.Module):
    """Utility to find the last Conv2d layer in the model for Grad-CAM."""
    for layer in reversed(list(model.modules())):
        if isinstance(layer, torch.nn.Conv2d):
            return layer
    return None

class BrainTumorClassifier(nn.Module):
    """
    Xception-based Architecture for Brain Tumor Classification.
    Structure: timm Xception backbone -> Flatten -> Dropout(0.3) -> Linear(2048, 128) -> ReLU -> Dropout(0.25) -> Linear(128, num_classes)
    """
    def __init__(self, num_classes=4, pretrained=False):
        super(BrainTumorClassifier, self).__init__()
        self.base_model = timm.create_model("xception", pretrained=pretrained, num_classes=0)
        self.model = nn.Sequential(
            self.base_model,
            nn.Flatten(),
            nn.Dropout(0.3),
            nn.Linear(self.base_model.num_features, 128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.model(x)

    def get_target_layer(self, target_layer_name="conv4"):
        """Returns the target layer for Grad-CAM calculation"""
        layer = get_last_conv_layer(self.base_model)
        if layer is not None:
            return layer
        return getattr(self.base_model, target_layer_name, self.base_model.conv4)


class ClassificationModelAdapter:
    """
    Adapter class to load real custom PyTorch classification weights or models.
    Supports state_dict, full serialized models, or checkpoint dicts.
    """
    def __init__(self, model_path: str, num_classes: int = 4, device: str = "cpu", target_layer: str = "conv4"):
        self.model_path = model_path
        self.num_classes = num_classes
        self.device = torch.device(device if torch.cuda.is_available() and "cuda" in device else "cpu")
        self.target_layer_name = target_layer
        self.model = None
        self.is_loaded = False
        
        self.load_model()

    def load_model(self):
        try:
            self.model = BrainTumorClassifier(num_classes=self.num_classes)
            
            if os.path.exists(self.model_path):
                logger.info(f"Loading Classification model from {self.model_path}")
                checkpoint = torch.load(self.model_path, map_location=self.device)
                
                if isinstance(checkpoint, dict):
                    if "state_dict" in checkpoint:
                        self.model.model.load_state_dict(checkpoint["state_dict"], strict=True)
                    elif "model_state_dict" in checkpoint:
                        self.model.model.load_state_dict(checkpoint["model_state_dict"], strict=True)
                    else:
                        self.model.model.load_state_dict(checkpoint, strict=True)
                elif isinstance(checkpoint, torch.nn.Module):
                    self.model = checkpoint
                
                logger.info("Classification Xception model weights loaded successfully.")
            else:
                logger.warning(f"Classification model file not found at {self.model_path}. Operating in baseline initialization mode.")

            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Error loading classification model: {str(e)}. Initializing fallback baseline model.")
            self.model = BrainTumorClassifier(num_classes=self.num_classes)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True

    def predict(self, image_tensor: torch.Tensor):
        self.model.eval()
        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            outputs = self.model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            return probabilities
