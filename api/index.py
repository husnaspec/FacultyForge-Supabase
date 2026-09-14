import os
import sys
import shutil
import tempfile
from pathlib import Path

# Identify directories
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
BACKEND_DIR = ROOT_DIR / "backend"

# Ensure Python sys.path includes backend and root directories
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# On Vercel / serverless environments, initialize writable database in temp directory
if os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    tmp_dir = Path(tempfile.gettempdir())
    tmp_db = tmp_dir / "facultyforge.db"
    source_db = BACKEND_DIR / "facultyforge.db"
    
    if not tmp_db.exists():
        if source_db.exists():
            try:
                shutil.copy2(source_db, tmp_db)
            except Exception as e:
                print(f"[Vercel Serverless] Notice copying source DB: {e}")
    
    os.environ["SQLITE_DB_PATH"] = str(tmp_db)

from app.main import app
from app.db.init_db import init_db_schema

# Explicitly ensure database schema and initial records are ready (serverless does not run lifespan reliably)
try:
    init_db_schema()
except Exception as e:
    print(f"[Vercel Serverless] DB schema init notice: {e}")
