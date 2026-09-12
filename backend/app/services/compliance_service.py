from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.compliance import ComplianceRule, FacultyCompliance
from app.models.faculty import Faculty
from app.models.registration import Registration
from app.models.event import Event
from app.models.certificate import Certificate

class ComplianceService:
    @staticmethod
    def calculate_faculty_compliance(db: Session, faculty_id: int) -> Dict[str, Any]:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError("Faculty not found")

        active_rules = db.query(ComplianceRule).filter(ComplianceRule.is_active == True).all()
        if not active_rules:
            # Default institutional rule
            rule = ComplianceRule(
                rule_name="Annual Faculty Development Requirement",
                description="Institutional mandatory target for annual continuous professional development.",
                minimum_training_hours=40.0,
                period_type="ANNUAL",
                required_topics="Teaching Methodology, Research, Emerging Technologies",
                is_active=True
            )
            db.add(rule)
            db.commit()
            db.refresh(rule)
            active_rules = [rule]

        # Calculate completed hours from certificates and completed registrations
        certs = db.query(Certificate).filter(
            Certificate.faculty_id == faculty_id,
            Certificate.status == "VALID"
        ).all()
        completed_hours = sum(c.training_hours for c in certs)

        # In case there are completed registrations without certificates yet
        completed_regs = db.query(Registration).filter(
            Registration.faculty_id == faculty_id,
            Registration.completion_status == "COMPLETED"
        ).all()
        for r in completed_regs:
            if r.event and not any(c.event_id == r.event_id for c in certs):
                completed_hours += r.event.duration_hours

        primary_rule = active_rules[0]
        req_hours = primary_rule.minimum_training_hours
        remaining_hours = max(0.0, req_hours - completed_hours)
        pct = min(100.0, round((completed_hours / req_hours * 100.0), 1)) if req_hours > 0 else 100.0

        if completed_hours >= req_hours:
            status = "COMPLIANT"
        elif completed_hours >= (req_hours * 0.5):
            status = "ATTENTION_REQUIRED"
        else:
            status = "NON_COMPLIANT"

        # Update or create record
        rec = db.query(FacultyCompliance).filter(
            FacultyCompliance.faculty_id == faculty_id,
            FacultyCompliance.compliance_rule_id == primary_rule.id
        ).first()

        if not rec:
            rec = FacultyCompliance(
                faculty_id=faculty_id,
                compliance_rule_id=primary_rule.id,
                completed_hours=completed_hours,
                required_hours=req_hours,
                compliance_percentage=pct,
                status=status,
                last_calculated=datetime.utcnow()
            )
            db.add(rec)
        else:
            rec.completed_hours = completed_hours
            rec.required_hours = req_hours
            rec.compliance_percentage = pct
            rec.status = status
            rec.last_calculated = datetime.utcnow()

        db.commit()

        return {
            "faculty_id": faculty.id,
            "faculty_name": faculty.full_name,
            "faculty_code": faculty.faculty_code,
            "department_name": faculty.department.name if faculty.department else "N/A",
            "rule_name": primary_rule.rule_name,
            "completed_hours": completed_hours,
            "required_hours": req_hours,
            "remaining_hours": remaining_hours,
            "compliance_percentage": pct,
            "status": status,
            "last_calculated": rec.last_calculated
        }

    @staticmethod
    def get_compliance_dashboard(db: Session) -> Dict[str, Any]:
        faculties = db.query(Faculty).filter(Faculty.is_active == True).all()
        results = []
        compliant_count = 0
        attention_count = 0
        non_compliant_count = 0

        for f in faculties:
            item = ComplianceService.calculate_faculty_compliance(db, f.id)
            results.append(item)
            if item["status"] == "COMPLIANT":
                compliant_count += 1
            elif item["status"] == "ATTENTION_REQUIRED":
                attention_count += 1
            else:
                non_compliant_count += 1

        total = len(faculties)
        compliance_rate = round((compliant_count / total * 100.0), 1) if total > 0 else 0.0

        return {
            "total_faculty": total,
            "compliance_rate": compliance_rate,
            "status_breakdown": {
                "COMPLIANT": compliant_count,
                "ATTENTION_REQUIRED": attention_count,
                "NON_COMPLIANT": non_compliant_count
            },
            "faculty_records": results
        }

compliance_service = ComplianceService()
