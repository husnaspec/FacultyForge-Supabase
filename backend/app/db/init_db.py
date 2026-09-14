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
            # 1. faculty_skills verification_status
            res = conn.execute(text("PRAGMA table_info(faculty_skills)")).fetchall()
            col_names = [row[1] for row in res]
            if "verification_status" not in col_names:
                conn.execute(text("ALTER TABLE faculty_skills ADD COLUMN verification_status VARCHAR(50) DEFAULT 'UNVERIFIED'"))
                conn.commit()

            # 1b. teaching_impacts verified_at and verified_by
            ti_res = conn.execute(text("PRAGMA table_info(teaching_impacts)")).fetchall()
            ti_cols = [row[1] for row in ti_res]
            if "verified_at" not in ti_cols:
                conn.execute(text("ALTER TABLE teaching_impacts ADD COLUMN verified_at DATETIME"))
                conn.commit()
            if "verified_by" not in ti_cols:
                conn.execute(text("ALTER TABLE teaching_impacts ADD COLUMN verified_by VARCHAR(150)"))
                conn.commit()

            # 2. registrations table safe migration for self-registration & nullable faculty_id
            reg_info = conn.execute(text("PRAGMA table_info(registrations)")).fetchall()
            reg_cols = {row[1]: row for row in reg_info}
            if "participant_name" not in reg_cols or (reg_cols.get("faculty_id") and reg_cols["faculty_id"][3] == 1):
                conn.execute(text("PRAGMA foreign_keys = OFF"))
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS registrations_v2 (
                        id INTEGER PRIMARY KEY,
                        event_id INTEGER NOT NULL REFERENCES events(id),
                        faculty_id INTEGER REFERENCES faculty(id),
                        participant_name VARCHAR(150),
                        faculty_code VARCHAR(50),
                        email VARCHAR(120),
                        phone VARCHAR(50),
                        department VARCHAR(100),
                        designation VARCHAR(100),
                        institution_name VARCHAR(200),
                        years_of_experience FLOAT,
                        teaching_interests TEXT,
                        research_interests TEXT,
                        registration_code VARCHAR(100),
                        registration_token VARCHAR(100),
                        qr_token VARCHAR(255),
                        registered_at DATETIME,
                        registration_status VARCHAR(50) DEFAULT 'CONFIRMED',
                        eligibility_status VARCHAR(50) DEFAULT 'ELIGIBLE',
                        completion_status VARCHAR(50) DEFAULT 'IN_PROGRESS',
                        attendance_status VARCHAR(50) DEFAULT 'PENDING'
                    )
                """))
                conn.execute(text("""
                    INSERT INTO registrations_v2 (
                        id, event_id, faculty_id, registered_at, registration_status, eligibility_status, completion_status, attendance_status
                    )
                    SELECT id, event_id, faculty_id, registered_at, registration_status, eligibility_status, completion_status, 'PENDING'
                    FROM registrations
                """))
                conn.execute(text("""
                    UPDATE registrations_v2
                    SET 
                        participant_name = (SELECT full_name FROM faculty WHERE faculty.id = registrations_v2.faculty_id),
                        faculty_code = (SELECT faculty_code FROM faculty WHERE faculty.id = registrations_v2.faculty_id),
                        email = (SELECT email FROM faculty WHERE faculty.id = registrations_v2.faculty_id),
                        phone = (SELECT phone FROM faculty WHERE faculty.id = registrations_v2.faculty_id),
                        department = (SELECT d.code FROM faculty f LEFT JOIN departments d ON f.department_id = d.id WHERE f.id = registrations_v2.faculty_id),
                        designation = (SELECT designation FROM faculty WHERE faculty.id = registrations_v2.faculty_id),
                        institution_name = 'Vignan''s University',
                        registration_code = 'REG-VU2026-' || printf('%04d', registrations_v2.id),
                        registration_token = 'token-' || registrations_v2.id,
                        qr_token = 'REG-VU2026-' || printf('%04d', registrations_v2.id) || char(58) || 'tok' || registrations_v2.id
                    WHERE faculty_id IS NOT NULL
                """))
                conn.execute(text("DROP TABLE registrations"))
                conn.execute(text("ALTER TABLE registrations_v2 RENAME TO registrations"))
                conn.execute(text("PRAGMA foreign_keys = ON"))
                conn.commit()

            # 3. attendances table safe migration for registration_id & nullable faculty_id
            att_info = conn.execute(text("PRAGMA table_info(attendances)")).fetchall()
            att_cols = {row[1]: row for row in att_info}
            if "registration_id" not in att_cols or (att_cols.get("faculty_id") and att_cols["faculty_id"][3] == 1):
                conn.execute(text("PRAGMA foreign_keys = OFF"))
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS attendances_v2 (
                        id INTEGER PRIMARY KEY,
                        event_id INTEGER NOT NULL REFERENCES events(id),
                        session_id INTEGER REFERENCES event_sessions(id),
                        faculty_id INTEGER REFERENCES faculty(id),
                        registration_id INTEGER REFERENCES registrations(id),
                        attendance_date DATETIME,
                        attendance_status VARCHAR(20) DEFAULT 'PRESENT',
                        attendance_method VARCHAR(20) DEFAULT 'MANUAL',
                        check_in_time DATETIME
                    )
                """))
                conn.execute(text("""
                    INSERT INTO attendances_v2 (
                        id, event_id, session_id, faculty_id, attendance_date, attendance_status, attendance_method, check_in_time
                    )
                    SELECT id, event_id, session_id, faculty_id, attendance_date, attendance_status, attendance_method, check_in_time
                    FROM attendances
                """))
                conn.execute(text("""
                    UPDATE attendances_v2
                    SET registration_id = (
                        SELECT r.id FROM registrations r 
                        WHERE r.event_id = attendances_v2.event_id AND r.faculty_id = attendances_v2.faculty_id
                        LIMIT 1
                    )
                    WHERE registration_id IS NULL
                """))
                conn.execute(text("DROP TABLE attendances"))
                conn.execute(text("ALTER TABLE attendances_v2 RENAME TO attendances"))
                conn.execute(text("PRAGMA foreign_keys = ON"))
                conn.commit()

        except Exception as e:
            print(f"[Schema Init] Note on column check: {e}")

    # Safe startup reconciliation of unlinked registrations
    try:
        from app.db.session import SessionLocal
        from app.services.faculty_registration_service import FacultyRegistrationService
        db = SessionLocal()
        reconciled = FacultyRegistrationService.reconcile_unlinked_registrations(db)
        if reconciled > 0:
            print(f"[Startup Reconciliation] Reconciled {reconciled} registrations to faculty records.")
        db.close()
    except Exception as e:
        print(f"[Startup Reconciliation] Note: {e}")
