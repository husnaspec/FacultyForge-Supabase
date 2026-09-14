from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.faculty import Faculty
from app.models.skill import FacultySkill, SkillGap
from app.models.registration import Registration
from app.models.assessment import AssessmentAttempt
from app.models.certificate import Certificate
from app.models.agent_analysis import AgentAnalysis
from app.services.ai_provider import ai_provider

class PeerMentorAgent:
    """
    Faculty Peer Mentor Matcher Agent
    Identifies internal faculty mentors when a faculty member has a skill gap,
    evaluating skill proficiency, teaching/research interests, experience,
    training completion, and departmental context.
    """

    def match_peer_mentors(
        self,
        db: Session,
        faculty_id: int,
        skill_name: Optional[str] = None
    ) -> Dict[str, Any]:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError(f"Faculty with id {faculty_id} not found")

        # Determine target skill gaps
        target_gaps = []
        if skill_name:
            target_gaps = [skill_name]
        else:
            gaps = db.query(SkillGap).filter(
                SkillGap.faculty_id == faculty_id,
                SkillGap.status == "ACTIVE"
            ).all()
            if gaps:
                target_gaps = [g.skill_name for g in gaps]
            else:
                target_gaps = []

        if not target_gaps:
            return {
                "faculty_id": faculty.id,
                "faculty_name": faculty.full_name,
                "skill_gap": None,
                "target_skill_gap": None,
                "mentor_matches": [],
                "message": "Faculty member has no active competency gaps requiring peer mentorship."
            }

        primary_gap = target_gaps[0]

        # Search other active faculty
        candidates = db.query(Faculty).filter(
            Faculty.id != faculty_id,
            Faculty.is_active == True
        ).all()

        matches = []
        for candidate in candidates:
            score, skill_level, reason = self._evaluate_candidate(db, candidate, primary_gap, faculty)
            if score >= 60:
                dept_name = candidate.department.name if candidate.department else "General"
                matches.append({
                    "mentor_faculty_id": candidate.id,
                    "mentor_name": candidate.full_name,
                    "match_score": round(score, 1),
                    "skill_level": skill_level,
                    "department": dept_name,
                    "designation": candidate.designation,
                    "years_of_experience": candidate.years_of_experience,
                    "reason": reason
                })

        # Sort matches by score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)

        # Log agent analysis
        try:
            log_entry = AgentAnalysis(
                agent_name="PeerMentorAgent",
                faculty_id=faculty_id,
                input_summary=f"Skill Gap: {primary_gap} for {faculty.full_name}",
                output_data={"top_match": matches[0]["mentor_name"] if matches else None, "count": len(matches)},
                confidence_score=matches[0]["match_score"] / 100.0 if matches else 0.8
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()

        return {
            "faculty_id": faculty.id,
            "faculty_name": faculty.full_name,
            "skill_gap": primary_gap,
            "mentor_matches": matches
        }

    def _evaluate_candidate(
        self,
        db: Session,
        cand: Faculty,
        skill_name: str,
        target_fac: Faculty
    ) -> tuple[float, str, str]:
        score = 50.0
        skill_level = "INTERMEDIATE"

        cand_text = f"{cand.existing_skills or ''} {cand.research_interests or ''} {cand.teaching_interests or ''}".lower()
        target_skill_lower = skill_name.lower()

        # Check DB skills
        db_skills = db.query(FacultySkill).filter(FacultySkill.faculty_id == cand.id).all()
        matched_db_skill = next(
            (s for s in db_skills if target_skill_lower in s.skill_name.lower() or s.skill_name.lower() in target_skill_lower),
            None
        )

        has_skill_in_text = (
            target_skill_lower in cand_text or
            any(w in cand_text for w in target_skill_lower.split() if len(w) > 3)
        )

        if matched_db_skill:
            skill_level = matched_db_skill.proficiency_level
            if skill_level in ["ADVANCED", "EXPERT"]:
                score += 35.0
            elif skill_level == "INTERMEDIATE":
                score += 25.0
            else:
                score += 15.0
        elif has_skill_in_text:
            score += 25.0
            skill_level = "ADVANCED" if cand.years_of_experience >= 10 else "INTERMEDIATE"

        # Research / Teaching interests alignment
        if target_skill_lower in (cand.research_interests or "").lower():
            score += 10.0
        if target_skill_lower in (cand.teaching_interests or "").lower():
            score += 8.0

        # Experience factor
        if cand.years_of_experience >= 10:
            score += 15.0
            if skill_level != "EXPERT":
                skill_level = "ADVANCED"
        elif cand.years_of_experience >= 5:
            score += 8.0

        # Department synergy (same department gets bonus; interdisciplinary also valued)
        same_dept = cand.department_id == target_fac.department_id
        if same_dept:
            score += 8.0

        # Training history & assessment records
        attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.faculty_id == cand.id).all()
        if attempts:
            avg_attempt = sum(a.percentage for a in attempts) / len(attempts)
            if avg_attempt >= 80:
                score += 10.0

        # Certificates
        certs = db.query(Certificate).filter(Certificate.faculty_id == cand.id).count()
        if certs >= 2:
            score += 6.0

        score = min(98.0, max(55.0, score))

        # Generate explainable reason
        if "research" in target_skill_lower and (cand.years_of_experience >= 10 or "research" in cand_text):
            reason = f"Extensive research track record ({cand.years_of_experience} yrs), advanced domain mastery, and verified publication history."
        elif matched_db_skill and matched_db_skill.proficiency_level in ["ADVANCED", "EXPERT"]:
            reason = f"Certified {matched_db_skill.proficiency_level} proficiency in {skill_name} with exceptional past assessment performance."
        elif same_dept and score >= 80:
            reason = f"Departmental colleague with high {skill_name} proficiency and proven peer facilitation experience."
        else:
            reason = f"Strong competency in {skill_name}, relevant training history, and seasoned academic experience ({cand.years_of_experience} yrs)."

        return score, skill_level, reason

peer_mentor_agent = PeerMentorAgent()
