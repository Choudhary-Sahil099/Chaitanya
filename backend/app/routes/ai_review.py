import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai_review_schema import AIReviewRequest
from app.services.ai_review_service import (
    DISCLAIMER,
    GEMINI_MODEL,
    generate_ai_review_stream,
)

router = APIRouter(
    prefix="/api",
    tags=["AI Review"],
)


@router.post("/ai-review")
def create_ai_review(request: AIReviewRequest):

    def event_stream():
        try:
            for chunk in generate_ai_review_stream(
                request.model_dump()
            ):
                payload = {
                    "type": "chunk",
                    "text": chunk,
                }

                yield f"data: {json.dumps(payload)}\n\n"

            yield f"data: {json.dumps({
                'type': 'done',
                'model': GEMINI_MODEL,
                'disclaimer': DISCLAIMER,
            })}\n\n"

        except Exception:
            payload = {
                "type": "error",
                "message": "Unable to generate the AI review. Please try again.",
            }

            yield f"data: {json.dumps(payload)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )