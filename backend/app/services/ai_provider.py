import os
import json
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

class AIProvider:
    """
    Dual-mode AI Provider:
    Mode 1: Deterministic intelligent algorithm engine (default, runs offline, zero API key required).
    Mode 2: External LLM (Gemini or OpenAI compatible) if AI_API_KEY is set and AI_PROVIDER == 'llm'.
    """

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL

    def is_llm_enabled(self) -> bool:
        return self.provider == "llm" and bool(self.api_key.strip())

    def generate_completion(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Invokes external LLM if configured, otherwise returns None to trigger deterministic engine."""
        if not self.is_llm_enabled():
            return ""
        try:
            import httpx
            # Example Gemini REST call or generic LLM endpoint
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system_instruction or ''}\n\n{prompt}"}]}]
            }
            with httpx.Client(timeout=20.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        return candidates[0]["content"]["parts"][0]["text"]
        except Exception:
            pass
        return ""

    @staticmethod
    def calculate_jaccard_similarity(str1: str, str2: str) -> float:
        """Token-based Jaccard similarity for skill and keyword matching."""
        if not str1 or not str2:
            return 0.0
        s1 = set(re.findall(r"\b[a-zA-Z]{3,}\b", str1.lower()))
        s2 = set(re.findall(r"\b[a-zA-Z]{3,}\b", str2.lower()))
        if not s1 or not s2:
            return 0.0
        intersection = len(s1.intersection(s2))
        union = len(s1.union(s2))
        return intersection / union if union > 0 else 0.0

    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        if not text:
            return []
        tokens = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
        stopwords = {
            "and", "the", "for", "with", "that", "this", "from", "into", "over",
            "after", "about", "your", "their", "will", "have", "more", "which"
        }
        return [t for t in tokens if t not in stopwords]

    def generate_fdp_blueprint(self, prompt: str, department_name: str = "Computer Science & Engineering", target_days: int = 2) -> Dict[str, Any]:
        """
        Generates full FDP specification using LLM or structured educational taxonomy logic.
        """
        topic = prompt.strip()
        # Clean topic from generic prompt words
        topic_clean = re.sub(r"(?i)^(create|generate|design|organize|a|an|\d+[- ]day|fdp|workshop|on|for|faculty|engineering)+\s*", "", topic).strip()
        if not topic_clean:
            topic_clean = "Generative AI for Engineering Education"
        else:
            topic_clean = topic_clean.title()
            # Restore standard acronyms
            for acr in ["Ai", "Llm", "Obe", "Nba", "Fdp", "Sttp", "Iot", "Vlsi"]:
                topic_clean = re.sub(rf"\b{acr}\b", acr.upper(), topic_clean)

        duration_hours = float(target_days * 8)
        
        # Schedule generation
        schedule = []
        for day in range(1, target_days + 1):
            if day == 1:
                schedule.append({
                    "day": 1,
                    "session_num": 1,
                    "title": f"Foundations and Paradigm Shifts in {topic_clean}",
                    "time": "09:30 AM - 11:30 AM",
                    "objective": f"Introduce core theoretical foundations, architectural principles, and pedagogical contexts of {topic_clean}."
                })
                schedule.append({
                    "day": 1,
                    "session_num": 2,
                    "title": f"Hands-on Lab: Tooling, Frameworks & Practical Setups for {topic_clean}",
                    "time": "01:30 PM - 04:30 PM",
                    "objective": "Guided laboratory exercises configuring development environments, pipelines, and real-world baseline models."
                })
            elif day == 2:
                schedule.append({
                    "day": 2,
                    "session_num": 3,
                    "title": f"Curriculum Integration & Advanced Implementation of {topic_clean}",
                    "time": "09:30 AM - 11:30 AM",
                    "objective": "Formulating laboratory syllabi, outcome-based rubrics, and project-based assignments for undergraduate/postgraduate courses."
                })
                schedule.append({
                    "day": 2,
                    "session_num": 4,
                    "title": f"Capstone Demonstration, Case Studies & Research Applications",
                    "time": "01:30 PM - 04:30 PM",
                    "objective": "Presenting end-to-end case studies, research challenges, and faculty capstone peer presentations."
                })
            else:
                schedule.append({
                    "day": day,
                    "session_num": day * 2 - 1,
                    "title": f"Day {day}: Specialization Tracks & Industrial Practice in {topic_clean}",
                    "time": "09:30 AM - 11:30 AM",
                    "objective": f"Deep dive into production deployment, security, and ethics of {topic_clean}."
                })
                schedule.append({
                    "day": day,
                    "session_num": day * 2,
                    "title": f"Day {day}: Research Grant Writing & Publication Methodologies",
                    "time": "01:30 PM - 04:30 PM",
                    "objective": "Drafting research proposals, finding funding agencies, and publishing indexed papers."
                })

        pre_questions = [
            {
                "question_text": f"Which core architectural model primarily underpins modern {topic_clean} workflows?",
                "option_a": "Transformer-based Self-Attention Mechanism",
                "option_b": "Linear Autoregressive Moving Average",
                "option_c": "Static Rule-based Finite State Automaton",
                "option_d": "Uncalibrated Perceptron Mesh",
                "correct_option": "a",
                "marks": 10.0,
                "explanation": "Modern generative and computational engineering paradigms rely predominantly on transformer self-attention mechanisms."
            },
            {
                "question_text": f"In designing outcome-based coursework around {topic_clean}, which Bloom's taxonomy level is targeted in capstone projects?",
                "option_a": "Remembering",
                "option_b": "Evaluating and Creating",
                "option_c": "Understanding",
                "option_d": "Rote Mimicry",
                "correct_option": "b",
                "marks": 10.0,
                "explanation": "Capstone and hands-on laboratory activities aim for Higher Order Thinking Skills (HOTS): Evaluating and Creating."
            },
            {
                "question_text": f"What is the most critical constraint when deploying {topic_clean} systems in institutional academic labs?",
                "option_a": "Compute latency, data privacy, and ethical guardrails",
                "option_b": "Color scheme of user interfaces",
                "option_c": "Cable length in laboratory benches",
                "option_d": "Chalkboard orientation",
                "correct_option": "a",
                "marks": 10.0,
                "explanation": "Compute resource provisioning, student data privacy, and ethical governance are premier deployment constraints."
            }
        ]

        post_questions = [
            {
                "question_text": f"How does temperature scaling influence token sampling in probabilistic {topic_clean} pipelines?",
                "option_a": "Higher temperature introduces stochastic diversity, lower temperature enforces deterministic greedy selection",
                "option_b": "Temperature directly alters the hardware GPU thermal throttle limit",
                "option_c": "Temperature decreases the model's token vocabulary size",
                "option_d": "It has no statistical influence on softmax distribution",
                "correct_option": "a",
                "marks": 10.0,
                "explanation": "Softmax temperature dampens or sharpens probability logits, directly managing output stochasticity and determinism."
            },
            {
                "question_text": f"Which strategy most effectively mitigates hallucination and improves factual grounding in domain-specific academic applications?",
                "option_a": "Retrieval-Augmented Generation (RAG) with vector embeddings",
                "option_b": "Increasing model prompt font size",
                "option_c": "Removing all contextual constraints from prompts",
                "option_d": "Running inference exclusively on CPU threads",
                "correct_option": "a",
                "marks": 10.0,
                "explanation": "RAG leverages semantic vector search to retrieve authoritative academic textbooks and documents before generative synthesis."
            },
            {
                "question_text": f"According to NBA/NAAC outcome-based education (OBE), how should faculty evaluate the learning impact of this {topic_clean} FDP?",
                "option_a": "Measuring normalized learning gain between pre and post assessments accompanied by rubric-based capstone evaluation",
                "option_b": "Counting total registered email addresses only",
                "option_c": "Checking whether students clicked attendance once",
                "option_d": "Comparing physical certificate paper weights",
                "correct_option": "a",
                "marks": 10.0,
                "explanation": "Outcome-based frameworks require measuring measurable learning gain and demonstrable competency mastery."
            }
        ]

        return {
            "title": f"FDP on {topic_clean}",
            "event_type": "FDP",
            "description": f"An intensive {target_days}-day Faculty Development Programme engineered to empower engineering educators with advanced methodologies, hands-on lab capabilities, and pedagogical frameworks in {topic_clean}.",
            "objectives": f"1. Demystify foundational principles and modern implementations of {topic_clean}.\n2. Equip educators with practical lab competencies and industry-standard workflows.\n3. Formulate outcome-based curricula, course outcomes (CO), and capstone assessments for students.\n4. Foster collaborative academic research and funded project development.",
            "target_audience": f"Faculty Members, Research Scholars, and Lab Instructors from {department_name} and allied engineering branches.",
            "eligibility": "Faculty members currently teaching or researching in Computer Science, Information Technology, Electronics, or allied engineering domains.",
            "duration_hours": duration_hours,
            "capacity": 50,
            "delivery_mode": "HYBRID",
            "expected_outcomes": f"Participants will be able to independently design modern lab curricula, build functional prototypes using {topic_clean}, and mentor undergraduate student capstones.",
            "learning_outcomes": f"1. Mastery of state-of-the-art tools and frameworks.\n2. Capability to integrate {topic_clean} into academic lesson plans.\n3. Competency to publish applied research and apply for scientific grants.",
            "estimated_budget": float(target_days * 17500),
            "trainer_expertise_requirement": f"Minimum 8+ years domain experience in {topic_clean}, proven publication record in IEEE/ACM, and track record in delivering high-impact faculty workshops.",
            "registration_description": f"Registration is free for internal faculty. Open to approved external participants upon institutional nomination. Limited seats to ensure hands-on lab mentoring.",
            "certificate_eligibility_criteria": "Minimum 75% verified session attendance, mandatory completion of Pre-Assessment and Post-Assessment, and submission of programme feedback.",
            "schedule": schedule,
            "pre_assessment_questions": pre_questions,
            "post_assessment_questions": post_questions,
            "feedback_questions": [
                "Depth and quality of technical content",
                "Competence, clarity, and pacing of the resource person",
                "Direct relevance to departmental teaching & research",
                "Effectiveness of hands-on laboratory exercises",
                "Quality of institutional organization and scheduling"
            ],
            "final_report_outline": [
                "Executive Summary & Institutional Alignment",
                "Participant Demographics & Attendance Audit",
                "Pedagogical Modules & Laboratory Deliverables",
                "Pre vs Post Assessment Normalized Learning Gain Analysis",
                "Participant Qualitative & Quantitative Feedback Intelligence",
                "Financial Statement & Budget Utilization",
                "Strategic Follow-Up Action Plan for Department"
            ]
        }

ai_provider = AIProvider()
