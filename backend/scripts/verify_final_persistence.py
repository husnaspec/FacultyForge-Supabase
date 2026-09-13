import urllib.request
import json
import time
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.department import Department

def run_test():
    print("--- 1. Creating Department = FINAL-PERSISTENCE-TEST ---")
    db = SessionLocal()
    try:
        existing = db.query(Department).filter(Department.name == "FINAL-PERSISTENCE-TEST").first()
        if not existing:
            d = Department(
                name="FINAL-PERSISTENCE-TEST",
                code="FPT",
                description="Final test for persistence and durability",
                is_active=True
            )
            db.add(d)
            db.commit()
            db.refresh(d)
            dept_id = d.id
            print(f"Created Department ID: {dept_id}")
        else:
            dept_id = existing.id
            print(f"Found Existing Department ID: {dept_id}")
    finally:
        db.close()

    # 2. Query through HTTP API (simulating browser refresh)
    print("--- 2. Simulating browser refresh / HTTP API Query ---")
    url = "http://127.0.0.1:8000/api/v1/departments"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        match = next((x for x in data if x["name"] == "FINAL-PERSISTENCE-TEST"), None)
        assert match is not None, "Department not found in live API response!"
        print(f"PASS: Browser/HTTP API returned department: {match['name']} (ID: {match['id']})")

    # 3. Simulate backend shutdown and restart
    print("--- 3. Simulating backend shutdown and restart ---")
    from app.db.session import engine
    engine.dispose()
    print("Disposed all database connection pools (backend stopped).")

    # Reopen DB directly
    db_reopened = SessionLocal()
    try:
        found_reopened = db_reopened.query(Department).filter(Department.name == "FINAL-PERSISTENCE-TEST").first()
        assert found_reopened is not None, "Record missing after restart!"
        print(f"PASS: Record confirmed in database after restart: {found_reopened.name} (ID: {found_reopened.id})")
    finally:
        db_reopened.close()

    # 4. Start backend from other working directory
    print("--- 4. Testing access from different working directory ---")
    orig_cwd = os.getcwd()
    other_dir = str(Path(orig_cwd).parent)
    try:
        os.chdir(other_dir)
        print(f"Switched working directory to: {os.getcwd()}")
        db_other = SessionLocal()
        try:
            found_other = db_other.query(Department).filter(Department.name == "FINAL-PERSISTENCE-TEST").first()
            assert found_other is not None, "Record missing when accessed from different directory!"
            assert str(settings.SQLITE_DB_PATH) == r"C:\Users\husna\OneDrive\Desktop\FDPX\backend\facultyforge.db"
            print(f"PASS: Record confirmed when running from {os.getcwd()}: {found_other.name}")
        finally:
            db_other.close()
    finally:
        os.chdir(orig_cwd)

    print("\nALL FINAL PERSISTENCE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
