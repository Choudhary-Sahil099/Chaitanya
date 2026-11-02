from pydantic import BaseModel, Field


class AIReviewRequest(BaseModel):
    predicted_class: str
    predicted_class_code: str
    confidence: float = Field(ge=0, le=1)

    class_probabilities: dict[str, float]

    is_uncertain: bool
    normalized_entropy: float = Field(ge=0, le=1)

    uncertainty_reasons: list[str] = []


class AIReviewResponse(BaseModel):
    success: bool
    review: str
    model: str
    disclaimer: str