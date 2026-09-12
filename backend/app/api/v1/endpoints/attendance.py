from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.db.session import get_db
from app.models.event import Event, EventSession
from app.models.faculty import Faculty
from app.models.attendance import Attendance
from app.models.registration import Registration
from app.schemas import AttendanceRecordRequest, AttendanceBulkRequest, AttendanceResponse

router = APIRouter()

@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def record_attendance(att_in: AttendanceRecordRequest, event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    faculty = db.query(Faculty).filter(Faculty.id == att_in.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    # Upsert attendance record
    query = db.query(Attendance).filter(
        Attendance.event_id == event_id,
        Attendance.faculty_id == att_in.faculty_id
    )
    if att_in.session_id:
        query = query.filter(Attendance.session_id == att_in.session_id)
    
    rec = query.first()
    if not rec:
        rec = Attendance(
            event_id=event_id,
            session_id=att_in.session_id,
            faculty_id=att_in.faculty_id,
            attendance_status=att_in.attendance_status.upper(),
            attendance_method=att_in.attendance_method.upper(),
            attendance_date=datetime.utcnow(),
            check_in_time=datetime.utcnow()
        )
        db.add(rec)
    else:
        rec.attendance_status = att_in.attendance_status.upper()
        rec.attendance_method = att_in.attendance_method.upper()
        rec.check_in_time = datetime.utcnow()

    db.commit()
    db.refresh(rec)

    resp = AttendanceResponse.from_orm(rec)
    resp.faculty_name = faculty.full_name
    return resp

@router.post("/attendance/bulk")
def record_bulk_attendance(bulk_in: AttendanceBulkRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == bulk_in.event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    count = 0
    for item in bulk_in.records:
        f_id = item.get("faculty_id")
        status_val = item.get("attendance_status", "PRESENT").upper()
        method_val = item.get("attendance_method", "MANUAL").upper()

        rec = db.query(Attendance).filter(
            Attendance.event_id == bulk_in.event_id,
            Attendance.session_id == bulk_in.session_id,
            Attendance.faculty_id == f_id
        ).first()

        if not rec:
            rec = Attendance(
                event_id=bulk_in.event_id,
                session_id=bulk_in.session_id,
                faculty_id=f_id,
                attendance_status=status_val,
                attendance_method=method_val,
                attendance_date=datetime.utcnow(),
                check_in_time=datetime.utcnow()
            )
            db.add(rec)
        else:
            rec.attendance_status = status_val
            rec.attendance_method = method_val
            rec.check_in_time = datetime.utcnow()
        count += 1

    db.commit()
    return {"message": f"Updated attendance for {count} faculty members."}

@router.get("/events/{id}/attendance")
def get_event_attendance(id: int, session_id: Optional[int] = None, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    registrations = db.query(Registration).filter(Registration.event_id == id).all()
    query = db.query(Attendance).filter(Attendance.event_id == id)
    if session_id:
        query = query.filter(Attendance.session_id == session_id)
    
    attendances = query.all()
    att_map = {(a.session_id, a.faculty_id): a for a in attendances}

    # Summary calculations
    total_records = len(attendances)
    present_count = sum(1 for a in attendances if a.attendance_status == "PRESENT")
    overall_pct = round((present_count / total_records * 100.0), 1) if total_records > 0 else 100.0

    return {
        "event_id": id,
        "event_title": event.title,
        "total_registrations": len(registrations),
        "overall_attendance_percentage": overall_pct,
        "records": [
            {
                "id": a.id,
                "session_id": a.session_id,
                "faculty_id": a.faculty_id,
                "faculty_name": a.faculty.full_name if a.faculty else "Faculty",
                "department": a.faculty.department.code if a.faculty and a.faculty.department else "N/A",
                "attendance_status": a.attendance_status,
                "attendance_method": a.attendance_method,
                "check_in_time": a.check_in_time
            } for a in attendances
        ]
    }
