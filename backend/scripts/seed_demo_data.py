"""
Optional manual seeding script for FacultyForge AI.
Run this script ONLY when explicitly requested to seed demo/baseline data.
Production startup NEVER executes this automatically.
"""
from app.db.session import SessionLocal
from app.services.seed_service import seed_service
from app.core.config import settings

def run_seed():
    print(f"Seeding baseline data to database: {settings.SQLITE_DB_PATH}")
    db = SessionLocal()
    try:
        seed_service.seed_all(db)
        print("Seeding completed successfully.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
