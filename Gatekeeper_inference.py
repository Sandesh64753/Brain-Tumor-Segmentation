"""
One-Class Gatekeeper Inference
================================
Uses the autoencoder trained in train_mri_autoencoder.py to reject
non-MRI inputs, with no negative dataset required.

Usage:
    result = validate_mri("uploaded_image.jpg")
    if result["is_mri"]:
        # forward to your tumor detection model
        ...
    else:
        # reject
        print(result["reason"])
"""

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import transforms

MODEL_PATH = "mri_autoencoder.pt"
THRESHOLD_PATH = "mri_threshold.txt"
IMG_SIZE = 128
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

_tf = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])


class ConvAutoencoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 32, 3, stride=2, padding=1), nn.ReLU(),
            nn.Conv2d(32, 64, 3, stride=2, padding=1), nn.ReLU(),
            nn.Conv2d(64, 128, 3, stride=2, padding=1), nn.ReLU(),
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1, output_padding=1), nn.ReLU(),
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1, output_padding=1), nn.ReLU(),
            nn.ConvTranspose2d(32, 1, 3, stride=2, padding=1, output_padding=1), nn.Sigmoid(),
        )

    def forward(self, x):
        return self.decoder(self.encoder(x))


_model = None
_threshold = None


def _load():
    global _model, _threshold
    if _model is None:
        m = ConvAutoencoder()
        m.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        m.to(DEVICE)
        m.eval()
        _model = m
        with open(THRESHOLD_PATH) as f:
            _threshold = float(f.read().strip())
    return _model, _threshold


def heuristic_check(img: Image.Image) -> tuple[bool, str]:
    """Fast pre-filter before running the autoencoder (same rationale as before)."""
    rgb = img.convert("RGB")
    arr = np.asarray(rgb).astype(np.float32)

    channel_spread = arr.max(axis=2) - arr.min(axis=2)
    if channel_spread.mean() > 25:
        return False, "Image too colorful for an MRI"

    if arr.std() < 5:
        return False, "Image has almost no variation (likely blank/corrupted)"

    w, h = img.size
    if w < 64 or h < 64:
        return False, "Resolution too low to be a usable MRI scan"

    return True, ""


def validate_mri(image_path: str) -> dict:
    img = Image.open(image_path)

    passed, reason = heuristic_check(img)
    if not passed:
        return {"is_mri": False, "stage": "heuristic", "reason": reason, "recon_error": None}

    model, threshold = _load()
    x = _tf(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        recon = model(x)
        err = float(((recon - x) ** 2).mean().item())

    is_mri = err <= threshold
    reason = None if is_mri else f"Reconstruction error {err:.5f} exceeds threshold {threshold:.5f} (doesn't look like an MRI)"
    return {"is_mri": is_mri, "stage": "autoencoder", "reason": reason, "recon_error": err}


if __name__ == "__main__":
    import sys
    for path in sys.argv[1:]:
        print(path, "->", validate_mri(path))