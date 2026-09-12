from typing import Tuple, Optional
import cv2
import torch
import numpy as np
from app.ml.model_loader import model_loader
from app.services.preprocessing_service import preprocessing_service

class SegmentationService:
    def predict(self, rgb_numpy: np.ndarray, threshold: float = 0.5) -> Tuple[np.ndarray, bool, int, float, Optional[float], Optional[float]]:
        """
        Runs UNet segmentation model on MRI image.
        Resizes binary mask back to original image dimensions.
        Returns: (binary_mask, tumor_detected, tumor_pixels, area_percentage, dice_score, iou_score)
        """
        adapter = model_loader.segmentation_adapter
        if not adapter or not adapter.is_loaded:
            raise RuntimeError("Segmentation model is not initialized.")

        orig_h, orig_w = rgb_numpy.shape[:2]
        tensor = preprocessing_service.preprocess_for_segmentation(rgb_numpy)
        
        mask_tensor = adapter.predict_mask(tensor, threshold=threshold)
        mask_numpy = mask_tensor.squeeze(0).squeeze(0).cpu().numpy() # (H, W) in [0, 1]
        
        # Resize binary mask back to original dimensions
        mask_resized = cv2.resize((mask_numpy * 255).astype(np.uint8), (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)
        binary_mask = (mask_resized > 127).astype(np.uint8) * 255

        # Calculate metrics
        tumor_pixels = int(np.count_nonzero(binary_mask))
        total_pixels = orig_h * orig_w
        area_percentage = round((tumor_pixels / total_pixels) * 100.0, 2)
        tumor_detected = tumor_pixels > 50 # Threshold for noise filtering

        # Dice & IoU require ground truth - keep as None when ground truth is unavailable
        dice_score = None
        iou_score = None

        return binary_mask, tumor_detected, tumor_pixels, area_percentage, dice_score, iou_score

segmentation_service = SegmentationService()
