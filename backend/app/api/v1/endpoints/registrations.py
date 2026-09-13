from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
import uuid
import secrets
from app.db.session import get_db
from app.models.event import Event
from app.models.faculty import Faculty
from app.models.registration import Registration
from app.schemas import RegistrationCreate, RegistrationResponse

router = APIRouter()

@router.post("/events/{id}/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(id: int, reg_in: RegistrationCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    if event.status not in ["REGISTRATION_OPEN", "APPROVED", "ONGOING"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration is not open for this event (current status: {event.status})."
        )

    # 1. Capacity validation
    current_reg_count = db.query(Registration).filter(
        Registration.event_id == id,
        Registration.registration_status != "CANCELLED"
    ).count()
    if current_reg_count >= event.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration Closed — Programme Capacity Reached"
        )

    # 2. Faculty identification and linking
    faculty = None
    if reg_in.faculty_id:
        faculty = db.query(Faculty).filter(Faculty.id == reg_in.faculty_id).first()
    
    clean_email = reg_in.email.strip().lower() if reg_in.email else None
    clean_code = reg_in.faculty_code.strip().upper() if reg_in.faculty_code else None

    if not faculty and (clean_email or clean_code):
        conds = []
        if clean_email:
            conds.append(Faculty.email.ilike(clean_email))
        if clean_code:
            conds.append(Faculty.faculty_code.ilike(clean_code))
        faculty = db.query(Faculty).filter(or_(*conds)).first()

    # Determine core values
    p_name = reg_in.full_name or (faculty.full_name if faculty else "Participant")
    f_code = clean_code or (faculty.faculty_code if faculty else None)
    f_email = clean_email or (faculty.email if faculty else None)
    f_phone = reg_in.phone or (getattr(faculty, "phone", None) if faculty else None)
    f_dept = reg_in.department or (faculty.department.code if faculty and faculty.department else None)
    f_desig = reg_in.designation or (faculty.designation if faculty else "Faculty")
    f_inst = reg_in.institution_name or "Vignan's University"
    exp_years = reg_in.years_of_experience if reg_in.years_of_experience is not None else (getattr(faculty, "years_of_experience", 0.0) if faculty else 0.0)
    teach_int = reg_in.teaching_interests or (faculty.teaching_interests if faculty else None)
    res_int = reg_in.research_interests or (faculty.research_interests if faculty else None)
    linked_faculty_id = faculty.id if faculty else None

    # 3. Duplicate registration protection
    # Prevent duplicate registrations using same programme + same email OR same programme + same faculty code
    dup_filters = [Registration.event_id == id]
    dup_or_clauses = []
    if linked_faculty_id:
        dup_or_clauses.append(Registration.faculty_id == linked_faculty_id)
    if f_email:
        dup_or_clauses.append(Registration.email.ilike(f_email))
    if f_code:
        dup_or_clauses.append(Registration.faculty_code.ilike(f_code))

    if dup_or_clauses:
        existing = db.query(Registration).filter(
            Registration.event_id == id,
            or_(*dup_or_clauses),
            Registration.registration_status != "CANCELLED"
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You are already registered for this programme."
            )

    # 4. Department / Eligibility validation (if restricted)
    if event.eligibility and "Department Specific" in event.eligibility:
        if event.department and f_dept and event.department.code.upper() != f_dept.upper():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration restricted to Department of {event.department.name}."
            )

    # 5. Generate serial registration code and safe QR token
    total_existing = db.query(Registration).count()
    serial_no = total_existing + 1
    reg_code = f"REG-VU2026-{serial_no:04d}"
    reg_token = f"reg_tok_{uuid.uuid4().hex[:12]}"
    qr_secret = secrets.token_hex(8)
    qr_token = f"{reg_code}:{qr_secret}"

    reg = Registration(
        event_id=id,
        faculty_id=linked_faculty_id,
        participant_name=p_name,
        faculty_code=f_code,
        email=f_email,
        phone=f_phone,
        department=f_dept,
        designation=f_desig,
        institution_name=f_inst,
        years_of_experience=exp_years,
        teaching_interests=teach_int,
        research_interests=res_int,
        registration_code=reg_code,
        registration_token=reg_token,
        qr_token=qr_token,
        registered_at=datetime.utcnow(),
        registration_status="CONFIRMED",
        eligibility_status="ELIGIBLE",
        completion_status="IN_PROGRESS",
        attendance_status="PENDING"
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)

    resp = RegistrationResponse.from_orm(reg)
    resp.registration_id = reg.id
    resp.faculty_name = p_name
    resp.participant_name = p_name
    resp.faculty_code = f_code
    resp.email = f_email
    resp.phone = f_phone
    resp.department = f_dept
    resp.department_name = f_dept
    resp.designation = f_desig
    resp.institution_name = f_inst
    resp.registration_code = reg_code
    resp.registration_token = reg_token
    resp.qr_token = qr_token
    resp.attendance_status = "PENDING"
    return resp

@router.get("/events/{id}/registrations", response_model=List[RegistrationResponse])
def list_event_registrations(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    registrations = db.query(Registration).filter(Registration.event_id == id).order_by(Registration.id.asc()).all()
    results = []
    for r in registrations:
        resp = RegistrationResponse.from_orm(r)
        p_name = r.participant_name or (r.faculty.full_name if r.faculty else "Participant")
        f_code = r.faculty_code or (r.faculty.faculty_code if r.faculty else None)
        f_dept = r.department or (r.faculty.department.code if r.faculty and r.faculty.department else None)
        resp.registration_id = r.id
        resp.faculty_name = p_name
        resp.participant_name = p_name
        resp.faculty_code = f_code
        resp.department = f_dept
        resp.department_name = f_dept
        resp.email = r.email or (r.faculty.email if r.faculty else None)
        resp.phone = r.phone or (getattr(r.faculty, "phone", None) if r.faculty else None)
        resp.designation = r.designation or (r.faculty.designation if r.faculty else None)
        resp.institution_name = r.institution_name or "Vignan's University"
        resp.registration_code = r.registration_code or f"REG-VU2026-{r.id:04d}"
        resp.qr_token = r.qr_token or f"{resp.registration_code}:tok{r.id}"
        resp.attendance_status = r.attendance_status or "PENDING"
        results.append(resp)
    return results
