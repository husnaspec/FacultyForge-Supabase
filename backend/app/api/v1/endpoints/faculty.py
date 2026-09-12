from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.faculty import Faculty
from app.models.department import Department
from app.models.skill import SkillGap, TrainingRecommendation
from app.schemas import (
    FacultyCreate, FacultyUpdate, FacultyResponse,
    DigitalPassportResponse, SkillGapItem, TrainingRecommendationItem,
    SkillEvidenceCreate, SkillEvidenceResponse, VerifiedSkillItem,
    TeachingImpactCreate, TeachingImpactResponse
)
from app.services.passport_service import passport_service
from app.services.compliance_service import compliance_service
from app.services.skill_evidence_service import skill_evidence_service
from app.models.teaching_impact import TeachingImpact
from app.models.event import Event

router = APIRouter()

@router.post("/faculty", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
def create_faculty(fac_in: FacultyCreate, db: Session = Depends(get_db)):
    # Validate department exists
    dept = db.query(Department).filter(Department.id == fac_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department does not exist.")

    # Validate unique email and code
    existing = db.query(Faculty).filter(
        (Faculty.email == fac_in.email) | (Faculty.faculty_code == fac_in.faculty_code)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Faculty with this email or faculty code already exists.")

    faculty = Faculty(**fac_in.dict())
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    resp = FacultyResponse.from_orm(faculty)
    resp.department_name = faculty.department.name if faculty.department else None
    return resp

@router.get("/faculty", response_model=List[FacultyResponse])
def list_faculty(
    department_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Faculty)
    if department_id:
        query = query.filter(Faculty.department_id == department_id)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Faculty.full_name.ilike(s)) |
            (Faculty.faculty_code.ilike(s)) |
            (Faculty.email.ilike(s)) |
            (Faculty.existing_skills.ilike(s))
        )
    faculties = query.all()
    res = []
    for f in faculties:
        resp = FacultyResponse.from_orm(f)
        resp.department_name = f.department.name if f.department else None
        res.append(resp)
    return res

@router.get("/faculty/{id}", response_model=FacultyResponse)
def get_faculty(id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")
    resp = FacultyResponse.from_orm(faculty)
    resp.department_name = faculty.department.name if faculty.department else None
    return resp

@router.put("/faculty/{id}", response_model=FacultyResponse)
def update_faculty(id: int, fac_in: FacultyUpdate, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")

    if fac_in.department_id:
        dept = db.query(Department).filter(Department.id == fac_in.department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department does not exist.")

    for field, val in fac_in.dict(exclude_unset=True).items():
        setattr(faculty, field, val)

    db.commit()
    db.refresh(faculty)
    resp = FacultyResponse.from_orm(faculty)
    resp.department_name = faculty.department.name if faculty.department else None
    return resp

@router.delete("/faculty/{id}")
def deactivate_faculty(id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty member not found.")
    faculty.is_active = False
    db.commit()
    return {"message": f"Faculty {faculty.full_name} deactivated successfully."}

@router.get("/faculty/{id}/passport", response_model=DigitalPassportResponse)
def get_faculty_passport(id: int, db: Session = Depends(get_db)):
    try:
        return passport_service.get_digital_passport(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/faculty/{id}/skill-gaps")
def get_faculty_skill_gaps(id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")
    
    gaps = db.query(SkillGap).filter(SkillGap.faculty_id == id, SkillGap.status == "ACTIVE").all()
    return {
        "faculty_id": id,
        "faculty_name": faculty.full_name,
        "skill_gaps": [
            {
                "skill": g.skill_name,
                "current_level": g.current_level,
                "required_level": g.required_level,
                "gap_score": g.gap_score,
                "priority": g.priority,
                "reason": g.explanation,
                "identified_at": g.identified_at
            } for g in gaps
        ]
    }

@router.get("/faculty/{id}/recommendations")
def get_faculty_recommendations(id: int, db: Session = Depends(get_db)):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    recs = db.query(TrainingRecommendation).filter(TrainingRecommendation.faculty_id == id).all()
    return {
        "faculty_id": id,
        "faculty_name": faculty.full_name,
        "recommendations": [
            {
                "title": r.title,
                "topic": r.topic,
                "priority": r.priority,
                "reason": r.reason,
                "recommended_duration": r.recommended_duration,
                "confidence_score": r.confidence_score,
                "status": r.status,
                "recommended_event_id": r.recommended_event_id
            } for r in recs
        ]
    }

@router.get("/faculty/{id}/compliance")
def get_faculty_compliance(id: int, db: Session = Depends(get_db)):
    try:
        return compliance_service.calculate_faculty_compliance(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# ======================= SKILL EVIDENCE ENDPOINTS =======================

@router.post("/faculty/{id}/skill-evidence", response_model=SkillEvidenceResponse, status_code=status.HTTP_201_CREATED)
def add_faculty_skill_evidence(
    id: int,
    ev_in: SkillEvidenceCreate,
    db: Session = Depends(get_db)
):
    try:
        return skill_evidence_service.add_evidence(
            db,
            faculty_id=id,
            skill_name=ev_in.skill_name,
            evidence_type=ev_in.evidence_type,
            evidence_reference=ev_in.evidence_reference,
            score=ev_in.score,
            verified=ev_in.verified,
            verified_by=ev_in.verified_by
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/faculty/{id}/skill-evidence", response_model=List[SkillEvidenceResponse])
def get_faculty_skill_evidence(
    id: int,
    skill_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")
    return skill_evidence_service.get_faculty_evidence(db, faculty_id=id, skill_name=skill_name)

@router.get("/faculty/{id}/verified-skills", response_model=List[VerifiedSkillItem])
def get_faculty_verified_skills(
    id: int,
    db: Session = Depends(get_db)
):
    try:
        return skill_evidence_service.get_verified_skills(db, faculty_id=id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# ======================= TEACHING IMPACT ENDPOINTS =======================

@router.post("/faculty/{id}/teaching-impact", response_model=TeachingImpactResponse, status_code=status.HTTP_201_CREATED)
def record_teaching_impact(
    id: int,
    impact_in: TeachingImpactCreate,
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    if impact_in.event_id:
        ev = db.query(Event).filter(Event.id == impact_in.event_id).first()
        if not ev:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event does not exist.")

    impact = TeachingImpact(
        faculty_id=id,
        event_id=impact_in.event_id,
        skill_name=impact_in.skill_name,
        application_type=impact_in.application_type,
        application_description=impact_in.application_description,
        evidence_url=impact_in.evidence_url,
        self_rating=impact_in.self_rating,
        reviewer_rating=impact_in.reviewer_rating,
        impact_status=impact_in.impact_status,
        applied_at=impact_in.applied_at or datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(impact)
    db.commit()
    db.refresh(impact)

    # Also record practical activity evidence automatically!
    try:
        skill_evidence_service.add_evidence(
            db,
            faculty_id=id,
            skill_name=impact_in.skill_name,
            evidence_type="PRACTICAL_ACTIVITY",
            evidence_reference=f"Applied in {impact_in.application_type}: {impact_in.application_description[:80]}",
            score=impact_in.self_rating * 20.0, # map 1-5 to 20-100%
            verified=True,
            verified_by="HOD Classroom Review"
        )
    except Exception:
        pass

    resp = TeachingImpactResponse.from_orm(impact)
    resp.faculty_name = faculty.full_name
    resp.event_title = impact.event.title if impact.event else None
    return resp

@router.get("/faculty/{id}/teaching-impact", response_model=List[TeachingImpactResponse])
def get_faculty_teaching_impact(
    id: int,
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    impacts = db.query(TeachingImpact).filter(TeachingImpact.faculty_id == id).order_by(TeachingImpact.created_at.desc()).all()
    res = []
    for imp in impacts:
        resp = TeachingImpactResponse.from_orm(imp)
        resp.faculty_name = faculty.full_name
        resp.event_title = imp.event.title if imp.event else None
        res.append(resp)
    return res
