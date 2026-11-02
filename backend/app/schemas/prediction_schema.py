
from typing import List, Optional, Literal

from pydantic import BaseModel, Field


class ClassProbability(BaseModel):
    """Probability assigned to one diagnostic category."""

    class_index: int
    class_code: str
    class_name: str
    probability: float = Field(ge=0.0, le=1.0)


class PredictionResponse(BaseModel):
    """Complete DermaExplain prediction response."""

    success: bool = True
    analysis_id: Optional[int] = None
    predicted_class: str
    predicted_class_code: str

    confidence: float = Field(ge=0.0, le=1.0)

    status: Literal["accepted", "uncertain"]
    is_uncertain: bool

    normalized_entropy: float

    uncertainty_reasons: List[str]

    class_probabilities: List[ClassProbability]

    # Base64-encoded PNG images
    gradcam_heatmap: Optional[str] = None
    gradcam_overlay: Optional[str] = None

    disclaimer: str = (
        "DermaExplain is an experimental AI research prototype. "
        "Its predictions are not medical diagnoses. "
        "Consult a qualified healthcare professional for "
        "medical assessment."
    )


class ErrorResponse(BaseModel):
    """Standard API error response."""

    success: bool = False
    detail: str
