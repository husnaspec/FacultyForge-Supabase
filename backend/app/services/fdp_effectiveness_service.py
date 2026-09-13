from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.feedback import Feedback
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.teaching_impact import TeachingImpact
from app.services.assessment_service import assessment_service

# Configurable Weights
DEFAULT_EFFECTIVENESS_WEIGHTS = {
    "learning_gain": 0.30,
    "attendance": 0.15,
    "completion": 0.15,
    "feedback": 0.20,
    "application": 0.10,
    "cost_efficiency": 0.10,
}

class FDPEffectivenessService:
    """
    FDP Effectiveness and ROI Measurement Service
    Computes a composite multi-factor score evaluating academic return on investment,
    pedagogical gains, participant engagement, cost per participant, and classroom application.
    """

    @staticmethod
    def calculate_effectiveness(
        db: Session,
        event_id: int,
        custom_weights: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError(f"Event with id {event_id} not found")

        weights = custom_weights or DEFAULT_EFFECTIVENESS_WEIGHTS

        # 1. Learning Gain Score (30%)
        try:
            impact_res = assessment_service.calculate_learning_impact(db, event_id)
            if impact_res.get("has_data"):
                gain_pp = impact_res.get("learning_gain_pp", 0.0)
                learning_score = min(100.0, max(0.0, (gain_pp / 35.0) * 100.0))
            else:
                gain_pp = 0.0
                learning_score = 0.0
        except Exception:
            gain_pp = 0.0
            learning_score = 0.0

        # 2. Attendance Score (15%)
        all_att = db.query(Attendance).filter(Attendance.event_id == event_id).all()
        if all_att:
            present_att = sum(1 for a in all_att if a.attendance_status == "PRESENT")
            attendance_score = round((present_att / len(all_att)) * 100.0, 1)
        else:
            attendance_score = 0.0

        # 3. Completion Rate Score (15%)
        regs = db.query(Registration).filter(Registration.event_id == event_id).all()
        if regs:
            completed_count = sum(1 for r in regs if r.completion_status == "COMPLETED")
            completion_score = round((completed_count / len(regs)) * 100.0, 1)
        else:
            completed_count = 0
            completion_score = 0.0

        # 4. Feedback Rating Score (20%)
        feedbacks = db.query(Feedback).filter(Feedback.event_id == event_id).all()
        if feedbacks:
            avg_fb = sum((f.content_rating + f.trainer_rating + f.relevance_rating + f.practical_rating + f.organization_rating) / 5.0 for f in feedbacks) / len(feedbacks)
            feedback_score = round((avg_fb / 5.0) * 100.0, 1)
        else:
            avg_fb = 0.0
            feedback_score = 0.0

        # 5. Practical Application Rate Score (10%)
        app_count = db.query(TeachingImpact).filter(TeachingImpact.event_id == event_id).count()
        if app_count == 0:
            app_count = db.query(TeachingImpact).filter(TeachingImpact.application_description.ilike(f"%{event.title[:15]}%")).count()
        
        if completed_count > 0 and app_count > 0:
            app_ratio = min(1.0, app_count / completed_count)
            application_score = round(app_ratio * 100.0, 1)
        elif app_count > 0:
            application_score = 75.0
        else:
            application_score = 0.0

        # 6. Cost Efficiency Score (10%)
        expenditure = event.actual_expenditure if event.actual_expenditure and event.actual_expenditure > 0 else (event.estimated_budget or 0.0)
        actual_participants = completed_count if completed_count > 0 else len(regs)
        cost_per_participant = round(expenditure / actual_participants, 1) if actual_participants > 0 else 0.0

        if actual_participants == 0 or expenditure == 0:
            cost_efficiency_score = 0.0
        elif cost_per_participant <= 1000:
            cost_efficiency_score = 95.0
        elif cost_per_participant <= 1500:
            cost_efficiency_score = 88.0
        elif cost_per_participant <= 2500:
            cost_efficiency_score = 78.0
        else:
            cost_efficiency_score = 68.0

        # Overall weighted composite
        has_any_data = (all_att or regs or feedbacks or (impact_res.get("has_data") if 'impact_res' in locals() else False))
        if not has_any_data:
            overall_score = 0.0
            impact_level = "PENDING"
        else:
            overall_score = round(
                (learning_score * weights["learning_gain"]) +
                (attendance_score * weights["attendance"]) +
                (completion_score * weights["completion"]) +
                (feedback_score * weights["feedback"]) +
                (application_score * weights["application"]) +
                (cost_efficiency_score * weights["cost_efficiency"]),
                1
            )
            impact_level = "HIGH" if overall_score >= 75.0 else ("MEDIUM" if overall_score >= 50.0 else "LOW")

        overall_score = min(100.0, max(0.0, overall_score))

        # Impact Level classification
        if overall_score >= 90.0:
            impact_level = "EXCELLENT"
        elif overall_score >= 78.0:
            impact_level = "HIGH"
        elif overall_score >= 60.0:
            impact_level = "MEDIUM"
        else:
            impact_level = "LOW"

        explanations = [
            f"Demonstrated solid measurable learning gain of +{gain_pp:.1f} percentage points (Diagnostic: {learning_score:.1f}/100).",
            f"High cohort engagement with {attendance_score:.1f}% attendance and {completion_score:.1f}% certified completions.",
            f"Participant satisfaction index registered at {feedback_score:.1f}/100 based on faculty feedback reviews.",
            f"Classroom/research application rate at {application_score:.1f}/100 demonstrates post-training translation to practice.",
            f"Cost efficiency computed at ₹{cost_per_participant:.0f} per completed participant."
        ]

        return {
            "event_id": event.id,
            "event_title": event.title,
            "event_code": event.event_code,
            "learning_score": round(learning_score, 1),
            "attendance_score": round(attendance_score, 1),
            "completion_score": round(completion_score, 1),
            "feedback_score": round(feedback_score, 1),
            "application_score": round(application_score, 1),
            "cost_efficiency_score": round(cost_efficiency_score, 1),
            "overall_effectiveness_score": overall_score,
            "impact_level": impact_level,
            "actual_expenditure": expenditure,
            "completed_participants": actual_participants,
            "cost_per_participant": cost_per_participant,
            "weights": weights,
            "breakdown_explanations": explanations
        }

fdp_effectiveness_service = FDPEffectivenessService()
