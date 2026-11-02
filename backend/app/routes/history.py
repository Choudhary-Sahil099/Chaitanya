
import mimetypes
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import shutil

from app.services.storage_service import ANALYSIS_STORAGE_DIR
from app.database.connection import get_db
from app.database.models import Analysis


router = APIRouter(
    prefix="/api",
    tags=["Analysis History"]
)


def get_analysis(db: Session, analysis_id: int):
    """Retrieve an analysis or raise 404."""

    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found."
        )

    return analysis


def get_analysis_file(
    db: Session,
    analysis_id: int,
    path_attribute: str
):
    """Retrieve and validate a stored analysis file."""

    analysis = get_analysis(db, analysis_id)

    stored_path = getattr(analysis, path_attribute, None)

    if not stored_path:
        raise HTTPException(
            status_code=404,
            detail="Requested file is not available."
        )

    file_path = Path(stored_path)

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Requested file was not found."
        )

    return file_path


# --------------------------------------------------
# GET ALL ANALYSES
# --------------------------------------------------

@router.get("/history")
def get_analysis_history(
    db: Session = Depends(get_db)
):
    analyses = (
        db.query(Analysis)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "total": len(analyses),
        "analyses": [
            {
                "id": analysis.id,
                "original_filename": analysis.original_filename,
                "predicted_class": analysis.predicted_class,
                "predicted_class_code": analysis.predicted_class_code,
                "confidence": analysis.confidence,
                "status": analysis.status,
                "is_uncertain": analysis.is_uncertain,
                "created_at": analysis.created_at,
                "image_url": f"/api/history/{analysis.id}/image"
            }
            for analysis in analyses
        ]
    }


# --------------------------------------------------
# GET ORIGINAL IMAGE
# --------------------------------------------------

@router.get("/history/{analysis_id}/image")
def get_analysis_image(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = get_analysis(db, analysis_id)

    image_path = Path(analysis.image_path)

    if not image_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Original image not found."
        )

    media_type = (
        mimetypes.guess_type(analysis.original_filename)[0]
        or "application/octet-stream"
    )

    return FileResponse(
        path=image_path,
        media_type=media_type,
        content_disposition_type="inline"
    )


# --------------------------------------------------
# GET COMPLETE ANALYSIS DETAILS
# --------------------------------------------------

@router.get("/history/{analysis_id}")
def get_analysis_detail(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = get_analysis(db, analysis_id)

    return {
        "success": True,
        "analysis": {
            "id": analysis.id,
            "original_filename": analysis.original_filename,

            "predicted_class": analysis.predicted_class,
            "predicted_class_code": analysis.predicted_class_code,
            "confidence": analysis.confidence,

            "status": analysis.status,
            "is_uncertain": analysis.is_uncertain,
            "normalized_entropy": analysis.normalized_entropy,
            "uncertainty_reasons": analysis.uncertainty_reasons,

            "class_probabilities": analysis.class_probabilities,

            "created_at": analysis.created_at,

            "image_url": f"/api/history/{analysis.id}/image",
            "gradcam_heatmap_url": f"/api/history/{analysis.id}/heatmap",
            "gradcam_overlay_url": f"/api/history/{analysis.id}/overlay"
        }
    }


# --------------------------------------------------
# GET GRAD-CAM HEATMAP
# --------------------------------------------------

@router.get("/history/{analysis_id}/heatmap")
def get_analysis_heatmap(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    path = get_analysis_file(
        db,
        analysis_id,
        "gradcam_heatmap_path"
    )

    return FileResponse(
        path=path,
        media_type="image/png",
        content_disposition_type="inline"
    )


# --------------------------------------------------
# GET GRAD-CAM OVERLAY
# --------------------------------------------------

@router.get("/history/{analysis_id}/overlay")
def get_analysis_overlay(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    path = get_analysis_file(
        db,
        analysis_id,
        "gradcam_overlay_path"
    )

    return FileResponse(
        path=path,
        media_type="image/png",
        content_disposition_type="inline"
    )


@router.delete("/history/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db)
):
    analysis = get_analysis(db, analysis_id)

    # Determine the directory containing this analysis's files.
    image_path = Path(analysis.image_path).resolve()
    storage_root = ANALYSIS_STORAGE_DIR.resolve()
    analysis_dir = image_path.parent

    # Ensure the directory belongs to our analysis storage.
    if not analysis_dir.is_relative_to(storage_root):
        raise HTTPException(
            status_code=400,
            detail="Invalid analysis storage path."
        )

    # Delete the database record.
    db.delete(analysis)
    db.commit()

    # Delete the original image and Grad-CAM files.
    try:
        if analysis_dir.exists():
            shutil.rmtree(analysis_dir)
    except OSError:
        # The database record is deleted; file cleanup can be retried.
        print(f"Warning: Could not remove files from {analysis_dir}")

    return {
        "success": True,
        "message": "Analysis deleted successfully.",
        "analysis_id": analysis_id
    }
