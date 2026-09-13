from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.faculty import Faculty
from app.models.skill import FacultySkill, SkillGap

CORE_HEATMAP_SKILLS = [
    "Generative AI",
    "Cybersecurity",
    "Research Methodology",
    "Outcome Based Education",
    "Cloud Computing",
    "Data Analytics",
    "Machine Learning"
]

class SkillHeatmapService:
    """
    Department Skill Heatmap Service
    Calculates multi-departmental skill density and competency gaps,
    translating institutional data into readable LOW, MEDIUM, HIGH heat maps.
    """

    @staticmethod
    def get_skill_heatmap(
        db: Session,
        department_id: Optional[int] = None,
        skill_category: Optional[str] = None
    ) -> Dict[str, Any]:
        # Fetch departments
        dept_query = db.query(Department).filter(Department.is_active == True)
        if department_id:
            dept_query = dept_query.filter(Department.id == department_id)
        departments = dept_query.order_by(Department.id).all()

        skills = CORE_HEATMAP_SKILLS
        if skill_category:
            matched = [s for s in skills if skill_category.lower() in s.lower()]
            if matched:
                skills = matched

        dept_list = [{"id": d.id, "name": d.name, "code": d.code} for d in departments]

        matrix: Dict[str, Dict[str, Any]] = {}
        high_strength_count = 0
        critical_gap_count = 0

        for skill in skills:
            skill_lower = skill.lower()
            matrix[skill] = {}

            for dept in departments:
                dept_faculty = db.query(Faculty).filter(
                    Faculty.department_id == dept.id,
                    Faculty.is_active == True
                ).all()
                total_faculty = len(dept_faculty) or 1

                # Faculty with this skill
                skill_count = 0
                gap_count = 0

                for f in dept_faculty:
                    # Check acquired skills
                    has_skill = False
                    f_skills = db.query(FacultySkill).filter(FacultySkill.faculty_id == f.id).all()
                    if any(skill_lower in fs.skill_name.lower() or fs.skill_name.lower() in skill_lower for fs in f_skills):
                        has_skill = True
                    elif skill_lower in (f.existing_skills or "").lower():
                        has_skill = True
                    
                    if has_skill:
                        skill_count += 1

                    # Check gaps
                    gaps = db.query(SkillGap).filter(
                        SkillGap.faculty_id == f.id,
                        SkillGap.status == "ACTIVE"
                    ).all()
                    if any(skill_lower in g.skill_name.lower() or g.skill_name.lower() in skill_lower for g in gaps):
                        gap_count += 1

                # Calculate genuine score from real database skill counts and gaps
                skill_ratio = (skill_count / total_faculty) * 100.0 if total_faculty > 0 else 0.0
                gap_ratio = (gap_count / total_faculty) * 100.0 if total_faculty > 0 else 0.0
                score = max(0.0, min(100.0, round(skill_ratio - (gap_ratio * 0.4) + 20.0 if skill_count > 0 else (0.0 if gap_count == 0 else 10.0), 1)))

                if score >= 70.0:
                    level = "HIGH"
                    high_strength_count += 1
                elif score >= 40.0:
                    level = "MED"
                else:
                    level = "LOW"
                    critical_gap_count += 1

                matrix[skill][dept.code] = {
                    "department_id": dept.id,
                    "department_code": dept.code,
                    "score": score,
                    "level": level,
                    "faculty_with_skill": skill_count,
                    "faculty_with_gap": gap_count,
                    "total_faculty": total_faculty
                }

        total_cells = len(departments) * len(skills)
        all_cell_scores = [matrix[s][d.code]["score"] for s in skills for d in departments if d.code in matrix[s]]
        avg_readiness = round(sum(all_cell_scores) / len(all_cell_scores), 1) if all_cell_scores else 0.0

        summary = {
            "total_departments_analyzed": len(departments),
            "total_skills_tracked": len(skills),
            "high_competency_cells": high_strength_count,
            "development_priority_cells": critical_gap_count,
            "overall_readiness_index": avg_readiness
        }

        return {
            "departments": dept_list,
            "skills": skills,
            "matrix": matrix,
            "summary": summary
        }

skill_heatmap_service = SkillHeatmapService()
