"""
Comprehensive persistence and restart test for FacultyForge AI.
Tests insertion of unique records, simulated process restart,
directory-independent path resolution, and full record survival.
"""
import os
import sys
from pathlib import Path
from datetime import datetime

# Add backend to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.models.department import Department
from app.models.faculty import Faculty
from app.models.event import Event
from app.models.registration import Registration
from app.models.attendance import Attendance

def run_persistence_test():
    print("=" * 60)
    print("FACULTYFORGE AI — PERSISTENCE & RESTART VERIFICATION TEST")
    print("=" * 60)

    db_path_initial = settings.SQLITE_DB_PATH
    print(f"Step 0: Canonical DB Path: {db_path_initial}")
    assert db_path_initial.exists(), f"Database file not found at {db_path_initial}"

    db = SessionLocal()
    try:
        # 1. Create or retrieve Persistence Test Department
        dept = db.query(Department).filter(Department.code == "PTD").first()
        if not dept:
            dept = Department(
                name="Persistence Test Department",
                code="PTD",
                description="Department created for persistence verification",
                is_active=True
            )
            db.add(dept)
            db.commit()
            db.refresh(dept)
            print(f"Step 1: Created Department: '{dept.name}' (ID: {dept.id})")
        else:
            print(f"Step 1: Found Existing Department: '{dept.name}' (ID: {dept.id})")

        # 2. Create or retrieve Persistence Test Faculty
        fac = db.query(Faculty).filter(Faculty.faculty_code == "PTF001").first()
        if not fac:
            fac = Faculty(
                faculty_code="PTF001",
                full_name="Persistence Test Faculty",
                email="ptfaculty@vignan.ac.in",
                department_id=dept.id,
                designation="Assistant Professor",
                qualification="Ph.D. in Computer Science",
                years_of_experience=6.5,
                teaching_interests="Database Systems, AI",
                research_interests="Distributed Storage, Agentic Systems",
                is_active=True
            )
            db.add(fac)
            db.commit()
            db.refresh(fac)
            print(f"Step 2: Created Faculty: '{fac.full_name}' (ID: {fac.id})")
        else:
            print(f"Step 2: Found Existing Faculty: '{fac.full_name}' (ID: {fac.id})")

        # 3. Create or retrieve Persistence Test FDP
        event = db.query(Event).filter(Event.event_code == "PTEST-FDP-2026").first()
        if not event:
            event = Event(
                event_code="PTEST-FDP-2026",
                title="Persistence Test FDP",
                description="Testing durability and multi-directory resolution",
                event_type="FDP",
                duration_hours=16.0,
                capacity=40,
                delivery_mode="HYBRID",
                venue="Vignan Ramanujan Seminar Hall",
                department_id=dept.id,
                status="DRAFT"
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            print(f"Step 3: Created Programme: '{event.title}' (ID: {event.id}, Status: {event.status})")
        else:
            print(f"Step 3: Found Existing Programme: '{event.title}' (ID: {event.id}, Status: {event.status})")

        # 4. Create Registration
        reg = db.query(Registration).filter(
            Registration.event_id == event.id,
            Registration.email == fac.email
        ).first()
        if not reg:
            reg_code = f"REG-PTEST-{event.id:04d}-{fac.id:04d}"
            qr_tok = f"QR-TOK-{reg_code}"
            reg = Registration(
                event_id=event.id,
                faculty_id=fac.id,
                participant_name=fac.full_name,
                faculty_code=fac.faculty_code,
                email=fac.email,
                phone="9876543210",
                department=dept.name,
                designation=fac.designation,
                institution_name="Vignan's University",
                years_of_experience=fac.years_of_experience,
                registration_code=reg_code,
                registration_token=f"tok-{reg_code}",
                qr_token=qr_tok,
                registration_status="CONFIRMED",
                attendance_status="PENDING"
            )
            db.add(reg)
            db.commit()
            db.refresh(reg)
            print(f"Step 4: Created Registration: Code {reg.registration_code}, QR Token: {reg.qr_token}")
        else:
            print(f"Step 4: Found Existing Registration: Code {reg.registration_code}")

        # 5. Record Attendance
        att = db.query(Attendance).filter(
            Attendance.event_id == event.id,
            Attendance.registration_id == reg.id
        ).first()
        if not att:
            att = Attendance(
                event_id=event.id,
                registration_id=reg.id,
                faculty_id=fac.id,
                attendance_date=datetime.utcnow(),
                attendance_status="PRESENT",
                attendance_method="QR_SCAN",
                check_in_time=datetime.utcnow()
            )
            db.add(att)
            reg.attendance_status = "PRESENT"
            db.commit()
            db.refresh(att)
            print(f"Step 5: Recorded Attendance: ID {att.id}, Method: {att.attendance_method}, Status: {att.attendance_status}")
        else:
            print(f"Step 5: Found Existing Attendance: ID {att.id}, Status: {att.attendance_status}")

    finally:
        db.close()

    print("\n--- SIMULATING PROCESS SHUTDOWN AND RESTART ---")
    # Dispose connection pool to simulate clean shutdown
    engine.dispose()
    print("Disposed all database connection pools (simulated backend shutdown).")

    # Step 6: Test from simulated different working directory
    orig_cwd = os.getcwd()
    parent_cwd = str(Path(orig_cwd).parent)
    try:
        os.chdir(parent_cwd)
        print(f"Changed working directory to: {os.getcwd()}")
        # Re-import / re-evaluate database path
        re_db_path = settings.SQLITE_DB_PATH
        print(f"Re-evaluated DB Path: {re_db_path}")
        assert re_db_path == db_path_initial, f"DB path changed! Before: {db_path_initial}, After: {re_db_path}"
        print("[PASS] Working directory change did NOT affect the canonical database path.")
    finally:
        os.chdir(orig_cwd)

    # Step 7: Re-open database after simulated restart and verify records
    print("\n--- RE-OPENING DATABASE POST-RESTART ---")
    new_db = SessionLocal()
    try:
        d = new_db.query(Department).filter(Department.code == "PTD").first()
        f = new_db.query(Faculty).filter(Faculty.faculty_code == "PTF001").first()
        e = new_db.query(Event).filter(Event.event_code == "PTEST-FDP-2026").first()
        r = new_db.query(Registration).filter(Registration.event_id == e.id, Registration.email == "ptfaculty@vignan.ac.in").first()
        a = new_db.query(Attendance).filter(Attendance.event_id == e.id, Attendance.registration_id == r.id).first()

        assert d is not None, "Department missing after restart!"
        assert f is not None, "Faculty missing after restart!"
        assert e is not None, "Event missing after restart!"
        assert r is not None, "Registration missing after restart!"
        assert a is not None, "Attendance record missing after restart!"
        assert a.attendance_status == "PRESENT", "Attendance status altered!"

        print(f"[PASS] Department survived restart: '{d.name}'")
        print(f"[PASS] Faculty survived restart: '{f.full_name}'")
        print(f"[PASS] Event survived restart: '{e.title}' (Status: {e.status})")
        print(f"[PASS] Registration survived restart: Code '{r.registration_code}', Token '{r.qr_token}'")
        print(f"[PASS] Attendance record survived restart: Status '{a.attendance_status}', Method '{a.attendance_method}'")
        print("=" * 60)
        print("ALL PERSISTENCE AND RESTART TESTS PASSED WITH 100% DURABILITY!")
        print("=" * 60)
    finally:
        new_db.close()

if __name__ == "__main__":
    run_persistence_test()
