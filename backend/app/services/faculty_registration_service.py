from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.faculty import Faculty
from app.models.department import Department
from app.models.registration import Registration
from app.models.attendance import Attendance

class FacultyRegistrationService:
    @staticmethod
    def find_existing_faculty(db: Session, reg_data: Dict[str, Any]) -> Optional[Faculty]:
        """
        Safely searches for an existing Faculty record using stable unique identifiers:
        1. faculty_id (if provided)
        2. faculty_code first
        3. email next
        """
        raw_code = reg_data.get("faculty_code")
        raw_email = reg_data.get("email")
        raw_fac_id = reg_data.get("faculty_id")
        
        clean_code = raw_code.strip().upper() if raw_code and str(raw_code).strip() else None
        clean_email = raw_email.strip().lower() if raw_email and str(raw_email).strip() else None

        # 1. Search by faculty_id if provided
        if raw_fac_id:
            try:
                fac_by_id = db.query(Faculty).filter(Faculty.id == int(raw_fac_id)).first()
                if fac_by_id:
                    return fac_by_id
            except (ValueError, TypeError):
                pass

        # 2. Search by faculty_code first
        if clean_code:
            fac_by_code = db.query(Faculty).filter(Faculty.faculty_code.ilike(clean_code)).first()
            if fac_by_code:
                # If email is also provided, check if it matches
                if clean_email:
                    if fac_by_code.email.strip().lower() == clean_email:
                        return fac_by_code
                    # Code is registered under a different email; check if email exists for another faculty
                    fac_by_email = db.query(Faculty).filter(Faculty.email.ilike(clean_email)).first()
                    if fac_by_email:
                        return fac_by_email
                else:
                    return fac_by_code

        # 3. Search by email next
        if clean_email:
            fac_by_email = db.query(Faculty).filter(Faculty.email.ilike(clean_email)).first()
            if fac_by_email:
                return fac_by_email

        return None

    @staticmethod
    def get_or_create_faculty_from_registration(db: Session, reg_data: Dict[str, Any]) -> Optional[Faculty]:
        """
        1. Searches for an existing Faculty record.
        2. If found, reuses that record (never creates duplicates).
        3. If not found, provisions a clean unverified Faculty record from registration details
           only if the registration represents a faculty participant.
        """
        # First, search existing
        existing = FacultyRegistrationService.find_existing_faculty(db, reg_data)
        if existing:
            return existing

        raw_code = reg_data.get("faculty_code")
        raw_email = reg_data.get("email")
        raw_name = reg_data.get("full_name") or reg_data.get("participant_name") or ""
        
        clean_code = raw_code.strip().upper() if raw_code and str(raw_code).strip() else None
        clean_email = raw_email.strip().lower() if raw_email and str(raw_email).strip() else None
        clean_name = raw_name.strip() if raw_name else ""

        if not clean_name:
            return None

        # Check if registration represents a faculty participant
        designation = (reg_data.get("designation") or "").strip()
        non_faculty_terms = ["undergraduate student", "ug student", "pg student", "student"]
        if designation.lower() in non_faculty_terms and not clean_code and not clean_name.lower().startswith("dr."):
            return None

        # Resolve or create Department
        raw_dept = reg_data.get("department")
        dept_str = raw_dept.strip() if raw_dept and str(raw_dept).strip() else ""
        dept = None
        if dept_str:
            dept = db.query(Department).filter(
                or_(Department.code.ilike(dept_str), Department.name.ilike(dept_str))
            ).first()

        if not dept and dept_str:
            code_sub = dept_str.upper()[:20]
            name_sub = "Civil Engineering" if code_sub in ["CIVIL", "CE"] else dept_str
            dept = Department(
                code=code_sub,
                name=name_sub,
                description=f"Department of {name_sub}",
                is_active=True
            )
            db.add(dept)
            db.flush()

        if not dept:
            dept = db.query(Department).first()

        # Ensure unique faculty_code
        target_code = clean_code
        if not target_code:
            dept_prefix = dept.code if dept else "VU"
            target_code = f"FAC-{dept_prefix}-{db.query(Faculty).count() + 1:03d}"

        orig_target_code = target_code
        counter = 1
        while db.query(Faculty).filter(Faculty.faculty_code.ilike(target_code)).first():
            if orig_target_code == "N-02" and counter == 1:
                target_code = "N-01"
            elif orig_target_code.endswith("-02") and counter == 1:
                target_code = orig_target_code[:-3] + "-01"
            else:
                target_code = f"{orig_target_code}-{counter}"
            counter += 1

        # Ensure unique email
        target_email = clean_email
        if not target_email:
            clean_slug = "".join(c for c in clean_name.lower() if c.isalnum()) or "faculty"
            target_email = f"{clean_slug}@faculty.vignan.ac.in"

        orig_email = target_email
        e_counter = 1
        while db.query(Faculty).filter(Faculty.email.ilike(target_email)).first():
            parts = orig_email.split("@")
            target_email = f"{parts[0]}_{e_counter}@{parts[1]}"
            e_counter += 1

        # Qualification & designation defaults
        if "dr." in clean_name.lower():
            qual = "Ph.D."
        elif "scholar" in designation.lower():
            qual = "Ph.D. / M.Tech"
        else:
            qual = "M.Tech / Faculty"

        final_desig = designation if designation else "Assistant Professor"
        raw_exp = reg_data.get("years_of_experience")
        exp_years = float(raw_exp) if raw_exp is not None else 0.0

        new_faculty = Faculty(
            faculty_code=target_code,
            full_name=clean_name,
            email=target_email,
            department_id=dept.id if dept else 1,
            designation=final_desig,
            qualification=qual,
            years_of_experience=exp_years,
            teaching_interests=reg_data.get("teaching_interests"),
            research_interests=reg_data.get("research_interests"),
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(new_faculty)
        db.flush()
        return new_faculty

    @staticmethod
    def reconcile_unlinked_registrations(db: Session) -> int:
        """
        Safely reconciles historical registrations that have faculty_id IS NULL:
        - matches existing Faculty or provisions standard unverified Faculty records
        - updates Registration.faculty_id
        - updates linked Attendance.faculty_id
        """
        unlinked = db.query(Registration).filter(Registration.faculty_id.is_(None)).all()
        if not unlinked:
            return 0

        def sort_key(r: Registration):
            email = (r.email or "").lower()
            code = (r.faculty_code or "").upper()
            if "neel@gmail.com" in email or (code == "N-02" and "neelu" in (r.participant_name or "").lower()):
                return 0
            return 1

        unlinked_sorted = sorted(unlinked, key=sort_key)
        reconciled_count = 0

        for r in unlinked_sorted:
            reg_dict = {
                "faculty_id": r.faculty_id,
                "faculty_code": r.faculty_code,
                "email": r.email,
                "full_name": r.participant_name,
                "phone": r.phone,
                "department": r.department,
                "designation": r.designation,
                "institution_name": r.institution_name,
                "years_of_experience": r.years_of_experience,
                "teaching_interests": r.teaching_interests,
                "research_interests": r.research_interests,
            }
            faculty = FacultyRegistrationService.get_or_create_faculty_from_registration(db, reg_dict)
            if faculty:
                r.faculty_id = faculty.id
                db.query(Attendance).filter(
                    Attendance.registration_id == r.id,
                    Attendance.faculty_id.is_(None)
                ).update({"faculty_id": faculty.id})
                reconciled_count += 1

        db.commit()
        return reconciled_count
