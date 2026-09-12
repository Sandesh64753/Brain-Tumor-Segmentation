import os
import logging
import torch
import torch.nn as nn

logger = logging.getLogger(__name__)

class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super(DoubleConv, self).__init__()
        self.double_conv = nn.Sequential(
            nn.Conv2d(in_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        return self.double_conv(x)


class UNet(nn.Module):
    """
    Standard UNet Architecture for Brain MRI Segmentation matching best_brisc_unet.pth.
    """
    def __init__(self, in_channels=3, out_channels=1):
        super(UNet, self).__init__()
        self.enc1 = DoubleConv(in_channels, 64)
        self.enc2 = DoubleConv(64, 128)
        self.enc3 = DoubleConv(128, 256)
        self.enc4 = DoubleConv(256, 512)
        self.pool = nn.MaxPool2d(2, 2)
        self.bottleneck = DoubleConv(512, 1024)
        
        self.up4 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec4 = DoubleConv(1024, 512)
        
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = DoubleConv(512, 256)
        
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = DoubleConv(256, 128)
        
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = DoubleConv(128, 64)
        
        self.final = nn.Conv2d(64, out_channels, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        e4 = self.enc4(self.pool(e3))
        b = self.bottleneck(self.pool(e4))
        
        d4 = self.up4(b)
        d4 = torch.cat([d4, e4], dim=1)
        d4 = self.dec4(d4)
        
        d3 = self.up3(d4)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)
        
        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)
        
        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)
        
        logits = self.final(d1)
        return self.sigmoid(logits)


class SegmentationModelAdapter:
    """
    Adapter class to load real custom PyTorch segmentation weights or models.
    Supports state_dict, full serialized models, or checkpoint dicts.
    """
    def __init__(self, model_path: str, device: str = "cpu"):
        self.model_path = model_path
        self.device = torch.device(device if torch.cuda.is_available() and "cuda" in device else "cpu")
        self.model = None
        self.is_loaded = False
        
        self.load_model()

    def load_model(self):
        try:
            self.model = UNet(in_channels=3, out_channels=1)
            
            if os.path.exists(self.model_path):
                logger.info(f"Loading Segmentation model from {self.model_path}")
                checkpoint = torch.load(self.model_path, map_location=self.device)
                
                if isinstance(checkpoint, dict):
                    if "state_dict" in checkpoint:
                        self.model.load_state_dict(checkpoint["state_dict"], strict=False)
                    elif "model_state_dict" in checkpoint:
                        self.model.load_state_dict(checkpoint["model_state_dict"], strict=False)
                    else:
                        self.model.load_state_dict(checkpoint, strict=False)
                elif isinstance(checkpoint, torch.nn.Module):
                    self.model = checkpoint
                
                logger.info("Segmentation model weights loaded successfully.")
            else:
                logger.warning(f"Segmentation model file not found at {self.model_path}. Operating in baseline initialization mode.")

            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
        except Exception as e:
            logger.error(f"Error loading segmentation model: {str(e)}. Initializing fallback baseline model.")
            self.model = UNet(in_channels=3, out_channels=1)
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True

    def predict_mask(self, image_tensor: torch.Tensor, threshold: float = 0.5):
        self.model.eval()
        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            outputs = self.model(image_tensor)
            binary_mask = (outputs > threshold).float()
            return binary_mask
