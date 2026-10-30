
from app.services.model_loader import model_loader
from app.services.uncertainty import uncertainty_detector


class PredictionService:
    """Handles skin lesion classification and prediction results."""

    def __init__(self):
        self.model_loader = model_loader
        self.uncertainty_detector = uncertainty_detector

        self.class_names = self.model_loader.class_names

        self.label_to_code = (
            self.model_loader.class_mapping["label_to_code"]
        )

        self.code_to_name = (
            self.model_loader.class_mapping["code_to_name"]
        )

    def predict(self, image_tensor):
        """
        Predict the lesion category from a preprocessed image tensor.

        Expected input shape: [1, 3, 224, 224]
        """

        if image_tensor.ndim != 4 or image_tensor.shape[0] != 1:
            raise ValueError(
                "Expected one image with shape [1, 3, 224, 224]."
            )

        # Generate raw model logits
        logits = self.model_loader.model(
            image_tensor.to(self.model_loader.device)
        )

        # Apply calibration and uncertainty detection
        analysis = self.uncertainty_detector.analyze(logits)

        predicted_index = analysis["predicted_class_index"]

        predicted_code = self.label_to_code[str(predicted_index)]
        predicted_name = self.code_to_name[predicted_code]

        # Build probabilities for all seven classes
        class_probabilities = []

        for index, probability in enumerate(
            analysis["probabilities"]
        ):
            code = self.label_to_code[str(index)]

            class_probabilities.append({
                "class_index": index,
                "class_code": code,
                "class_name": self.code_to_name[code],
                "probability": probability
            })

        # Sort classes by probability, highest first
        class_probabilities.sort(
            key=lambda item: item["probability"],
            reverse=True
        )

        return {
            "predicted_class": predicted_name,
            "predicted_class_code": predicted_code,
            "confidence": analysis["confidence"],
            "status": analysis["status"],
            "is_uncertain": analysis["is_uncertain"],
            "normalized_entropy": analysis["normalized_entropy"],
            "uncertainty_reasons": analysis["uncertainty_reasons"],
            "class_probabilities": class_probabilities
        }


# Shared prediction service
prediction_service = PredictionService()
