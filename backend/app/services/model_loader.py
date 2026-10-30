
import json
from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models


# Resolve the backend directory
BACKEND_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BACKEND_DIR / "app" / "models"


class ModelLoader:
    """Loads and manages the trained DermaExplain model."""

    def __init__(self):
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.model = None
        self.config = None
        self.class_mapping = None
        self.uncertainty_policy = None

        self._load_configurations()
        self._load_model()

    def _load_configurations(self):
        """Load model and class configuration files."""

        with open(MODEL_DIR / "dermaexplain_config.json") as file:
            self.config = json.load(file)

        with open(MODEL_DIR / "class_mapping.json") as file:
            self.class_mapping = json.load(file)

        with open(MODEL_DIR / "uncertainty_policy.json") as file:
            self.uncertainty_policy = json.load(file)

    def _load_model(self):
        """Initialize EfficientNet-B0 and load trained weights."""

        self.model = models.efficientnet_b0(weights=None)

        self.model.classifier[0] = nn.Dropout(p=0.3)
        self.model.classifier[1] = nn.Linear(
            self.model.classifier[1].in_features,
            self.config["num_classes"]
        )

        checkpoint_path = (
            MODEL_DIR / "dermaexplain_efficientnet_b0.pth"
        )

        if not checkpoint_path.exists():
            raise FileNotFoundError(
                f"Model checkpoint not found: {checkpoint_path}"
            )

        state_dict = torch.load(
            checkpoint_path,
            map_location=self.device,
            weights_only=True
        )

        self.model.load_state_dict(state_dict)

        self.model.to(self.device)
        self.model.eval()

        print(f"DermaExplain model loaded on {self.device}")

    @property
    def class_names(self):
        return self.config["class_names"]

    @property
    def temperature(self):
        return self.uncertainty_policy["temperature"]


# Shared model instance
model_loader = ModelLoader()
