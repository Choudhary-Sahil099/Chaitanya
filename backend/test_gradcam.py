import torch
import cv2

from app.services.gradcam import gradcam_service
from app.services.model_loader import model_loader

# Generate a dummy normalized image tensor
dummy_image = torch.randn(1, 3, 224, 224)

# Get predicted class
with torch.no_grad():
    logits = model_loader.model(
        dummy_image.to(model_loader.device)
    )

predicted_class = logits.argmax(dim=1).item()

# Generate Grad-CAM
heatmap, grayscale_cam = gradcam_service.generate(
    dummy_image,
    target_class=predicted_class
)

print("\nGrad-CAM Test")
print("=" * 40)

print("Predicted class index:", predicted_class)
print("Heatmap shape:", heatmap.shape)
print("Grayscale CAM shape:", grayscale_cam.shape)
print("Minimum CAM value:", grayscale_cam.min())
print("Maximum CAM value:", grayscale_cam.max())

# Save heatmap
cv2.imwrite("gradcam_test_heatmap.jpg", heatmap)

print("\nGrad-CAM generated successfully!")
print("Saved: gradcam_test_heatmap.jpg")