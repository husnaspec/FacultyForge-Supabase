import os
from pathlib import Path
from dotenv import load_dotenv

# Canonical resolution: always based on source file location, never CWD
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BACKEND_DIR / ".env")

# Canonical SQLite DB file path
DEFAULT_DB_PATH = BACKEND_DIR / "facultyforge.db"
env_db_path = os.getenv("SQLITE_DB_PATH")
if env_db_path and env_db_path.strip():
    RESOLVED_DB_PATH = Path(env_db_path.strip()).resolve()
else:
    RESOLVED_DB_PATH = DEFAULT_DB_PATH.resolve()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "FacultyForge AI")
    TAGLINE: str = "From Training Needs to Measurable Faculty Growth"
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "facultyforge-secret-key-change-in-production")
    
    # Canonical SQLite configuration
    BACKEND_DIR: Path = BACKEND_DIR
    SQLITE_DB_PATH: Path = RESOLVED_DB_PATH
    DATABASE_URL: str = f"sqlite:///{RESOLVED_DB_PATH.as_posix()}"
    
    # AI Provider Configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic") # "deterministic" or "llm"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")

settings = Settings()
