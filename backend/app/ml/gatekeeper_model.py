import os
import logging
import torch
import torch.nn as nn
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

class ConvAutoencoder(nn.Module):
    """
    Convolutional Autoencoder for Brain MRI Anomaly Detection & Gatekeeping.
    Trained to reconstruct normal and pathological brain MRI slices with low error.
    Non-MRI inputs yield significantly higher reconstruction error.
    """
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(1, 32, 3, stride=2, padding=1), nn.ReLU(),   # 128 -> 64
            nn.Conv2d(32, 64, 3, stride=2, padding=1), nn.ReLU(),  # 64 -> 32
            nn.Conv2d(64, 128, 3, stride=2, padding=1), nn.ReLU(), # 32 -> 16
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1, output_padding=1), nn.ReLU(),  # 16 -> 32
            nn.ConvTranspose2d(64, 32, 3, stride=2, padding=1, output_padding=1), nn.ReLU(),   # 32 -> 64
            nn.ConvTranspose2d(32, 1, 3, stride=2, padding=1, output_padding=1), nn.Sigmoid(), # 64 -> 128
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        z = self.encoder(x)
        return self.decoder(z)


class GatekeeperModelAdapter:
    """
    Adapter wrapper for the PyTorch ConvAutoencoder gatekeeper model.
    """
    def __init__(
        self,
        model_path: str,
        threshold_path: str,
        device: str = "cpu"
    ):
        self.model_path = model_path
        self.threshold_path = threshold_path
        self.device = torch.device(device if torch.cuda.is_available() and device.startswith("cuda") else "cpu")
        self.model: Optional[ConvAutoencoder] = None
        self.threshold: float = 0.001505
        self.is_loaded = False
        self._load()

    def _resolve_path(self, path: str) -> str:
        if os.path.isabs(path) and os.path.exists(path):
            return path
        # Try relative to current working dir
        if os.path.exists(path):
            return path
        # Try relative to backend dir
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        candidate = os.path.join(backend_dir, path)
        if os.path.exists(candidate):
            return candidate
        # Try relative to repo root
        repo_root = os.path.dirname(backend_dir)
        candidate2 = os.path.join(repo_root, path)
        if os.path.exists(candidate2):
            return candidate2
        # Try filename directly in repo root
        basename = os.path.basename(path)
        candidate3 = os.path.join(repo_root, basename)
        if os.path.exists(candidate3):
            return candidate3
        return path

    def _load(self):
        try:
            resolved_threshold = self._resolve_path(self.threshold_path)
            if os.path.exists(resolved_threshold):
                with open(resolved_threshold, "r") as f:
                    self.threshold = float(f.read().strip())
                logger.info(f"Loaded MRI Gatekeeper threshold: {self.threshold:.6f} from {resolved_threshold}")
            else:
                logger.warning(f"Threshold file not found at {resolved_threshold}, using default: {self.threshold}")

            resolved_model = self._resolve_path(self.model_path)
            if not os.path.exists(resolved_model):
                logger.warning(f"Gatekeeper model file not found at {resolved_model}")
                return

            model = ConvAutoencoder()
            state_dict = torch.load(resolved_model, map_location=self.device)
            model.load_state_dict(state_dict)
            model.to(self.device)
            model.eval()
            self.model = model
            self.is_loaded = True
            logger.info(f"Successfully loaded MRI Gatekeeper model from {resolved_model} on {self.device}")
        except Exception as e:
            logger.error(f"Error loading Gatekeeper model: {str(e)}", exc_info=True)
            self.is_loaded = False

    def compute_reconstruction_error(self, tensor: torch.Tensor) -> float:
        """
        Computes MSE reconstruction error between input tensor and autoencoder reconstruction.
        Input tensor shape: (1, 1, 128, 128)
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Gatekeeper autoencoder model is not loaded.")

        with torch.no_grad():
            x = tensor.to(self.device)
            recon = self.model(x)
            mse_err = float(((recon - x) ** 2).mean().item())
            return mse_err

    def validate_tensor(self, tensor: torch.Tensor) -> Tuple[bool, float, float]:
        """
        Returns (is_mri, recon_error, threshold)
        """
        err = self.compute_reconstruction_error(tensor)
        is_mri = err <= self.threshold
        return is_mri, err, self.threshold
