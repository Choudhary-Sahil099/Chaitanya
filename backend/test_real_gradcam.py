
import torch
import cv2
import numpy as np

from PIL import Image
from torchvision import transforms

from app.services.model_loader import model_loader
from app.services.gradcam import gradcam_service
from app.services.uncertainty import uncertainty_detector


# Image location
IMAGE_PATH = "test_images/ISIC_0033520.jpg"
# Load image
image = Image.open(IMAGE_PATH).convert("RGB")

# Preserve original image for visualization
original = np.array(image)

# Apply the same preprocessing used during training
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

image_tensor = preprocess(image).unsqueeze(0)

# Generate prediction
with torch.no_grad():
    logits = model_loader.model(
        image_tensor.to(model_loader.device)
    )

# Get calibrated prediction and uncertainty
result = uncertainty_detector.analyze(logits)

predicted_index = result["predicted_class_index"]
predicted_name = model_loader.class_names[predicted_index]

# Generate Grad-CAM for predicted class
heatmap, grayscale_cam = gradcam_service.generate(
    image_tensor,
    target_class=predicted_index
)

# Resize original image for overlay
original_resized = cv2.resize(original, (224, 224))

# Convert RGB to BGR for OpenCV
original_bgr = cv2.cvtColor(
    original_resized,
    cv2.COLOR_RGB2BGR
)

# Generate overlay
overlay = cv2.addWeighted(
    original_bgr,
    0.6,
    heatmap,
    0.4,
    0
)

# Save outputs
cv2.imwrite("real_gradcam_heatmap.jpg", heatmap)
cv2.imwrite("real_gradcam_overlay.jpg", overlay)
cv2.imwrite("real_original.jpg", original_bgr)

print("\nREAL IMAGE GRAD-CAM TEST")
print("=" * 45)

print("Predicted class:", predicted_name)
print("Confidence:", round(result["confidence"], 4))
print("Normalized entropy:", round(result["normalized_entropy"], 4))
print("Uncertainty status:", result["status"])

print("\nGenerated files:")
print("- real_original.jpg")
print("- real_gradcam_heatmap.jpg")
print("- real_gradcam_overlay.jpg")
