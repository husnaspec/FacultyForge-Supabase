import uuid
import json
import secrets
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.certificate import Certificate
from app.models.event import Event
from app.models.faculty import Faculty
from app.models.department import Department
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.feedback import Feedback

class CertificateService:
    @staticmethod
    def get_or_link_faculty_for_registration(db: Session, reg: Registration) -> Optional[Faculty]:
        faculty = None
        if reg.faculty_id:
            faculty = db.query(Faculty).filter(Faculty.id == reg.faculty_id).first()

        if not faculty and (reg.email or reg.faculty_code):
            conds = []
            if reg.email:
                conds.append(Faculty.email.ilike(reg.email.strip().lower()))
            if reg.faculty_code:
                conds.append(Faculty.faculty_code.ilike(reg.faculty_code.strip().upper()))
            faculty = db.query(Faculty).filter(or_(*conds)).first()

        # If faculty matched, link to registration
        if faculty and not reg.faculty_id:
            reg.faculty_id = faculty.id
            db.commit()

        # If no faculty exists yet, create one for the registered faculty participant
        if not faculty and (reg.participant_name or reg.email):
            clean_code = (reg.faculty_code or f"FAC-REG-{reg.id:04d}").strip().upper()
            clean_email = (reg.email or f"participant_{reg.id}@university.edu").strip().lower()

            # Ensure unique faculty_code and email
            existing_code = db.query(Faculty).filter(Faculty.faculty_code == clean_code).first()
            if existing_code:
                clean_code = f"FAC-REG-{reg.id:04d}-{secrets.token_hex(2).upper()}"
            existing_email = db.query(Faculty).filter(Faculty.email == clean_email).first()
            if existing_email:
                clean_email = f"participant_{reg.id}_{secrets.token_hex(2)}@university.edu"

            dept = None
            if reg.department:
                dept = db.query(Department).filter(
                    or_(Department.code.ilike(reg.department.strip()), Department.name.ilike(f"%{reg.department.strip()}%"))
                ).first()
            dept_id = dept.id if dept else 4  # Default to MECH (dept 4) or first department

            faculty = Faculty(
                faculty_code=clean_code,
                full_name=reg.participant_name or "Faculty Participant",
                email=clean_email,
                department_id=dept_id,
                designation=reg.designation or "Assistant Professor",
                qualification="Ph.D. / M.Tech",
                years_of_experience=reg.years_of_experience or 2.0,
                teaching_interests=reg.teaching_interests,
                research_interests=reg.research_interests,
                is_active=True
            )
            db.add(faculty)
            db.commit()
            db.refresh(faculty)

            reg.faculty_id = faculty.id
            db.commit()

        # Synchronize attendance records with the resolved faculty id
        if faculty:
            db.query(Attendance).filter(
                Attendance.registration_id == reg.id,
                Attendance.faculty_id.is_(None)
            ).update({"faculty_id": faculty.id})
            db.commit()

        return faculty

    @staticmethod
    def evaluate_participant_eligibility(db: Session, event_id: int, reg: Registration) -> Dict[str, Any]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError(f"Event {event_id} not found")

        faculty = CertificateService.get_or_link_faculty_for_registration(db, reg)
        fac_id = faculty.id if faculty else reg.faculty_id

        p_name = reg.participant_name or (faculty.full_name if faculty else f"Participant #{reg.id}")
        p_email = reg.email or (faculty.email if faculty else None)
        p_code = reg.faculty_code or (faculty.faculty_code if faculty else None)

        reasons = []

        # 1. Registration status check
        reg_status = (reg.registration_status or "PENDING").upper()
        reg_pass = (reg_status == "CONFIRMED")
        if not reg_pass:
            reasons.append(f"Registration status is {reg_status} (CONFIRMED required)")

        # 2. Attendance percentage check
        total_sessions = len(event.sessions) if event.sessions else 1
        att_query = db.query(Attendance).filter(
            Attendance.event_id == event_id,
            Attendance.attendance_status == "PRESENT"
        )
        if fac_id:
            att_query = att_query.filter(or_(Attendance.registration_id == reg.id, Attendance.faculty_id == fac_id))
        else:
            att_query = att_query.filter(Attendance.registration_id == reg.id)

        attended_sessions = att_query.count()
        attendance_pct = (attended_sessions / total_sessions * 100.0) if total_sessions > 0 else 100.0
        attendance_pct = min(100.0, attendance_pct)

        att_pass = (attendance_pct >= 60.0)
        if not att_pass:
            reasons.append(f"Attendance {attendance_pct:.0f}% is below minimum requirement (60%)")

        # 3. PRE Assessment check
        pre_assessment = db.query(Assessment).filter(
            Assessment.event_id == event_id,
            Assessment.assessment_type == "PRE"
        ).first()
        if pre_assessment:
            pre_attempt = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == pre_assessment.id,
                AssessmentAttempt.faculty_id == fac_id
            ).first() if fac_id else None
            pre_pass = (pre_attempt is not None)
            pre_status = "Completed" if pre_pass else "Not Completed"
            if not pre_pass:
                reasons.append("PRE assessment incomplete")
        else:
            pre_status = "Not Required"
            pre_pass = True

        # 4. POST Assessment check
        post_assessment = db.query(Assessment).filter(
            Assessment.event_id == event_id,
            Assessment.assessment_type == "POST"
        ).first()
        if post_assessment:
            post_attempt = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == post_assessment.id,
                AssessmentAttempt.faculty_id == fac_id
            ).first() if fac_id else None
            post_pass = (post_attempt is not None)
            post_status = "Completed" if post_pass else "Not Completed"
            if not post_pass:
                reasons.append("POST assessment incomplete")
        else:
            post_status = "Not Required"
            post_pass = True

        # 5. Feedback check
        fb = db.query(Feedback).filter(
            Feedback.event_id == event_id,
            Feedback.faculty_id == fac_id
        ).first() if fac_id else None
        feedback_pass = (fb is not None)
        feedback_status = "Submitted" if feedback_pass else "Missing"
        if not feedback_pass:
            reasons.append("Feedback not submitted")

        # 6. Programme completion check
        event_status = (event.status or "").upper()
        reg_comp = (reg.completion_status or "").upper()
        programme_pass = (event_status == "COMPLETED" or reg_comp == "COMPLETED")
        programme_status = "Completed" if programme_pass else ("In Progress" if event_status in ["APPROVED", "ONGOING", "REGISTRATION_OPEN"] else event_status)
        if not programme_pass:
            reasons.append("Programme not completed")

        # 7. Check if already issued
        existing_cert = db.query(Certificate).filter(
            Certificate.event_id == event_id,
            Certificate.faculty_id == fac_id
        ).first() if fac_id else None

        is_eligible = (reg_pass and att_pass and pre_pass and post_pass and feedback_pass and programme_pass)

        return {
            "registration_id": reg.id,
            "faculty_id": fac_id,
            "participant_name": p_name,
            "faculty_code": p_code,
            "email": p_email,
            "registration_status": reg_status,
            "registration_status_pass": reg_pass,
            "attendance_percentage": attendance_pct,
            "attendance_pass": att_pass,
            "attended_sessions": attended_sessions,
            "total_sessions": total_sessions,
            "pre_status": pre_status,
            "pre_pass": pre_pass,
            "post_status": post_status,
            "post_pass": post_pass,
            "feedback_status": feedback_status,
            "feedback_pass": feedback_pass,
            "programme_status": programme_status,
            "programme_pass": programme_pass,
            "is_eligible": is_eligible,
            "already_issued": existing_cert is not None,
            "certificate_code": existing_cert.certificate_code if existing_cert else None,
            "reason": "; ".join(reasons) if reasons else "All eligibility criteria satisfied."
        }

    @staticmethod
    def get_event_eligibility(db: Session, event_id: int) -> Dict[str, Any]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError("Event not found")

        registrations = db.query(Registration).filter(
            Registration.event_id == event_id
        ).order_by(Registration.id.asc()).all()

        participants = []
        eligible_count = 0
        ineligible_count = 0

        for reg in registrations:
            eval_res = CertificateService.evaluate_participant_eligibility(db, event_id, reg)
            participants.append(eval_res)
            if eval_res["is_eligible"]:
                eligible_count += 1
            else:
                ineligible_count += 1

        pre_req = db.query(Assessment).filter(Assessment.event_id == event_id, Assessment.assessment_type == "PRE").first() is not None
        post_req = db.query(Assessment).filter(Assessment.event_id == event_id, Assessment.assessment_type == "POST").first() is not None

        criteria_parts = ["Confirmed Registration", "Attendance >= 60%"]
        if pre_req and post_req:
            criteria_parts.append("PRE/POST Assessments")
        elif post_req:
            criteria_parts.append("POST Assessment")
        elif pre_req:
            criteria_parts.append("PRE Assessment")
        criteria_parts.extend(["Feedback", "Programme Completion"])

        if not pre_req and not post_req:
            criteria_summary = f"Audited participant-level criteria: {', '.join(criteria_parts)} (Assessments not required for this programme)."
        else:
            criteria_summary = f"Audited participant-level criteria: {', '.join(criteria_parts)}."

        return {
            "event_id": event.id,
            "event_code": event.event_code,
            "event_title": event.title,
            "total_participants": len(participants),
            "eligible_count": eligible_count,
            "ineligible_count": ineligible_count,
            "pre_assessment_required": pre_req,
            "post_assessment_required": post_req,
            "criteria_summary": criteria_summary,
            "participants": participants
        }

    @staticmethod
    def check_eligibility(db: Session, event_id: int, faculty_id: int) -> Dict[str, Any]:
        reg = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.faculty_id == faculty_id
        ).first()

        if not reg:
            return {"is_eligible": False, "reason": "Faculty is not registered for this programme."}

        eval_res = CertificateService.evaluate_participant_eligibility(db, event_id, reg)
        return {
            "is_eligible": eval_res["is_eligible"],
            "attendance_percentage": eval_res["attendance_percentage"],
            "pre_assessment_completed": eval_res["pre_pass"],
            "post_assessment_completed": eval_res["post_pass"],
            "feedback_completed": eval_res["feedback_pass"],
            "programme_completed": eval_res["programme_pass"],
            "reason": eval_res["reason"]
        }

    @staticmethod
    def generate_certificate_for_faculty(db: Session, event_id: int, faculty_id: int, force: bool = False) -> Certificate:
        existing = db.query(Certificate).filter(
            Certificate.event_id == event_id,
            Certificate.faculty_id == faculty_id
        ).first()
        if existing:
            return existing

        if not force:
            eligibility = CertificateService.check_eligibility(db, event_id, faculty_id)
            if not eligibility["is_eligible"]:
                raise ValueError(f"Faculty is not eligible for certificate: {eligibility['reason']}")

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
            "credential_type": "token-verifiable digital certificate",
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
    def generate_all_eligible_certificates(db: Session, event_id: int) -> Dict[str, Any]:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError("Event not found")

        registrations = db.query(Registration).filter(
            Registration.event_id == event_id,
            Registration.registration_status == "CONFIRMED"
        ).order_by(Registration.id.asc()).all()

        generated_certs = []
        skipped_reasons = []

        for reg in registrations:
            eval_res = CertificateService.evaluate_participant_eligibility(db, event_id, reg)
            p_name = eval_res["participant_name"]

            if eval_res["already_issued"]:
                # Already has certificate, skip generation
                continue

            if eval_res["is_eligible"]:
                cert = CertificateService.generate_certificate_for_faculty(
                    db, event_id, eval_res["faculty_id"], force=True
                )
                generated_certs.append(cert)
            else:
                skipped_reasons.append(f"{p_name}: {eval_res['reason']}")

        return {
            "generated_count": len(generated_certs),
            "skipped_count": len(skipped_reasons),
            "reasons": skipped_reasons,
            "certificates": generated_certs
        }

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
            "credential_type": "token-verifiable digital certificate",
            "verification_status": "VALID CERTIFICATE" if cert.status == "VALID" else "REVOKED CERTIFICATE"
        }

certificate_service = CertificateService()
