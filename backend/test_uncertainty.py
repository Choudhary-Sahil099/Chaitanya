import torch

from app.services.uncertainty import uncertainty_detector


# Simulated logits for seven classes
test_logits = torch.tensor([
    [5.0, 1.0, 0.5, 0.2, 0.1, -0.5, -1.0]
])

result = uncertainty_detector.analyze(test_logits)

print("\nUncertainty Detection Test")
print("-" * 40)

print("Predicted class index:",
      result["predicted_class_index"])

print("Confidence:",
      round(result["confidence"], 4))

print("Normalized entropy:",
      round(result["normalized_entropy"], 4))

print("Status:", result["status"])

print("Uncertain:", result["is_uncertain"])

print("Reasons:", result["uncertainty_reasons"])

print("\nClass probabilities:")

for index, probability in enumerate(result["probabilities"]):
    print(f"Class {index}: {probability:.4f}")