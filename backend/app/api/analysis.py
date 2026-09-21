import os
import uuid
import time
import json
import numpy as np
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.analysis import Analysis
from app.schemas.analysis import (
    AnalysisPredictionResponse,
    AnalysisListItem,
    ClassificationResult,
    SegmentationResult,
    Visualizations,
    MriValidationResponse
)
from app.utils.image_utils import load_image_as_rgb, save_numpy_as_image, create_combined_overlay
from app.utils.dicom_utils import is_dicom_file, read_dicom_as_rgb
from app.services.classification_service import classification_service
from app.services.segmentation_service import segmentation_service
from app.services.gradcam_service import gradcam_service
from app.services.report_service import report_service
from app.services.gatekeeper_service import gatekeeper_service

router = APIRouter(prefix="/analysis", tags=["MRI Analysis"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".dcm", ".dicom"}


@router.post("/validate", response_model=MriValidationResponse)
async def validate_mri_file(
    file: UploadFile = File(...)
):
    """
    Fast Gatekeeper validation endpoint.
    Checks whether the uploaded file is a valid brain MRI scan using 2-stage verification:
    1. Heuristic filters (colors, variance, resolution)
    2. ConvAutoencoder reconstruction error comparison against calibrated threshold
    """
    filename = file.filename or "scan.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return MriValidationResponse(
            is_mri=False,
            stage="format_error",
            reason=f"Unsupported format '{ext}'. Allowed: JPG, PNG, DICOM (.dcm).",
            recon_error=None,
            threshold=0.001505,
            message="Invalid file format."
        )

    content = await file.read()
    temp_path = os.path.join(settings.UPLOAD_DIR, f"val_temp_{uuid.uuid4()}_{filename}")
    try:
        with open(temp_path, "wb") as f:
            f.write(content)

        val_result = gatekeeper_service.validate_file(temp_path)
        return MriValidationResponse(**val_result)
    except Exception as e:
        return MriValidationResponse(
            is_mri=False,
            stage="exception",
            reason=str(e),
            recon_error=None,
            threshold=0.001505,
            message=f"Validation error: {str(e)}"
        )
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@router.post("/predict", response_model=AnalysisPredictionResponse)
async def predict_mri(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate extension
    filename = file.filename or "mri_scan.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, DICOM (.dcm)."
        )

    # Read content & check size limit
    content = await file.read()
    max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    start_time = time.time()
    analysis_id = str(uuid.uuid4())
    
    # Paths setup
    analysis_dir = os.path.join(settings.OUTPUT_DIR, analysis_id)
    upload_file_path = os.path.join(settings.UPLOAD_DIR, f"{analysis_id}_{filename}")
    os.makedirs(analysis_dir, exist_ok=True)

    # Save uploaded file
    with open(upload_file_path, "wb") as f:
        f.write(content)

    # Process RGB numpy array
    try:
        if is_dicom_file(filename):
            rgb_numpy = read_dicom_as_rgb(upload_file_path)
        else:
            rgb_numpy = load_image_as_rgb(upload_file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to process this image. Please verify that the uploaded file is a valid MRI image. Error: {str(e)}"
        )

    # 0. Gatekeeper MRI Validation Check
    val_result = gatekeeper_service.validate_image_array(rgb_numpy)
    if not val_result.get("is_mri", False):
        # Clean up saved upload if not a valid MRI
        if os.path.exists(upload_file_path):
            try:
                os.remove(upload_file_path)
            except Exception:
                pass
        reason_msg = val_result.get("reason") or "Image does not match MRI characteristics."
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MRI Gatekeeper Validation Failed: The uploaded image is un-validated and was rejected (Reason: {reason_msg}). Tumor detection was not performed."
        )

    # 1. Classification
    predicted_class, confidence, probabilities = classification_service.predict(rgb_numpy)
    
    # Find top class index for Grad-CAM
    class_names = settings.get_class_names()
    target_class_idx = class_names.index(predicted_class) if predicted_class in class_names else 0

    # 2. Segmentation
    # If classification says "No Tumor", skip UNet and produce a blank mask
    if predicted_class == "No Tumor":
        orig_h, orig_w = rgb_numpy.shape[:2]
        binary_mask = np.zeros((orig_h, orig_w), dtype=np.uint8)
        tumor_detected = False
        tumor_pixels = 0
        area_percentage = 0.0
        dice_score = None
        iou_score = None
    else:
        binary_mask, tumor_detected, tumor_pixels, area_percentage, dice_score, iou_score = segmentation_service.predict(rgb_numpy)

    # 3. Grad-CAM Heatmap
    gradcam_heatmap = gradcam_service.generate_heatmap(rgb_numpy, target_class_idx=target_class_idx)

    # 4. Combined Overlay
    overlay_rgb = create_combined_overlay(rgb_numpy, binary_mask, gradcam_heatmap, alpha_mask=0.4, alpha_gradcam=0.35)

    # Save generated visual assets
    orig_path = os.path.join(analysis_dir, "original.png")
    gradcam_path = os.path.join(analysis_dir, "gradcam.png")
    mask_path = os.path.join(analysis_dir, "mask.png")
    overlay_path = os.path.join(analysis_dir, "overlay.png")
    pdf_report_path = os.path.join(settings.REPORT_DIR, f"{analysis_id}_report.pdf")

    save_numpy_as_image(rgb_numpy, orig_path)
    save_numpy_as_image(gradcam_heatmap, gradcam_path)
    save_numpy_as_image(binary_mask, mask_path)
    save_numpy_as_image(overlay_rgb, overlay_path)

    elapsed_ms = int((time.time() - start_time) * 1000)

    # Build DB Analysis entity
    analysis_record = Analysis(
        id=analysis_id,
        user_id=current_user.id,
        filename=filename,
        original_image_path=orig_path,
        gradcam_image_path=gradcam_path,
        mask_image_path=mask_path,
        overlay_image_path=overlay_path,
        report_pdf_path=pdf_report_path,
        classification=predicted_class,
        classification_confidence=confidence,
        class_probabilities=json.dumps(probabilities),
        tumor_detected=tumor_detected,
        tumor_pixels=tumor_pixels,
        tumor_area_percentage=area_percentage,
        dice_score=dice_score,
        iou_score=iou_score,
        inference_time_ms=elapsed_ms,
        classification_model_version="NeuroScan-Classify-v1.0",
        segmentation_model_version="NeuroScan-Segment-v1.0"
    )

    # Generate PDF Report
    try:
        report_service.generate_pdf_report(analysis_record, pdf_report_path)
    except Exception as e:
        print(f"Warning: PDF report generation error: {str(e)}")

    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # Construct web accessible URL paths for images
    def get_file_url(abs_path: str) -> str:
        rel_path = os.path.relpath(abs_path, start=os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        return f"/static/{rel_path.replace(os.sep, '/')}"

    return AnalysisPredictionResponse(
        analysis_id=analysis_record.id,
        filename=analysis_record.filename,
        classification=ClassificationResult(
            predicted_class=predicted_class,
            confidence=confidence,
            probabilities=probabilities
        ),
        segmentation=SegmentationResult(
            tumor_detected=tumor_detected,
            tumor_pixels=tumor_pixels,
            area_percentage=area_percentage,
            dice_score=dice_score,
            iou_score=iou_score
        ),
        visualizations=Visualizations(
            original=get_file_url(orig_path),
            gradcam=get_file_url(gradcam_path),
            mask=get_file_url(mask_path),
            overlay=get_file_url(overlay_path)
        ),
        inference_time_ms=elapsed_ms,
        classification_model_version=analysis_record.classification_model_version,
        segmentation_model_version=analysis_record.segmentation_model_version,
        created_at=analysis_record.created_at
    )


@router.get("/history", response_model=List[AnalysisListItem])
def get_analysis_history(
    search: Optional[str] = Query(None),
    classification_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)

    if classification_filter and classification_filter != "all":
        query = query.filter(Analysis.classification == classification_filter)

    if search:
        query = query.filter(Analysis.filename.ilike(f"%{search}%"))

    analyses = query.order_by(Analysis.created_at.desc()).all()

    def get_file_url(abs_path: str) -> str:
        if not abs_path:
            return ""
        rel_path = os.path.relpath(abs_path, start=os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        return f"/static/{rel_path.replace(os.sep, '/')}"

    results = []
    for item in analyses:
        results.append(AnalysisListItem(
            id=item.id,
            filename=item.filename,
            classification=item.classification,
            classification_confidence=item.classification_confidence,
            tumor_detected=item.tumor_detected,
            tumor_area_percentage=item.tumor_area_percentage,
            created_at=item.created_at,
            original_image_path=get_file_url(item.original_image_path),
            overlay_image_path=get_file_url(item.overlay_image_path),
            report_pdf_path=f"/api/reports/{item.id}/download" if item.report_pdf_path else None
        ))

    return results


@router.get("/{analysis_id}", response_model=AnalysisPredictionResponse)
def get_analysis_by_id(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    def get_file_url(abs_path: str) -> str:
        if not abs_path:
            return ""
        rel_path = os.path.relpath(abs_path, start=os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        return f"/static/{rel_path.replace(os.sep, '/')}"

    probs = json.loads(analysis.class_probabilities) if analysis.class_probabilities else {}

    return AnalysisPredictionResponse(
        analysis_id=analysis.id,
        filename=analysis.filename,
        classification=ClassificationResult(
            predicted_class=analysis.classification,
            confidence=analysis.classification_confidence,
            probabilities=probs
        ),
        segmentation=SegmentationResult(
            tumor_detected=analysis.tumor_detected,
            tumor_pixels=analysis.tumor_pixels,
            area_percentage=analysis.tumor_area_percentage,
            dice_score=analysis.dice_score,
            iou_score=analysis.iou_score
        ),
        visualizations=Visualizations(
            original=get_file_url(analysis.original_image_path),
            gradcam=get_file_url(analysis.gradcam_image_path),
            mask=get_file_url(analysis.mask_image_path),
            overlay=get_file_url(analysis.overlay_image_path)
        ),
        inference_time_ms=analysis.inference_time_ms,
        classification_model_version=analysis.classification_model_version,
        segmentation_model_version=analysis.segmentation_model_version,
        created_at=analysis.created_at
    )


@router.delete("/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    db.delete(analysis)
    db.commit()
    return None
