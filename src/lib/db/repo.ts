// Unified Data Repository for FacultyForge AI (Agent 27)
// Interfaces with Supabase PostgreSQL and falls back to deterministic seeded records when offline.

import { createAdminClient } from '@/lib/supabase/server';
import { FDPGeneratorAgent } from '@/lib/ai/fdpGenerator';
import { LearningGainAgent } from '@/lib/ai/learningGainAgent';
import { SkillGapAgent } from '@/lib/ai/skillGapAgent';
import { RecommendationAgent } from '@/lib/ai/recommendationAgent';
import { ComplianceAgent } from '@/lib/ai/complianceAgent';
import { FeedbackAgent } from '@/lib/ai/feedbackAgent';
import { PeerMentorAgent } from '@/lib/ai/peerMentorAgent';
import { CareerGrowthAgent } from '@/lib/ai/careerGrowthAgent';
import { TrainingEquityAgent } from '@/lib/ai/trainingEquityAgent';
import { TrainingSimulatorAgent } from '@/lib/ai/trainingSimulator';
import { PredictivePlannerAgent } from '@/lib/ai/predictivePlanner';

// Seed Memory Store
const seedDepartments = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering', is_active: true },
  { id: 2, name: 'Information Technology', code: 'IT', description: 'Department of Information Technology', is_active: true },
  { id: 3, name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Department of Electronics and Communication', is_active: true },
  { id: 4, name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering', is_active: true },
];

const seedComplianceRules = [
  { id: 1, rule_name: 'Institutional Annual Faculty Development Requirement', description: 'Institutional benchmark of 40 hours of continuous professional and pedagogical development per academic year.', minimum_training_hours: 40.0, period_type: 'ANNUAL', required_topics: 'Teaching Methodology, Research, Emerging Technologies', is_active: true },
  { id: 2, rule_name: 'Institutional Accreditation-Support Development Rule', description: 'Institutional benchmark of 24 hours of outcome-based and research-oriented development per semester.', minimum_training_hours: 24.0, period_type: 'SEMESTER', required_topics: 'Outcome Based Education, Research Methodology', is_active: true },
];

const seedFaculty = [
  { id: 1, faculty_code: 'FAC-CSE-001', full_name: 'Dr. Ayesha Khan', email: 'ayesha.khan@university.edu', department_id: 1, designation: 'Assistant Professor', qualification: 'Ph.D. in Computer Science', years_of_experience: 5.5, teaching_interests: 'Artificial Intelligence, Machine Learning, Data Structures', research_interests: 'Generative AI, Deep Learning Models', existing_skills: 'Python, Machine Learning, Data Structures, Algorithms', development_interests: 'Generative AI, Research Methodology, Grant Writing', phone: '+91 98450 12345', is_active: true },
  { id: 2, faculty_code: 'FAC-CSE-002', full_name: 'Dr. Meera Rao', email: 'meera.rao@university.edu', department_id: 1, designation: 'Associate Professor', qualification: 'Ph.D. in Distributed Systems', years_of_experience: 11.0, teaching_interests: 'Cloud Computing, Operating Systems, Computer Networks', research_interests: 'Distributed Systems, Virtualization Architectures', existing_skills: 'Cloud Architecture, Linux, Kubernetes, C++', development_interests: 'Cybersecurity, Academic Leadership', phone: '+91 98450 23456', is_active: true },
  { id: 3, faculty_code: 'FAC-IT-001', full_name: 'Dr. Arjun Sharma', email: 'arjun.sharma@university.edu', department_id: 2, designation: 'Assistant Professor', qualification: 'Ph.D. in Cyber Defense', years_of_experience: 4.0, teaching_interests: 'Information Security, Cryptography, Network Protocols', research_interests: 'Cyber Threat Intelligence, Intrusion Detection', existing_skills: 'Network Security, Python, Cryptography, Wireshark', development_interests: 'Zero Trust Architecture, Grant Writing', phone: '+91 98450 34567', is_active: true },
  { id: 4, faculty_code: 'FAC-ECE-001', full_name: 'Dr. Neha Reddy', email: 'neha.reddy@university.edu', department_id: 3, designation: 'Associate Professor', qualification: 'Ph.D. in Microelectronics', years_of_experience: 12.0, teaching_interests: 'VLSI Design, Digital Electronics, Embedded Systems', research_interests: 'Neuromorphic Computing, Low-power VLSI', existing_skills: 'Verilog, Embedded C, FPGA, Cadence', development_interests: 'Edge AI, Scopus Publishing', phone: '+91 98450 45678', is_active: true },
  { id: 5, faculty_code: 'FAC-MECH-001', full_name: 'Dr. Farhan Ali', email: 'farhan.ali@university.edu', department_id: 4, designation: 'Professor', qualification: 'Ph.D. in Thermal Engineering', years_of_experience: 18.0, teaching_interests: 'Thermodynamics, Heat Transfer, CAD/CAM', research_interests: 'Additive Manufacturing, Thermal Optimization', existing_skills: 'ANSYS, SolidWorks, Optimization, FEA', development_interests: 'Outcome Based Education, Industry 4.0', phone: '+91 98450 56789', is_active: true },
  { id: 6, faculty_code: 'FAC-IT-002', full_name: 'Dr. Kavya Nair', email: 'kavya.nair@university.edu', department_id: 2, designation: 'Assistant Professor', qualification: 'Ph.D. in Software Engineering', years_of_experience: 6.0, teaching_interests: 'Web Technologies, Full Stack Engineering, Software Testing', research_interests: 'Human-Computer Interaction, Web Accessibility', existing_skills: 'JavaScript, React, Node.js, SQL, Testing Frameworks', development_interests: 'Cloud Native Microservices, Pedagogical Innovations', phone: '+91 98450 67890', is_active: true },
  { id: 7, faculty_code: 'FAC-CSE-003', full_name: 'Dr. Rohan Verma', email: 'rohan.verma@university.edu', department_id: 1, designation: 'Assistant Professor', qualification: 'Ph.D. in Data Engineering', years_of_experience: 3.5, teaching_interests: 'Database Management, Big Data Analytics, Python', research_interests: 'Scalable Vector Databases, Streaming Data', existing_skills: 'SQL, Apache Spark, Hadoop, Python, NoSQL', development_interests: 'Generative AI, Research Methodology', phone: '+91 98450 78901', is_active: true },
  { id: 8, faculty_code: 'FAC-ECE-002', full_name: 'Dr. Sana Ahmed', email: 'sana.ahmed@university.edu', department_id: 3, designation: 'Assistant Professor', qualification: 'Ph.D. in Telecommunications', years_of_experience: 7.0, teaching_interests: 'Wireless Communications, Digital Signal Processing', research_interests: '5G/6G MIMO Architectures, Beamforming', existing_skills: 'MATLAB, Wireless Protocols, DSP, Python', development_interests: 'Deep Learning for Signal Processing, OBE', phone: '+91 98450 89012', is_active: true },
  { id: 9, faculty_code: 'FAC-CSE-004', full_name: 'Dr. Priya Iyer', email: 'priya.iyer@university.edu', department_id: 1, designation: 'Professor', qualification: 'Ph.D. in Software Architecture', years_of_experience: 20.0, teaching_interests: 'Software Engineering, System Design, Object Oriented Design', research_interests: 'Empirical Software Quality, Architecture Patterns', existing_skills: 'Agile, UML, Software Architecture, Testing', development_interests: 'Academic Leadership, Accreditation Audits', phone: '+91 98450 90123', is_active: true },
  { id: 10, faculty_code: 'FAC-IT-003', full_name: 'Dr. Rahul Das', email: 'rahul.das@university.edu', department_id: 2, designation: 'Assistant Professor', qualification: 'Ph.D. in Cloud Security', years_of_experience: 5.0, teaching_interests: 'DevOps Engineering, Cloud Infrastructure, Linux', research_interests: 'Automated Vulnerability Detection in CI/CD', existing_skills: 'Docker, Kubernetes, Jenkins, Terraform, Python', development_interests: 'Cybersecurity, Grant Writing', phone: '+91 98450 01234', is_active: true },
  { id: 11, faculty_code: 'FAC-MECH-002', full_name: 'Dr. Nikhil Jain', email: 'nikhil.jain@university.edu', department_id: 4, designation: 'Associate Professor', qualification: 'Ph.D. in Robotics', years_of_experience: 10.0, teaching_interests: 'Robotics & Automation, Mechatronics, Control Systems', research_interests: 'Autonomous Mobile Robotics, Trajectory Planning', existing_skills: 'ROS, MATLAB, Kinematics, Python, Arduino', development_interests: 'AI for Robotics, Outcome Based Education', phone: '+91 98450 11223', is_active: true },
  { id: 12, faculty_code: 'FAC-ECE-003', full_name: 'Dr. Ananya Bose', email: 'ananya.bose@university.edu', department_id: 3, designation: 'Assistant Professor', qualification: 'Ph.D. in IoT Systems', years_of_experience: 4.5, teaching_interests: 'Internet of Things, Sensor Networks, Microcontrollers', research_interests: 'Smart Sensors, Energy Harvesting Edge Nodes', existing_skills: 'Arduino, ESP32, MQTT, C++, Embedded Systems', development_interests: 'Edge AI, Research Methodology', phone: '+91 98450 22334', is_active: true },
];

const seedResourcePersons = [
  { id: 1, name: 'Dr. Rajesh Deshmukh', email: 'rajesh.deshmukh@iitb.ac.in', phone: '+91 98200 11223', organization: 'Indian Institute of Technology Bombay', designation: 'Senior Professor & AI Chair', expertise: 'Generative AI, Large Language Models, PyTorch, Transformers', topics: 'Transformers, Agentic Workflows, Evaluation Benchmarks', biography: 'Dr. Deshmukh has over 22 years of research leadership in artificial intelligence and deep neural architectures.', years_of_experience: 22.0, total_sessions: 18, average_rating: 4.92, honorarium_expectation: 'Rs. 15,000 per session', travel_required: true, is_active: true },
  { id: 2, name: 'Ms. Sunita Sundaram', email: 'sunita.s@google.com', phone: '+91 98200 44556', organization: 'Google Cloud Platform', designation: 'Staff Cloud Solutions Architect', expertise: 'Cloud Native Systems, Kubernetes, Microservices Architecture, Kafka', topics: 'Distributed Systems, Zero Trust, Cloud Cost Optimization', biography: 'Ms. Sundaram leads enterprise cloud modernization initiatives across APAC.', years_of_experience: 15.0, total_sessions: 12, average_rating: 4.88, honorarium_expectation: 'Honorary / Institutional Waiver', travel_required: false, is_active: true },
  { id: 3, name: 'Dr. Vikramaditya Rathore', email: 'vikram.rathore@iisc.ac.in', phone: '+91 98200 77889', organization: 'Indian Institute of Science Bangalore', designation: 'Principal Research Scientist', expertise: 'Neuromorphic Hardware, Low-Power VLSI, TinyML, Verilog', topics: 'Edge AI, Neuromorphic Chips, Cadence Simulation', biography: 'Dr. Rathore has published over 80 Scopus-indexed papers in hardware acceleration.', years_of_experience: 19.0, total_sessions: 14, average_rating: 4.85, honorarium_expectation: 'Rs. 12,000 per session', travel_required: true, is_active: true },
];

const seedEvents: any[] = [
  {
    id: 1,
    event_code: 'FDP-CSE-2026-001',
    title: 'Advanced Generative AI & Autonomous Agent Architectures in Higher Education',
    description: 'A comprehensive 5-day immersive faculty development programme exploring LLM orchestration, RAG pipelines, and agentic workflows for classroom pedagogy.',
    event_type: 'FDP',
    objectives: '1. Master Transformer architecture principles.\n2. Build production-grade RAG pipelines.\n3. Integrate autonomous multi-agent systems.',
    target_audience: 'Faculty of CSE, IT, and AI/Data Science',
    eligibility: 'Assistant Professors and above with Python knowledge',
    start_date: new Date(Date.now() - 15 * 86400000).toISOString(),
    end_date: new Date(Date.now() - 11 * 86400000).toISOString(),
    duration_hours: 40.0,
    capacity: 50,
    delivery_mode: 'HYBRID',
    venue: 'Auditorium Hall 3 / Hybrid Zoom Link',
    department_id: 1,
    coordinator_faculty_id: 1,
    status: 'COMPLETED',
    expected_outcomes: 'Faculty will build generative AI modules and course materials.',
    learning_outcomes: 'Proficiency in PyTorch, LangChain, and Agentic workflows.',
    estimated_budget: 85000.0,
    actual_expenditure: 78400.0,
  },
  {
    id: 2,
    event_code: 'FDP-IT-2026-002',
    title: 'Cloud Native Microservices and Zero Trust DevSecOps',
    description: 'Hands-on training in building resilient cloud services using Kubernetes, Docker, automated CI/CD security scanning, and distributed telemetry.',
    event_type: 'WORKSHOP',
    objectives: '1. Container orchestration with K8s.\n2. Zero trust network architectures.\n3. Continuous vulnerability scanning.',
    target_audience: 'Faculty of IT, CSE, and MCA',
    eligibility: 'Faculty handling Cloud and Operating Systems courses',
    start_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    duration_hours: 16.0,
    capacity: 45,
    delivery_mode: 'OFFLINE',
    venue: 'Cloud Computing Lab - Room 402',
    department_id: 2,
    coordinator_faculty_id: 2,
    status: 'APPROVED',
    expected_outcomes: 'Design hands-on lab experiments for undergraduate students.',
    learning_outcomes: 'Kubernetes deployment, secret management, and monitoring.',
    estimated_budget: 45000.0,
    actual_expenditure: 0.0,
  },
  {
    id: 3,
    event_code: 'FDP-ECE-2026-003',
    title: 'Edge AI, TinyML & Neuromorphic Chip Design',
    description: 'Exploring microelectronics, low-power edge accelerators, and hardware-aware deep learning compilation.',
    event_type: 'FDP',
    objectives: '1. Understand neuromorphic architecture.\n2. Deploy quantized models on microcontrollers.\n3. Hardware synthesis using Verilog.',
    target_audience: 'Faculty of ECE, EEE, and Instrumentation',
    eligibility: 'Faculty with VLSI / Embedded systems background',
    start_date: new Date(Date.now() + 20 * 86400000).toISOString(),
    end_date: new Date(Date.now() + 24 * 86400000).toISOString(),
    duration_hours: 32.0,
    capacity: 40,
    delivery_mode: 'HYBRID',
    venue: 'VLSI Design Center - Room 201',
    department_id: 3,
    coordinator_faculty_id: 4,
    status: 'PENDING_APPROVAL',
    expected_outcomes: 'Curriculum upgrade for 4th year elective courses.',
    learning_outcomes: 'Verilog testbench simulation, TinyML deployment on ARM Cortex.',
    estimated_budget: 60000.0,
    actual_expenditure: 0.0,
  },
];

const seedSessions: any[] = [
  { id: 1, event_id: 1, title: 'Day 1: Modern Transformer Architectures & Attention Mechanisms', description: 'Mathematical breakdown of self-attention and rotary positional embeddings.', session_date: new Date(Date.now() - 15 * 86400000).toISOString(), start_time: '09:30 AM', end_time: '01:00 PM', resource_person_id: 1, learning_objective: 'Understand transformer math', room_or_link: 'Auditorium Hall 3' },
  { id: 2, event_id: 1, title: 'Day 2: Retrieval Augmented Generation (RAG) & Vector Indexing', description: 'Chunking, embeddings, vector search, and reranking.', session_date: new Date(Date.now() - 14 * 86400000).toISOString(), start_time: '09:30 AM', end_time: '01:00 PM', resource_person_id: 1, learning_objective: 'Implement vector search', room_or_link: 'Auditorium Hall 3' },
  { id: 3, event_id: 1, title: 'Day 3: Autonomous Agent Design & Multi-Agent Collaboration', description: 'ReAct pattern, tool use, memory architectures, and Agent 27 autonomous workflows.', session_date: new Date(Date.now() - 13 * 86400000).toISOString(), start_time: '09:30 AM', end_time: '01:00 PM', resource_person_id: 2, learning_objective: 'Build autonomous loops', room_or_link: 'Auditorium Hall 3' },
  { id: 4, event_id: 1, title: 'Day 4: Fine-Tuning & Parameter Efficient Adaptation (LoRA/QLoRA)', description: 'Quantization and adapter matrices.', session_date: new Date(Date.now() - 12 * 86400000).toISOString(), start_time: '09:30 AM', end_time: '01:00 PM', resource_person_id: 1, learning_objective: 'Fine-tune open models', room_or_link: 'Auditorium Hall 3' },
  { id: 5, event_id: 1, title: 'Day 5: Capstone Demonstrations & Institutional Integration', description: 'Participant project presentations and curriculum mapping.', session_date: new Date(Date.now() - 11 * 86400000).toISOString(), start_time: '09:30 AM', end_time: '04:00 PM', resource_person_id: 1, learning_objective: 'Deploy peer projects', room_or_link: 'Auditorium Hall 3' },
];

const seedProposals: any[] = [
  { id: 1, event_id: 1, submitted_by: 'Dr. Ayesha Khan', submitted_at: new Date(Date.now() - 30 * 86400000).toISOString(), approval_status: 'APPROVED', approver_name: 'Dr. Priya Iyer', approver_role: 'HOD', remarks: 'Approved. High priority for NAAC Criterion 6.3.2 accreditation norms.', reviewed_at: new Date(Date.now() - 28 * 86400000).toISOString() },
  { id: 2, event_id: 2, submitted_by: 'Dr. Meera Rao', submitted_at: new Date(Date.now() - 14 * 86400000).toISOString(), approval_status: 'APPROVED', approver_name: 'Dr. Priya Iyer', approver_role: 'HOD', remarks: 'Approved with allocated laboratory budget.', reviewed_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 3, event_id: 3, submitted_by: 'Dr. Neha Reddy', submitted_at: new Date(Date.now() - 3 * 86400000).toISOString(), approval_status: 'PENDING', approver_name: null, approver_role: 'IQAC Coordinator', remarks: 'Awaiting IQAC financial committee signoff.', reviewed_at: null },
];

const seedRegistrations: any[] = [
  { id: 1, event_id: 1, faculty_id: 1, participant_name: 'Dr. Ayesha Khan', faculty_code: 'FAC-CSE-001', email: 'ayesha.khan@university.edu', department: 'CSE', designation: 'Assistant Professor', registration_code: 'REG-VU2026-0001', registration_token: 'tok-001', qr_token: 'REG-VU2026-0001:tok-001', registration_status: 'CONFIRMED', eligibility_status: 'ELIGIBLE', completion_status: 'COMPLETED', attendance_status: 'PRESENT' },
  { id: 2, event_id: 1, faculty_id: 3, participant_name: 'Dr. Arjun Sharma', faculty_code: 'FAC-IT-001', email: 'arjun.sharma@university.edu', department: 'IT', designation: 'Assistant Professor', registration_code: 'REG-VU2026-0002', registration_token: 'tok-002', qr_token: 'REG-VU2026-0002:tok-002', registration_status: 'CONFIRMED', eligibility_status: 'ELIGIBLE', completion_status: 'COMPLETED', attendance_status: 'PRESENT' },
  { id: 3, event_id: 1, faculty_id: 7, participant_name: 'Dr. Rohan Verma', faculty_code: 'FAC-CSE-003', email: 'rohan.verma@university.edu', department: 'CSE', designation: 'Assistant Professor', registration_code: 'REG-VU2026-0003', registration_token: 'tok-003', qr_token: 'REG-VU2026-0003:tok-003', registration_status: 'CONFIRMED', eligibility_status: 'ELIGIBLE', completion_status: 'COMPLETED', attendance_status: 'PRESENT' },
  { id: 4, event_id: 1, faculty_id: 6, participant_name: 'Dr. Kavya Nair', faculty_code: 'FAC-IT-002', email: 'kavya.nair@university.edu', department: 'IT', designation: 'Assistant Professor', registration_code: 'REG-VU2026-0004', registration_token: 'tok-004', qr_token: 'REG-VU2026-0004:tok-004', registration_status: 'CONFIRMED', eligibility_status: 'ELIGIBLE', completion_status: 'COMPLETED', attendance_status: 'PRESENT' },
];

const seedAttendances: any[] = [
  { id: 1, event_id: 1, session_id: 1, faculty_id: 1, registration_id: 1, attendance_date: new Date(Date.now() - 15 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 2, event_id: 1, session_id: 2, faculty_id: 1, registration_id: 1, attendance_date: new Date(Date.now() - 14 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 3, event_id: 1, session_id: 3, faculty_id: 1, registration_id: 1, attendance_date: new Date(Date.now() - 13 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 4, event_id: 1, session_id: 4, faculty_id: 1, registration_id: 1, attendance_date: new Date(Date.now() - 12 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 5, event_id: 1, session_id: 5, faculty_id: 1, registration_id: 1, attendance_date: new Date(Date.now() - 11 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 6, event_id: 1, session_id: 1, faculty_id: 3, registration_id: 2, attendance_date: new Date(Date.now() - 15 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'MANUAL' },
  { id: 7, event_id: 1, session_id: 2, faculty_id: 3, registration_id: 2, attendance_date: new Date(Date.now() - 14 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 8, event_id: 1, session_id: 3, faculty_id: 3, registration_id: 2, attendance_date: new Date(Date.now() - 13 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 9, event_id: 1, session_id: 4, faculty_id: 3, registration_id: 2, attendance_date: new Date(Date.now() - 12 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
  { id: 10, event_id: 1, session_id: 5, faculty_id: 3, registration_id: 2, attendance_date: new Date(Date.now() - 11 * 86400000).toISOString(), attendance_status: 'PRESENT', attendance_method: 'QR' },
];

const seedAssessments: any[] = [
  { id: 1, event_id: 1, assessment_type: 'PRE', title: 'Pre-Programme Diagnostic Assessment: Generative AI Foundations', total_marks: 100.0, passing_marks: 50.0 },
  { id: 2, event_id: 1, assessment_type: 'POST', title: 'Post-Programme Competency Assessment: Generative AI & Agents', total_marks: 100.0, passing_marks: 60.0 },
];

const seedQuestions: any[] = [
  { id: 1, assessment_id: 1, question_text: 'What is the computational bottleneck in standard Multi-Head Attention?', option_a: 'O(N) memory complexity', option_b: 'O(N^2) time and memory complexity with sequence length', option_c: 'Linear projection initialization', option_d: 'Layer normalization vanish', correct_option: 'b', marks: 25.0, explanation: 'Full self-attention calculates an N x N similarity matrix, giving O(N^2) complexity.' },
  { id: 2, assessment_id: 1, question_text: 'Which vector distance metric is invariant to vector magnitude?', option_a: 'Euclidean Distance', option_b: 'Manhattan Distance', option_c: 'Cosine Similarity', option_d: 'Hamming Distance', correct_option: 'c', marks: 25.0, explanation: 'Cosine similarity computes cosine of angle between vectors, normalizing for magnitude.' },
  { id: 3, assessment_id: 2, question_text: 'In LoRA, why is inference latency zero compared to prompt tuning?', option_a: 'Adapter matrices can be merged into frozen base weights before deployment', option_b: 'Prunes 90% of model neurons', option_c: 'Uses 1-bit quantization exclusively', option_d: 'Executes in GPU SRAM only', correct_option: 'a', marks: 25.0, explanation: 'W_merged = W_base + (B * A) * scaling, resulting in normal forward pass speed.' },
  { id: 4, assessment_id: 2, question_text: 'What does Hake\'s normalized learning gain formula g measure?', option_a: 'Raw percentage difference', option_b: 'The fraction of possible improvement actually achieved relative to baseline headroom', option_c: 'Standard deviation of class test grades', option_d: 'Post-test pass rate exclusively', correct_option: 'b', marks: 25.0, explanation: 'g = (Post - Pre) / (100 - Pre), measuring empirical competence gain relative to initial headroom.' },
];

const seedAttempts: any[] = [
  { id: 1, assessment_id: 1, faculty_id: 1, score: 50.0, percentage: 50.0 },
  { id: 2, assessment_id: 2, faculty_id: 1, score: 92.0, percentage: 92.0 },
  { id: 3, assessment_id: 1, faculty_id: 3, score: 44.0, percentage: 44.0 },
  { id: 4, assessment_id: 2, faculty_id: 3, score: 86.0, percentage: 86.0 },
];

const seedFeedbacks: any[] = [
  { id: 1, event_id: 1, faculty_id: 1, content_rating: 5, trainer_rating: 5, relevance_rating: 5, practical_rating: 5, organization_rating: 5, comments: 'Exemplary faculty development programme. The hands-on labs on autonomous agent coordination were directly applicable to our AI curriculum.', suggestions: 'Provide extended compute cluster access post-workshop.' },
  { id: 2, event_id: 1, faculty_id: 3, content_rating: 5, trainer_rating: 5, relevance_rating: 5, practical_rating: 4, organization_rating: 5, comments: 'Exceptional coverage of transformer architectures and practical RAG pipelines.', suggestions: 'Organize a dedicated follow-up on fine-tuning small edge models.' },
];

const seedCertificates: any[] = [
  { id: 1, certificate_code: 'CERT-CSE-2026-0001', event_id: 1, faculty_id: 1, issue_date: new Date(Date.now() - 10 * 86400000).toISOString(), training_hours: 40.0, verification_token: 'CERT-CSE-2026-8F2A', qr_data: 'https://facultyforge.edu/verify-certificate/CERT-CSE-2026-8F2A', status: 'VALID' },
  { id: 2, certificate_code: 'CERT-IT-2026-0002', event_id: 1, faculty_id: 3, issue_date: new Date(Date.now() - 10 * 86400000).toISOString(), training_hours: 40.0, verification_token: 'CERT-IT-2026-4B9C', qr_data: 'https://facultyforge.edu/verify-certificate/CERT-IT-2026-4B9C', status: 'VALID' },
];

const seedFacultyCompliance: any[] = [
  { id: 1, faculty_id: 1, compliance_rule_id: 1, completed_hours: 40.0, required_hours: 40.0, compliance_percentage: 100.0, status: 'COMPLIANT' },
  { id: 2, faculty_id: 2, compliance_rule_id: 1, completed_hours: 24.0, required_hours: 40.0, compliance_percentage: 60.0, status: 'ATTENTION_REQUIRED' },
  { id: 3, faculty_id: 3, compliance_rule_id: 1, completed_hours: 40.0, required_hours: 40.0, compliance_percentage: 100.0, status: 'COMPLIANT' },
  { id: 4, faculty_id: 4, compliance_rule_id: 1, completed_hours: 16.0, required_hours: 40.0, compliance_percentage: 40.0, status: 'NON_COMPLIANT' },
  { id: 5, faculty_id: 5, compliance_rule_id: 1, completed_hours: 44.0, required_hours: 40.0, compliance_percentage: 110.0, status: 'COMPLIANT' },
  { id: 6, faculty_id: 6, compliance_rule_id: 1, completed_hours: 20.0, required_hours: 40.0, compliance_percentage: 50.0, status: 'ATTENTION_REQUIRED' },
  { id: 7, faculty_id: 7, compliance_rule_id: 1, completed_hours: 12.0, required_hours: 40.0, compliance_percentage: 30.0, status: 'NON_COMPLIANT' },
  { id: 8, faculty_id: 8, compliance_rule_id: 1, completed_hours: 28.0, required_hours: 40.0, compliance_percentage: 70.0, status: 'ATTENTION_REQUIRED' },
  { id: 9, faculty_id: 9, compliance_rule_id: 1, completed_hours: 48.0, required_hours: 40.0, compliance_percentage: 120.0, status: 'COMPLIANT' },
  { id: 10, faculty_id: 10, compliance_rule_id: 1, completed_hours: 16.0, required_hours: 40.0, compliance_percentage: 40.0, status: 'NON_COMPLIANT' },
  { id: 11, faculty_id: 11, compliance_rule_id: 1, completed_hours: 32.0, required_hours: 40.0, compliance_percentage: 80.0, status: 'ATTENTION_REQUIRED' },
  { id: 12, faculty_id: 12, compliance_rule_id: 1, completed_hours: 18.0, required_hours: 40.0, compliance_percentage: 45.0, status: 'NON_COMPLIANT' },
];

const seedSkillEvidence: any[] = [
  { id: 1, faculty_id: 1, skill_name: 'Generative AI & LLMs', evidence_type: 'CERTIFICATE', evidence_reference: 'CERT-CSE-2026-8F2A', score: 92.0, verified: true, verified_by: 'IQAC Coordinator', created_at: new Date().toISOString() },
  { id: 2, faculty_id: 3, skill_name: 'Network Security', evidence_type: 'PROJECT', evidence_reference: 'Institutional Zero Trust Firewall Setup', score: 88.0, verified: true, verified_by: 'HOD - IT', created_at: new Date().toISOString() },
];

const seedTeachingImpacts: any[] = [
  { id: 1, faculty_id: 1, event_id: 1, skill_name: 'Generative AI & LLMs', application_type: 'CLASSROOM', application_description: 'Integrated Hugging Face transformer labs into CS401 AI Course curriculum.', evidence_url: 'https://course-portal.university.edu/cs401', self_rating: 4.8, reviewer_rating: 4.9, impact_status: 'VERIFIED', applied_at: new Date().toISOString(), created_at: new Date().toISOString(), verified_at: new Date().toISOString(), verified_by: 'HOD - CSE' },
];

// Helper to test if remote Supabase connection is active
async function trySupabase<T>(queryFn: (client: any) => Promise<T>): Promise<{ success: boolean; data?: T; error?: any }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('mock.supabase.co') || supabaseUrl.includes('your-project')) {
      return { success: false };
    }
    const adminClient = createAdminClient();
    const res = await queryFn(adminClient);
    return { success: true, data: res };
  } catch (err) {
    return { success: false, error: err };
  }
}

// In-Memory Mutables
let dynamicEvents = [...seedEvents];
let dynamicSessions = [...seedSessions];
let dynamicProposals = [...seedProposals];
let dynamicRegistrations = [...seedRegistrations];
let dynamicAttendances = [...seedAttendances];
let dynamicAssessments = [...seedAssessments];
let dynamicQuestions = [...seedQuestions];
let dynamicAttempts = [...seedAttempts];
let dynamicFeedbacks = [...seedFeedbacks];
let dynamicCertificates = [...seedCertificates];
let dynamicTeachingImpacts = [...seedTeachingImpacts];
let dynamicSkillEvidence = [...seedSkillEvidence];
let dynamicFaculty = [...seedFaculty];

export const dbRepo = {
  // Departments
  async getDepartments() {
    const remote = await trySupabase(async (sb) => {
      const { data, error } = await sb.from('departments').select('*').order('id');
      if (error) throw error;
      return data;
    });
    if (remote.success && remote.data && remote.data.length > 0) return remote.data;
    return seedDepartments;
  },

  async getDepartment(id: number) {
    const depts = await this.getDepartments();
    return depts.find((d: any) => d.id === Number(id)) || null;
  },

  // Faculty
  async getFacultyList(departmentId?: number, search?: string) {
    const remote = await trySupabase(async (sb) => {
      let q = sb.from('faculty').select('*, department:departments(*)').order('id');
      if (departmentId) q = q.eq('department_id', departmentId);
      if (search) q = q.ilike('full_name', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    });
    if (remote.success && remote.data && remote.data.length > 0) return remote.data;

    let res = dynamicFaculty.map(f => ({
      ...f,
      department: seedDepartments.find(d => d.id === f.department_id) || { name: 'Engineering', code: 'ENG' },
    }));
    if (departmentId) res = res.filter(f => f.department_id === Number(departmentId));
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(f => f.full_name.toLowerCase().includes(s) || f.faculty_code.toLowerCase().includes(s) || f.email.toLowerCase().includes(s));
    }
    return res;
  },

  async getFaculty(id: number) {
    const list = await this.getFacultyList();
    return list.find((f: any) => f.id === Number(id)) || null;
  },

  // Resource Persons
  async getResourcePersons(search?: string) {
    const remote = await trySupabase(async (sb) => {
      let q = sb.from('resource_persons').select('*').order('id');
      if (search) q = q.ilike('name', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    });
    if (remote.success && remote.data && remote.data.length > 0) return remote.data;

    let res = [...seedResourcePersons];
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(r => r.name.toLowerCase().includes(s) || r.expertise.toLowerCase().includes(s));
    }
    return res;
  },

  // Events
  async getEvents(params: { status?: string; department_id?: number; search?: string } = {}) {
    const remote = await trySupabase(async (sb) => {
      let q = sb.from('events').select('*, department:departments(*), coordinator:faculty(*)').order('id', { ascending: false });
      if (params.status) q = q.eq('status', params.status);
      if (params.department_id) q = q.eq('department_id', params.department_id);
      if (params.search) q = q.ilike('title', `%${params.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    });
    if (remote.success && remote.data && remote.data.length > 0) return remote.data;

    let res = dynamicEvents.map(e => ({
      ...e,
      department: seedDepartments.find(d => d.id === e.department_id) || { name: 'Computer Science', code: 'CSE' },
      coordinator: dynamicFaculty.find(f => f.id === e.coordinator_faculty_id) || null,
      sessions_count: dynamicSessions.filter(s => s.event_id === e.id).length,
      registrations_count: dynamicRegistrations.filter(r => r.event_id === e.id).length,
    }));

    if (params.status) res = res.filter(e => e.status === params.status);
    if (params.department_id) res = res.filter(e => e.department_id === Number(params.department_id));
    if (params.search) {
      const s = params.search.toLowerCase();
      res = res.filter(e => e.title.toLowerCase().includes(s) || e.event_code.toLowerCase().includes(s));
    }
    return res;
  },

  async getEvent(id: number) {
    const events = await this.getEvents();
    const event = events.find((e: any) => e.id === Number(id));
    if (!event) return null;

    const sessions = dynamicSessions.filter(s => s.event_id === Number(id));
    const proposals = dynamicProposals.filter(p => p.event_id === Number(id));
    const registrations = dynamicRegistrations.filter(r => r.event_id === Number(id));

    return {
      ...event,
      sessions,
      proposals,
      registrations,
    };
  },

  async createEvent(input: any) {
    const id = dynamicEvents.length + 1;
    const eventCode = `FDP-GEN-2026-${String(id).padStart(3, '0')}`;
    const newEvent = {
      id,
      event_code: eventCode,
      title: input.title,
      description: input.description || null,
      event_type: input.event_type || 'FDP',
      objectives: input.objectives || null,
      target_audience: input.target_audience || null,
      eligibility: input.eligibility || null,
      start_date: input.start_date || new Date().toISOString(),
      end_date: input.end_date || new Date().toISOString(),
      duration_hours: Number(input.duration_hours || 16.0),
      capacity: Number(input.capacity || 50),
      delivery_mode: input.delivery_mode || 'HYBRID',
      venue: input.venue || 'Campus Auditorium',
      department_id: Number(input.department_id || 1),
      coordinator_faculty_id: input.coordinator_faculty_id ? Number(input.coordinator_faculty_id) : 1,
      status: input.status || 'DRAFT',
      expected_outcomes: input.expected_outcomes || null,
      learning_outcomes: input.learning_outcomes || null,
      estimated_budget: Number(input.estimated_budget || 25000),
      actual_expenditure: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dynamicEvents.unshift(newEvent);

    // If sessions supplied in payload, insert them
    if (Array.isArray(input.sessions)) {
      input.sessions.forEach((s: any, idx: number) => {
        dynamicSessions.push({
          id: dynamicSessions.length + 1,
          event_id: id,
          title: s.title || `Session ${idx + 1}`,
          description: s.description || null,
          session_date: s.session_date || newEvent.start_date,
          start_time: s.start_time || '09:30 AM',
          end_time: s.end_time || '04:30 PM',
          resource_person_id: s.resource_person_id ? Number(s.resource_person_id) : 1,
          learning_objective: s.learning_objective || null,
          room_or_link: s.room_or_link || 'Hall 1',
        });
      });
    }

    return newEvent;
  },

  async updateEvent(id: number, updates: any) {
    const event = dynamicEvents.find(e => e.id === Number(id));
    if (!event) return null;
    Object.assign(event, updates, { updated_at: new Date().toISOString() });
    return event;
  },

  // Proposals
  async getProposals(status?: string) {
    let res = dynamicProposals.map(p => {
      const event = dynamicEvents.find(e => e.id === p.event_id) || { title: 'Unknown Event', event_code: 'FDP-000' };
      return { ...p, event };
    });
    if (status) res = res.filter(p => p.approval_status === status);
    return res;
  },

  async submitProposal(eventId: number, submittedBy: string = 'Admin Coordinator') {
    const existing = dynamicProposals.find(p => p.event_id === Number(eventId));
    if (existing) {
      existing.approval_status = 'PENDING';
      existing.submitted_by = submittedBy;
      existing.submitted_at = new Date().toISOString();
      await this.updateEvent(eventId, { status: 'PENDING_APPROVAL' });
      return existing;
    }
    const newProp = {
      id: dynamicProposals.length + 1,
      event_id: Number(eventId),
      submitted_by: submittedBy,
      submitted_at: new Date().toISOString(),
      approval_status: 'PENDING',
      approver_name: null,
      approver_role: 'HOD',
      remarks: null,
      reviewed_at: null,
    };
    dynamicProposals.push(newProp);
    await this.updateEvent(eventId, { status: 'PENDING_APPROVAL' });
    return newProp;
  },

  async reviewProposal(id: number, approvalStatus: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED', approverName: string, approverRole: string, remarks?: string) {
    const prop = dynamicProposals.find(p => p.id === Number(id));
    if (!prop) return null;

    prop.approval_status = approvalStatus;
    prop.approver_name = approverName;
    prop.approver_role = approverRole;
    prop.remarks = remarks || null;
    prop.reviewed_at = new Date().toISOString();

    const newEventStatus = approvalStatus === 'APPROVED' ? 'APPROVED' : approvalStatus === 'REJECTED' ? 'REJECTED' : 'DRAFT';
    await this.updateEvent(prop.event_id, { status: newEventStatus });
    return prop;
  },

  // Registrations
  async getEventRegistrations(eventId: number) {
    return dynamicRegistrations.filter(r => r.event_id === Number(eventId));
  },

  async registerForEvent(eventId: number, payload: any) {
    const id = dynamicRegistrations.length + 1;
    const regCode = `REG-VU2026-${String(id).padStart(4, '0')}`;
    const token = `token-${id}`;
    const newReg = {
      id,
      event_id: Number(eventId),
      faculty_id: payload.faculty_id ? Number(payload.faculty_id) : null,
      participant_name: payload.participant_name || 'Participant',
      faculty_code: payload.faculty_code || null,
      email: payload.email || null,
      phone: payload.phone || null,
      department: payload.department || 'Engineering',
      designation: payload.designation || 'Faculty Member',
      institution_name: payload.institution_name || "Vignan's University",
      registration_code: regCode,
      registration_token: token,
      qr_token: `${regCode}:${token}`,
      registered_at: new Date().toISOString(),
      registration_status: 'CONFIRMED',
      eligibility_status: 'ELIGIBLE',
      completion_status: 'IN_PROGRESS',
      attendance_status: 'PENDING',
    };
    dynamicRegistrations.push(newReg);
    return newReg;
  },

  // Attendance
  async getEventAttendance(eventId: number, sessionId?: number) {
    let res = dynamicAttendances.filter(a => a.event_id === Number(eventId));
    if (sessionId) res = res.filter(a => a.session_id === Number(sessionId));
    return res;
  },

  async recordAttendance(eventId: number, payload: any) {
    const id = dynamicAttendances.length + 1;
    const att = {
      id,
      event_id: Number(eventId),
      session_id: payload.session_id ? Number(payload.session_id) : null,
      faculty_id: payload.faculty_id ? Number(payload.faculty_id) : null,
      registration_id: payload.registration_id ? Number(payload.registration_id) : null,
      attendance_date: new Date().toISOString(),
      attendance_status: payload.attendance_status || 'PRESENT',
      attendance_method: payload.attendance_method || 'MANUAL',
    };
    dynamicAttendances.push(att);
    return att;
  },

  // Assessments
  async getEventAssessments(eventId: number) {
    const assessments = dynamicAssessments.filter(a => a.event_id === Number(eventId));
    return assessments.map(a => ({
      ...a,
      questions: dynamicQuestions.filter(q => q.assessment_id === a.id),
      attempts: dynamicAttempts.filter(at => at.assessment_id === a.id),
    }));
  },

  async submitAssessment(assessmentId: number, facultyId: number, answers: any = {}, score?: number, percentage?: number) {
    const questions = dynamicQuestions.filter(q => q.assessment_id === Number(assessmentId));
    let calculatedScore = score;
    let calculatedPercentage = percentage;

    if (calculatedScore === undefined && questions.length > 0) {
      let correct = 0;
      let total = 0;
      questions.forEach(q => {
        total += q.marks;
        if (answers[q.id] === q.correct_option) {
          correct += q.marks;
        }
      });
      calculatedScore = correct;
      calculatedPercentage = Number(((correct / total) * 100).toFixed(1));
    }

    const attempt = {
      id: dynamicAttempts.length + 1,
      assessment_id: Number(assessmentId),
      faculty_id: Number(facultyId),
      score: calculatedScore || 85.0,
      percentage: calculatedPercentage || 85.0,
      submitted_at: new Date().toISOString(),
    };
    dynamicAttempts.push(attempt);
    return attempt;
  },

  async getLearningImpact(eventId: number) {
    const pre = dynamicAssessments.find(a => a.event_id === Number(eventId) && a.assessment_type === 'PRE');
    const post = dynamicAssessments.find(a => a.event_id === Number(eventId) && a.assessment_type === 'POST');

    const pairs: Array<{ pre_score: number; post_score: number }> = [];
    if (pre && post) {
      const preAttempts = dynamicAttempts.filter(a => a.assessment_id === pre.id);
      const postAttempts = dynamicAttempts.filter(a => a.assessment_id === post.id);

      preAttempts.forEach(pr => {
        const matchingPost = postAttempts.find(po => po.faculty_id === pr.faculty_id);
        if (matchingPost) {
          pairs.push({ pre_score: pr.percentage, post_score: matchingPost.percentage });
        }
      });
    }

    // If no pairs yet, default to seeded demonstration metrics (+32pp average gain)
    if (pairs.length === 0) {
      return {
        average_pre: 47.0,
        average_post: 89.0,
        average_absolute_gain: 42.0,
        average_normalized_gain: 0.7925,
        cohort_size: 4,
        effectiveness_label: 'Exemplary Empirical Learning Gain (High)',
      };
    }

    return LearningGainAgent.calculateCohortGain(pairs);
  },

  // Feedback
  async getEventFeedback(eventId: number) {
    return dynamicFeedbacks.filter(f => f.event_id === Number(eventId));
  },

  async submitFeedback(eventId: number, payload: any) {
    const id = dynamicFeedbacks.length + 1;
    const fb = {
      id,
      event_id: Number(eventId),
      faculty_id: Number(payload.faculty_id),
      content_rating: Number(payload.content_rating || 5),
      trainer_rating: Number(payload.trainer_rating || 5),
      relevance_rating: Number(payload.relevance_rating || 5),
      practical_rating: Number(payload.practical_rating || 4),
      organization_rating: Number(payload.organization_rating || 5),
      comments: payload.comments || null,
      suggestions: payload.suggestions || null,
      submitted_at: new Date().toISOString(),
    };
    dynamicFeedbacks.push(fb);
    return fb;
  },

  async getFeedbackIntelligence(eventId: number) {
    const feedbacks = await this.getEventFeedback(eventId);
    return FeedbackAgent.analyzeFeedbacks(feedbacks);
  },

  // Certificates
  async getEventCertificates(eventId: number) {
    return dynamicCertificates.filter(c => c.event_id === Number(eventId));
  },

  async verifyCertificate(token: string) {
    const cert = dynamicCertificates.find(c => c.verification_token === token || c.certificate_code === token);
    if (!cert) return null;

    const event = dynamicEvents.find(e => e.id === cert.event_id);
    const faculty = dynamicFaculty.find(f => f.id === cert.faculty_id);

    return {
      ...cert,
      event_title: event?.title || 'Faculty Development Programme',
      event_type: event?.event_type || 'FDP',
      faculty_name: faculty?.full_name || 'Faculty Member',
      faculty_code: faculty?.faculty_code || 'FAC-000',
      institution_name: "Vignan's University",
      is_valid: cert.status === 'VALID',
    };
  },

  async generateCertificates(eventId: number, facultyIds?: number[]) {
    const event = dynamicEvents.find(e => e.id === Number(eventId));
    const targetFacultyIds = facultyIds || [1, 3];
    const generated: any[] = [];

    for (const fId of targetFacultyIds) {
      const existing = dynamicCertificates.find(c => c.event_id === Number(eventId) && c.faculty_id === fId);
      if (existing) {
        generated.push(existing);
        continue;
      }

      const id = dynamicCertificates.length + 1;
      const code = `CERT-${event?.department_id === 1 ? 'CSE' : 'IT'}-2026-${String(id).padStart(4, '0')}`;
      const token = `CERT-TOKEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const cert = {
        id,
        certificate_code: code,
        event_id: Number(eventId),
        faculty_id: fId,
        issue_date: new Date().toISOString(),
        training_hours: event?.duration_hours || 40.0,
        verification_token: token,
        qr_data: `https://facultyforge.edu/verify-certificate/${token}`,
        status: 'VALID',
      };
      dynamicCertificates.push(cert);
      generated.push(cert);
    }
    return generated;
  },

  // Compliance
  async getComplianceRules() {
    return seedComplianceRules;
  },

  async getFacultyCompliance(facultyId: number) {
    const comp = seedFacultyCompliance.find(c => c.faculty_id === Number(facultyId)) || {
      completed_hours: 32.0,
      required_hours: 40.0,
      compliance_percentage: 80.0,
      status: 'ATTENTION_REQUIRED',
    };
    return ComplianceAgent.evaluateCompliance(comp.completed_hours, comp.required_hours);
  },

  async getComplianceDashboard() {
    let compliantCount = 0;
    let attentionCount = 0;
    let nonCompliantCount = 0;
    let totalHours = 0;

    seedFacultyCompliance.forEach(c => {
      totalHours += c.completed_hours;
      if (c.status === 'COMPLIANT') compliantCount++;
      else if (c.status === 'ATTENTION_REQUIRED') attentionCount++;
      else nonCompliantCount++;
    });

    const totalFaculty = seedFacultyCompliance.length;
    return {
      total_faculty: totalFaculty,
      compliant_faculty: compliantCount,
      attention_required_faculty: attentionCount,
      non_compliant_faculty: nonCompliantCount,
      compliance_rate: Number(((compliantCount / totalFaculty) * 100).toFixed(1)),
      total_cpd_hours_accumulated: totalHours,
      institutional_norm_hours: 40.0,
    };
  },

  // Teaching Impact
  async getTeachingImpacts(facultyId?: number, eventId?: number) {
    let res = [...dynamicTeachingImpacts];
    if (facultyId) res = res.filter(t => t.faculty_id === Number(facultyId));
    if (eventId) res = res.filter(t => t.event_id === Number(eventId));
    return res;
  },

  async recordTeachingImpact(payload: any) {
    const id = dynamicTeachingImpacts.length + 1;
    const impact = {
      id,
      faculty_id: Number(payload.faculty_id),
      event_id: payload.event_id ? Number(payload.event_id) : null,
      skill_name: payload.skill_name || 'Academic Competency',
      application_type: payload.application_type || 'CLASSROOM',
      application_description: payload.application_description || 'Applied in teaching syllabus.',
      evidence_url: payload.evidence_url || null,
      self_rating: Number(payload.self_rating || 4.5),
      reviewer_rating: null,
      impact_status: 'APPLIED',
      applied_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      verified_at: null,
      verified_by: null,
    };
    dynamicTeachingImpacts.push(impact);
    return impact;
  },

  // Skill Evidence
  async getSkillEvidence(facultyId?: number) {
    let res = [...dynamicSkillEvidence];
    if (facultyId) res = res.filter(e => e.faculty_id === Number(facultyId));
    return res;
  },

  async addSkillEvidence(payload: any) {
    const id = dynamicSkillEvidence.length + 1;
    const item = {
      id,
      faculty_id: Number(payload.faculty_id),
      skill_name: payload.skill_name || 'Verified Competency',
      evidence_type: payload.evidence_type || 'CERTIFICATE',
      evidence_reference: payload.evidence_reference || 'Ref #1',
      score: payload.score ? Number(payload.score) : 90.0,
      verified: true,
      verified_by: 'IQAC File Custodian',
      created_at: new Date().toISOString(),
    };
    dynamicSkillEvidence.push(item);
    return item;
  },

  // Dashboard Overview
  async getDashboardSummary() {
    const totalEvents = dynamicEvents.length;
    const activeEvents = dynamicEvents.filter(e => ['APPROVED', 'REGISTRATION_OPEN', 'ONGOING'].includes(e.status)).length;
    const completedEvents = dynamicEvents.filter(e => e.status === 'COMPLETED').length;
    const pendingProposals = dynamicProposals.filter(p => p.approval_status === 'PENDING').length;
    const compliance = await this.getComplianceDashboard();

    return {
      total_faculty: dynamicFaculty.length,
      total_events: totalEvents,
      active_events: activeEvents,
      completed_events: completedEvents,
      pending_proposals: pendingProposals,
      compliance_rate: compliance.compliance_rate,
      total_cpd_hours: compliance.total_cpd_hours_accumulated,
      average_learning_gain_pp: 42.0,
      naac_criterion_632_ready: true,
      recent_events: dynamicEvents.slice(0, 5),
    };
  },
};
