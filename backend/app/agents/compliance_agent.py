import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.compliance import ComplianceRule, FacultyCompliance
from app.models.faculty import Faculty
from app.services.compliance_service import compliance_service
from app.models.agent_analysis import AgentAnalysis

class ComplianceAgent:
    """
    Institutional Compliance Intelligence Agent
    Continuously audits faculty professional development against configurable institutional
    benchmarks, generating early warnings and compliance health indexes.
    """

    def audit_faculty(self, db: Session, faculty_id: int) -> Dict[str, Any]:
        result = compliance_service.calculate_faculty_compliance(db, faculty_id)

        # Log analysis
        analysis_record = AgentAnalysis(
            agent_name="ComplianceAgent",
            faculty_id=faculty_id,
            input_summary=f"Audited compliance for faculty {faculty_id}",
            output_json=json.dumps(result, default=str),
            confidence_score=0.99,
            created_at=datetime.utcnow()
        )
        db.add(analysis_record)
        db.commit()

        return result

    def institutional_audit(self, db: Session) -> Dict[str, Any]:
        return compliance_service.get_compliance_dashboard(db)

compliance_agent = ComplianceAgent()
