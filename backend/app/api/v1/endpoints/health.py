from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings
from app.db.mongo import mongo_manager

router = APIRouter()

@router.get("/health")
def get_health():
    is_mongo_connected = mongo_manager.is_connected()
    is_ai_configured = bool(settings.GEMINI_API_KEY or settings.AI_API_KEY)
    
    return {
        "status": "healthy",
        "service": "FacultyForge AI API",
        "version": "1.0.0",
        "tagline": settings.TAGLINE,
        "database": {
            "mongodb_configured": bool(settings.MONGODB_URI and settings.MONGODB_URI.strip()),
            "mongodb_connected": is_mongo_connected,
            "database_name": settings.MONGODB_DB_NAME
        },
        "ai": {
            "configured": is_ai_configured,
            "provider": settings.AI_PROVIDER,
            "model": settings.AI_MODEL
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
