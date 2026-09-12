import os
import cv2
import numpy as np
from PIL import Image

PADDING = 10

def cutout_image(img: np.ndarray, padding: int = PADDING) -> np.ndarray:
    """
    Automatically detects the largest contour and crops the
    image around it with the specified padding.
    Accepts uint8 RGB or BGR or grayscale numpy array.
    """
    if img is None or img.size == 0:
        return img

    if len(img.shape) == 3 and img.shape[2] == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    elif len(img.shape) == 2:
        gray = img
    else:
        return img

    # Gaussian blur
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # Otsu thresholding
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # Morphological cleaning
    kernel = np.ones((5, 5), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Fallback
    if len(contours) == 0:
        return img

    # Largest contour
    largest_contour = max(contours, key=cv2.contourArea)

    # Bounding rectangle
    x, y, w, h = cv2.boundingRect(largest_contour)

    # Padding
    x_min = max(0, x - padding)
    y_min = max(0, y - padding)
    x_max = min(img.shape[1], x + w + padding)
    y_max = min(img.shape[0], y + h + padding)

    # Crop
    cropped = img[y_min:y_max, x_min:x_max]

    # Safety check
    if cropped.size == 0:
        return img

    return cropped


def load_image_as_rgb(file_path: str) -> np.ndarray:
    """Reads image file (PNG, JPG, JPEG) and returns RGB uint8 numpy array (H, W, 3)."""
    image = Image.open(file_path).convert("RGB")
    return np.array(image)

def save_numpy_as_image(array: np.ndarray, output_path: str) -> str:
    """Saves uint8 numpy array (RGB or Grayscale) to output_path."""
    if array.dtype != np.uint8:
        if array.max() <= 1.0:
            array = (array * 255).astype(np.uint8)
        else:
            array = array.astype(np.uint8)

    if len(array.shape) == 2:
        img = Image.fromarray(array, mode="L")
    elif array.shape[2] == 3:
        img = Image.fromarray(array, mode="RGB")
    elif array.shape[2] == 4:
        img = Image.fromarray(array, mode="RGBA")
    else:
        raise ValueError(f"Unsupported array shape: {array.shape}")
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path)
    return output_path

def create_combined_overlay(original_rgb: np.ndarray, mask: np.ndarray, gradcam_heatmap: np.ndarray = None, alpha_mask: float = 0.4, alpha_gradcam: float = 0.4) -> np.ndarray:
    """
    Combines Original MRI RGB + Tumor Segmentation Red Overlay + Grad-CAM Heatmap.
    """
    h, w = original_rgb.shape[:2]
    
    # Ensure overlay base is float
    overlay = original_rgb.astype(np.float32)
    
    # Apply red tumor mask overlay
    if mask is not None:
        mask_resized = cv2.resize(mask.astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST)
        red_mask = np.zeros_like(original_rgb, dtype=np.float32)
        red_mask[:, :, 0] = 255.0 # Red channel
        
        tumor_indices = mask_resized > 0
        overlay[tumor_indices] = (1 - alpha_mask) * overlay[tumor_indices] + alpha_mask * red_mask[tumor_indices]

    # Apply Grad-CAM heatmap overlay if provided
    if gradcam_heatmap is not None:
        if len(gradcam_heatmap.shape) == 3 and gradcam_heatmap.shape[2] == 3:
            color_heatmap_rgb = cv2.resize(gradcam_heatmap.astype(np.float32), (w, h))
        else:
            heatmap_resized = cv2.resize(gradcam_heatmap.astype(np.float32), (w, h))
            if heatmap_resized.max() <= 1.0:
                heatmap_resized = (heatmap_resized * 255).astype(np.uint8)
            else:
                heatmap_resized = heatmap_resized.astype(np.uint8)
            color_heatmap = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
            color_heatmap_rgb = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB).astype(np.float32)
        
        overlay = (1 - alpha_gradcam) * overlay + alpha_gradcam * color_heatmap_rgb

    return np.clip(overlay, 0, 255).astype(np.uint8)
