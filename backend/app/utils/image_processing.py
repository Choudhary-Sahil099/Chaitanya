
from io import BytesIO

import torch
from PIL import Image, UnidentifiedImageError
from torchvision import transforms

from app.services.model_loader import model_loader


class ImageProcessingError(Exception):
    """Raised when an uploaded image is invalid."""


# Image preprocessing configuration from our trained model
image_transform = transforms.Compose([
    transforms.Resize(
        tuple(model_loader.config["input_size"])
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=model_loader.config["mean"],
        std=model_loader.config["std"]
    )
])


def process_image(image_bytes: bytes) -> tuple[torch.Tensor, Image.Image]:
    """
    Validate and preprocess an uploaded image.

    Returns:
        image_tensor: Normalized tensor [1, 3, 224, 224]
        original_image: Original RGB image for visualization
    """

    if not image_bytes:
        raise ImageProcessingError("Uploaded image is empty.")

    # Limit upload size to 10 MB
    max_size = 10 * 1024 * 1024

    if len(image_bytes) > max_size:
        raise ImageProcessingError(
            "Image exceeds the maximum size of 10 MB."
        )

    try:
        image = Image.open(BytesIO(image_bytes))

        # Reject animated images
        if getattr(image, "is_animated", False):
            raise ImageProcessingError(
                "Animated images are not supported."
            )

        image.verify()

        # Reopen after verification
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

    except (UnidentifiedImageError, OSError, ValueError):
        raise ImageProcessingError(
            "Invalid or unsupported image file."
        )

    # Reject extremely small images
    width, height = image.size

    if width < 50 or height < 50:
        raise ImageProcessingError(
            "Image resolution is too low. Minimum size is 50x50."
        )

    # Apply exact model preprocessing
    image_tensor = image_transform(image).unsqueeze(0)

    return image_tensor, image
