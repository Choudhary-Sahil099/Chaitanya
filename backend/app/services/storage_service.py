
import uuid
from pathlib import Path

import cv2
import numpy as np

from app.database.connection import STORAGE_DIR


ANALYSIS_STORAGE_DIR = STORAGE_DIR / "analyses"


def save_analysis_images(
    image_bytes: bytes,
    heatmap: np.ndarray,
    overlay: np.ndarray,
):
    """Save original image and Grad-CAM visualizations."""

    analysis_id = str(uuid.uuid4())

    analysis_dir = ANALYSIS_STORAGE_DIR / analysis_id
    analysis_dir.mkdir(parents=True, exist_ok=True)

    original_path = analysis_dir / "original_image"
    heatmap_path = analysis_dir / "gradcam_heatmap.png"
    overlay_path = analysis_dir / "gradcam_overlay.png"

    # Preserve original uploaded image bytes.
    # Use a safe generated filename rather than the user's filename.
    original_path = analysis_dir / "original_image.bin"
    original_path.write_bytes(image_bytes)

    # Save Grad-CAM images.
    if not cv2.imwrite(str(heatmap_path), heatmap):
        raise RuntimeError("Could not save Grad-CAM heatmap.")

    if not cv2.imwrite(str(overlay_path), overlay):
        raise RuntimeError("Could not save Grad-CAM overlay.")

    return {
        "analysis_id": analysis_id,
        "image_path": str(original_path),
        "gradcam_heatmap_path": str(heatmap_path),
        "gradcam_overlay_path": str(overlay_path),
    }
