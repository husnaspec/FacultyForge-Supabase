from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.db.session import get_db
from app.models.event import Event, EventSession
from app.models.faculty import Faculty
from app.models.attendance import Attendance
from app.models.registration import Registration
from app.schemas import (
    AttendanceRecordRequest, AttendanceBulkRequest, AttendanceResponse,
    AttendanceQRCheckinRequest, AttendanceManualRequest
)

router = APIRouter()

@router.post("/attendance/qr-checkin")
def qr_checkin(checkin_in: AttendanceQRCheckinRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == checkin_in.event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    token = checkin_in.qr_token.strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid registration QR.")

    # 1. Look up registration by qr_token, registration_token, or registration_code
    token_prefix = token.split(":")[0] if ":" in token else token
    reg = db.query(Registration).filter(
        or_(
            Registration.qr_token == token,
            Registration.registration_token == token,
            Registration.registration_code == token,
            Registration.registration_code == token_prefix
        )
    ).first()

    if not reg:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid registration QR.")

    # 2. Verify registration belongs to selected programme
    if reg.event_id != checkin_in.event_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="QR does not belong to this programme."
        )

    # 3. Check registration status is valid
    if reg.registration_status in ["CANCELLED", "REVOKED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration has been cancelled or revoked."
        )

    # 4. Determine session safely
    session = None
    sess_id_int = None
    if checkin_in.session_id is not None and str(checkin_in.session_id).strip():
        try:
            sess_id_int = int(checkin_in.session_id)
        except (ValueError, TypeError):
            sess_id_int = None

    if sess_id_int is not None:
        session = db.query(EventSession).filter(
            EventSession.id == sess_id_int,
            EventSession.event_id == checkin_in.event_id
        ).first()

    safe_session_id = session.id if session else None

    # 5. Prevent duplicate attendance check-in for same session
    att_query = db.query(Attendance).filter(Attendance.event_id == checkin_in.event_id)
    if safe_session_id is not None:
        att_query = att_query.filter(Attendance.session_id == safe_session_id)
    else:
        att_query = att_query.filter(Attendance.session_id.is_(None))

    match_conds = []
    if reg.id:
        match_conds.append(Attendance.registration_id == reg.id)
    if reg.faculty_id:
        match_conds.append(Attendance.faculty_id == reg.faculty_id)

    if match_conds:
        if len(match_conds) == 1:
            att_query = att_query.filter(match_conds[0])
        else:
            att_query = att_query.filter(or_(*match_conds))

    existing_att = att_query.first()
    if existing_att and existing_att.attendance_status == "PRESENT":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already recorded."
        )

    now = datetime.utcnow()
    if not existing_att:
        rec = Attendance(
            event_id=checkin_in.event_id,
            session_id=safe_session_id,
            faculty_id=reg.faculty_id,
            registration_id=reg.id,
            attendance_status="PRESENT",
            attendance_method="QR",
            attendance_date=now,
            check_in_time=now
        )
        db.add(rec)
    else:
        rec = existing_att
        rec.attendance_status = "PRESENT"
        rec.attendance_method = "QR"
        rec.check_in_time = now

    reg.attendance_status = "PRESENT"
    db.commit()
    db.refresh(rec)

    p_name = reg.participant_name or (reg.faculty.full_name if reg.faculty else "Participant")
    f_code = reg.faculty_code or (reg.faculty.faculty_code if reg.faculty else "N/A")
    dept = reg.department or (reg.faculty.department.code if reg.faculty and reg.faculty.department else "CSE")
    sess_title = session.title if session else "Day 1 Morning (09:30 AM - 12:30 PM)"

    return {
        "success": True,
        "message": "Attendance Verified ✓",
        "participant_name": p_name,
        "faculty_code": f_code,
        "department": dept,
        "event_title": event.title,
        "session_title": sess_title,
        "check_in_time": now.strftime("%I:%M %p"),
        "check_in_timestamp": now.isoformat(),
        "attendance_status": "PRESENT",
        "attendance_method": "QR",
        "registration_code": reg.registration_code
    }

