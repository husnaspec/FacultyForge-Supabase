import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def http_post(endpoint, data):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def http_get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def main():
    print("Verifying Live API at", BASE_URL)

    # 1. Check Faculty Lookup
    status, lookup = http_get("/faculty/lookup?code=FAC-CSE-001")
    assert status == 200 and lookup["found"] is True
    print(f"[OK] Live Faculty Lookup: {lookup['full_name']} ({lookup['department']})")

    # 2. Check Event 13 initial seats
    status, events = http_get("/events")
    evt13 = next((e for e in events if e["id"] == 13), None)
    assert evt13 is not None
    print(f"[OK] Event 13 found: '{evt13['title']}' | Registered: {evt13['registered_count']}/{evt13['capacity']}")

    # 3. Register Dr. Veda
    veda_payload = {
        "full_name": "Dr. Veda",
        "faculty_code": "FA-V2",
        "email": "veda@gmail.com",
        "phone": "9876543210",
        "department": "CSE",
        "designation": "Assistant Professor",
        "institution_name": "Vignan's University",
        "years_of_experience": 4.0,
        "teaching_interests": "Artificial Intelligence, Data Systems",
        "research_interests": "Machine Learning",
        "consent": True
    }
    status, reg_res = http_post("/events/13/register", veda_payload)
    assert status == 201, f"Registration failed: {reg_res}"
    reg_id = reg_res["registration_id"]
    reg_code = reg_res["registration_code"]
    qr_token = reg_res["qr_token"]
    print(f"[OK] Dr. Veda Registered: ID={reg_id} | Code={reg_code} | QR Token={qr_token}")

    # 4. Duplicate Registration Check
    status, dup_res = http_post("/events/13/register", veda_payload)
    assert status == 409
    print(f"[OK] Duplicate Registration Blocked (409): {dup_res['detail']}")

    # 5. Check Seat count updated
    status, events = http_get("/events")
    evt13 = next(e for e in events if e["id"] == 13)
    assert evt13["registered_count"] == 1
    print(f"[OK] Seats updated: {evt13['registered_count']}/{evt13['capacity']}")

    # 6. Check Attendance Desk Cohort
    status, att_info = http_get("/events/13/attendance")
    assert status == 200
    assert att_info["total_registrations"] == 1
    assert att_info["recorded_checkins"] == 0
    print(f"[OK] Attendance Desk initial: Cohort={att_info['total_registrations']}, Checkins={att_info['recorded_checkins']}")

    # 7. Manual Attendance: Mark Present
    status, man_res = http_post("/attendance/manual", {
        "event_id": 13,
        "registration_id": reg_id,
        "attendance_status": "PRESENT"
    })
    assert status == 200
    print(f"[OK] Manual Attendance Recorded: {man_res['participant_name']} -> {man_res['attendance_status']}")

    # 8. Check Attendance Desk after Manual Present
    status, att_info = http_get("/events/13/attendance")
    assert att_info["recorded_checkins"] == 1
    assert att_info["overall_attendance_percentage"] == 100.0
    print(f"[OK] Attendance Desk updated: Checkins={att_info['recorded_checkins']}, Rate={att_info['overall_attendance_percentage']}%")

    # 9. Reset attendance for Event 13 to test QR Scanner Mode cleanly
    import sqlite3
    conn = sqlite3.connect("backend/facultyforge.db")
    conn.cursor().execute("DELETE FROM attendances WHERE event_id=13")
    conn.commit()
    conn.close()

    # 10. QR Scanner Checkin
    status, qr_res = http_post("/attendance/qr-checkin", {
        "event_id": 13,
        "qr_token": qr_token
    })
    assert status == 200 and qr_res["success"] is True
    print(f"[OK] QR Scanner Verified: {qr_res['participant_name']} | Status={qr_res['attendance_status']} | Method={qr_res['attendance_method']}")

    # 11. Prevent Duplicate QR Checkin
    status, qr_dup = http_post("/attendance/qr-checkin", {
        "event_id": 13,
        "qr_token": qr_token
    })
    assert status == 409
    print(f"[OK] Duplicate QR Checkin Blocked (409): {qr_dup['detail']}")

    # 12. Prevent Wrong Programme QR Checkin
    status, qr_wrong = http_post("/attendance/qr-checkin", {
        "event_id": 1,
        "qr_token": qr_token
    })
    assert status == 400
    print(f"[OK] Wrong Programme QR Blocked (400): {qr_wrong['detail']}")

    # 13. Verify Final Attendance Desk Audit Log
    status, final_att = http_get("/events/13/attendance")
    assert final_att["total_registrations"] == 1
    assert final_att["recorded_checkins"] == 1
    rec = final_att["records"][0]
    assert rec["participant_name"] == "Dr. Veda"
    assert rec["attendance_method"] == "QR"
    assert rec["attendance_status"] == "PRESENT"
    print(f"[OK] Audit Log Verified: {rec['participant_name']} | Method={rec['attendance_method']} | Status={rec['attendance_status']} | Time={rec['check_in_time']}")

    print("\n=======================================================")
    print("LIVE BACKEND & FRONTEND-FACING APIS PASSED 100% OF TESTS")
    print("=======================================================")

if __name__ == "__main__":
    main()
