from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.department import Department
from app.models.faculty import Faculty
from app.models.event import Event
from app.models.certificate import Certificate
from app.models.feedback import Feedback
from app.models.attendance import Attendance
from app.models.skill import SkillGap, TrainingRecommendation
from app.models.compliance import FacultyCompliance
from app.services.assessment_service import assessment_service

class DashboardService:
    @staticmethod
    def get_summary_metrics(db: Session) -> Dict[str, Any]:
        faculty_count = db.query(Faculty).filter(Faculty.is_active == True).count()
        dept_count = db.query(Department).filter(Department.is_active == True).count()
        
        all_events = db.query(Event).all()
        active_events = [e for e in all_events if e.status in ["REGISTRATION_OPEN", "ONGOING", "APPROVED"]]
        completed_events = [e for e in all_events if e.status == "COMPLETED"]

        certs_count = db.query(Certificate).filter(Certificate.status == "VALID").count()
        total_training_hours = sum(c.training_hours for c in db.query(Certificate).all())
        if total_training_hours == 0 and completed_events:
            total_training_hours = sum(e.duration_hours for e in completed_events)

        # Average attendance from real recorded attendances
        total_att = db.query(Attendance).count()
        present_att = db.query(Attendance).filter(Attendance.attendance_status == "PRESENT").count()
        avg_attendance = round((present_att / total_att * 100.0), 1) if total_att > 0 else 0.0

        # Average feedback from real feedback submissions
        feedbacks = db.query(Feedback).all()
        if feedbacks:
            avg_fb = round(sum((f.content_rating + f.trainer_rating + f.relevance_rating + f.practical_rating + f.organization_rating) / 5.0 for f in feedbacks) / len(feedbacks), 2)
        else:
            avg_fb = 0.0

        # Average learning gain across events with real assessment data
        learning_gains = []
        for e in completed_events:
            try:
                impact = assessment_service.calculate_learning_impact(db, e.id)
                if impact.get("has_data") and impact.get("learning_gain_pp") is not None:
                    learning_gains.append(impact["learning_gain_pp"])
            except Exception:
                pass
        avg_learning_gain = round(sum(learning_gains) / len(learning_gains), 1) if learning_gains else 0.0

        # Faculty with skill gaps
        distinct_gap_faculty = db.query(SkillGap.faculty_id).filter(SkillGap.status == "ACTIVE").distinct().count()

        # Real Compliance rate from faculty compliance records
        active_faculty = db.query(Faculty).filter(Faculty.is_active == True).all()
        compliant_count = 0
        from app.services.compliance_service import compliance_service
        for f in active_faculty:
            try:
                comp = compliance_service.calculate_faculty_compliance(db, f.id)
                if comp.get("status") == "COMPLIANT":
                    compliant_count += 1
            except Exception:
                pass
        compliance_rate = round((compliant_count / len(active_faculty) * 100.0), 1) if active_faculty else 0.0

        # Recent and upcoming events
        recent = sorted(all_events, key=lambda x: x.created_at or datetime.utcnow(), reverse=True)[:5]
        upcoming = [e for e in all_events if e.status in ["REGISTRATION_OPEN", "APPROVED", "ONGOING"]][:5]

        # Real Top skill gaps from database
        gap_records = db.query(SkillGap.skill_name, func.count(SkillGap.id).label("cnt")).filter(
            SkillGap.status == "ACTIVE"
        ).group_by(SkillGap.skill_name).order_by(func.count(SkillGap.id).desc()).limit(5).all()
        
        top_gaps = [{"skill": r[0], "count": r[1]} for r in gap_records]

        return {
            "total_faculty": faculty_count,
            "total_departments": dept_count,
            "active_programmes": len(active_events),
            "completed_programmes": len(completed_events),
            "total_training_hours": total_training_hours,
            "average_attendance": avg_attendance,
            "average_learning_gain_pp": avg_learning_gain,
            "average_feedback": avg_fb,
            "certificates_count": certs_count,
            "faculty_with_gaps": distinct_gap_faculty,
            "compliance_rate": compliance_rate,
            "top_skill_gaps": top_gaps,
            "recent_programmes": [
                {
                    "id": e.id,
                    "event_code": e.event_code,
                    "title": e.title,
                    "event_type": e.event_type,
                    "status": e.status,
                    "duration_hours": e.duration_hours,
                    "department": e.department.name if e.department else "N/A"
                } for e in recent
            ],
            "upcoming_programmes": [
                {
                    "id": e.id,
                    "event_code": e.event_code,
                    "title": e.title,
                    "event_type": e.event_type,
                    "status": e.status,
                    "capacity": e.capacity,
                    "registered": len(e.registrations) if e.registrations else 0,
                    "delivery_mode": e.delivery_mode
                } for e in upcoming
            ]
        }

    @staticmethod
    def get_strategy_analytics(db: Session) -> Dict[str, Any]:
        summary = DashboardService.get_summary_metrics(db)

        # Real monthly programme breakdown from Event dates
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        all_events = db.query(Event).all()
        current_year = datetime.utcnow().year
        monthly_counts = {m: {"fdps": 0, "workshops": 0} for m in months}
        for ev in all_events:
            dt = ev.start_date or ev.created_at
            if dt:
                m_name = dt.strftime("%b")
                if m_name in monthly_counts:
                    if ev.event_type in ["FDP", "STTP", "TRAINING"]:
                        monthly_counts[m_name]["fdps"] += 1
                    else:
                        monthly_counts[m_name]["workshops"] += 1
        programmes_by_month = [
            {"month": m, "fdps": monthly_counts[m]["fdps"], "workshops": monthly_counts[m]["workshops"]}
            for m in months[:max(9, datetime.utcnow().month)]
        ]

        # Real Skill Gaps by Category
        active_gaps = db.query(SkillGap).filter(SkillGap.status == "ACTIVE").all()
        category_map = {
            "Artificial Intelligence & ML": 0,
            "Cybersecurity & Networks": 0,
            "Research & Grant Writing": 0,
            "Outcome Based Pedagogy (OBE)": 0,
            "Emerging Engineering Domains": 0
        }
        for g in active_gaps:
            name = g.skill_name.lower()
            if any(k in name for k in ["ai", "generative", "machine learning", "data", "deep learning"]):
                category_map["Artificial Intelligence & ML"] += 1
            elif any(k in name for k in ["cyber", "security", "network", "cloud"]):
                category_map["Cybersecurity & Networks"] += 1
            elif any(k in name for k in ["research", "scopus", "grant", "writing"]):
                category_map["Research & Grant Writing"] += 1
            elif any(k in name for k in ["obe", "outcome", "nba", "pedagogy", "accreditation"]):
                category_map["Outcome Based Pedagogy (OBE)"] += 1
            else:
                category_map["Emerging Engineering Domains"] += 1

        total_cat_gaps = sum(category_map.values())
        skill_gap_categories = [
            {
                "category": cat,
                "count": count,
                "percentage": round(count / total_cat_gaps * 100) if total_cat_gaps > 0 else 0
            }
            for cat, count in category_map.items() if count > 0
        ]

        # Real Training Demand by Topic derived from active SkillGaps
        gap_stats = db.query(SkillGap.skill_name, func.count(SkillGap.id).label("cnt")).filter(
            SkillGap.status == "ACTIVE"
        ).group_by(SkillGap.skill_name).order_by(func.count(SkillGap.id).desc()).limit(5).all()

        training_demand = []
        for r in gap_stats:
            skill_n = r[0]
            cnt = r[1]
            # Find which departments have this gap
            fac_with_gap = db.query(Faculty).join(SkillGap).filter(
                SkillGap.skill_name == skill_n,
                SkillGap.status == "ACTIVE"
            ).all()
            depts = list(set(f.department.code for f in fac_with_gap if f.department))
            training_demand.append({
                "topic": skill_n,
                "demand_score": min(100.0, round(cnt * 20.0 + 40.0, 1)),
                "target_depts": depts if depts else ["ALL"]
            })

        # Real Learning Gain by FDP from actual assessment attempts
        events = db.query(Event).filter(Event.status.in_(["COMPLETED", "ONGOING", "APPROVED"])).all()
        learning_gain_by_fdp = []
        for ev in events:
            try:
                impact = assessment_service.calculate_learning_impact(db, ev.id)
                if impact.get("has_data") and impact.get("learning_gain_pp") is not None:
                    learning_gain_by_fdp.append({
                        "event_title": ev.title[:30] + ("..." if len(ev.title) > 30 else ""),
                        "pre_average": impact["pre_average"],
                        "post_average": impact["post_average"],
                        "learning_gain_pp": impact["learning_gain_pp"]
                    })
            except Exception:
                pass

        # Real Department Development Score
        departments = db.query(Department).all()
        dept_scores = []
        for d in departments:
            fac_in_dept = db.query(Faculty).filter(Faculty.department_id == d.id, Faculty.is_active == True).all()
            fac_ids = [f.id for f in fac_in_dept]
            dept_certs = db.query(Certificate).filter(Certificate.faculty_id.in_(fac_ids), Certificate.status == "VALID").all() if fac_ids else []
            hours_completed = sum(c.training_hours for c in dept_certs)
            
            # Score based on proportion of faculty certified and training target
            fac_count = len(fac_in_dept)
            if fac_count > 0:
                cert_ratio = min(1.0, len(dept_certs) / fac_count)
                hours_ratio = min(1.0, hours_completed / (fac_count * 40.0))
                dev_score = round((cert_ratio * 50.0 + hours_ratio * 50.0), 1)
            else:
                dev_score = 0.0

            dept_scores.append({
                "department": d.code,
                "name": d.name,
                "faculty_count": fac_count,
                "development_score": dev_score,
                "training_hours_completed": hours_completed
            })

        # Real Compliance distribution calculated across all active faculty
        from app.services.compliance_service import compliance_service
        active_faculty = db.query(Faculty).filter(Faculty.is_active == True).all()
        comp_counts = {"COMPLIANT": 0, "ATTENTION_REQUIRED": 0, "NON_COMPLIANT": 0}
        for f in active_faculty:
            try:
                c_res = compliance_service.calculate_faculty_compliance(db, f.id)
                st = c_res.get("status", "NON_COMPLIANT")
                if st in comp_counts:
                    comp_counts[st] += 1
                else:
                    comp_counts["NON_COMPLIANT"] += 1
            except Exception:
                comp_counts["NON_COMPLIANT"] += 1

        total_f = len(active_faculty)
        compliance_dist = [
            {"status": "Compliant (>=40 hrs)", "count": comp_counts["COMPLIANT"], "percentage": round(comp_counts["COMPLIANT"] / total_f * 100) if total_f > 0 else 0},
            {"status": "Attention Required (20-39 hrs)", "count": comp_counts["ATTENTION_REQUIRED"], "percentage": round(comp_counts["ATTENTION_REQUIRED"] / total_f * 100) if total_f > 0 else 0},
            {"status": "Non-Compliant (<20 hrs)", "count": comp_counts["NON_COMPLIANT"], "percentage": round(comp_counts["NON_COMPLIANT"] / total_f * 100) if total_f > 0 else 0}
        ]

        # Recommended Next FDPs derived from highest priority active skill gaps
        next_recommended = []
        for r in gap_stats[:3]:
            skill_n = r[0]
            fac_with_gap = db.query(Faculty).join(SkillGap).filter(SkillGap.skill_name == skill_n, SkillGap.status == "ACTIVE").all()
            depts = list(set(f.department.code for f in fac_with_gap if f.department))
            next_recommended.append({
                "topic": f"{skill_n} Competency Programme",
                "departments": depts if depts else ["ALL"],
                "duration": "2 to 3 Days",
                "priority": "HIGH",
                "reason": f"Directly addresses {r[1]} active faculty competency gaps identified in departmental audits."
            })

        return {
            "summary": summary,
            "programmes_by_month": programmes_by_month,
            "skill_gap_categories": skill_gap_categories,
            "training_demand": training_demand,
            "learning_gain_by_fdp": learning_gain_by_fdp,
            "department_development_score": dept_scores,
            "compliance_distribution": compliance_dist,
            "next_recommended_fdps": next_recommended
        }

dashboard_service = DashboardService()
