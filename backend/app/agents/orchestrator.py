from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.agents.skill_gap_agent import skill_gap_agent
from app.agents.recommendation_agent import recommendation_agent
from app.agents.resource_matcher_agent import resource_matcher_agent
from app.agents.fdp_generator_agent import fdp_generator_agent
from app.agents.learning_impact_agent import learning_impact_agent
from app.agents.feedback_agent import feedback_agent
from app.agents.compliance_agent import compliance_agent
from app.agents.predictive_planner_agent import predictive_planner_agent
from app.agents.report_agent import report_agent
from app.services.passport_service import passport_service
from app.services.dashboard_service import dashboard_service

class AgentOrchestrator:
    """
    Agent Orchestrator
    Coordinates execution pipelines across the multi-agent system.
    Each workflow step runs on explicit, controlled API calls and user interactions.
    """

    def __init__(self):
        self.skill_gap_agent = skill_gap_agent
        self.recommendation_agent = recommendation_agent
        self.resource_matcher_agent = resource_matcher_agent
        self.fdp_generator_agent = fdp_generator_agent
        self.learning_impact_agent = learning_impact_agent
        self.feedback_agent = feedback_agent
        self.compliance_agent = compliance_agent
        self.predictive_planner_agent = predictive_planner_agent
        self.report_agent = report_agent

    def run_faculty_development_pipeline(self, db: Session, faculty_id: int) -> Dict[str, Any]:
        """
        Flow 1: Faculty Data -> Skill Gap Agent -> Recommendation Agent
        """
        gaps = self.skill_gap_agent.analyze(db, faculty_id)
        recommendations = self.recommendation_agent.recommend(db, faculty_id)
        passport = passport_service.get_digital_passport(db, faculty_id)

        return {
            "faculty_id": faculty_id,
            "skill_gaps": gaps["skill_gaps"],
            "recommendations": recommendations["recommendations"],
            "passport_summary": {
                "training_hours": passport["total_training_hours"],
                "compliance_status": passport["compliance"]["status"]
            }
        }

    def run_programme_creation_pipeline(self, db: Session, prompt: str, department_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Flow 2: Prompt -> FDP Generator Agent -> Resource Matcher Agent
        """
        fdp = self.fdp_generator_agent.generate(db, prompt, department_id=department_id)
        event_id = fdp.get("created_draft_event_id")
        matches = []
        if event_id:
            match_res = self.resource_matcher_agent.match_for_event(db, event_id)
            matches = match_res.get("matches", [])

        return {
            "generated_fdp": fdp,
            "matched_resource_persons": matches[:3]
        }

    def run_post_programme_pipeline(self, db: Session, event_id: int) -> Dict[str, Any]:
        """
        Flow 3: Assessment -> Learning Impact Agent | Feedback -> Feedback Agent -> Report Agent
        """
        learning_impact = self.learning_impact_agent.analyze(db, event_id)
        feedback_intel = self.feedback_agent.analyze(db, event_id)
        report = self.report_agent.generate_report(db, event_id)

        return {
            "learning_impact": learning_impact,
            "feedback_intelligence": feedback_intel,
            "report_summary": {
                "event_title": report["programme_overview"]["title"],
                "learning_gain": report["learning_gain"]["learning_gain_pp"],
                "overall_feedback": feedback_intel["overall_rating"]
            }
        }

    def run_institutional_strategy_pipeline(self, db: Session, department_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Flow 4: Institution Data -> Predictive Planner -> Strategy Dashboard
        """
        planner = self.predictive_planner_agent.forecast_training_demands(db, department_id=department_id)
        strategy = dashboard_service.get_strategy_analytics(db)

        return {
            "predictive_planner": planner,
            "strategy_analytics": strategy
        }

orchestrator = AgentOrchestrator()
