from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAttempt
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.event import Event

class AssessmentService:
    @staticmethod
    def score_attempt(db: Session, assessment_id: int, faculty_id: int, answers: Dict[str, str]) -> AssessmentAttempt:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise ValueError("Assessment not found")

        # Enforce PRE before POST rule
        if assessment.assessment_type == "POST":
            pre_assessment = db.query(Assessment).filter(
                Assessment.event_id == assessment.event_id,
                Assessment.assessment_type == "PRE"
            ).first()
            if pre_assessment:
                pre_attempt = db.query(AssessmentAttempt).filter(
                    AssessmentAttempt.assessment_id == pre_assessment.id,
                    AssessmentAttempt.faculty_id == faculty_id
                ).first()
                if not pre_attempt:
                    raise ValueError("PRE assessment required before attempting POST assessment.")

        # Check existing attempt
        existing = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.faculty_id == faculty_id
        ).first()
        if existing:
            return existing

        questions = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == assessment_id).all()
        total_possible = sum(q.marks for q in questions) if questions else assessment.total_marks
        if total_possible <= 0:
            total_possible = 100.0

        obtained_score = 0.0
        for q in questions:
            user_ans = answers.get(str(q.id), "").strip().lower()
            if user_ans and user_ans == q.correct_option.strip().lower():
                obtained_score += q.marks

        percentage = round((obtained_score / total_possible) * 100.0, 2)
        attempt = AssessmentAttempt(
            assessment_id=assessment_id,
            faculty_id=faculty_id,
            score=obtained_score,
            percentage=percentage
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return attempt

    @staticmethod
    def calculate_learning_impact(db: Session, event_id: int) -> Dict[str, Any]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError(f"Event with id {event_id} not found")

        # Registrations and attendance rates from real DB data
        registrations = db.query(Registration).filter(Registration.event_id == event_id).all()
        reg_count = len(registrations)

        attendances = db.query(Attendance).filter(
            Attendance.event_id == event_id,
            Attendance.attendance_status == "PRESENT"
        ).all()
        
        attendee_faculty = set(a.faculty_id for a in attendances if a.faculty_id is not None)
        attendance_rate = round((len(attendee_faculty) / reg_count * 100.0), 1) if reg_count > 0 else 0.0
        
        completed_reg = [r for r in registrations if r.completion_status == "COMPLETED"]
        completion_rate = round((len(completed_reg) / reg_count * 100.0), 1) if reg_count > 0 else 0.0

        pre_assessment = db.query(Assessment).filter(
            Assessment.event_id == event_id,
            Assessment.assessment_type == "PRE"
        ).first()

        post_assessment = db.query(Assessment).filter(
            Assessment.event_id == event_id,
            Assessment.assessment_type == "POST"
        ).first()

        pre_attempts = []
        if pre_assessment:
            pre_attempts = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == pre_assessment.id
            ).all()

        post_attempts = []
        if post_assessment:
            post_attempts = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == post_assessment.id
            ).all()

        # If no attempts exist at all, return genuine empty state
        if not pre_attempts and not post_attempts:
            return {
                "event_id": event.id,
                "event_title": event.title,
                "pre_average": 0.0,
                "post_average": 0.0,
                "learning_gain_pp": 0.0,
                "attendance_rate": attendance_rate,
                "completion_rate": completion_rate,
                "improvement_distribution": {"high": 0, "moderate": 0, "slight": 0},
                "impact_level": "PENDING",
                "participant_count": 0,
                "has_data": False,
                "explanation": "No assessment data available. Pre and post assessment scores will populate once participants complete the tests."
            }

        # Faculty matched attempts
        pre_scores = {a.faculty_id: a.percentage for a in pre_attempts}
        post_scores = {a.faculty_id: a.percentage for a in post_attempts}
        common_faculty = set(pre_scores.keys()).intersection(set(post_scores.keys()))

        if common_faculty:
            pre_avg = round(sum(pre_scores[f] for f in common_faculty) / len(common_faculty), 2)
            post_avg = round(sum(post_scores[f] for f in common_faculty) / len(common_faculty), 2)
            learning_gain_pp = round(post_avg - pre_avg, 2)
        else:
            pre_avg = round(sum(a.percentage for a in pre_attempts) / len(pre_attempts), 2) if pre_attempts else 0.0
            post_avg = round(sum(a.percentage for a in post_attempts) / len(post_attempts), 2) if post_attempts else 0.0
            learning_gain_pp = round(post_avg - pre_avg, 2) if (pre_attempts and post_attempts) else 0.0

        # Improvement distribution from real common faculty attempts
        high_gain = 0
        moderate_gain = 0
        slight_gain = 0
        for f in common_faculty:
            diff = post_scores[f] - pre_scores[f]
            if diff >= 25:
                high_gain += 1
            elif diff >= 10:
                moderate_gain += 1
            else:
                slight_gain += 1

        impact_level = "HIGH" if learning_gain_pp >= 25.0 else ("MODERATE" if learning_gain_pp >= 10.0 else ("LOW" if (pre_attempts and post_attempts) else "PENDING"))

        if pre_attempts and post_attempts:
            explanation = (
                f"Pre-assessment average was {pre_avg}%, while post-assessment average attained {post_avg}%, "
                f"representing an absolute Learning Gain of {'+' if learning_gain_pp >= 0 else ''}{learning_gain_pp} percentage points across cohort."
            )
        elif pre_attempts:
            explanation = f"Diagnostic pre-assessment completed with average score of {pre_avg}%. Post-assessment pending."
        else:
            explanation = f"Post-assessment completed with average score of {post_avg}%. Diagnostic pre-assessment was not recorded."

        return {
            "event_id": event.id,
            "event_title": event.title,
            "pre_average": pre_avg,
            "post_average": post_avg,
            "learning_gain_pp": learning_gain_pp,
            "attendance_rate": attendance_rate,
            "completion_rate": completion_rate,
            "improvement_distribution": {
                "high_improvement (>25 pp)": high_gain,
                "moderate_improvement (10-25 pp)": moderate_gain,
                "slight_improvement (<10 pp)": slight_gain
            },
            "impact_level": impact_level,
            "participant_count": len(common_faculty) if common_faculty else max(len(pre_attempts), len(post_attempts)),
            "has_data": True,
            "explanation": explanation
        }

assessment_service = AssessmentService()
