from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
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

    faculty = db.query(Faculty).filter(Faculty.id == reg_in.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    if event.status not in ["REGISTRATION_OPEN", "APPROVED", "ONGOING"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration is not open for this event (current status: {event.status})."
        )

    # Prevent duplicate registration
    existing = db.query(Registration).filter(
        Registration.event_id == id,
        Registration.faculty_id == reg_in.faculty_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Faculty already registered for this event."
        )

    # Check capacity
    current_reg_count = db.query(Registration).filter(Registration.event_id == id).count()
    if current_reg_count >= event.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event capacity has been reached."
        )

    reg = Registration(
        event_id=id,
        faculty_id=reg_in.faculty_id,
        registered_at=datetime.utcnow(),
        registration_status="CONFIRMED",
        eligibility_status="ELIGIBLE",
        completion_status="IN_PROGRESS"
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)

    resp = RegistrationResponse.from_orm(reg)
    resp.faculty_name = faculty.full_name
    resp.faculty_code = faculty.faculty_code
    resp.department_name = faculty.department.name if faculty.department else None
    return resp

@router.get("/events/{id}/registrations", response_model=List[RegistrationResponse])
def list_event_registrations(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    registrations = db.query(Registration).filter(Registration.event_id == id).all()
    results = []
    for r in registrations:
        resp = RegistrationResponse.from_orm(r)
        resp.faculty_name = r.faculty.full_name if r.faculty else None
        resp.faculty_code = r.faculty.faculty_code if r.faculty else None
        resp.department_name = r.faculty.department.name if r.faculty and r.faculty.department else None
        results.append(resp)
    return results
