from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.faculty import Faculty
from app.models.department import Department
from app.models.skill import SkillGap, TrainingRecommendation
from app.schemas import (
    FacultyCreate, FacultyUpdate, FacultyResponse,
    DigitalPassportResponse, SkillGapItem, TrainingRecommendationItem,
    SkillEvidenceCreate, SkillEvidenceResponse, VerifiedSkillItem,
    TeachingImpactCreate, TeachingImpactResponse, TeachingImpactVerify
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

@router.get("/faculty/lookup")
def lookup_faculty(
    code: Optional[str] = None,
    email: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    from sqlalchemy import or_
    search_val = (query or code or email or "").strip()
    if not search_val:
        return {"found": False, "message": "No search parameter provided."}

    conds = [
        Faculty.faculty_code.ilike(search_val),
        Faculty.email.ilike(search_val)
    ]
    faculty = db.query(Faculty).filter(or_(*conds)).first()
    if not faculty:
        return {"found": False}

    dept_code = faculty.department.code if faculty.department else ""
    dept_name = faculty.department.name if faculty.department else ""
    return {
        "found": True,
        "faculty_id": faculty.id,
        "full_name": faculty.full_name,
        "faculty_code": faculty.faculty_code,
        "email": faculty.email,
        "phone": getattr(faculty, "phone", "") or "",
        "department": dept_code or dept_name,
        "designation": faculty.designation or "Assistant Professor",
        "institution_name": "Vignan's University",
        "years_of_experience": getattr(faculty, "years_of_experience", 0.0) or 0.0,
        "teaching_interests": faculty.teaching_interests or "",
        "research_interests": faculty.research_interests or ""
    }

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
@router.get("/faculty/{id}/digital-passport", response_model=DigitalPassportResponse)
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

# ======================= TEACHING IMPACT ENDPOINTS =======================

def _build_impact_response(imp: TeachingImpact) -> TeachingImpactResponse:
    resp = TeachingImpactResponse.from_orm(imp)
    resp.faculty_name = imp.faculty.full_name if imp.faculty else None
    resp.event_title = imp.event.title if imp.event else None
    resp.description = imp.application_description
    resp.evidence_reference = imp.evidence_url
    resp.status = imp.impact_status
    resp.verified_at = imp.verified_at
    resp.verified_by = imp.verified_by
    return resp

@router.post("/faculty/{id}/teaching-impact", response_model=TeachingImpactResponse, status_code=status.HTTP_201_CREATED)
def record_teaching_impact(
    id: int,
    impact_in: TeachingImpactCreate,
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    desc = (impact_in.description or impact_in.application_description or "").strip()
    if not desc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Description is required.")

    ev_id = impact_in.event_id
    if ev_id:
        ev = db.query(Event).filter(Event.id == ev_id).first()
        if not ev:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event does not exist.")

    # Duplicate protection: prevent repeated clicks within 60s
    recent_dup = db.query(TeachingImpact).filter(
        TeachingImpact.faculty_id == id,
        TeachingImpact.skill_name.ilike(impact_in.skill_name.strip()),
        TeachingImpact.application_type == impact_in.application_type,
        TeachingImpact.application_description == desc,
        TeachingImpact.created_at >= datetime.utcnow() - timedelta(seconds=60)
    ).first()
    if recent_dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A duplicate teaching impact record was recently submitted. Please wait before re-submitting."
        )

    ev_ref = impact_in.evidence_reference or impact_in.evidence_url
    status_val = (impact_in.status or impact_in.impact_status or "APPLIED").upper()
    if status_val not in ["PLANNED", "APPLIED", "VERIFIED"]:
        status_val = "APPLIED"

    verified_at = datetime.utcnow() if status_val == "VERIFIED" else None
    verified_by = "Academic / HOD Review" if status_val == "VERIFIED" else None

    impact = TeachingImpact(
        faculty_id=id,
        event_id=ev_id,
        skill_name=impact_in.skill_name.strip(),
        application_type=impact_in.application_type,
        application_description=desc,
        evidence_url=ev_ref.strip() if ev_ref else None,
        self_rating=float(impact_in.self_rating or 4.0),
        reviewer_rating=impact_in.reviewer_rating,
        impact_status=status_val,
        applied_at=impact_in.applied_at or datetime.utcnow(),
        created_at=datetime.utcnow(),
        verified_at=verified_at,
        verified_by=verified_by
    )
    db.add(impact)
    db.commit()
    db.refresh(impact)

    # Also log practical activity evidence automatically
    try:
        skill_evidence_service.add_evidence(
            db,
            faculty_id=id,
            skill_name=impact.skill_name,
            evidence_type="PRACTICAL_ACTIVITY",
            evidence_reference=f"Applied in {impact.application_type}: {desc[:80]}",
            score=impact.self_rating * 20.0,
            verified=(status_val == "VERIFIED"),
            verified_by="HOD Classroom Review" if status_val == "VERIFIED" else None
        )
    except Exception:
        pass

    return _build_impact_response(impact)

@router.post("/teaching-impact", response_model=TeachingImpactResponse, status_code=status.HTTP_201_CREATED)
def create_teaching_impact_standalone(
    impact_in: TeachingImpactCreate,
    db: Session = Depends(get_db)
):
    fac_id = impact_in.faculty_id
    if not fac_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="faculty_id is required in request body.")
    return record_teaching_impact(id=fac_id, impact_in=impact_in, db=db)

@router.get("/faculty/{id}/teaching-impact", response_model=List[TeachingImpactResponse])
def get_faculty_teaching_impact(
    id: int,
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    impacts = db.query(TeachingImpact).filter(TeachingImpact.faculty_id == id).order_by(TeachingImpact.created_at.desc()).all()
    return [_build_impact_response(imp) for imp in impacts]

@router.get("/teaching-impact", response_model=List[TeachingImpactResponse])
def list_teaching_impacts(
    faculty_id: Optional[int] = None,
    event_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TeachingImpact)
    if faculty_id:
        query = query.filter(TeachingImpact.faculty_id == faculty_id)
    if event_id:
        query = query.filter(TeachingImpact.event_id == event_id)
    impacts = query.order_by(TeachingImpact.created_at.desc()).all()
    return [_build_impact_response(imp) for imp in impacts]

@router.put("/teaching-impact/{id}/verify", response_model=TeachingImpactResponse)
@router.post("/teaching-impact/{id}/verify", response_model=TeachingImpactResponse)
def verify_teaching_impact(
    id: int,
    req: Optional[TeachingImpactVerify] = None,
    db: Session = Depends(get_db)
):
    impact = db.query(TeachingImpact).filter(TeachingImpact.id == id).first()
    if not impact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teaching impact record not found.")

    impact.impact_status = "VERIFIED"
    impact.verified_at = datetime.utcnow()
    impact.verified_by = (req.verified_by if req and req.verified_by else "HOD / IQAC Review")
    if req and req.reviewer_rating is not None:
        impact.reviewer_rating = req.reviewer_rating

    db.commit()
    db.refresh(impact)
    return _build_impact_response(impact)

@router.get("/faculty/{id}/programmes")
def get_faculty_programmes(
    id: int,
    db: Session = Depends(get_db)
):
    faculty = db.query(Faculty).filter(Faculty.id == id).first()
    if not faculty:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Faculty not found.")

    from app.models.registration import Registration
    from app.models.attendance import Attendance

    events_map = {}

    # 1. Registered programmes
    regs = db.query(Registration).filter(
        (Registration.faculty_id == id) | (Registration.email == faculty.email)
    ).all()
    for r in regs:
        if r.event:
            events_map[r.event.id] = {
                "id": r.event.id,
                "title": r.event.title,
                "event_code": r.event.event_code,
                "status": r.event.status,
                "delivery_mode": r.event.delivery_mode,
                "relationship": "REGISTERED"
            }

    # 2. Attended programmes
    atts = db.query(Attendance).filter(Attendance.faculty_id == id).all()
    for a in atts:
        if a.event and a.event.id not in events_map:
            events_map[a.event.id] = {
                "id": a.event.id,
                "title": a.event.title,
                "event_code": a.event.event_code,
                "status": a.event.status,
                "delivery_mode": a.event.delivery_mode,
                "relationship": "ATTENDED"
            }

    # 3. All completed programmes as fallback
    completed = db.query(Event).filter(Event.status == "COMPLETED").all()
    for c in completed:
        if c.id not in events_map:
            events_map[c.id] = {
                "id": c.id,
                "title": c.title,
                "event_code": c.event_code,
                "status": c.status,
                "delivery_mode": c.delivery_mode,
                "relationship": "AVAILABLE"
            }

    return list(events_map.values())
