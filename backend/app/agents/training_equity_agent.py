from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.faculty import Faculty
from app.models.department import Department
from app.models.registration import Registration
from app.models.certificate import Certificate
from app.models.agent_analysis import AgentAnalysis

class TrainingEquityAgent:
    """
    Training Fatigue & Participation Equity Agent
    Evaluates institutional distribution of training opportunities across faculty cohorts.
    Maintains professional, neutral institutional language to identify over-utilized
    and under-served cohorts, promoting equitable capability building.
    """

    def analyze_equity(
        self,
        db: Session,
        department_id: Optional[int] = None,
        academic_year: str = "2026-2027",
        semester: str = "Odd Semester"
    ) -> Dict[str, Any]:
        query = db.query(Faculty).filter(Faculty.is_active == True)
        if department_id:
            query = query.filter(Faculty.department_id == department_id)
        faculty_list = query.all()

        total_faculty = len(faculty_list) or 1

        highly_trained = 0
        moderately_trained = 0
        no_recent = 0

        faculty_records = []
        for f in faculty_list:
            regs = db.query(Registration).filter(
                Registration.faculty_id == f.id,
                Registration.completion_status == "COMPLETED"
            ).all()

            certs = db.query(Certificate).filter(
                Certificate.faculty_id == f.id,
                Certificate.status == "VALID"
            ).all()

            prog_count = max(len(regs), len(certs))
            total_hours = sum(c.training_hours for c in certs)
            if total_hours == 0 and regs:
                total_hours = sum(r.event.duration_hours for r in regs if r.event)

            # Classify status neutrally
            if prog_count >= 3 or total_hours >= 40.0:
                status = "HIGH_PARTICIPATION"
                highly_trained += 1
            elif prog_count >= 1 or total_hours >= 16.0:
                status = "BALANCED"
                moderately_trained += 1
            else:
                status = "NEEDS_OPPORTUNITY"
                no_recent += 1

            last_date = None
            if certs:
                last_date = max(c.issue_date for c in certs).strftime("%b %d, %Y")
            elif regs and regs[0].event and regs[0].event.end_date:
                last_date = regs[0].event.end_date.strftime("%b %d, %Y")

            faculty_records.append({
                "faculty_id": f.id,
                "faculty_name": f.full_name,
                "faculty_code": f.faculty_code,
                "department": f.department.code if f.department else "N/A",
                "programmes_attended": prog_count,
                "training_hours": total_hours,
                "last_attended_date": last_date,
                "participation_status": status
            })

        # Calculate Equity Gini-inspired distribution score (0 to 100)
        # Perfect balance: balanced cohorts across departments
        equity_ratio = (moderately_trained + 0.5 * highly_trained) / total_faculty
        equity_score = round(min(95.0, max(42.0, equity_ratio * 90.0 + 10.0)), 1)

        # Potential issue description using neutral institutional phrasing
        if no_recent > 0 and highly_trained > 0:
            potential_issue = (
                f"Training opportunities exhibit cohort concentration: {highly_trained} faculty member(s) hold high participation frequency, "
                f"while {no_recent} faculty member(s) have not completed an FDP in the current academic calendar."
            )
        elif no_recent > 0:
            potential_issue = f"{no_recent} faculty member(s) currently lack recent certified continuous professional development."
        else:
            potential_issue = "Training distribution is evenly balanced across active faculty cadres."

        recommendations = [
            "Prioritize nomination invitations for faculty members currently in the 'Needs Opportunity' cohort.",
            "Balance department-level nomination quotas to ensure multi-disciplinary capability building.",
            "Avoid repeatedly nominating the same participants for back-to-back specialized workshops to prevent training fatigue.",
            "Introduce modular, blended asynchronous formats to accommodate high-workload assistant professors."
        ]

        # Log analysis
        try:
            log_entry = AgentAnalysis(
                agent_name="TrainingEquityAgent",
                input_summary=f"Equity check for {total_faculty} faculty members",
                output_data={"equity_score": equity_score, "no_recent_count": no_recent},
                confidence_score=0.90
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()

        return {
            "total_faculty": total_faculty,
            "highly_trained_count": highly_trained,
            "moderately_trained_count": moderately_trained,
            "no_recent_training_count": no_recent,
            "participation_equity_score": equity_score,
            "potential_issue": potential_issue,
            "recommendations": recommendations,
            "distribution": {
                "high_participation": highly_trained,
                "balanced": moderately_trained,
                "needs_opportunity": no_recent
            },
            "faculty_list": sorted(faculty_records, key=lambda x: (x["programmes_attended"], x["training_hours"]), reverse=True)
        }

training_equity_agent = TrainingEquityAgent()
