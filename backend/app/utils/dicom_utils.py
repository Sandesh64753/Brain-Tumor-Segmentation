import numpy as np
from PIL import Image

def is_dicom_file(filename: str) -> bool:
    ext = filename.lower().split('.')[-1]
    return ext in ['dcm', 'dicom']

def read_dicom_as_rgb(file_path: str) -> np.ndarray:
    """Reads a DICOM file using pydicom (if available) and normalizes pixel values to 0-255 RGB."""
    try:
        import pydicom
        ds = pydicom.dcmread(file_path)
        pixel_array = ds.pixel_array.astype(float)

        # Handle Rescale Slope and Intercept if present
        if hasattr(ds, 'RescaleSlope') and hasattr(ds, 'RescaleIntercept'):
            pixel_array = pixel_array * ds.RescaleSlope + ds.RescaleIntercept

        # Min-max normalization to 0-255
        p_min = np.min(pixel_array)
        p_max = np.max(pixel_array)
        
        if p_max > p_min:
            normalized = ((pixel_array - p_min) / (p_max - p_min)) * 255.0
        else:
            normalized = np.zeros_like(pixel_array)
            
        normalized_uint8 = normalized.astype(np.uint8)

        # If 2D image, convert to 3-channel RGB
        if len(normalized_uint8.shape) == 2:
            rgb_image = np.stack([normalized_uint8] * 3, axis=-1)
        elif len(normalized_uint8.shape) == 3 and normalized_uint8.shape[0] in [1, 3]:
            # Channel first to channel last
            if normalized_uint8.shape[0] == 1:
                rgb_image = np.stack([normalized_uint8[0]] * 3, axis=-1)
            else:
                rgb_image = np.transpose(normalized_uint8, (1, 2, 0))
        else:
            rgb_image = normalized_uint8

        return rgb_image
    except Exception as e:
        # Fallback to PIL in case of standard image with dicom extension
        img = Image.open(file_path).convert("RGB")
        return np.array(img)
