import uvicorn
import os
import sys

# Ensure backend directory is in sys.path regardless of where Python is launched
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0" if os.getenv("PORT") else "127.0.0.1")
    reload = os.getenv("RELOAD", "false" if os.getenv("PORT") else "true").lower() in ("true", "1")
    print(f"Starting FacultyForge AI Backend on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
