from typing import Dict, Tuple
import torch
import numpy as np
from app.core.config import settings
from app.ml.model_loader import model_loader
from app.services.preprocessing_service import preprocessing_service

class ClassificationService:
    def __init__(self):
        self.class_names = settings.get_class_names()

    def predict(self, rgb_numpy: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """
        Runs PyTorch classification model inference on input MRI array.
        Returns: (predicted_class, confidence, probabilities_dict)
        """
        adapter = model_loader.classification_adapter
        if not adapter or not adapter.is_loaded:
            raise RuntimeError("Classification model is not initialized.")

        tensor = preprocessing_service.preprocess_for_classification(rgb_numpy)
        probabilities_tensor = adapter.predict(tensor)
        
        probs = probabilities_tensor.squeeze(0).cpu().numpy().tolist()
        
        # Build probability dictionary
        prob_dict = {}
        for idx, class_name in enumerate(self.class_names):
            if idx < len(probs):
                prob_dict[class_name] = round(float(probs[idx]), 4)
            else:
                prob_dict[class_name] = 0.0

        # Determine top predicted class
        top_idx = int(np.argmax(probs))
        predicted_class = self.class_names[top_idx] if top_idx < len(self.class_names) else "Unknown"
        confidence = round(float(probs[top_idx]), 4)

        return predicted_class, confidence, prob_dict

classification_service = ClassificationService()
