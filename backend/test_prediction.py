import torch

from app.services.prediction_service import prediction_service


# Simulate a preprocessed 224x224 RGB image
dummy_image = torch.randn(1, 3, 224, 224)

result = prediction_service.predict(dummy_image)

print("\nDermaExplain Prediction Test")
print("=" * 45)

print("Predicted class:", result["predicted_class"])
print("Class code:", result["predicted_class_code"])

print("Confidence:", round(result["confidence"], 4))
print("Status:", result["status"])
print("Uncertain:", result["is_uncertain"])

print("\nAll seven class probabilities:")

for item in result["class_probabilities"]:
    print(
        f'{item["class_name"]}: '
        f'{item["probability"]:.4f}'
    )