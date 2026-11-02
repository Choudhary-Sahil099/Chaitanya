
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    JSON,
)

from app.database.connection import Base


class Analysis(Base):
    __tablename__ = "analyses"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Uploaded image information
    original_filename = Column(String, nullable=False)
    image_path = Column(String, nullable=False)

    # Prediction information
    predicted_class = Column(String, nullable=False)
    predicted_class_code = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)

    # Uncertainty information
    status = Column(String, nullable=False)
    is_uncertain = Column(Boolean, nullable=False)
    normalized_entropy = Column(Float, nullable=False)
    uncertainty_reasons = Column(JSON, nullable=False)

    # Class probabilities
    class_probabilities = Column(JSON, nullable=False)

    # Grad-CAM visualization paths
    gradcam_heatmap_path = Column(String, nullable=True)
    gradcam_overlay_path = Column(String, nullable=True)

    # Analysis creation timestamp
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
