
from pathlib import Path

from app.utils.image_processing import process_image


image_path = Path("test_images/ISIC_0033520.jpg")

with open(image_path, "rb") as file:
    image_bytes = file.read()

image_tensor, original_image = process_image(image_bytes)

print("\nImage Processing Test")
print("=" * 40)

print("Original image size:", original_image.size)
print("Tensor shape:", image_tensor.shape)
print("Tensor dtype:", image_tensor.dtype)
print("Minimum value:", image_tensor.min().item())
print("Maximum value:", image_tensor.max().item())

print("\nImage processing successful!")
