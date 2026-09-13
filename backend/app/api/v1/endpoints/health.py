from fastapi import APIRouter
from datetime import datetime, timezone
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine

router = APIRouter()

@router.get("/health")
def get_health():
    db_connected = False
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            db_connected = True
    except Exception:
        db_connected = False

    is_ai_configured = bool(settings.GEMINI_API_KEY or settings.AI_API_KEY)
    
    return {
        "status": "healthy",
        "service": "FacultyForge AI API",
        "version": "1.0.0",
        "tagline": settings.TAGLINE,
        "database": {
            "type": "sqlite",
            "connected": db_connected
        },
        "ai": {
            "configured": is_ai_configured,
            "provider": settings.AI_PROVIDER,
            "model": settings.AI_MODEL
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
