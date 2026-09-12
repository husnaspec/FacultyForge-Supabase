import json
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.services.assessment_service import assessment_service
from app.models.agent_analysis import AgentAnalysis

class LearningImpactAgent:
    """
    Learning Impact Intelligence Agent
    Evaluates empirical cognitive shift between pre and post tests,
    correlating attendance integrity and outcome-based Bloom mastery.
    """

    def analyze(self, db: Session, event_id: int) -> Dict[str, Any]:
        impact_data = assessment_service.calculate_learning_impact(db, event_id)

        # Log analysis
        analysis_record = AgentAnalysis(
            agent_name="LearningImpactAgent",
            event_id=event_id,
            input_summary=f"Event ID: {event_id}, Title: {impact_data['event_title']}",
            output_json=json.dumps(impact_data),
            confidence_score=0.97,
            created_at=datetime.utcnow()
        )
        db.add(analysis_record)
        db.commit()

        return impact_data

learning_impact_agent = LearningImpactAgent()
