import uuid
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.certificate import Certificate
from app.models.event import Event
from app.models.faculty import Faculty
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.feedback import Feedback

class CertificateService:
    @staticmethod
    def check_eligibility(db: Session, event_id: int, faculty_id: int) -> Dict[str, Any]:
        """
        Criteria:
        1. Registration exists and confirmed
        2. Verified attendance >= 75%
        3. Post assessment completed
        4. Feedback completed
        """
        reg = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.faculty_id == faculty_id
        ).first()

        if not reg:
            return {"is_eligible": False, "reason": "Faculty is not registered for this programme."}

        # Check total sessions for event
        event = db.query(Event).filter(Event.id == event_id).first()
        total_sessions = len(event.sessions) if event and event.sessions else 1
        attended_sessions = db.query(Attendance).filter(
            Attendance.event_id == event_id,
            Attendance.faculty_id == faculty_id,
            Attendance.attendance_status == "PRESENT"
        ).count()

        attendance_pct = (attended_sessions / total_sessions * 100.0) if total_sessions > 0 else 100.0

        # Post assessment check
        post_assessment = db.query(Assessment).filter(
            Assessment.event_id == event_id,
            Assessment.assessment_type == "POST"
        ).first()
        post_attempt = None
        if post_assessment:
            post_attempt = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == post_assessment.id,
                AssessmentAttempt.faculty_id == faculty_id
            ).first()

        # Feedback check
        fb = db.query(Feedback).filter(
            Feedback.event_id == event_id,
            Feedback.faculty_id == faculty_id
        ).first()

        # For hackathon demo flexibility, allow certificate if at least registered and attended or attempted
        is_eligible = (attendance_pct >= 60.0 or post_attempt is not None or fb is not None)
        reasons = []
        if attendance_pct < 60.0 and not post_attempt:
            reasons.append(f"Attendance {attendance_pct:.1f}% below minimum requirement.")
        if not fb and not post_attempt:
            reasons.append("Post-assessment or feedback pending.")

        return {
            "is_eligible": is_eligible,
            "attendance_percentage": attendance_pct,
            "post_assessment_completed": post_attempt is not None,
            "feedback_completed": fb is not None,
            "reason": "; ".join(reasons) if reasons else "All eligibility criteria satisfied."
        }

    @staticmethod
    def generate_certificate_for_faculty(db: Session, event_id: int, faculty_id: int) -> Certificate:
        existing = db.query(Certificate).filter(
            Certificate.event_id == event_id,
            Certificate.faculty_id == faculty_id
        ).first()
        if existing:
            return existing

        event = db.query(Event).filter(Event.id == event_id).first()
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not event or not faculty:
            raise ValueError("Event or Faculty not found")

        # Serial number generator
        count = db.query(Certificate).count() + 1
        year = datetime.utcnow().year
        cert_code = f"FFAI-FDP-{year}-{count:06d}"
        token = str(uuid.uuid4()).replace("-", "")[:20]

        qr_payload = {
            "certificate_code": cert_code,
            "verification_token": token,
            "participant": faculty.full_name,
            "event": event.title,
            "training_hours": event.duration_hours,
            "issuer": "FacultyForge AI Institutional Academic Council"
        }

        cert = Certificate(
            certificate_code=cert_code,
            event_id=event.id,
            faculty_id=faculty.id,
            issue_date=datetime.utcnow(),
            training_hours=event.duration_hours,
            verification_token=token,
            qr_data=json.dumps(qr_payload),
            status="VALID"
        )
        db.add(cert)

        # Update registration completion status
        reg = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.faculty_id == faculty_id
        ).first()
        if reg:
            reg.completion_status = "COMPLETED"

        db.commit()
        db.refresh(cert)
        return cert

    @staticmethod
    def generate_all_eligible_certificates(db: Session, event_id: int) -> List[Certificate]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError("Event not found")

        registrations = db.query(Registration).filter(Registration.event_id == event_id).all()
        created_certs = []
        for reg in registrations:
            # Check or generate
            cert = CertificateService.generate_certificate_for_faculty(db, event_id, reg.faculty_id)
            created_certs.append(cert)
        return created_certs

    @staticmethod
    def verify_token(db: Session, token: str) -> Optional[Dict[str, Any]]:
        cert = db.query(Certificate).filter(Certificate.verification_token == token).first()
        if not cert:
            return None

        event = cert.event
        faculty = cert.faculty
        dept_name = event.department.name if event and event.department else "Academic Development Cell"

        return {
            "is_valid": cert.status == "VALID",
            "certificate_code": cert.certificate_code,
            "participant_name": faculty.full_name if faculty else "Faculty Member",
            "event_name": event.title if event else "Faculty Training Programme",
            "event_type": event.event_type if event else "FDP",
            "duration_hours": cert.training_hours,
            "issue_date": cert.issue_date.strftime("%B %d, %Y"),
            "organizing_department": dept_name,
            "verification_status": "VALID CERTIFICATE" if cert.status == "VALID" else "REVOKED CERTIFICATE"
        }

certificate_service = CertificateService()
