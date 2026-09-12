from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.models.event import Event
from app.models.faculty import Faculty
from app.models.feedback import Feedback
from app.schemas import FeedbackCreate, FeedbackResponse, FeedbackIntelligenceResponse
from app.agents.feedback_agent import feedback_agent

router = APIRouter()

@router.post("/events/{id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(id: int, fb_in: FeedbackCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    faculty = db.query(Faculty).filter(Faculty.id == fb_in.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    # Prevent duplicate feedback
    existing = db.query(Feedback).filter(
        Feedback.event_id == id,
        Feedback.faculty_id == fb_in.faculty_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Faculty already submitted feedback for this event."
        )

    fb = Feedback(
        event_id=id,
        faculty_id=fb_in.faculty_id,
        content_rating=fb_in.content_rating,
        trainer_rating=fb_in.trainer_rating,
        relevance_rating=fb_in.relevance_rating,
        practical_rating=fb_in.practical_rating,
        organization_rating=fb_in.organization_rating,
        comments=fb_in.comments,
        suggestions=fb_in.suggestions,
        submitted_at=datetime.utcnow()
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    resp = FeedbackResponse.from_orm(fb)
    resp.faculty_name = faculty.full_name
    return resp

@router.get("/events/{id}/feedback", response_model=List[FeedbackResponse])
def list_event_feedback(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    feedbacks = db.query(Feedback).filter(Feedback.event_id == id).all()
    results = []
    for f in feedbacks:
        resp = FeedbackResponse.from_orm(f)
        resp.faculty_name = f.faculty.full_name if f.faculty else None
        results.append(resp)
    return results

@router.get("/events/{id}/feedback-intelligence", response_model=FeedbackIntelligenceResponse)
def get_feedback_intelligence(id: int, db: Session = Depends(get_db)):
    try:
        return feedback_agent.analyze(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
