import numpy as np
import torch
import torchvision.transforms as transforms
from app.core.config import settings
from app.utils.image_utils import cutout_image

class PreprocessingService:
    def __init__(self):
        self.classification_size = 299 # Standard Xception resolution
        self.segmentation_size = settings.IMAGE_SIZE
        
        self.classification_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((self.classification_size, self.classification_size)),
            transforms.ToTensor(),
        ])
        
        self.segmentation_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((self.segmentation_size, self.segmentation_size)),
            transforms.ToTensor()
        ])

    def preprocess_for_classification(self, rgb_numpy: np.ndarray, apply_cutout: bool = True) -> torch.Tensor:
        """Preprocesses RGB numpy array with automatic contour cutout into PyTorch tensor batch (1, 3, 299, 299)."""
        if apply_cutout:
            rgb_numpy = cutout_image(rgb_numpy)
        tensor = self.classification_transform(rgb_numpy)
        return tensor.unsqueeze(0)

    def preprocess_for_segmentation(self, rgb_numpy: np.ndarray) -> torch.Tensor:
        """Preprocesses RGB numpy array for segmentation tensor batch (1, 3, H, W)."""
        tensor = self.segmentation_transform(rgb_numpy)
        return tensor.unsqueeze(0)

preprocessing_service = PreprocessingService()
