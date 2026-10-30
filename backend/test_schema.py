from app.schemas.prediction_schema import (
    PredictionResponse,
    ClassProbability
)

test_response = PredictionResponse(
    predicted_class="Melanocytic nevi",
    predicted_class_code="nv",
    confidence=0.85,
    status="accepted",
    is_uncertain=False,
    normalized_entropy=0.20,
    uncertainty_reasons=[],
    class_probabilities=[
        ClassProbability(
            class_index=0,
            class_code="nv",
            class_name="Melanocytic nevi",
            probability=0.85
        )
    ]
)

print(test_response.model_dump_json(indent=4))