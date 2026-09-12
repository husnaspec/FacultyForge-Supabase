import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.event import Event, EventSession
from app.models.assessment import Assessment, AssessmentQuestion
from app.models.agent_analysis import AgentAnalysis
from app.services.ai_provider import ai_provider

class FDPGeneratorAgent:
    """
    AI FDP Generator Agent
    Synthesizes full pedagogical structures, accreditation-compliant learning outcomes,
    session blueprints, and pre/post psychometric questions from natural language prompts.
    Always creates programmes initially in DRAFT state.
    """

    def generate(self, db: Session, prompt: str, department_id: Optional[int] = None, target_days: int = 2) -> Dict[str, Any]:
        # Resolve department
        dept = None
        if department_id:
            dept = db.query(Department).filter(Department.id == department_id).first()
        if not dept:
            dept = db.query(Department).first()

        dept_name = dept.name if dept else "Computer Science & Engineering"
        dept_id = dept.id if dept else 1

        # Use AIProvider to craft the blueprint
        blueprint = ai_provider.generate_fdp_blueprint(prompt, department_name=dept_name, target_days=target_days)

        # Generate unique event code
        count = db.query(Event).count() + 1
        year = datetime.utcnow().year
        event_code = f"FFAI-EVT-{year}-{count:04d}"

        start_time = datetime.utcnow() + timedelta(days=14)
        end_time = start_time + timedelta(days=target_days)

        # Create DRAFT Event in DB
        draft_event = Event(
            event_code=event_code,
            title=blueprint["title"],
            description=blueprint["description"],
            event_type=blueprint["event_type"],
            objectives=blueprint["objectives"],
            target_audience=blueprint["target_audience"],
            eligibility=blueprint["eligibility"],
            start_date=start_time,
            end_date=end_time,
            duration_hours=blueprint["duration_hours"],
            capacity=blueprint["capacity"],
            delivery_mode=blueprint["delivery_mode"],
            venue="Main Campus Seminar Hall & Virtual Academic Portal",
            department_id=dept_id,
            status="DRAFT", # STRICTLY DRAFT
            expected_outcomes=blueprint["expected_outcomes"],
            learning_outcomes=blueprint["learning_outcomes"],
            estimated_budget=blueprint["estimated_budget"],
            actual_expenditure=0.0
        )
        db.add(draft_event)
        db.flush()

        # Create EventSessions
        for s in blueprint["schedule"]:
            sess_date = start_time + timedelta(days=s.get("day", 1) - 1)
            time_parts = s.get("time", "09:30 AM - 11:30 AM").split("-")
            st = time_parts[0].strip() if len(time_parts) > 0 else "09:30 AM"
            et = time_parts[1].strip() if len(time_parts) > 1 else "11:30 AM"

            sess = EventSession(
                event_id=draft_event.id,
                title=s.get("title", f"Session {s.get('session_num', 1)}"),
                description=s.get("objective", ""),
                session_date=sess_date,
                start_time=st,
                end_time=et,
                learning_objective=s.get("objective", ""),
                room_or_link="Campus Lab 4 & Hybrid Streaming Link"
            )
            db.add(sess)

        # Create PRE Assessment & Questions
        pre_assessment = Assessment(
            event_id=draft_event.id,
            assessment_type="PRE",
            title=f"Diagnostic Pre-Assessment: {draft_event.title}",
            total_marks=30.0,
            passing_marks=15.0
        )
        db.add(pre_assessment)
        db.flush()

        for q in blueprint.get("pre_assessment_questions", []):
            db_q = AssessmentQuestion(
                assessment_id=pre_assessment.id,
                question_text=q["question_text"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_option=q["correct_option"],
                marks=q.get("marks", 10.0),
                explanation=q.get("explanation", "")
            )
            db.add(db_q)

        # Create POST Assessment & Questions
        post_assessment = Assessment(
            event_id=draft_event.id,
            assessment_type="POST",
            title=f"Competency Post-Assessment: {draft_event.title}",
            total_marks=30.0,
            passing_marks=15.0
        )
        db.add(post_assessment)
        db.flush()

        for q in blueprint.get("post_assessment_questions", []):
            db_q = AssessmentQuestion(
                assessment_id=post_assessment.id,
                question_text=q["question_text"],
                option_a=q["option_a"],
                option_b=q["option_b"],
                option_c=q["option_c"],
                option_d=q["option_d"],
                correct_option=q["correct_option"],
                marks=q.get("marks", 10.0),
                explanation=q.get("explanation", "")
            )
            db.add(db_q)

        # Log analysis
        analysis_record = AgentAnalysis(
            agent_name="FDPGeneratorAgent",
            event_id=draft_event.id,
            input_summary=f"Prompt: {prompt}, Target: {target_days} Days",
            output_json=json.dumps({"title": draft_event.title, "event_code": draft_event.event_code}),
            confidence_score=0.96,
            created_at=datetime.utcnow()
        )
        db.add(analysis_record)

        db.commit()
        db.refresh(draft_event)

        blueprint["created_draft_event_id"] = draft_event.id
        return blueprint

fdp_generator_agent = FDPGeneratorAgent()
