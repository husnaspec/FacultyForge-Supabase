import uuid
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.faculty import Faculty
from app.models.resource_person import ResourcePerson
from app.models.event import Event, EventSession
from app.models.proposal import Proposal
from app.models.registration import Registration
from app.models.attendance import Attendance
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAttempt
from app.models.feedback import Feedback
from app.models.certificate import Certificate
from app.models.skill import FacultySkill, SkillGap, TrainingRecommendation
from app.models.compliance import ComplianceRule, FacultyCompliance
from app.models.skill_evidence import SkillEvidence
from app.models.teaching_impact import TeachingImpact

class SeedService:
    @staticmethod
    def seed_all(db: Session):
        # 1. Departments
        if db.query(Department).count() > 0:
            return # Already seeded

        dept_cse = Department(name="Computer Science & Engineering", code="CSE", description="Department of Computer Science and Engineering", is_active=True)
        dept_it = Department(name="Information Technology", code="IT", description="Department of Information Technology", is_active=True)
        dept_ece = Department(name="Electronics & Communication Engineering", code="ECE", description="Department of Electronics and Communication", is_active=True)
        dept_mech = Department(name="Mechanical Engineering", code="MECH", description="Department of Mechanical Engineering", is_active=True)
        db.add_all([dept_cse, dept_it, dept_ece, dept_mech])
        db.flush()

        # 2. Compliance Rules
        rule_annual = ComplianceRule(
            rule_name="Annual Faculty Development Requirement",
            description="Mandatory 40 hours of continuous professional and pedagogical development per academic year.",
            minimum_training_hours=40.0,
            period_type="ANNUAL",
            required_topics="Teaching Methodology, Research, Emerging Technologies",
            is_active=True
        )
        rule_tenure = ComplianceRule(
            rule_name="NBA/NAAC Accreditation Continuous Development Rule",
            description="Minimum 24 hours of outcome-based and research-oriented development per semester.",
            minimum_training_hours=24.0,
            period_type="SEMESTER",
            required_topics="Outcome Based Education, Research Methodology",
            is_active=True
        )
        db.add_all([rule_annual, rule_tenure])
        db.flush()

        # 3. Faculty (12 Members)
        faculties_data = [
            {
                "code": "FAC-CSE-001", "name": "Dr. Ayesha Khan", "email": "ayesha.khan@university.edu",
                "dept_id": dept_cse.id, "desig": "Assistant Professor", "qual": "Ph.D. in Computer Science",
                "exp": 5.5, "teaching": "Artificial Intelligence, Machine Learning, Data Structures",
                "research": "Generative AI, Deep Learning Models",
                "skills": "Python, Machine Learning, Data Structures, Algorithms",
                "dev_interests": "Generative AI, Research Methodology, Grant Writing"
            },
            {
                "code": "FAC-CSE-002", "name": "Dr. Meera Rao", "email": "meera.rao@university.edu",
                "dept_id": dept_cse.id, "desig": "Associate Professor", "qual": "Ph.D. in Distributed Systems",
                "exp": 11.0, "teaching": "Cloud Computing, Operating Systems, Computer Networks",
                "research": "Distributed Systems, Virtualization Architectures",
                "skills": "Cloud Architecture, Linux, Kubernetes, C++",
                "dev_interests": "Cybersecurity, Academic Leadership"
            },
            {
                "code": "FAC-IT-001", "name": "Dr. Arjun Sharma", "email": "arjun.sharma@university.edu",
                "dept_id": dept_it.id, "desig": "Assistant Professor", "qual": "Ph.D. in Cyber Defense",
                "exp": 4.0, "teaching": "Information Security, Cryptography, Network Protocols",
                "research": "Cyber Threat Intelligence, Intrusion Detection",
                "skills": "Network Security, Python, Cryptography, Wireshark",
                "dev_interests": "Zero Trust Architecture, Grant Writing"
            },
            {
                "code": "FAC-ECE-001", "name": "Dr. Neha Reddy", "email": "neha.reddy@university.edu",
                "dept_id": dept_ece.id, "desig": "Associate Professor", "qual": "Ph.D. in Microelectronics",
                "exp": 12.0, "teaching": "VLSI Design, Digital Electronics, Embedded Systems",
                "research": "Neuromorphic Computing, Low-power VLSI",
                "skills": "Verilog, Embedded C, FPGA, Cadence",
                "dev_interests": "Edge AI, Scopus Publishing"
            },
            {
                "code": "FAC-MECH-001", "name": "Dr. Farhan Ali", "email": "farhan.ali@university.edu",
                "dept_id": dept_mech.id, "desig": "Professor", "qual": "Ph.D. in Thermal Engineering",
                "exp": 18.0, "teaching": "Thermodynamics, Heat Transfer, CAD/CAM",
                "research": "Additive Manufacturing, Thermal Optimization",
                "skills": "ANSYS, SolidWorks, Optimization, FEA",
                "dev_interests": "Outcome Based Education, Industry 4.0"
            },
            {
                "code": "FAC-IT-002", "name": "Dr. Kavya Nair", "email": "kavya.nair@university.edu",
                "dept_id": dept_it.id, "desig": "Assistant Professor", "qual": "Ph.D. in Software Engineering",
                "exp": 6.0, "teaching": "Web Technologies, Full Stack Engineering, Software Testing",
                "research": "Human-Computer Interaction, Web Accessibility",
                "skills": "JavaScript, React, Node.js, SQL, Testing Frameworks",
                "dev_interests": "Cloud Native Microservices, Pedagogical Innovations"
            },
            {
                "code": "FAC-CSE-003", "name": "Dr. Rohan Verma", "email": "rohan.verma@university.edu",
                "dept_id": dept_cse.id, "desig": "Assistant Professor", "qual": "Ph.D. in Data Engineering",
                "exp": 3.5, "teaching": "Database Management, Big Data Analytics, Python",
                "research": "Scalable Vector Databases, Streaming Data",
                "skills": "SQL, Apache Spark, Hadoop, Python, NoSQL",
                "dev_interests": "Generative AI, Research Methodology"
            },
            {
                "code": "FAC-ECE-002", "name": "Dr. Sana Ahmed", "email": "sana.ahmed@university.edu",
                "dept_id": dept_ece.id, "desig": "Assistant Professor", "qual": "Ph.D. in Telecommunications",
                "exp": 7.0, "teaching": "Wireless Communications, Digital Signal Processing",
                "research": "5G/6G MIMO Architectures, Beamforming",
                "skills": "MATLAB, Wireless Protocols, DSP, Python",
                "dev_interests": "Deep Learning for Signal Processing, OBE"
            },
            {
                "code": "FAC-CSE-004", "name": "Dr. Priya Iyer", "email": "priya.iyer@university.edu",
                "dept_id": dept_cse.id, "desig": "Professor", "qual": "Ph.D. in Software Architecture",
                "exp": 20.0, "teaching": "Software Engineering, System Design, Object Oriented Design",
                "research": "Empirical Software Quality, Architecture Patterns",
                "skills": "Agile, UML, Software Architecture, Testing",
                "dev_interests": "Academic Leadership, Accreditation Audits"
            },
            {
                "code": "FAC-IT-003", "name": "Dr. Rahul Das", "email": "rahul.das@university.edu",
                "dept_id": dept_it.id, "desig": "Assistant Professor", "qual": "Ph.D. in Cloud Security",
                "exp": 5.0, "teaching": "DevOps Engineering, Cloud Infrastructure, Linux",
                "research": "Automated Vulnerability Detection in CI/CD",
                "skills": "Docker, Kubernetes, Jenkins, Terraform, Python",
                "dev_interests": "Cybersecurity, Grant Writing"
            },
            {
                "code": "FAC-MECH-002", "name": "Dr. Nikhil Jain", "email": "nikhil.jain@university.edu",
                "dept_id": dept_mech.id, "desig": "Associate Professor", "qual": "Ph.D. in Robotics",
                "exp": 10.0, "teaching": "Robotics & Automation, Mechatronics, Control Systems",
                "research": "Autonomous Mobile Robotics, Trajectory Planning",
                "skills": "ROS, MATLAB, Kinematics, Python, Arduino",
                "dev_interests": "AI for Robotics, Outcome Based Education"
            },
            {
                "code": "FAC-ECE-003", "name": "Dr. Ananya Bose", "email": "ananya.bose@university.edu",
                "dept_id": dept_ece.id, "desig": "Assistant Professor", "qual": "Ph.D. in IoT Systems",
                "exp": 4.5, "teaching": "Internet of Things, Sensor Networks, Microcontrollers",
                "research": "Smart Sensors, Energy Harvesting Edge Nodes",
                "skills": "Arduino, ESP32, MQTT, C++, Embedded Systems",
                "dev_interests": "Edge AI, Research Methodology"
            }
        ]

        created_faculties = []
        for f_data in faculties_data:
            fac = Faculty(
                faculty_code=f_data["code"],
                full_name=f_data["name"],
                email=f_data["email"],
                department_id=f_data["dept_id"],
                designation=f_data["desig"],
                qualification=f_data["qual"],
                years_of_experience=f_data["exp"],
                teaching_interests=f_data["teaching"],
                research_interests=f_data["research"],
                existing_skills=f_data["skills"],
                development_interests=f_data["dev_interests"],
                is_active=True
            )
            db.add(fac)
            created_faculties.append(fac)
        db.flush()

        # Add initial skills
        for fac in created_faculties:
            for s_name in [s.strip() for s in (fac.existing_skills or "").split(",") if s.strip()]:
                db.add(FacultySkill(
                    faculty_id=fac.id,
                    skill_name=s_name,
                    proficiency_level="ADVANCED" if fac.years_of_experience > 10 else "INTERMEDIATE",
                    source="SELF_REPORTED"
                ))

        # 4. Resource Persons
        rps_data = [
            {
                "name": "Dr. Anirudh Sen", "email": "anirudh.sen@iisc.ac.in", "phone": "+91-98765-43210",
                "org": "Indian Institute of Science (IISc)", "desig": "Professor & Principal Investigator",
                "expertise": "Generative AI, Large Language Models, Deep Learning, Natural Language Processing",
                "topics": "Prompt Engineering, Transformer Architectures, RAG Systems, AI Ethics",
                "bio": "Fellow of INAE, author of 70+ IEEE transactions, lead consultant for AI education initiatives.",
                "exp": 16.0, "sessions": 28, "rating": 4.90, "hon": "Rs. 25,000 / day", "travel": True
            },
            {
                "name": "Prof. Vikram Singhania", "email": "vikram.s@cyberlabs.res.in", "phone": "+91-98765-43211",
                "org": "National Cybersecurity Defense Research Centre", "desig": "Chief Security Architect",
                "expertise": "Cybersecurity, Zero-Trust Architecture, Defensive Operations, Threat Modeling",
                "topics": "Enterprise Threat Modeling, Cloud Security, Incident Handling, Cryptographic Protocols",
                "bio": "Former advisor to CERT-In, certified CISSP/CISM with 14 years hands-on penetration and defense experience.",
                "exp": 14.0, "sessions": 22, "rating": 4.82, "hon": "Rs. 20,000 / day", "travel": False
            },
            {
                "name": "Dr. Shalini Mukherjee", "email": "shalini.m@niepa.edu.in", "phone": "+91-98765-43212",
                "org": "National Institute of Educational Planning", "desig": "Senior Academic Advisor & Professor",
                "expertise": "Research Methodology, Academic Writing, High-Impact Scopus Publishing, Grant Proposal Drafting",
                "topics": "Literature Review Mapping, Citation Analytics, Statistical Verification, Grant Writing",
                "bio": "Mentored over 350 faculty research proposals; reviewed funding submissions for SERB and DST.",
                "exp": 20.0, "sessions": 35, "rating": 4.88, "hon": "Rs. 18,000 / day", "travel": True
            },
            {
                "name": "Dr. K. R. Venkatesh", "email": "kr.venkatesh@nba-consult.org", "phone": "+91-98765-43213",
                "org": "Centre for Academic Excellence & Accreditation", "desig": "Chief Quality Evaluator",
                "expertise": "Outcome Based Education, Bloom's Taxonomy, NBA/NAAC Attainment, Curriculum Design",
                "topics": "CO-PO-PSO Formulation, Rubric Design, Continuous Quality Improvement, Course Dossiers",
                "bio": "Trained more than 80 institutions across India on outcome-based education and tier-1 accreditation.",
                "exp": 22.0, "sessions": 42, "rating": 4.78, "hon": "Rs. 22,000 / day", "travel": True
            },
            {
                "name": "Dr. Tara Sundaram", "email": "tara.s@data-analytics.org", "phone": "+91-98765-43214",
                "org": "Centre for Advanced Computational Analytics", "desig": "Principal Data Scientist",
                "expertise": "Data Analytics, Machine Learning, Applied Statistics, Python for Engineers",
                "topics": "Exploratory Data Analysis, Predictive Modeling, Experimental Design, Big Data Tools",
                "bio": "Industrial data scientist with extensive track record conducting university faculty bootcamps.",
                "exp": 11.0, "sessions": 19, "rating": 4.70, "hon": "Rs. 16,000 / day", "travel": False
            }
        ]

        created_rps = []
        for rp in rps_data:
            r_obj = ResourcePerson(
                name=rp["name"], email=rp["email"], phone=rp["phone"],
                organization=rp["org"], designation=rp["desig"], expertise=rp["expertise"],
                topics=rp["topics"], biography=rp["bio"], years_of_experience=rp["exp"],
                total_sessions=rp["sessions"], average_rating=rp["rating"],
                honorarium_expectation=rp["hon"], travel_required=rp["travel"], is_active=True
            )
            db.add(r_obj)
            created_rps.append(r_obj)
        db.flush()

        # 5. Events
        now = datetime.utcnow()

        # Event 1: Completed FDP with full assessments, attendance, feedback and certificates
        e1_start = now - timedelta(days=20)
        e1_end = now - timedelta(days=18)
        evt_cyber = Event(
            event_code="FFAI-EVT-2026-0001",
            title="Cybersecurity Fundamentals for Faculty",
            description="A comprehensive 3-day practical workshop exploring defensive cybersecurity architectures, threat modeling, and network hardening for engineering faculty.",
            event_type="WORKSHOP",
            objectives="1. Master foundational principles of zero-trust defense.\n2. Configure laboratory ethical penetration environments.\n3. Integrate cyber security case studies into undergraduate syllabi.",
            target_audience="Faculty of IT, CSE, and ECE departments",
            eligibility="Faculty with foundational knowledge in computer networks",
            start_date=e1_start,
            end_date=e1_end,
            duration_hours=24.0,
            capacity=40,
            delivery_mode="HYBRID",
            venue="Auditorium 2 & Hybrid Lab Portal",
            department_id=dept_it.id,
            coordinator_faculty_id=created_faculties[2].id, # Dr. Arjun Sharma
            status="COMPLETED",
            expected_outcomes="Participants configure vulnerability scanner pipelines and deliver updated lab modules.",
            learning_outcomes="Deep conceptual grasp of network defense; ability to formulate lab assignments.",
            estimated_budget=35000.0,
            actual_expenditure=32400.0
        )
        db.add(evt_cyber)
        db.flush()

        # Sessions for Event 1
        s1 = EventSession(event_id=evt_cyber.id, title="Zero-Trust Architecture Foundations", session_date=e1_start, start_time="09:30 AM", end_time="01:00 PM", resource_person_id=created_rps[1].id, learning_objective="Principles of Zero Trust")
        s2 = EventSession(event_id=evt_cyber.id, title="Hands-on Threat Modeling & Packet Analysis", session_date=e1_start + timedelta(days=1), start_time="09:30 AM", end_time="04:30 PM", resource_person_id=created_rps[1].id, learning_objective="Defensive Network Inspection")
        db.add_all([s1, s2])
        db.flush()

        # Event 2: Research Methodology (COMPLETED)
        e2_start = now - timedelta(days=45)
        e2_end = now - timedelta(days=42)
        evt_research = Event(
            event_code="FFAI-EVT-2026-0002",
            title="Research Methodology and Academic Writing",
            description="High-impact national workshop on empirical research design, Scopus/SCI indexing, and competitive research grant proposal formulation.",
            event_type="STTP",
            objectives="Equip faculty with publishing strategies, experimental validation metrics, and grant acquisition methodologies.",
            target_audience="Faculty across all engineering departments",
            eligibility="All active teaching faculty and research guides",
            start_date=e2_start,
            end_date=e2_end,
            duration_hours=24.0,
            capacity=60,
            delivery_mode="ONLINE",
            venue="Virtual University Lecture Hall",
            department_id=dept_cse.id,
            coordinator_faculty_id=created_faculties[1].id,
            status="COMPLETED",
            expected_outcomes="Manuscript drafts prepared for high-impact journals.",
            learning_outcomes="Rigorous academic research execution and grant writing.",
            estimated_budget=28000.0,
            actual_expenditure=26500.0
        )
        db.add(evt_research)
        db.flush()

        # Event 3: Outcome Based Education (COMPLETED)
        e3_start = now - timedelta(days=70)
        e3_end = now - timedelta(days=68)
        evt_obe = Event(
            event_code="FFAI-EVT-2026-0003",
            title="Outcome Based Education Workshop",
            description="Accreditation-focused intensive training covering Course Outcomes, Program Outcomes, Bloom's Taxonomy, and rubric attainment calculations.",
            event_type="WORKSHOP",
            objectives="Empower academic departments to prepare compliant OBE course files for Tier-1 NBA evaluation.",
            target_audience="Academic course coordinators and department heads",
            eligibility="Teaching faculty members",
            start_date=e3_start,
            end_date=e3_end,
            duration_hours=16.0,
            capacity=80,
            delivery_mode="OFFLINE",
            venue="Main Campus Seminar Hall",
            department_id=dept_cse.id,
            coordinator_faculty_id=created_faculties[8].id,
            status="COMPLETED",
            expected_outcomes="Complete formulation of validated course outcome matrices.",
            learning_outcomes="Accreditation readiness and rubric-based assessment mastery.",
            estimated_budget=30000.0,
            actual_expenditure=29000.0
        )
        db.add(evt_obe)
        db.flush()

        # Event 4: Active Approved FDP - Ready for Demo Registration / Workflow
        e4_start = now + timedelta(days=10)
        e4_end = now + timedelta(days=12)
        evt_genai = Event(
            event_code="FFAI-EVT-2026-0004",
            title="Generative AI for Engineering Education",
            description="An intensive 2-day Faculty Development Programme engineered to empower engineering educators with advanced LLM prompt engineering, hands-on lab capabilities, and pedagogical frameworks.",
            event_type="FDP",
            objectives="1. Demystify foundational principles and modern implementations of Generative AI.\n2. Equip educators with practical lab competencies and industry-standard workflows.\n3. Formulate outcome-based curricula, course outcomes (CO), and capstone assessments for students.",
            target_audience="Faculty Members, Research Scholars, and Lab Instructors from CSE, IT, and allied engineering branches.",
            eligibility="Faculty members currently teaching or researching in Computer Science or engineering domains.",
            start_date=e4_start,
            end_date=e4_end,
            duration_hours=16.0,
            capacity=50,
            delivery_mode="HYBRID",
            venue="Main Campus Seminar Hall & Virtual Academic Portal",
            department_id=dept_cse.id,
            coordinator_faculty_id=created_faculties[0].id, # Dr. Ayesha Khan
            status="REGISTRATION_OPEN",
            expected_outcomes="Participants independently design modern lab curricula and build functional prototypes using LLMs.",
            learning_outcomes="Mastery of state-of-the-art tools, prompt frameworks, and academic research integration.",
            estimated_budget=35000.0,
            actual_expenditure=0.0
        )
        db.add(evt_genai)
        db.flush()

        # Sessions for Event 4
        s_genai_1 = EventSession(event_id=evt_genai.id, title="Day 1: Foundations and Transformer Architectures", session_date=e4_start, start_time="09:30 AM", end_time="12:30 PM", resource_person_id=created_rps[0].id, learning_objective="Core Transformer Mechanisms")
        s_genai_2 = EventSession(event_id=evt_genai.id, title="Day 1: Hands-on Prompt Engineering & RAG Lab", session_date=e4_start, start_time="01:30 PM", end_time="04:30 PM", resource_person_id=created_rps[0].id, learning_objective="Building Local Vector RAG Workflows")
        s_genai_3 = EventSession(event_id=evt_genai.id, title="Day 2: Capstone Pedagogical Integration & Curriculum Rubrics", session_date=e4_end, start_time="09:30 AM", end_time="03:30 PM", resource_person_id=created_rps[0].id, learning_objective="NBA OBE Curriculum Alignment")
        db.add_all([s_genai_1, s_genai_2, s_genai_3])
        db.flush()

        # Event 5: Data Analytics (DRAFT)
        evt_analytics = Event(
            event_code="FFAI-EVT-2026-0005",
            title="Data Analytics for Academic Research",
            description="Exploratory data analytics and machine learning methods for experimental and empirical academic studies.",
            event_type="FDP",
            objectives="Equip researchers with statistical Python toolkits and visualization best practices.",
            target_audience="Interdisciplinary engineering faculty",
            eligibility="All teaching faculty",
            start_date=now + timedelta(days=25),
            end_date=now + timedelta(days=28),
            duration_hours=24.0,
            capacity=45,
            delivery_mode="ONLINE",
            venue="Online Virtual Lab",
            department_id=dept_it.id,
            coordinator_faculty_id=created_faculties[5].id,
            status="DRAFT",
            expected_outcomes="Empirical data pipelines established for ongoing research papers.",
            learning_outcomes="Proficiency in Pandas, NumPy, and statistical hypothesis testing.",
            estimated_budget=25000.0,
            actual_expenditure=0.0
        )
        db.add(evt_analytics)
        db.flush()

        # Proposals
        p1 = Proposal(event_id=evt_genai.id, submitted_by="Dr. Ayesha Khan", submitted_at=now - timedelta(days=5), approval_status="APPROVED", approver_name="Dr. Priya Iyer", approver_role="HOD", remarks="Approved unanimously. High alignment with department emerging technology goals.", reviewed_at=now - timedelta(days=4))
        p2 = Proposal(event_id=evt_cyber.id, submitted_by="Dr. Arjun Sharma", submitted_at=e1_start - timedelta(days=10), approval_status="APPROVED", approver_name="Dr. Vikram Singhania", approver_role="IQAC", remarks="Crucial technical training for security labs.", reviewed_at=e1_start - timedelta(days=9))
        db.add_all([p1, p2])
        db.flush()

        # 6. Registrations, Attendance, Assessments, Feedback, Certificates for Event 1 (Cybersecurity)
        # 6 faculty registered
        registered_fac_indices = [0, 1, 2, 5, 6, 9] # Ayesha Khan, Meera Rao, Arjun Sharma, Kavya Nair, Rohan Verma, Rahul Das
        for idx in registered_fac_indices:
            fac = created_faculties[idx]
            reg = Registration(
                event_id=evt_cyber.id,
                faculty_id=fac.id,
                registered_at=e1_start - timedelta(days=5),
                registration_status="CONFIRMED",
                eligibility_status="ELIGIBLE",
                completion_status="COMPLETED"
            )
            db.add(reg)
            
            # Attendance
            db.add(Attendance(event_id=evt_cyber.id, session_id=s1.id, faculty_id=fac.id, attendance_date=e1_start, attendance_status="PRESENT", attendance_method="QR"))
            db.add(Attendance(event_id=evt_cyber.id, session_id=s2.id, faculty_id=fac.id, attendance_date=e1_start + timedelta(days=1), attendance_status="PRESENT", attendance_method="MANUAL"))
        db.flush()

        # Assessments for Event 1 (Cybersecurity)
        pre_assess_cyber = Assessment(event_id=evt_cyber.id, assessment_type="PRE", title="Pre-Assessment: Cybersecurity Baseline", total_marks=100.0, passing_marks=50.0)
        post_assess_cyber = Assessment(event_id=evt_cyber.id, assessment_type="POST", title="Post-Assessment: Threat Defense Competency", total_marks=100.0, passing_marks=50.0)
        db.add_all([pre_assess_cyber, post_assess_cyber])
        db.flush()

        # Questions for Cyber Assessments
        db.add(AssessmentQuestion(assessment_id=pre_assess_cyber.id, question_text="Which principle is core to Zero Trust architecture?", option_a="Never Trust, Always Verify", option_b="Trust Internal Network by Default", option_c="Use Single Factor Authentication", option_d="Disable Logging", correct_option="a", marks=50.0, explanation="Zero trust requires continuous validation of all actors."))
        db.add(AssessmentQuestion(assessment_id=pre_assess_cyber.id, question_text="What is the primary role of a DMZ in university networks?", option_a="Isolate public-facing services", option_b="Speed up student Wi-Fi", option_c="Store student grades unencrypted", option_d="Bypass institutional firewalls", correct_option="a", marks=50.0, explanation="A DMZ segments external exposure from internal databases."))

        db.add(AssessmentQuestion(assessment_id=post_assess_cyber.id, question_text="In threat modeling, what does the STRIDE methodology evaluate?", option_a="Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege", option_b="Storage, Transmission, Routing, IP, DNS, Encryption", option_c="Single Sign-on, Tokenization, Refresh, Ingestion, Decoding", option_d="Standardization, Throughput, Resilience, Inspection", correct_option="a", marks=50.0, explanation="STRIDE is the premier threat identification framework."))
        db.add(AssessmentQuestion(assessment_id=post_assess_cyber.id, question_text="Which defense most effectively mitigates internal lateral movement following credential compromise?", option_a="Microsegmentation and least privilege access", option_b="Increasing firewall buffer sizes", option_c="Disabling HTTPS certificates", option_d="Using shared administrator logins", correct_option="a", marks=50.0, explanation="Microsegmentation confines compromised credentials."))
        db.flush()

        # Attempts for Cyber Assessments: PRE avg = 54%, POST avg = 86% -> +32 percentage points!
        pre_scores = [50.0, 50.0, 60.0, 50.0, 60.0, 50.0]
        post_scores = [85.0, 90.0, 90.0, 80.0, 85.0, 85.0]
        for i, idx in enumerate(registered_fac_indices):
            fac = created_faculties[idx]
            db.add(AssessmentAttempt(assessment_id=pre_assess_cyber.id, faculty_id=fac.id, score=pre_scores[i], percentage=pre_scores[i], submitted_at=e1_start))
            db.add(AssessmentAttempt(assessment_id=post_assess_cyber.id, faculty_id=fac.id, score=post_scores[i], percentage=post_scores[i], submitted_at=e1_end))

            # Feedback
            db.add(Feedback(
                event_id=evt_cyber.id,
                faculty_id=fac.id,
                content_rating=5 if i % 2 == 0 else 4,
                trainer_rating=5,
                relevance_rating=5,
                practical_rating=4,
                organization_rating=5,
                comments="Trainer highly rated and concepts explained clearly. Content highly relevant to modern engineering syllabus.",
                suggestions="Session duration too long without breaks; practical laboratory activities could be extended."
            ))

            # Certificate
            cert_code = f"FFAI-FDP-2026-{210 + i:06d}"
            token = f"TOKEN-CYBER-{fac.id}-{uuid.uuid4().hex[:8].upper()}"
            db.add(Certificate(
                certificate_code=cert_code,
                event_id=evt_cyber.id,
                faculty_id=fac.id,
                issue_date=e1_end,
                training_hours=evt_cyber.duration_hours,
                verification_token=token,
                qr_data=json.dumps({"code": cert_code, "token": token, "name": fac.full_name, "event": evt_cyber.title}),
                status="VALID"
            ))
        db.flush()

        # Event 4 (Generative AI) Pre & Post Assessments setup for interactive demo
        pre_assess_genai = Assessment(event_id=evt_genai.id, assessment_type="PRE", title="Pre-Assessment: Generative AI Foundations", total_marks=100.0, passing_marks=50.0)
        post_assess_genai = Assessment(event_id=evt_genai.id, assessment_type="POST", title="Post-Assessment: LLM Implementation & Pedagogy", total_marks=100.0, passing_marks=50.0)
        db.add_all([pre_assess_genai, post_assess_genai])
        db.flush()

        db.add(AssessmentQuestion(assessment_id=pre_assess_genai.id, question_text="What is the core mechanism enabling sequence-to-sequence reasoning in Transformer models?", option_a="Self-Attention Mechanism", option_b="Recurrent Hidden Units", option_c="Static Markov Chains", option_d="Convolutional Kernel Stride", correct_option="a", marks=50.0, explanation="Self-attention allows dynamic relational weighting across token contexts."))
        db.add(AssessmentQuestion(assessment_id=pre_assess_genai.id, question_text="In prompt engineering, what does 'Few-Shot Learning' signify?", option_a="Providing explicit input-output demonstration exemplars within the context prompt", option_b="Fine-tuning all billions of model weights on a GPU cluster", option_c="Limiting model generation to two words", option_d="Restarting the model process 3 times", correct_option="a", marks=50.0, explanation="Few-shot prompts provide exemplar pairs to prime in-context pattern completion."))

        db.add(AssessmentQuestion(assessment_id=post_assess_genai.id, question_text="Which approach minimizes factual hallucinations when deploying generative LLMs on institutional course materials?", option_a="Retrieval-Augmented Generation (RAG) using dense vector embeddings", option_b="Increasing the sampling temperature parameter to 1.8", option_c="Decreasing the input prompt length", option_d="Disabling all guardrail layers", correct_option="a", marks=50.0, explanation="RAG grounds model responses directly in authoritative retrieved syllabus documents."))
        db.add(AssessmentQuestion(assessment_id=post_assess_genai.id, question_text="How should Course Outcomes (COs) for Generative AI labs be evaluated in Outcome-Based Education?", option_a="By measuring normalized learning gains and rubric-scored student capstone projects", option_b="By counting total lines of code generated without execution", option_c="By student physical attendance alone", option_d="By multiple-choice memorization tests only", correct_option="a", marks=50.0, explanation="OBE requires demonstrable competency and measurable cognitive growth."))
        db.flush()

        # Pre-seed Skill Gaps for Dr. Ayesha Khan (Matches Demo Scenario Step 3)
        # Dr. Ayesha Khan ID: created_faculties[0].id
        ayesha_id = created_faculties[0].id
        db.add(SkillGap(
            faculty_id=ayesha_id,
            skill_name="Generative AI",
            current_level="BEGINNER",
            required_level="INTERMEDIATE",
            gap_score=82.0,
            priority="HIGH",
            explanation="Faculty teaches AI-related subjects but has no recent Generative AI training.",
            identified_at=now,
            status="ACTIVE"
        ))
        db.add(SkillGap(
            faculty_id=ayesha_id,
            skill_name="Research Methodology",
            current_level="BEGINNER",
            required_level="INTERMEDIATE",
            gap_score=62.0,
            priority="MEDIUM",
            explanation="Research interest exists but recent research-methodology training is absent.",
            identified_at=now,
            status="ACTIVE"
        ))

        # Pre-seed Recommendation for Dr. Ayesha Khan (Matches Demo Scenario Step 4)
        db.add(TrainingRecommendation(
            faculty_id=ayesha_id,
            title="Generative AI for Engineering Education",
            topic="Generative AI",
            priority="HIGH",
            reason="Addresses a high-priority skill gap; Matches teaching interests; No similar recent FDP completed",
            recommended_duration="3 Days",
            recommended_event_id=evt_genai.id,
            confidence_score=0.91,
            generated_at=now,
            status="PENDING"
        ))

        # Calculate initial compliances for all faculty
        for fac in created_faculties:
            comp_hours = 24.0 if fac.id in [created_faculties[i].id for i in registered_fac_indices] else 0.0
            if fac.id == created_faculties[1].id: # Meera Rao (Associate Prof)
                comp_hours = 48.0 # fully compliant
            elif fac.id == created_faculties[4].id: # Farhan Ali (Professor)
                comp_hours = 40.0
            
            req = 40.0
            status = "COMPLIANT" if comp_hours >= req else ("ATTENTION_REQUIRED" if comp_hours >= 20.0 else "NON_COMPLIANT")
            db.add(FacultyCompliance(
                faculty_id=fac.id,
                compliance_rule_id=rule_annual.id,
                completed_hours=comp_hours,
                required_hours=req,
                compliance_percentage=min(100.0, round((comp_hours / req) * 100.0, 1)),
                status=status,
                last_calculated=now
            ))

        # Additional Demo Data for Extensions:
        # 1. Ensure Dr. Meera Rao has Research Methodology (ADVANCED) for high-confidence peer mentor match
        meera_id = created_faculties[1].id
        db.add(FacultySkill(
            faculty_id=meera_id,
            skill_name="Research Methodology",
            proficiency_level="ADVANCED",
            source="FDP_ASSESSMENT",
            verification_status="VERIFIED"
        ))

        # 2. Pre-seed Skill Evidence for Dr. Ayesha Khan (Feature 2)
        db.add_all([
            SkillEvidence(
                faculty_id=ayesha_id,
                skill_name="Generative AI",
                evidence_type="ASSESSMENT",
                evidence_reference="Post-Assessment: Generative AI Foundations & LLM Lab (Score: 86%)",
                score=86.0,
                verified=True,
                verified_by="HOD CSE & IQAC Evaluator",
                created_at=now - timedelta(days=8)
            ),
            SkillEvidence(
                faculty_id=ayesha_id,
                skill_name="Generative AI",
                evidence_type="CERTIFICATE",
                evidence_reference="Certificate of Competency: FFAI-FDP-2026-000210",
                score=100.0,
                verified=True,
                verified_by="University Academic Registrar",
                created_at=now - timedelta(days=7)
            ),
            SkillEvidence(
                faculty_id=ayesha_id,
                skill_name="Generative AI",
                evidence_type="PRACTICAL_ACTIVITY",
                evidence_reference="Hands-on RAG lab implementation and syllabus course outcome mapping",
                score=90.0,
                verified=True,
                verified_by="Dean of Academic Development",
                created_at=now - timedelta(days=5)
            ),
            SkillEvidence(
                faculty_id=ayesha_id,
                skill_name="Cybersecurity",
                evidence_type="WORKSHOP_COMPLETION",
                evidence_reference="24-Hour Defensive Threat Modeling STTP Completion",
                score=85.0,
                verified=True,
                verified_by="Centre for Cyber Defense",
                created_at=now - timedelta(days=15)
            )
        ])

        # 3. Pre-seed Teaching Impact for Dr. Ayesha Khan and Dr. Arjun Sharma (Feature 3)
        db.add_all([
            TeachingImpact(
                faculty_id=ayesha_id,
                event_id=evt_cyber.id,
                skill_name="Generative AI",
                application_type="CLASSROOM",
                application_description="Used GenAI to create adaptive quizzes and formative problem sets for Data Structures course (CS301).",
                evidence_url="https://lms.university.edu/courses/cs301/adaptive-quizzes",
                self_rating=5.0,
                reviewer_rating=4.8,
                impact_status="APPLIED",
                applied_at=now - timedelta(days=6),
                created_at=now - timedelta(days=6)
            ),
            TeachingImpact(
                faculty_id=created_faculties[2].id, # Dr. Arjun Sharma
                event_id=evt_cyber.id,
                skill_name="Cybersecurity",
                application_type="LAB",
                application_description="Configured defensive network segmentation and vulnerability scanners for undergraduate ethical hacking laboratory.",
                evidence_url="https://cyberlab.university.edu/modules/threat-defense",
                self_rating=5.0,
                reviewer_rating=5.0,
                impact_status="VERIFIED",
                applied_at=now - timedelta(days=12),
                created_at=now - timedelta(days=12)
            )
        ])

        db.commit()

seed_service = SeedService()
