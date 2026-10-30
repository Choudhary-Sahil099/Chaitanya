
from fastapi import APIRouter

router = APIRouter(
    tags=["Home"]
)


@router.get("/", summary="Home")
async def home():
    return {
        "success": True,
        "application": "DermaExplain",
        "version": "1.0.0",
        "description": (
            "AI-powered skin lesion classification "
            "with Grad-CAM explainability and uncertainty estimation."
        ),
        "message": "Welcome to DermaExplain API!",
        "available_endpoints": {
            "home": "/",
            "health": "/health",
            "prediction": "/api/predict",
            "documentation": "/docs"
        },
        "disclaimer": (
            "This is an experimental AI research prototype, "
            "not a medical diagnostic tool."
        )
    }
