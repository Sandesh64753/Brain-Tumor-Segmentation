import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.analysis import Analysis

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{analysis_id}/download")
def download_pdf_report(
    analysis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    if not analysis or not analysis.report_pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF Report not found for this analysis."
        )

    if not os.path.exists(analysis.report_pdf_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file is missing from server storage."
        )

    return FileResponse(
        path=analysis.report_pdf_path,
        media_type="application/pdf",
        filename=f"NeuroScan_Report_{analysis_id[:8]}.pdf",
        headers={"Content-Disposition": f"attachment; filename=NeuroScan_Report_{analysis_id[:8]}.pdf"}
    )
