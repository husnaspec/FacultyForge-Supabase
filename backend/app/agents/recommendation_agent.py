import json
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.faculty import Faculty
from app.models.skill import SkillGap, TrainingRecommendation
from app.models.event import Event
from app.models.agent_analysis import AgentAnalysis
from app.agents.skill_gap_agent import skill_gap_agent

class RecommendationAgent:
    """
    Personalized Training Recommendation Agent
    Aligns identified skill gaps, faculty teaching/research interests,
    and institutional upcoming FDP offerings to produce tailored development plans.
    """

    def recommend(self, db: Session, faculty_id: int) -> Dict[str, Any]:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError(f"Faculty with id {faculty_id} not found")

        # Check existing active skill gaps, or run skill gap agent if none
        gaps = db.query(SkillGap).filter(
            SkillGap.faculty_id == faculty_id,
            SkillGap.status == "ACTIVE"
        ).all()
        if not gaps:
            skill_gap_agent.analyze(db, faculty_id)
            gaps = db.query(SkillGap).filter(
                SkillGap.faculty_id == faculty_id,
                SkillGap.status == "ACTIVE"
            ).all()

        # Available approved or upcoming FDPs
        catalog_events = db.query(Event).filter(
            Event.status.in_(["APPROVED", "REGISTRATION_OPEN", "DRAFT", "COMPLETED"])
        ).all()

        recommendations = []
        teaching = (faculty.teaching_interests or "").lower()
        research = (faculty.research_interests or "").lower()

        for gap in gaps:
            if "generative ai" in gap.skill_name.lower():
                # Find matching catalogue event or suggest new
                matching_ev = next((e for e in catalog_events if "generative ai" in e.title.lower()), None)
                recommendations.append({
                    "title": "Generative AI for Engineering Education",
                    "topic": "Generative AI & Pedagogical Integration",
                    "priority": "HIGH",
                    "recommended_duration": "2 to 3 Days",
                    "confidence_score": 0.91,
                    "reasons": [
                        "Directly addresses identified HIGH-priority Generative AI skill gap",
                        f"Aligns with active teaching interest in '{faculty.teaching_interests or 'AI Systems'}'",
                        "Zero matching certified programmes completed in current academic calendar"
                    ],
                    "suggested_delivery_mode": "HYBRID",
                    "aligned_gap": gap.skill_name,
                    "recommended_event_id": matching_ev.id if matching_ev else None
                })
            elif "research" in gap.skill_name.lower():
                matching_ev = next((e for e in catalog_events if "research" in e.title.lower()), None)
                recommendations.append({
                    "title": "Research Methodology and Academic Writing",
                    "topic": "Indexed Publishing and Research Grants",
                    "priority": "MEDIUM",
                    "recommended_duration": "3 Days",
                    "confidence_score": 0.86,
                    "reasons": [
                        "Strengthens Scopus/SCI publication pipeline for faculty appraisal",
                        f"Directly supports faculty research interests in '{faculty.research_interests or 'Applied Sciences'}'",
                        "Recommended by institutional IQAC criteria for tenure advancement"
                    ],
                    "suggested_delivery_mode": "ONLINE",
                    "aligned_gap": gap.skill_name,
                    "recommended_event_id": matching_ev.id if matching_ev else None
                })
            elif "cyber" in gap.skill_name.lower():
                matching_ev = next((e for e in catalog_events if "cyber" in e.title.lower()), None)
                recommendations.append({
                    "title": "Cybersecurity Fundamentals and Zero Trust Architecture",
                    "topic": "Applied Information Security",
                    "priority": "HIGH",
                    "recommended_duration": "3 Days",
                    "confidence_score": 0.88,
                    "reasons": [
                        "Fulfills departmental curriculum requirement for emerging security lab delivery",
                        "Addresses vulnerability in current syllabus coverage",
                        "High industry demand for student mentoring"
                    ],
                    "suggested_delivery_mode": "HYBRID",
                    "aligned_gap": gap.skill_name,
                    "recommended_event_id": matching_ev.id if matching_ev else None
                })
            elif "outcome" in gap.skill_name.lower() or "obe" in gap.skill_name.lower():
                matching_ev = next((e for e in catalog_events if "outcome" in e.title.lower() or "obe" in e.title.lower()), None)
                recommendations.append({
                    "title": "Outcome Based Education and Course Attainment Workshop",
                    "topic": "Accreditation and Continuous Quality Improvement",
                    "priority": "MEDIUM",
                    "recommended_duration": "2 Days",
                    "confidence_score": 0.84,
                    "reasons": [
                        "Institutional NBA/NAAC audit prerequisite",
                        "Equips faculty to compute CO-PO mapping and direct/indirect attainment",
                        "Mandatory for course coordinators"
                    ],
                    "suggested_delivery_mode": "OFFLINE",
                    "aligned_gap": gap.skill_name,
                    "recommended_event_id": matching_ev.id if matching_ev else None
                })

        # Default fallback recommendation if empty
        if not recommendations:
            recommendations.append({
                "title": "Generative AI for Engineering Education",
                "topic": "Generative AI",
                "priority": "HIGH",
                "recommended_duration": "3 Days",
                "confidence_score": 0.91,
                "reasons": [
                    "Addresses a high-priority skill gap",
                    "Matches teaching interests",
                    "No similar recent FDP completed"
                ],
                "suggested_delivery_mode": "HYBRID",
                "aligned_gap": "Generative AI",
                "recommended_event_id": None
            })

        # Save to TrainingRecommendation table
        db.query(TrainingRecommendation).filter(TrainingRecommendation.faculty_id == faculty_id).delete()
        for r in recommendations:
            db_rec = TrainingRecommendation(
                faculty_id=faculty_id,
                title=r["title"],
                topic=r["topic"],
                priority=r["priority"],
                reason="; ".join(r["reasons"]),
                recommended_duration=r["recommended_duration"],
                recommended_event_id=r.get("recommended_event_id"),
                confidence_score=r["confidence_score"],
                generated_at=datetime.utcnow(),
                status="PENDING"
            )
            db.add(db_rec)

        # Log analysis
        analysis_record = AgentAnalysis(
            agent_name="RecommendationAgent",
            faculty_id=faculty_id,
            input_summary=f"Gaps: {[g.skill_name for g in gaps]}",
            output_json=json.dumps(recommendations),
            confidence_score=0.91,
            created_at=datetime.utcnow()
        )
        db.add(analysis_record)
        db.commit()

        return {
            "faculty_id": faculty.id,
            "faculty_name": faculty.full_name,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow()
        }

recommendation_agent = RecommendationAgent()
