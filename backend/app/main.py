import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.ml.model_loader import model_loader
from app.api import auth, analysis, reports, contact, models, admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("neuroscan")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    logger.info("Loading PyTorch ML models into memory...")
    model_loader.initialize_models()

    yield

    # Shutdown tasks
    logger.info("Shutting down NeuroScan AI backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Brain MRI Analysis Platform (Classification, UNet Segmentation, Grad-CAM)",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static output directories for images
root_dir = os.path.dirname(os.path.dirname(__file__))
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/static/outputs", StaticFiles(directory=settings.OUTPUT_DIR), name="outputs")
app.mount("/static/reports", StaticFiles(directory=settings.REPORT_DIR), name="reports")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(analysis.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(contact.router, prefix=settings.API_V1_STR)
app.include_router(models.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "device": settings.DEVICE
    }
