from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.faculty import Faculty
from app.models.skill import FacultySkill, SkillGap
from app.models.registration import Registration
from app.models.certificate import Certificate
from app.models.agent_analysis import AgentAnalysis
from app.services.ai_provider import ai_provider

CAREER_GOAL_DEFINITIONS = {
    "RESEARCH_MENTOR": {
        "title": "Research Mentor & Principal Investigator",
        "description": "Develop advanced competencies in research methodology, grant acquisition, doctoral supervision, and high-impact international publishing.",
        "timeline_months": 18,
        "milestones": [
            {"skill": "Research Methodology", "training": "Advanced Empirical Research Methods & Data Validation", "priority": "HIGH"},
            {"skill": "Academic Writing", "training": "High-Impact Scopus & SCI Manuscript Authoring", "priority": "HIGH"},
            {"skill": "Research Ethics", "training": "Publication Ethics, Plagiarism Safeguards & Peer Reviewing", "priority": "MEDIUM"},
            {"skill": "Grant Proposal Writing", "training": "Competitive Research Proposal Drafting for SERB/DST/UGC", "priority": "HIGH"},
            {"skill": "Research Supervision", "training": "Doctoral Candidate Mentoring & Lab Infrastructure Management", "priority": "MEDIUM"}
        ]
    },
    "AI_ENABLED_EDUCATOR": {
        "title": "AI-Enabled Digital Educator",
        "description": "Transform instructional delivery by integrating Generative AI, personalized adaptive assessment, automated lab grading, and blended pedagogy.",
        "timeline_months": 12,
        "milestones": [
            {"skill": "Generative AI", "training": "Prompt Engineering & LLM Workflows for STEM Education", "priority": "HIGH"},
            {"skill": "Adaptive Assessments", "training": "Building AI-Assisted Formative & Summative Quizzes", "priority": "HIGH"},
            {"skill": "Virtual Labs & Simulation", "training": "Interactive Cloud & Containerized Classroom Environments", "priority": "MEDIUM"},
            {"skill": "Outcome-Based Pedagogy", "training": "NBA Bloom's Taxonomy Mapping for AI-Assisted Curricula", "priority": "HIGH"},
            {"skill": "AI Ethics in Education", "training": "Academic Integrity, AI Governance & Student Guidelines", "priority": "MEDIUM"}
        ]
    },
    "ACADEMIC_LEADER": {
        "title": "Academic Leader & Quality Administrator",
        "description": "Prepare for departmental headship, IQAC direction, institutional accreditation leadership, and curriculum governance.",
        "timeline_months": 24,
        "milestones": [
            {"skill": "Outcome Based Education", "training": "NBA Tier-1 Criteria & Course Attainment Masterclass", "priority": "HIGH"},
            {"skill": "Academic Governance", "training": "Departmental Resource Allocation, NEP-2020 Compliance & Policy", "priority": "HIGH"},
            {"skill": "Faculty Mentorship", "training": "Peer Coaching, Faculty Appraisals & Professional Development", "priority": "MEDIUM"},
            {"skill": "Curriculum Innovation", "training": "Industry Advisory Board Alignment & CBCS Frameworks", "priority": "HIGH"},
            {"skill": "Institutional Financial Planning", "training": "Laboratory Budgets, Seed Grants & Capital Management", "priority": "LOW"}
        ]
    },
    "INDUSTRY_READY_FACULTY": {
        "title": "Industry-Ready Technical Educator",
        "description": "Bridge academia and modern software/engineering industry practices with modern toolchains, cloud certifications, and project-based learning.",
        "timeline_months": 12,
        "milestones": [
            {"skill": "Cloud Architecture & DevOps", "training": "AWS/Azure Cloud Foundations & CI/CD Pipelines", "priority": "HIGH"},
            {"skill": "Full Stack / Modern Toolchains", "training": "Modern Frameworks, Microservices & Dockerized Labs", "priority": "HIGH"},
            {"skill": "Agile Methodologies", "training": "Scrum & Sprint Frameworks for Capstone Engineering Projects", "priority": "MEDIUM"},
            {"skill": "Industry Consulting", "training": "Translational Industry Problem Solving & MOUs", "priority": "HIGH"},
            {"skill": "Applied Cyber Defense", "training": "Defensive Architecture & Secure Coding Standards", "priority": "MEDIUM"}
        ]
    },
    "INNOVATION_MENTOR": {
        "title": "Innovation & Incubation Mentor",
        "description": "Guide student entrepreneurs, patent novel technical inventions, and steer university technology incubators and hackathons.",
        "timeline_months": 15,
        "milestones": [
            {"skill": "Intellectual Property Rights (IPR)", "training": "Patent Search, Prior Art Verification & Filing Workflows", "priority": "HIGH"},
            {"skill": "Design Thinking", "training": "Human-Centered Problem Definition & Prototyping", "priority": "HIGH"},
            {"skill": "Startup Incubation Mentorship", "training": "Business Model Canvases, Seed Capital & Pre-Incubation", "priority": "HIGH"},
            {"skill": "Hackathon Leadership", "training": "Organizing High-Impact Ideathons & Industry Challenges", "priority": "MEDIUM"},
            {"skill": "Commercialization Strategies", "training": "Tech Transfer Agreements & Industry Licensing", "priority": "MEDIUM"}
        ]
    },
    "PUBLICATION_FOCUSED_RESEARCHER": {
        "title": "High-Impact Publication Specialist",
        "description": "Accelerate personal and departmental publication volume in Q1/Q2 indexed journals and international conferences.",
        "timeline_months": 12,
        "milestones": [
            {"skill": "Literature Review Automation", "training": "Bibliometric Analysis & Citation Graph Mining", "priority": "MEDIUM"},
            {"skill": "Research Methodology", "training": "Statistical Rigor, Experimental Replicability & Data Repositories", "priority": "HIGH"},
            {"skill": "Journal Selection Strategy", "training": "Navigating Scopus, WoS, and Avoiding Predatory Journals", "priority": "HIGH"},
            {"skill": "Peer Review Responses", "training": "Addressing Reviewer Critiques & Editorial Negotiation", "priority": "HIGH"},
            {"skill": "Academic Branding", "training": "Google Scholar, ORCID & International Collaborative Networks", "priority": "LOW"}
        ]
    }
}

