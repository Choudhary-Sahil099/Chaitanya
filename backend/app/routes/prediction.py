import numpy as np
import base64
import cv2

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.prediction_service import prediction_service
from app.services.gradcam import gradcam_service
from app.utils.image_processing import (
    process_image,
    ImageProcessingError
)
from app.services.model_loader import model_loader

from app.schemas.prediction_schema import PredictionResponse


router = APIRouter(
    prefix="/api",
    tags=["Prediction"]
)


def encode_image(image):
    """Convert an OpenCV image into a Base64 PNG string."""

    success, buffer = cv2.imencode(".png", image)

    if not success:
        raise RuntimeError("Could not encode visualization.")

    return base64.b64encode(buffer).decode("utf-8")


@router.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict_image(
    file: UploadFile = File(...)
):
    """
    Classify an uploaded dermoscopic image,
    calculate uncertainty and generate Grad-CAM.
    """

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=415,
            detail="Only JPEG, PNG and WEBP images are supported."
        )

    try:
        # Read uploaded image
        image_bytes = await file.read()

        # Validate and preprocess
        image_tensor, original_image = process_image(image_bytes)

        # Generate prediction
        result = prediction_service.predict(image_tensor)

        # Get predicted class index
        predicted_index = next(
            index
            for index, code in model_loader.class_mapping[
                "label_to_code"
            ].items()
            if code == result["predicted_class_code"]
        )

        # Generate Grad-CAM
        heatmap, grayscale_cam = gradcam_service.generate(
            image_tensor,
            target_class=int(predicted_index)
        )

        # Prepare original image for overlay
        original_resized = cv2.resize(
            cv2.cvtColor(
                np.array(original_image),
                cv2.COLOR_RGB2BGR
            ),
            (224, 224)
        )

        # Blend original image and heatmap
        overlay = cv2.addWeighted(
            original_resized,
            0.6,
            heatmap,
            0.4,
            0
        )

        # Encode images as Base64
        heatmap_base64 = encode_image(heatmap)
        overlay_base64 = encode_image(overlay)

        # Return structured response
        return PredictionResponse(
            **result,
            gradcam_heatmap=heatmap_base64,
            gradcam_overlay=overlay_base64
        )

    except ImageProcessingError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except HTTPException:
        raise

    except Exception as error:
        print(f"Prediction error: {error}")

        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the image."
        )

    finally:
        await file.close()
