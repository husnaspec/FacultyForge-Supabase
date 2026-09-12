from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.services.seed_service import seed_service
from app.api.v1.router import api_router

# Ensure all models are imported
import app.models

from app.db.init_db import init_db_schema

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables and columns exist safely without data loss, and auto-seed initial data
    init_db_schema()
    db = SessionLocal()
    try:
        seed_service.seed_all(db)
    finally:
        db.close()
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
    "*"
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