class CareerGrowthAgent:
    """
    Faculty Career Growth Path Agent
    Translates institutional goals into personalized multi-step professional roadmaps,
    analyzing completed certifications, skill gap proficiencies, and existing skills.
    """

    def generate_career_path(
        self,
        db: Session,
        faculty_id: int,
        goal: str = "RESEARCH_MENTOR"
    ) -> Dict[str, Any]:
        faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise ValueError(f"Faculty with id {faculty_id} not found")

        goal_clean = goal.upper().strip()
        if goal_clean not in CAREER_GOAL_DEFINITIONS:
            goal_clean = "RESEARCH_MENTOR"

        goal_meta = CAREER_GOAL_DEFINITIONS[goal_clean]

        # Gather faculty existing competencies
        db_skills = db.query(FacultySkill).filter(FacultySkill.faculty_id == faculty_id).all()
        acquired_skill_names = {s.skill_name.lower() for s in db_skills}
        if faculty.existing_skills:
            for s in faculty.existing_skills.split(","):
                acquired_skill_names.add(s.strip().lower())

        active_gaps = db.query(SkillGap).filter(
            SkillGap.faculty_id == faculty_id,
            SkillGap.status == "ACTIVE"
        ).all()
        gap_names = {g.skill_name.lower() for g in active_gaps}

        # Check completed training events
        regs = db.query(Registration).filter(
            Registration.faculty_id == faculty_id,
            Registration.completion_status == "COMPLETED"
        ).all()
        completed_titles = " ".join([r.event.title.lower() for r in regs if r.event])

        steps: List[Dict[str, Any]] = []
        completed_count = 0

        for idx, m in enumerate(goal_meta["milestones"], start=1):
            s_name = m["skill"].lower()
            
            # Check status
            is_completed = False
            is_in_progress = False

            if any(s_name in ak or ak in s_name for ak in acquired_skill_names):
                is_completed = True
            elif any(s_name in g for g in gap_names):
                is_in_progress = True
            elif s_name in completed_titles:
                is_completed = True

            if is_completed:
                status = "COMPLETED"
                completed_count += 1
                reason = f"Verified competency established through prior training or departmental credentials in {m['skill']}."
            elif is_in_progress:
                status = "IN_PROGRESS"
                reason = f"Active development target. Recommended to complete '{m['training']}' to eliminate existing gap."
            else:
                status = "RECOMMENDED"
                reason = f"Essential milestone for {goal_meta['title']}. Provides specialized grounding in {m['skill']}."

            steps.append({
                "step_number": idx,
                "skill_or_milestone": m["skill"],
                "priority": m["priority"],
                "current_status": status,
                "recommended_training": m["training"],
                "reason": reason
            })

        # Calculate progress percentage
        progress = round((completed_count / len(steps)) * 100.0, 1)

        # Next recommended step
        next_step = next((s for s in steps if s["current_status"] in ["IN_PROGRESS", "RECOMMENDED"]), None)
        next_step_title = f"Step {next_step['step_number']}: {next_step['skill_or_milestone']} ({next_step['recommended_training']})" if next_step else "All core roadmap milestones completed!"

        # Explainable AI guidance
        guidance = (
            f"Based on your profile as {faculty.designation} in {faculty.department.name if faculty.department else 'Engineering'}, "
            f"you have achieved {completed_count}/{len(steps)} foundation milestones ({progress}%). "
            f"Prioritize '{next_step['skill_or_milestone'] if next_step else 'Capstone Leadership'}' to advance toward full {goal_meta['title']} accreditation."
        )

        # Log agent analysis
        try:
            log_entry = AgentAnalysis(
                agent_name="CareerGrowthAgent",
                faculty_id=faculty_id,
                input_summary=f"Goal: {goal_clean} for {faculty.full_name}",
                output_data={"progress": progress, "next_step": next_step_title},
                confidence_score=0.92
            )
            db.add(log_entry)
            db.commit()
        except Exception:
            db.rollback()

        return {
            "faculty_id": faculty.id,
            "faculty_name": faculty.full_name,
            "goal": goal_clean,
            "goal_title": goal_meta["title"],
            "description": goal_meta["description"],
            "target_timeline_months": goal_meta["timeline_months"],
            "current_progress_percentage": progress,
            "path": steps,
            "next_recommended_step": next_step_title,
            "ai_guidance": guidance
        }

career_growth_agent = CareerGrowthAgent()
