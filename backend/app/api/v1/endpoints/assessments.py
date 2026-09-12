from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.models.event import Event
from app.models.faculty import Faculty
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAttempt
from app.schemas import (
    AssessmentCreate, AssessmentResponse, QuestionCreate, QuestionResponse,
    AssessmentSubmitRequest, AssessmentAttemptResponse, LearningImpactResponse
)
from app.services.assessment_service import assessment_service
from app.agents.learning_impact_agent import learning_impact_agent

router = APIRouter()

@router.post("/assessments", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(assess_in: AssessmentCreate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == assess_in.event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    assess_type = assess_in.assessment_type.upper()
    if assess_type not in ["PRE", "POST"]:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="assessment_type must be PRE or POST.")

    assessment = Assessment(
        event_id=assess_in.event_id,
        assessment_type=assess_type,
        title=assess_in.title,
        total_marks=assess_in.total_marks,
        passing_marks=assess_in.passing_marks
    )
    db.add(assessment)
    db.flush()

    if assess_in.questions:
        for q in assess_in.questions:
            db_q = AssessmentQuestion(
                assessment_id=assessment.id,
                question_text=q.question_text,
                option_a=q.option_a,
                option_b=q.option_b,
                option_c=q.option_c,
                option_d=q.option_d,
                correct_option=q.correct_option.lower(),
                marks=q.marks,
                explanation=q.explanation
            )
            db.add(db_q)

    db.commit()
    db.refresh(assessment)
    return assessment

@router.post("/assessments/{id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def add_assessment_question(id: int, q_in: QuestionCreate, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

    q = AssessmentQuestion(
        assessment_id=id,
        question_text=q_in.question_text,
        option_a=q_in.option_a,
        option_b=q_in.option_b,
        option_c=q_in.option_c,
        option_d=q_in.option_d,
        correct_option=q_in.correct_option.lower(),
        marks=q_in.marks,
        explanation=q_in.explanation
    )
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.get("/events/{id}/assessments", response_model=List[AssessmentResponse])
def get_event_assessments(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    assessments = db.query(Assessment).filter(Assessment.event_id == id).all()
    return assessments

@router.post("/assessments/{id}/submit", response_model=AssessmentAttemptResponse)
def submit_assessment(id: int, sub_in: AssessmentSubmitRequest, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

    faculty = db.query(Faculty).filter(Faculty.id == sub_in.faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    # Check for duplicate attempt
    existing = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == id,
        AssessmentAttempt.faculty_id == sub_in.faculty_id
    ).first()
    if existing:
        resp = AssessmentAttemptResponse.from_orm(existing)
        resp.faculty_name = faculty.full_name
        return resp

    try:
        attempt = assessment_service.score_attempt(db, id, sub_in.faculty_id, sub_in.answers)
        resp = AssessmentAttemptResponse.from_orm(attempt)
        resp.faculty_name = faculty.full_name
        return resp
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/events/{id}/learning-impact", response_model=LearningImpactResponse)
def get_event_learning_impact(id: int, db: Session = Depends(get_db)):
    try:
        return learning_impact_agent.analyze(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
