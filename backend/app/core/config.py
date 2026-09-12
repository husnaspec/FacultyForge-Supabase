import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "FacultyForge AI")
    TAGLINE: str = "From Training Needs to Measurable Faculty Growth"
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/facultyforge.db")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic") # "deterministic" or "llm"
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")

settings = Settings()
