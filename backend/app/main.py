
from contextlib import asynccontextmanager
from app.routes.ai_review import router as ai_review_router
from fastapi import FastAPI

from app.routes.history import router as history_router
from app.routes.home import router as home_router
from app.routes.prediction import router as prediction_router

from app.database.connection import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables when the application starts
    init_db()
    print("Database initialized successfully.")

    yield

    print("Application shutting down.")


app = FastAPI(
    title="DermaExplain API",
    description=(
        "AI-powered skin lesion classification "
        "with Grad-CAM explainability and uncertainty estimation."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# Register API routes
app.include_router(home_router)
app.include_router(prediction_router)
app.include_router(history_router)
app.include_router(ai_review_router)
@app.get("/health", tags=["System"])
async def health():
    return {
        "success": True,
        "status": "healthy",
        "application": "DermaExplain",
        "model": "EfficientNet-B0",
    }
