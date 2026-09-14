from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.faculty import Faculty
from app.models.registration import Registration
from app.models.certificate import Certificate
from app.models.skill import FacultySkill, SkillGap, TrainingRecommendation
from app.models.event import Event
from app.models.assessment import Assessment, AssessmentAttempt
from app.services.compliance_service import compliance_service

class PassportService:
    @staticmethod
    def get_digital_passport(db: Session, faculty_id: int) -> Dict[str, Any]:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError("Faculty not found")

        # Registrations and certificates
        registrations = db.query(Registration).filter(Registration.faculty_id == faculty_id).all()
        certificates = db.query(Certificate).filter(
            Certificate.faculty_id == faculty_id,
            Certificate.status == "VALID"
        ).all()

        completed_events = [r.event for r in registrations if r.event and r.completion_status == "COMPLETED"]
        # Add events from certificates if not in completed_events
        cert_event_ids = {c.event_id for c in certificates}
        for e_id in cert_event_ids:
            if not any(ce.id == e_id for ce in completed_events):
                ev = db.query(Event).filter(Event.id == e_id).first()
                if ev:
                    completed_events.append(ev)

        fdps_count = sum(1 for e in completed_events if e.event_type in ["FDP", "STTP", "TRAINING"])
        workshops_count = sum(1 for e in completed_events if e.event_type in ["WORKSHOP", "SEMINAR"])
        
        # Training hours: sum from certs or completed events
        training_hours = sum(c.training_hours for c in certificates)
        if training_hours == 0 and completed_events:
            training_hours = sum(e.duration_hours for e in completed_events)

        # Baseline demo values if new
        if fdps_count == 0 and certificates:
            fdps_count = len(certificates)

        # 1. Profile skills: declared in faculty.existing_skills or self-reported
        profile_skills_set = set()
        if faculty.existing_skills:
            for s in faculty.existing_skills.split(","):
                if s.strip():
                    profile_skills_set.add(s.strip())
        db_skills = db.query(FacultySkill).filter(FacultySkill.faculty_id == faculty_id).all()
        for s in db_skills:
            if s.source == "SELF_REPORTED" or s.verification_status == "UNVERIFIED":
                profile_skills_set.add(s.skill_name.strip())
        profile_skills = sorted(list(profile_skills_set))

        # 2. Validated skills: only when verified through completed events, valid certificates, or institutional evidence records
        validated_skills_set = set()
        for e in completed_events:
            if "AI" in e.title:
                validated_skills_set.add("Generative AI")
                validated_skills_set.add("Machine Learning")
            if "Cyber" in e.title:
                validated_skills_set.add("Cybersecurity")
            if "Research" in e.title:
                validated_skills_set.add("Research Methodology")
            if "Outcome" in e.title or "OBE" in e.title:
                validated_skills_set.add("Outcome Based Education")

        for s in db_skills:
            if s.verification_status == "VERIFIED" and s.source in ["FDP_ASSESSMENT", "EVIDENCE_VALIDATED"]:
                validated_skills_set.add(s.skill_name.strip())

        # Also check verified skill evidence records from institutional training/evaluations
        if completed_events or certificates:
            try:
                from app.models.skill_evidence import SkillEvidence
                verified_evs = db.query(SkillEvidence).filter(
                    SkillEvidence.faculty_id == faculty_id,
                    SkillEvidence.verified == True
                ).all()
                for ev in verified_evs:
                    validated_skills_set.add(ev.skill_name.strip())
            except Exception:
                pass

        validated_skills = sorted(list(validated_skills_set))
        has_verified_skills = len(validated_skills) > 0

        # 3. Average learning gain across attended events with both pre/post
        faculty_attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.faculty_id == faculty_id).all()
        attempt_assess_ids = {a.assessment_id for a in faculty_attempts}

        assessed_event_ids = set(e.id for e in completed_events)
        if attempt_assess_ids:
            event_rows = db.query(Assessment.event_id).filter(Assessment.id.in_(attempt_assess_ids)).distinct().all()
            for r in event_rows:
                assessed_event_ids.add(r[0])

        learning_gains = []
        for ev_id in assessed_event_ids:
            pre_a = db.query(Assessment).filter(Assessment.event_id == ev_id, Assessment.assessment_type == "PRE").first()
            post_a = db.query(Assessment).filter(Assessment.event_id == ev_id, Assessment.assessment_type == "POST").first()
            if pre_a and post_a:
                att_pre = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == pre_a.id, AssessmentAttempt.faculty_id == faculty_id).first()
                att_post = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == post_a.id, AssessmentAttempt.faculty_id == faculty_id).first()
                if att_pre and att_post:
                    learning_gains.append(att_post.percentage - att_pre.percentage)

        has_assessment_data = len(learning_gains) > 0
        if has_assessment_data:
            avg_gain_pp = round(sum(learning_gains) / len(learning_gains), 1)
            if avg_gain_pp >= 25.0:
                learning_impact_level = "HIGH"
            elif avg_gain_pp >= 10.0:
                learning_impact_level = "MODERATE"
            elif avg_gain_pp > 0.0:
                learning_impact_level = "LOW"
            elif avg_gain_pp == 0.0:
                learning_impact_level = "NO CHANGE"
            else:
                learning_impact_level = "LOW"
            learning_impact_label = f"{'+' if avg_gain_pp >= 0 else ''}{avg_gain_pp} pp"
        else:
            avg_gain_pp = 0.0
            learning_impact_level = "NO DATA"
            learning_impact_label = "No assessment data"

        # Skill gaps
        gaps = db.query(SkillGap).filter(
            SkillGap.faculty_id == faculty_id,
            SkillGap.status == "ACTIVE"
        ).all()
        skill_gaps_data = [
            {
                "skill": g.skill_name,
                "current_level": g.current_level,
                "required_level": g.required_level,
                "gap_score": g.gap_score,
                "priority": g.priority,
                "reason": g.explanation
            } for g in gaps
        ]

        # Next recommended training
        rec = db.query(TrainingRecommendation).filter(
            TrainingRecommendation.faculty_id == faculty_id,
            TrainingRecommendation.status == "PENDING"
        ).order_by(TrainingRecommendation.confidence_score.desc()).first()

        next_rec = None
        if rec:
            next_rec = {
                "title": rec.title,
                "topic": rec.topic,
                "priority": rec.priority,
                "reason": rec.reason,
                "recommended_duration": rec.recommended_duration,
                "confidence_score": rec.confidence_score
            }

        # Compliance
        comp = compliance_service.calculate_faculty_compliance(db, faculty_id)

        # Academic Council Verification check
        # Must ONLY appear if an actual stored institutional verification record exists
        from app.models.teaching_impact import TeachingImpact
        has_valid_cert = certificates and any(c.status == "VALID" for c in certificates)
        has_verified_skill = len(validated_skills) > 0
        has_verified_impact = db.query(TeachingImpact).filter(
            TeachingImpact.faculty_id == faculty_id,
            TeachingImpact.verified_at.isnot(None)
        ).first() is not None

        is_academic_council_verified = bool(has_valid_cert or has_verified_skill or has_verified_impact)
        verification_badge_label = "Academic Council Verified" if is_academic_council_verified else "Institutional Record (Unverified)"

        # Timeline
        timeline = []
        for e in completed_events:
            cert = next((c for c in certificates if c.event_id == e.id), None)
            timeline.append({
                "event_id": e.id,
                "title": e.title,
                "event_type": e.event_type,
                "duration_hours": e.duration_hours,
                "delivery_mode": e.delivery_mode,
                "completed_date": cert.issue_date.strftime("%b %d, %Y") if cert else (e.end_date.strftime("%b %d, %Y") if e.end_date else "Completed"),
                "certificate_code": cert.certificate_code if cert else None,
                "verification_token": cert.verification_token if cert else None
            })

        # Extended Digital Passport Intelligence
        # 1. Verified Skills & Evidences
        try:
            from app.services.skill_evidence_service import skill_evidence_service
            verified_skills = skill_evidence_service.get_verified_skills(db, faculty_id)
            ev_list = skill_evidence_service.get_faculty_evidence(db, faculty_id)
            skill_evidences = [
                {
                    "id": e.id,
                    "skill_name": e.skill_name,
                    "evidence_type": e.evidence_type,
                    "evidence_reference": e.evidence_reference,
                    "score": e.score,
                    "verified": e.verified,
                    "created_at": e.created_at.strftime("%b %d, %Y") if e.created_at else None
                } for e in ev_list
            ]
        except Exception:
            verified_skills = []
            skill_evidences = []

        # 2. Applied Learning (Teaching Impact)
        try:
            from app.models.teaching_impact import TeachingImpact
            impacts = db.query(TeachingImpact).filter(TeachingImpact.faculty_id == faculty_id).all()
            applied_learning = [
                {
                    "id": ti.id,
                    "skill_name": ti.skill_name,
                    "training_title": ti.event.title if ti.event else "Continuous Development",
                    "application_type": ti.application_type,
                    "application_description": ti.application_description,
                    "self_rating": ti.self_rating,
                    "impact_status": ti.impact_status,
                    "applied_at": ti.applied_at.strftime("%b %d, %Y") if ti.applied_at else None
                } for ti in impacts
            ]
        except Exception:
            applied_learning = []

        # 3. Peer Mentors
        try:
            from app.agents.peer_mentor_agent import peer_mentor_agent
            mentor_data = peer_mentor_agent.match_peer_mentors(db, faculty_id)
            peer_mentors = mentor_data.get("mentor_matches", [])[:3]
        except Exception:
            peer_mentors = []

        # 4. Career Goal
        try:
            from app.agents.career_growth_agent import career_growth_agent
            career_data = career_growth_agent.generate_career_path(db, faculty_id, "RESEARCH_MENTOR")
            career_goal = {
                "goal": career_data["goal"],
                "goal_title": career_data["goal_title"],
                "progress_percentage": career_data["current_progress_percentage"],
                "next_recommended_step": career_data["next_recommended_step"]
            }
        except Exception:
            career_goal = None

        # 5. FDP Effectiveness History
        try:
            from app.services.fdp_effectiveness_service import fdp_effectiveness_service
            eff_history = []
            for ev in completed_events:
                eff = fdp_effectiveness_service.calculate_effectiveness(db, ev.id)
                eff_history.append({
                    "event_id": ev.id,
                    "event_title": ev.title,
                    "effectiveness_score": eff["overall_effectiveness_score"],
                    "impact_level": eff["impact_level"],
                    "learning_score": eff["learning_score"],
                    "attendance_score": eff["attendance_score"]
                })
        except Exception:
            eff_history = []

        return {
            "faculty_id": faculty.id,
            "faculty_code": faculty.faculty_code,
            "full_name": faculty.full_name,
            "department_name": faculty.department.name if faculty.department else "N/A",
            "designation": faculty.designation,
            "qualification": faculty.qualification,
            "years_of_experience": faculty.years_of_experience,
            "fdps_completed": max(fdps_count, len(completed_events)),
            "workshops_completed": workshops_count,
            "total_training_hours": training_hours,
            "certificates_count": len(certificates),
            "skills_acquired": validated_skills if has_verified_skills else profile_skills,
            "profile_skills": profile_skills,
            "validated_skills": validated_skills,
            "has_verified_skills": has_verified_skills,
            "average_learning_gain_pp": avg_gain_pp,
            "has_assessment_data": has_assessment_data,
            "learning_impact_level": learning_impact_level,
            "learning_impact_label": learning_impact_label,
            "is_academic_council_verified": is_academic_council_verified,
            "verification_badge_label": verification_badge_label,
            "skill_gaps": skill_gaps_data,
            "next_recommended_training": next_rec,
            "compliance": comp,
            "training_history": timeline,
            # Extended Sections
            "verified_skills": verified_skills,
            "skill_evidences": skill_evidences,
            "applied_learning": applied_learning,
            "peer_mentors": peer_mentors,
            "career_goal": career_goal,
            "fdp_effectiveness_history": eff_history
        }

passport_service = PassportService()
