from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "FacultyForge AI API",
        "version": "1.0.0",
        "tagline": "From Training Needs to Measurable Faculty Growth",
        "timestamp": datetime.utcnow()
    }