@router.post("/attendance/manual")
def manual_attendance(man_in: AttendanceManualRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == man_in.event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    reg = None
    faculty = None
    if man_in.registration_id:
        reg = db.query(Registration).filter(
            Registration.id == man_in.registration_id,
            Registration.event_id == man_in.event_id
        ).first()
        if reg and reg.faculty_id:
            faculty = db.query(Faculty).filter(Faculty.id == reg.faculty_id).first()
    elif man_in.faculty_id:
        faculty = db.query(Faculty).filter(Faculty.id == man_in.faculty_id).first()
        reg = db.query(Registration).filter(
            Registration.faculty_id == man_in.faculty_id,
            Registration.event_id == man_in.event_id
        ).first()

    if not reg and not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant registration not found.")

    status_val = man_in.attendance_status.upper() if man_in.attendance_status else "PRESENT"

    session = None
    if man_in.session_id:
        session = db.query(EventSession).filter(
            EventSession.id == man_in.session_id,
            EventSession.event_id == man_in.event_id
        ).first()

    safe_session_id = session.id if session else None

    query = db.query(Attendance).filter(Attendance.event_id == man_in.event_id)
    if safe_session_id:
        query = query.filter(Attendance.session_id == safe_session_id)
    else:
        query = query.filter(Attendance.session_id.is_(None))

    conds = []
    if reg:
        conds.append(Attendance.registration_id == reg.id)
    if faculty:
        conds.append(Attendance.faculty_id == faculty.id)
    rec = query.filter(or_(*conds)).first()

    now = datetime.utcnow()
    if not rec:
        rec = Attendance(
            event_id=man_in.event_id,
            session_id=safe_session_id,
            faculty_id=faculty.id if faculty else (reg.faculty_id if reg else None),
            registration_id=reg.id if reg else None,
            attendance_status=status_val,
            attendance_method="MANUAL",
            attendance_date=now,
            check_in_time=now
        )
        db.add(rec)
    else:
        rec.attendance_status = status_val
        rec.attendance_method = "MANUAL"
        rec.check_in_time = now

    if reg:
        reg.attendance_status = status_val
    db.commit()
    db.refresh(rec)

    p_name = reg.participant_name if reg else (faculty.full_name if faculty else "Faculty")
    return {
        "success": True,
        "message": f"Attendance recorded ({status_val}) for {p_name}",
        "participant_name": p_name,
        "attendance_status": status_val,
        "attendance_method": "MANUAL",
        "check_in_time": now.strftime("%I:%M %p")
    }

@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def record_attendance(att_in: AttendanceRecordRequest, event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    faculty = None
    if att_in.faculty_id:
        faculty = db.query(Faculty).filter(Faculty.id == att_in.faculty_id).first()

    reg = None
    if att_in.registration_id:
        reg = db.query(Registration).filter(Registration.id == att_in.registration_id).first()
    elif faculty:
        reg = db.query(Registration).filter(
            Registration.faculty_id == faculty.id,
            Registration.event_id == event_id
        ).first()

    if not faculty and not reg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty or registration not found.")

    session = None
    if att_in.session_id:
        session = db.query(EventSession).filter(
            EventSession.id == att_in.session_id,
            EventSession.event_id == event_id
        ).first()
    safe_session_id = session.id if session else None

    query = db.query(Attendance).filter(Attendance.event_id == event_id)
    if safe_session_id:
        query = query.filter(Attendance.session_id == safe_session_id)
    else:
        query = query.filter(Attendance.session_id.is_(None))

    conds = []
    if reg:
        conds.append(Attendance.registration_id == reg.id)
    if faculty:
        conds.append(Attendance.faculty_id == faculty.id)
    rec = query.filter(or_(*conds)).first()

    now = datetime.utcnow()
    status_val = att_in.attendance_status.upper()
    method_val = att_in.attendance_method.upper()

    if not rec:
        rec = Attendance(
            event_id=event_id,
            session_id=safe_session_id,
            faculty_id=faculty.id if faculty else (reg.faculty_id if reg else None),
            registration_id=reg.id if reg else None,
            attendance_status=status_val,
            attendance_method=method_val,
            attendance_date=now,
            check_in_time=now
        )
        db.add(rec)
    else:
        rec.attendance_status = status_val
        rec.attendance_method = method_val
        rec.check_in_time = now

    if reg:
        reg.attendance_status = status_val
    db.commit()
    db.refresh(rec)

    resp = AttendanceResponse.from_orm(rec)
    resp.faculty_name = reg.participant_name if reg else (faculty.full_name if faculty else "Faculty")
    resp.participant_name = resp.faculty_name
    resp.faculty_code = reg.faculty_code if reg else (faculty.faculty_code if faculty else "N/A")
    resp.department = reg.department if reg else (faculty.department.code if faculty and faculty.department else "CSE")
    return resp

@router.post("/attendance/bulk")
def record_bulk_attendance(bulk_in: AttendanceBulkRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == bulk_in.event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    bulk_session = None
    if bulk_in.session_id:
        bulk_session = db.query(EventSession).filter(
            EventSession.id == bulk_in.session_id,
            EventSession.event_id == bulk_in.event_id
        ).first()
    safe_bulk_session_id = bulk_session.id if bulk_session else None

    count = 0
    now = datetime.utcnow()
    for item in bulk_in.records:
        f_id = item.get("faculty_id")
        reg_id = item.get("registration_id")
        status_val = item.get("attendance_status", "PRESENT").upper()
        method_val = item.get("attendance_method", "MANUAL").upper()

        query = db.query(Attendance).filter(Attendance.event_id == bulk_in.event_id)
        if safe_bulk_session_id:
            query = query.filter(Attendance.session_id == safe_bulk_session_id)
        else:
            query = query.filter(Attendance.session_id.is_(None))

        conds = []
        if reg_id:
            conds.append(Attendance.registration_id == reg_id)
        if f_id:
            conds.append(Attendance.faculty_id == f_id)
        if not conds:
            continue
        rec = query.filter(or_(*conds)).first()

        if not rec:
            rec = Attendance(
                event_id=bulk_in.event_id,
                session_id=safe_bulk_session_id,
                faculty_id=f_id,
                registration_id=reg_id,
                attendance_status=status_val,
                attendance_method=method_val,
                attendance_date=now,
                check_in_time=now
            )
            db.add(rec)
        else:
            rec.attendance_status = status_val
            rec.attendance_method = method_val
            rec.check_in_time = now
        count += 1

    db.commit()
    return {"message": f"Updated attendance for {count} participants."}

@router.get("/events/{id}/attendance")
def get_event_attendance(id: int, session_id: Optional[int] = None, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    registrations = db.query(Registration).filter(
        Registration.event_id == id,
        Registration.registration_status != "CANCELLED"
    ).order_by(Registration.id.asc()).all()

    query = db.query(Attendance).filter(Attendance.event_id == id)
    if session_id:
        real_session = db.query(EventSession).filter(
            EventSession.id == session_id,
            EventSession.event_id == id
        ).first()
        if real_session:
            query = query.filter(Attendance.session_id == real_session.id)
        else:
            # Fallback/dummy session when event has no sessions in DB
            query = query.filter(or_(Attendance.session_id == session_id, Attendance.session_id.is_(None)))
    
    attendances = query.all()

    # Unique check-ins that are PRESENT
    present_reg_ids = set()
    for a in attendances:
        if a.attendance_status == "PRESENT":
            present_reg_ids.add(a.registration_id or a.faculty_id)

    total_cohort = len(registrations)
    checkins_count = len(present_reg_ids)
    overall_pct = round((checkins_count / total_cohort * 100.0), 1) if total_cohort > 0 else 0.0

    return {
        "event_id": id,
        "event_title": event.title,
        "total_registrations": total_cohort,
        "recorded_checkins": checkins_count,
        "overall_attendance_percentage": overall_pct,
        "records": [
            {
                "id": a.id,
                "session_id": a.session_id,
                "session_title": a.session.title if a.session else ("Day 1 Morning (09:30 AM - 12:30 PM)" if not event.sessions else "General Session"),
                "faculty_id": a.faculty_id,
                "registration_id": a.registration_id,
                "registration_code": a.registration.registration_code if a.registration else (f"REG-VU2026-{a.registration_id:04d}" if a.registration_id else "N/A"),
                "participant_name": a.registration.participant_name if (a.registration and a.registration.participant_name) else (a.faculty.full_name if a.faculty else "Participant"),
                "faculty_code": a.registration.faculty_code if (a.registration and a.registration.faculty_code) else (a.faculty.faculty_code if a.faculty else "N/A"),
                "department": a.registration.department if (a.registration and a.registration.department) else (a.faculty.department.code if a.faculty and a.faculty.department else "N/A"),
                "attendance_status": a.attendance_status,
                "attendance_method": a.attendance_method,
                "check_in_time": a.check_in_time.strftime("%I:%M %p") if a.check_in_time else "N/A",
                "check_in_timestamp": a.check_in_time.isoformat() if a.check_in_time else None
            } for a in attendances
        ]
    }
