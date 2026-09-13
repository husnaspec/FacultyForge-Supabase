from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.router import api_router

# Ensure all models are imported
import app.models

from app.db.init_db import init_db_schema

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Diagnostic: verify canonical database path during startup
    print(f"FacultyForge database: {settings.SQLITE_DB_PATH}")
    
    # Ensure tables and missing columns exist safely without data loss or dropping tables
    init_db_schema()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Faculty Development & Training Platform - From Training Needs to Measurable Faculty Growth",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "api_docs": "/docs",
        "api_v1": settings.API_V1_STR,
        "status": "online"
    }
