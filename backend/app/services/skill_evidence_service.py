from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.faculty import Faculty
from app.models.skill import FacultySkill
from app.models.skill_evidence import SkillEvidence
from app.models.certificate import Certificate
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.event import Event

class SkillEvidenceService:
    """
    Skill Evidence Service
    Manages multi-modal evidence validation ensuring FDP attendance is backed by
    assessments, certificates, practical assignments, or trainer evaluations.
    """

    @staticmethod
    def add_evidence(
        db: Session,
        faculty_id: int,
        skill_name: str,
        evidence_type: str,
        evidence_reference: str,
        score: Optional[float] = None,
        verified: bool = True,
        verified_by: Optional[str] = "IQAC Academic Committee"
    ) -> SkillEvidence:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError(f"Faculty with id {faculty_id} not found")

        evidence = SkillEvidence(
            faculty_id=faculty_id,
            skill_name=skill_name.strip(),
            evidence_type=evidence_type.upper(),
            evidence_reference=evidence_reference.strip(),
            score=score,
            verified=verified,
            verified_by=verified_by,
            created_at=datetime.utcnow()
        )
        db.add(evidence)
        db.commit()
        db.refresh(evidence)

        # Update or add FacultySkill verification status
        SkillEvidenceService.evaluate_and_update_skill(db, faculty_id, skill_name.strip())
        return evidence

    @staticmethod
    def get_faculty_evidence(
        db: Session,
        faculty_id: int,
        skill_name: Optional[str] = None
    ) -> List[SkillEvidence]:
        query = db.query(SkillEvidence).filter(SkillEvidence.faculty_id == faculty_id)
        if skill_name:
            query = query.filter(SkillEvidence.skill_name.ilike(f"%{skill_name.strip()}%"))
        return query.order_by(SkillEvidence.created_at.desc()).all()

    @staticmethod
    def evaluate_skill_status(evidences: List[SkillEvidence]) -> str:
        verified_evidences = [e for e in evidences if e.verified]
        count = len(verified_evidences)
        if count == 0:
            return "UNVERIFIED"
        elif count == 1:
            # If single evidence is an assessment with score >= 85%, mark verified
            first = verified_evidences[0]
            if first.score and first.score >= 85.0:
                return "VERIFIED"
            return "PARTIALLY_VERIFIED"
        else:
            return "VERIFIED"

    @staticmethod
    def evaluate_and_update_skill(db: Session, faculty_id: int, skill_name: str) -> str:
        evidences = db.query(SkillEvidence).filter(
            SkillEvidence.faculty_id == faculty_id,
            SkillEvidence.skill_name.ilike(f"%{skill_name}%")
        ).all()
        status = SkillEvidenceService.evaluate_skill_status(evidences)

        # Find existing FacultySkill or create
        f_skill = db.query(FacultySkill).filter(
            FacultySkill.faculty_id == faculty_id,
            FacultySkill.skill_name.ilike(f"%{skill_name}%")
        ).first()

        if f_skill:
            f_skill.verification_status = status
            if status == "VERIFIED" and f_skill.proficiency_level == "BEGINNER":
                f_skill.proficiency_level = "INTERMEDIATE"
            db.commit()
            db.refresh(f_skill)
        else:
            new_skill = FacultySkill(
                faculty_id=faculty_id,
                skill_name=skill_name,
                proficiency_level="INTERMEDIATE" if status in ["PARTIALLY_VERIFIED", "VERIFIED"] else "BEGINNER",
                source="EVIDENCE_VALIDATED",
                verification_status=status
            )
            db.add(new_skill)
            db.commit()

        return status

    @staticmethod
    def get_verified_skills(db: Session, faculty_id: int) -> List[Dict[str, Any]]:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError(f"Faculty with id {faculty_id} not found")

        # Check all skills associated with this faculty
        db_skills = db.query(FacultySkill).filter(FacultySkill.faculty_id == faculty_id).all()
        all_evidences = db.query(SkillEvidence).filter(SkillEvidence.faculty_id == faculty_id).all()

        # Group evidences by skill_name lower
        evidence_map: Dict[str, List[SkillEvidence]] = {}
        for ev in all_evidences:
            k = ev.skill_name.strip().lower()
            if k not in evidence_map:
                evidence_map[k] = []
            evidence_map[k].append(ev)

        # Build list
        result = []
        seen_skills = set()

        for s in db_skills:
            k = s.skill_name.strip().lower()
            seen_skills.add(k)
            evs = evidence_map.get(k, [])
            status = SkillEvidenceService.evaluate_skill_status(evs)
            result.append({
                "skill_name": s.skill_name,
                "proficiency_level": s.proficiency_level,
                "verification_status": status,
                "evidence_count": len(evs),
                "evidence_types": list(set(e.evidence_type for e in evs)),
                "last_verified": max([e.created_at for e in evs]) if evs else None
            })

        # Check for skills in evidence not in db_skills
        for k, evs in evidence_map.items():
            if k not in seen_skills:
                skill_name = evs[0].skill_name
                status = SkillEvidenceService.evaluate_skill_status(evs)
                result.append({
                    "skill_name": skill_name,
                    "proficiency_level": "INTERMEDIATE" if status == "VERIFIED" else "BEGINNER",
                    "verification_status": status,
                    "evidence_count": len(evs),
                    "evidence_types": list(set(e.evidence_type for e in evs)),
                    "last_verified": max([e.created_at for e in evs]) if evs else None
                })

        return sorted(result, key=lambda x: (x["verification_status"] == "VERIFIED", x["evidence_count"]), reverse=True)

skill_evidence_service = SkillEvidenceService()
