import cv2
import torch
import numpy as np
from app.ml.model_loader import model_loader
from app.services.preprocessing_service import preprocessing_service

class GradCAMService:
    def generate_heatmap(self, rgb_numpy: np.ndarray, target_class_idx: int = None) -> np.ndarray:
        """
        Generates Grad-CAM heatmap for the classification model.
        Returns uint8 RGB heatmap array (H, W, 3) matched to original image size.
        """
        adapter = model_loader.classification_adapter
        if not adapter or not adapter.is_loaded:
            raise RuntimeError("Classification model is not initialized for Grad-CAM.")

        model = adapter.model
        device = adapter.device
        orig_h, orig_w = rgb_numpy.shape[:2]

        tensor = preprocessing_service.preprocess_for_classification(rgb_numpy).to(device)
        tensor.requires_grad = True

        gradients = []
        activations = []

        def forward_hook(module, input, output):
            activations.append(output)
            def save_grad(grad):
                gradients.append(grad)
            output.register_hook(save_grad)

        target_layer = model.get_target_layer(adapter.target_layer_name)
        h_forward = target_layer.register_forward_hook(forward_hook)

        model.zero_grad()
        output = model(tensor)

        if target_class_idx is None:
            target_class_idx = int(torch.argmax(output, dim=1).item())

        score = output[0, target_class_idx]
        score.backward()

        h_forward.remove()

        if not gradients or not activations:
            # Fallback heatmap if hooks failed to trigger
            return np.zeros((orig_h, orig_w, 3), dtype=np.uint8)

        grads = gradients[0].detach().cpu().numpy()[0]
        acts = activations[0].detach().cpu().numpy()[0]

        # Global average pooling of gradients
        weights = np.mean(grads, axis=(1, 2))
        cam = np.zeros(acts.shape[1:], dtype=np.float32)

        for i, w in enumerate(weights):
            cam += w * acts[i, :, :]

        # ReLU and Min-Max normalization
        cam = np.maximum(cam, 0)
        cam_min, cam_max = cam.min(), cam.max()
        if cam_max > cam_min:
            cam = (cam - cam_min) / (cam_max - cam_min + 1e-8)
        else:
            cam = np.zeros_like(cam)

        cam_resized = cv2.resize((cam * 255).astype(np.uint8), (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
        color_heatmap_bgr = cv2.applyColorMap(cam_resized, cv2.COLORMAP_JET)
        color_heatmap_rgb = cv2.cvtColor(color_heatmap_bgr, cv2.COLOR_BGR2RGB)
        return color_heatmap_rgb

gradcam_service = GradCAMService()
