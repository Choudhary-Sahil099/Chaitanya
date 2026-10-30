
import math
import torch

from app.services.model_loader import model_loader


class UncertaintyDetector:
    """Calibrates model probabilities and detects uncertain predictions."""

    def __init__(self):
        self.temperature = float(model_loader.temperature)

        policy = model_loader.uncertainty_policy
        decision_policy = policy["decision_policy"]

        self.confidence_threshold = float(
            decision_policy["confidence_threshold"]
        )

        self.entropy_threshold = float(
            decision_policy["entropy_threshold"]
        )

        self.num_classes = int(
            model_loader.config["num_classes"]
        )

    def analyze(self, logits):
        """
        Apply temperature scaling and the validation-derived
        uncertainty policy to model logits.
        """

        if logits.ndim != 2 or logits.shape[0] != 1:
            raise ValueError(
                "Expected logits with shape [1, num_classes]."
            )

        if logits.shape[1] != self.num_classes:
            raise ValueError(
                f"Expected {self.num_classes} class scores."
            )

        # Temperature-scaled probabilities
        calibrated_logits = logits / self.temperature
        probabilities = torch.softmax(
            calibrated_logits, dim=1
        )[0]

        # Maximum class probability
        confidence, predicted_index = torch.max(
            probabilities, dim=0
        )

        # Normalized predictive entropy
        epsilon = 1e-10

        entropy = -torch.sum(
            probabilities * torch.log(probabilities + epsilon)
        )

        normalized_entropy = entropy / math.log(self.num_classes)

        confidence_value = confidence.item()
        entropy_value = normalized_entropy.item()
        predicted_index = predicted_index.item()

        # Both acceptance conditions must be satisfied
        confidence_pass = (
            confidence_value >= self.confidence_threshold
        )

        entropy_pass = (
            entropy_value <= self.entropy_threshold
        )

        is_uncertain = not (
            confidence_pass and entropy_pass
        )

        if is_uncertain:
            reasons = []

            if not confidence_pass:
                reasons.append("Low prediction confidence")

            if not entropy_pass:
                reasons.append("High prediction entropy")

            status = "uncertain"
        else:
            reasons = []
            status = "accepted"

        return {
            "predicted_class_index": predicted_index,
            "confidence": confidence_value,
            "normalized_entropy": entropy_value,
            "is_uncertain": is_uncertain,
            "status": status,
            "uncertainty_reasons": reasons,
            "probabilities": probabilities.tolist()
        }


# Shared uncertainty detector
uncertainty_detector = UncertaintyDetector()
