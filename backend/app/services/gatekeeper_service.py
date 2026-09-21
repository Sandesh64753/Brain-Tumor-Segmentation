import os
import logging
from typing import Dict, Any, Tuple, Union
import numpy as np
from PIL import Image
import torch
from torchvision import transforms

from app.ml.model_loader import model_loader
from app.utils.image_utils import load_image_as_rgb
from app.utils.dicom_utils import is_dicom_file, read_dicom_as_rgb

logger = logging.getLogger(__name__)

IMG_SIZE = 128

_transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

class GatekeeperService:
    """
    Gatekeeper service that validates whether an uploaded image is genuinely a brain MRI scan
    before forwarding to downstream tumor classification and segmentation models.
    """
    def __init__(self):
        self.img_size = IMG_SIZE

    def heuristic_check(self, rgb_numpy: np.ndarray) -> Tuple[bool, str]:
        """
        Fast heuristic pre-filter before invoking the neural autoencoder.
        Checks:
        1. Colorfulness: Genuine MRI scans are grayscale (RGB channels are nearly identical).
        2. Contrast variance: Rejects blank, completely dark, or single-color corrupted images.
        3. Dimensions: Rejects images with dimensions < 64x64.
        """
        h, w = rgb_numpy.shape[:2]
        if w < 64 or h < 64:
            return False, f"Resolution too low ({w}x{h}). Minimum 64x64 required for MRI analysis."

        arr = rgb_numpy.astype(np.float32)
        if arr.ndim == 3 and arr.shape[2] >= 3:
            channel_spread = arr[:, :, :3].max(axis=2) - arr[:, :, :3].min(axis=2)
            if channel_spread.mean() > 25.0:
                return False, "Image contains significant color content. Genuine Brain MRI scans are grayscale."

        if arr.std() < 5.0:
            return False, "Image has almost no contrast variation (blank or corrupted scan)."

        return True, ""

    def preprocess_image(self, rgb_numpy: np.ndarray) -> torch.Tensor:
        """
        Converts RGB numpy array to grayscale (1, 1, 128, 128) PyTorch tensor normalized to [0, 1].
        """
        pil_img = Image.fromarray(rgb_numpy)
        tensor = _transform(pil_img) # shape: (1, 128, 128)
        return tensor.unsqueeze(0)   # shape: (1, 1, 128, 128)

    def validate_image_array(self, rgb_numpy: np.ndarray) -> Dict[str, Any]:
        """
        Runs full 2-stage gatekeeper validation on an in-memory RGB numpy array.
        """
        # Stage 1: Heuristic fast filter
        passed_heuristics, reason = self.heuristic_check(rgb_numpy)
        if not passed_heuristics:
            return {
                "is_mri": False,
                "stage": "heuristic",
                "reason": reason,
                "recon_error": None,
                "threshold": getattr(model_loader.gatekeeper_adapter, "threshold", 0.001505) if model_loader.gatekeeper_adapter else 0.001505,
                "message": f"Scan verification failed at heuristic stage: {reason}"
            }

        # Stage 2: Neural ConvAutoencoder anomaly detection
        adapter = model_loader.gatekeeper_adapter
        if not adapter or not adapter.is_loaded:
            logger.warning("Gatekeeper autoencoder model adapter is not loaded; passing through.")
            return {
                "is_mri": True,
                "stage": "bypass",
                "reason": None,
                "recon_error": None,
                "threshold": 0.001505,
                "message": "Gatekeeper model in bypass mode (adapter not loaded)."
            }

        tensor = self.preprocess_image(rgb_numpy)
        is_mri, recon_error, threshold = adapter.validate_tensor(tensor)

        if not is_mri:
            return {
                "is_mri": False,
                "stage": "autoencoder",
                "reason": f"Reconstruction error ({recon_error:.5f}) exceeds calibrated threshold ({threshold:.5f}) — image does not match Brain MRI anatomy.",
                "recon_error": round(recon_error, 6),
                "threshold": round(threshold, 6),
                "message": "Scan verification failed: The uploaded image does not appear to be a Brain MRI scan."
            }

        return {
            "is_mri": True,
            "stage": "autoencoder",
            "reason": None,
            "recon_error": round(recon_error, 6),
            "threshold": round(threshold, 6),
            "message": "Image successfully validated as a genuine Brain MRI scan."
        }

    def validate_file(self, file_path: str) -> Dict[str, Any]:
        """
        Validates an image from file path (supports JPG, PNG, DICOM).
        """
        try:
            if is_dicom_file(file_path):
                rgb_numpy = read_dicom_as_rgb(file_path)
            else:
                rgb_numpy = load_image_as_rgb(file_path)
            return self.validate_image_array(rgb_numpy)
        except Exception as e:
            return {
                "is_mri": False,
                "stage": "format_error",
                "reason": f"Failed to decode image: {str(e)}",
                "recon_error": None,
                "threshold": 0.001505,
                "message": f"Unable to read or parse file: {str(e)}"
            }

gatekeeper_service = GatekeeperService()
