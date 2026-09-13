from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.event import Event, EventSession
from app.models.department import Department
from app.models.faculty import Faculty
from app.models.resource_person import ResourcePerson
from app.schemas import (
    EventCreate, EventUpdate, EventResponse, EventSessionCreate, EventSessionResponse,
    TeachingImpactResponse, FDPEffectivenessResponse
)
from app.models.teaching_impact import TeachingImpact
from app.services.fdp_effectiveness_service import fdp_effectiveness_service

router = APIRouter()

@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    if event_in.capacity <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Capacity must be greater than 0.")
    if event_in.duration_hours <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Duration hours must be greater than 0.")

    dept = db.query(Department).filter(Department.id == event_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department does not exist.")

    if event_in.coordinator_faculty_id:
        coord = db.query(Faculty).filter(Faculty.id == event_in.coordinator_faculty_id).first()
        if not coord:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coordinator faculty does not exist.")

    # Unique event code check or auto-generate
    event_data = event_in.dict(exclude={"sessions"})
    if not event_data.get("event_code"):
        count = db.query(Event).count() + 1
        year = datetime.utcnow().year
        event_data["event_code"] = f"VU-FDP-{year}-{count:04d}"
    else:
        existing = db.query(Event).filter(Event.event_code == event_data["event_code"]).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Event code already exists.")

    event = Event(**event_data)
    event.status = "DRAFT" # Always initially DRAFT
    db.add(event)
    db.flush()

    if event_in.sessions:
        for s in event_in.sessions:
            sess = EventSession(event_id=event.id, **s.dict())
            db.add(sess)

    db.commit()
    db.refresh(event)

    resp = EventResponse.from_orm(event)
    resp.department_name = event.department.name if event.department else None
    resp.coordinator_name = event.coordinator.full_name if event.coordinator else None
    resp.registered_count = len(event.registrations) if event.registrations else 0
    return resp

@router.get("/events", response_model=List[EventResponse])
def list_events(
    status: Optional[str] = None,
    department_id: Optional[int] = None,
    event_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if status:
        query = query.filter(Event.status == status.upper())
    if department_id:
        query = query.filter(Event.department_id == department_id)
    if event_type:
        query = query.filter(Event.event_type == event_type.upper())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Event.title.ilike(s)) |
            (Event.event_code.ilike(s)) |
            (Event.description.ilike(s))
        )

    events = query.order_by(Event.created_at.desc()).all()
    results = []
    for e in events:
        resp = EventResponse.from_orm(e)
        resp.department_name = e.department.name if e.department else None
        resp.coordinator_name = e.coordinator.full_name if e.coordinator else None
        resp.registered_count = len(e.registrations) if e.registrations else 0
        results.append(resp)
    return results

@router.get("/events/{id}", response_model=EventResponse)
def get_event(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    resp = EventResponse.from_orm(event)
    resp.department_name = event.department.name if event.department else None
    resp.coordinator_name = event.coordinator.full_name if event.coordinator else None
    resp.registered_count = len(event.registrations) if event.registrations else 0
    return resp

@router.put("/events/{id}", response_model=EventResponse)
def update_event(id: int, event_in: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    # Business rule: event must be approved before registration can open
    if event_in.status == "REGISTRATION_OPEN" and event.status not in ["APPROVED", "REGISTRATION_OPEN"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event must be approved before registration can open."
        )

    for field, val in event_in.dict(exclude_unset=True).items():
        setattr(event, field, val)

    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)

    resp = EventResponse.from_orm(event)
    resp.department_name = event.department.name if event.department else None
    resp.coordinator_name = event.coordinator.full_name if event.coordinator else None
    resp.registered_count = len(event.registrations) if event.registrations else 0
    return resp

@router.post("/events/{id}/sessions", response_model=EventSessionResponse, status_code=status.HTTP_201_CREATED)
def add_event_session(id: int, sess_in: EventSessionCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    sess = EventSession(event_id=id, **sess_in.dict())
    db.add(sess)
    db.commit()
    db.refresh(sess)

    resp = EventSessionResponse.from_orm(sess)
    resp.resource_person_name = sess.resource_person.name if sess.resource_person else None
    return resp

@router.get("/events/{id}/teaching-impact", response_model=List[TeachingImpactResponse])
def get_event_teaching_impact(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    impacts = db.query(TeachingImpact).filter(TeachingImpact.event_id == id).all()
    res = []
    for imp in impacts:
        resp = TeachingImpactResponse.from_orm(imp)
        resp.faculty_name = imp.faculty.full_name if imp.faculty else None
        resp.event_title = event.title
        res.append(resp)
    return res

@router.get("/events/{id}/effectiveness", response_model=FDPEffectivenessResponse)
def get_event_effectiveness(id: int, db: Session = Depends(get_db)):
    try:
        return fdp_effectiveness_service.calculate_effectiveness(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
