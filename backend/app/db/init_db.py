from sqlalchemy import text
from app.db.base import Base
from app.db.session import engine
import app.models  # Ensure all models are registered

def init_db_schema():
    """
    Safely ensures all tables and additive columns exist without deleting or altering existing data.
    """
    # Create any missing tables (like skill_evidence, teaching_impacts)
    Base.metadata.create_all(bind=engine)

    # Check for additive columns in SQLite safely
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(faculty_skills)")).fetchall()
            col_names = [row[1] for row in res]
            if "verification_status" not in col_names:
                conn.execute(text("ALTER TABLE faculty_skills ADD COLUMN verification_status VARCHAR(50) DEFAULT 'UNVERIFIED'"))
                conn.commit()
        except Exception as e:
            print(f"[Schema Init] Note on column check: {e}")
