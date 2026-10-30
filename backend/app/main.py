
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.home import router as home_router
from app.routes.prediction import router as prediction_router


app = FastAPI(
    title="DermaExplain API",
    description=(
        "AI-powered skin lesion classification "
        "with Grad-CAM explainability and uncertainty estimation."
    ),
    version="1.0.0"
)


# Frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(home_router)
app.include_router(prediction_router)


@app.get("/health", tags=["System"])
async def health():
    return {
        "success": True,
        "status": "healthy",
        "application": "DermaExplain",
        "model": "EfficientNet-B0"
    }
