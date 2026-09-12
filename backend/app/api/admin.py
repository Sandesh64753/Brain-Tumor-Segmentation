from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_admin
from app.core.config import settings
from app.models.user import User
from app.models.analysis import Analysis
from app.ml.model_loader import model_loader

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    total_users = db.query(User).count()
    total_analyses = db.query(Analysis).count()

    # Analyses today
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    analyses_today = db.query(Analysis).filter(Analysis.created_at >= today_start).count()

    # Tumor detected vs no tumor
    tumor_detected_count = db.query(Analysis).filter(Analysis.tumor_detected == True).count()
    no_tumor_count = db.query(Analysis).filter(Analysis.tumor_detected == False).count()

    # System Status
    class_adapter = model_loader.classification_adapter
    seg_adapter = model_loader.segmentation_adapter

    return {
        "metrics": {
            "total_users": total_users,
            "total_analyses": total_analyses,
            "analyses_today": analyses_today,
            "tumor_detected_count": tumor_detected_count,
            "no_tumor_count": no_tumor_count
        },
        "system_status": {
            "database_connected": True,
            "device": settings.DEVICE,
            "classification_model_loaded": class_adapter.is_loaded if class_adapter else False,
            "segmentation_model_loaded": seg_adapter.is_loaded if seg_adapter else False,
        }
    }
