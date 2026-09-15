-- ==============================================================================
-- FACULTYFORGE AI - AGENT 27: SUPABASE SEED DATA
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO public.departments (id, name, code, description, is_active) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', true),
(2, 'Information Technology', 'IT', 'Department of Information Technology', true),
(3, 'Electronics & Communication Engineering', 'ECE', 'Department of Electronics and Communication', true),
(4, 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering', true)
ON CONFLICT (id) DO NOTHING;

-- 2. COMPLIANCE RULES
INSERT INTO public.compliance_rules (id, rule_name, description, minimum_training_hours, period_type, required_topics, is_active) VALUES
(1, 'Institutional Annual Faculty Development Requirement', 'Institutional benchmark of 40 hours of continuous professional and pedagogical development per academic year.', 40.0, 'ANNUAL', 'Teaching Methodology, Research, Emerging Technologies', true),
(2, 'Institutional Accreditation-Support Development Rule', 'Institutional benchmark of 24 hours of outcome-based and research-oriented development per semester.', 24.0, 'SEMESTER', 'Outcome Based Education, Research Methodology', true)
ON CONFLICT (id) DO NOTHING;

-- 3. FACULTY (12 Records)
INSERT INTO public.faculty (id, faculty_code, full_name, email, department_id, designation, qualification, years_of_experience, teaching_interests, research_interests, existing_skills, development_interests, phone, is_active) VALUES
(1, 'FAC-CSE-001', 'Dr. Ayesha Khan', 'ayesha.khan@university.edu', 1, 'Assistant Professor', 'Ph.D. in Computer Science', 5.5, 'Artificial Intelligence, Machine Learning, Data Structures', 'Generative AI, Deep Learning Models', 'Python, Machine Learning, Data Structures, Algorithms', 'Generative AI, Research Methodology, Grant Writing', '+91 98450 12345', true),
(2, 'FAC-CSE-002', 'Dr. Meera Rao', 'meera.rao@university.edu', 1, 'Associate Professor', 'Ph.D. in Distributed Systems', 11.0, 'Cloud Computing, Operating Systems, Computer Networks', 'Distributed Systems, Virtualization Architectures', 'Cloud Architecture, Linux, Kubernetes, C++', 'Cybersecurity, Academic Leadership', '+91 98450 23456', true),
(3, 'FAC-IT-001', 'Dr. Arjun Sharma', 'arjun.sharma@university.edu', 2, 'Assistant Professor', 'Ph.D. in Cyber Defense', 4.0, 'Information Security, Cryptography, Network Protocols', 'Cyber Threat Intelligence, Intrusion Detection', 'Network Security, Python, Cryptography, Wireshark', 'Zero Trust Architecture, Grant Writing', '+91 98450 34567', true),
(4, 'FAC-ECE-001', 'Dr. Neha Reddy', 'neha.reddy@university.edu', 3, 'Associate Professor', 'Ph.D. in Microelectronics', 12.0, 'VLSI Design, Digital Electronics, Embedded Systems', 'Neuromorphic Computing, Low-power VLSI', 'Verilog, Embedded C, FPGA, Cadence', 'Edge AI, Scopus Publishing', '+91 98450 45678', true),
(5, 'FAC-MECH-001', 'Dr. Farhan Ali', 'farhan.ali@university.edu', 4, 'Professor', 'Ph.D. in Thermal Engineering', 18.0, 'Thermodynamics, Heat Transfer, CAD/CAM', 'Additive Manufacturing, Thermal Optimization', 'ANSYS, SolidWorks, Optimization, FEA', 'Outcome Based Education, Industry 4.0', '+91 98450 56789', true),
(6, 'FAC-IT-002', 'Dr. Kavya Nair', 'kavya.nair@university.edu', 2, 'Assistant Professor', 'Ph.D. in Software Engineering', 6.0, 'Web Technologies, Full Stack Engineering, Software Testing', 'Human-Computer Interaction, Web Accessibility', 'JavaScript, React, Node.js, SQL, Testing Frameworks', 'Cloud Native Microservices, Pedagogical Innovations', '+91 98450 67890', true),
(7, 'FAC-CSE-003', 'Dr. Rohan Verma', 'rohan.verma@university.edu', 1, 'Assistant Professor', 'Ph.D. in Data Engineering', 3.5, 'Database Management, Big Data Analytics, Python', 'Scalable Vector Databases, Streaming Data', 'SQL, Apache Spark, Hadoop, Python, NoSQL', 'Generative AI, Research Methodology', '+91 98450 78901', true),
(8, 'FAC-ECE-002', 'Dr. Sana Ahmed', 'sana.ahmed@university.edu', 3, 'Assistant Professor', 'Ph.D. in Telecommunications', 7.0, 'Wireless Communications, Digital Signal Processing', '5G/6G MIMO Architectures, Beamforming', 'MATLAB, Wireless Protocols, DSP, Python', 'Deep Learning for Signal Processing, OBE', '+91 98450 89012', true),
(9, 'FAC-CSE-004', 'Dr. Priya Iyer', 'priya.iyer@university.edu', 1, 'Professor', 'Ph.D. in Software Architecture', 20.0, 'Software Engineering, System Design, Object Oriented Design', 'Empirical Software Quality, Architecture Patterns', 'Agile, UML, Software Architecture, Testing', 'Academic Leadership, Accreditation Audits', '+91 98450 90123', true),
(10, 'FAC-IT-003', 'Dr. Rahul Das', 'rahul.das@university.edu', 2, 'Assistant Professor', 'Ph.D. in Cloud Security', 5.0, 'DevOps Engineering, Cloud Infrastructure, Linux', 'Automated Vulnerability Detection in CI/CD', 'Docker, Kubernetes, Jenkins, Terraform, Python', 'Cybersecurity, Grant Writing', '+91 98450 01234', true),
(11, 'FAC-MECH-002', 'Dr. Nikhil Jain', 'nikhil.jain@university.edu', 4, 'Associate Professor', 'Ph.D. in Robotics', 10.0, 'Robotics & Automation, Mechatronics, Control Systems', 'Autonomous Mobile Robotics, Trajectory Planning', 'ROS, MATLAB, Kinematics, Python, Arduino', 'AI for Robotics, Outcome Based Education', '+91 98450 11223', true),
(12, 'FAC-ECE-003', 'Dr. Ananya Bose', 'ananya.bose@university.edu', 3, 'Assistant Professor', 'Ph.D. in IoT Systems', 4.5, 'Internet of Things, Sensor Networks, Microcontrollers', 'Smart Sensors, Energy Harvesting Edge Nodes', 'Arduino, ESP32, MQTT, C++, Embedded Systems', 'Edge AI, Research Methodology', '+91 98450 22334', true)
ON CONFLICT (id) DO NOTHING;

-- 4. RESOURCE PERSONS
INSERT INTO public.resource_persons (id, name, email, phone, organization, designation, expertise, topics, biography, years_of_experience, total_sessions, average_rating, honorarium_expectation, travel_required, is_active) VALUES
(1, 'Dr. Rajesh Deshmukh', 'rajesh.deshmukh@iitb.ac.in', '+91 98200 11223', 'Indian Institute of Technology Bombay', 'Senior Professor & AI Chair', 'Generative AI, Large Language Models, PyTorch, Transformers', 'Transformers, Agentic Workflows, Evaluation Benchmarks', 'Dr. Deshmukh has over 22 years of research leadership in artificial intelligence and deep neural architectures.', 22.0, 18, 4.92, 'Rs. 15,000 per session', true, true),
(2, 'Ms. Sunita Sundaram', 'sunita.s@google.com', '+91 98200 44556', 'Google Cloud Platform', 'Staff Cloud Solutions Architect', 'Cloud Native Systems, Kubernetes, Microservices Architecture, Kafka', 'Distributed Systems, Zero Trust, Cloud Cost Optimization', 'Ms. Sundaram leads enterprise cloud modernization initiatives across APAC.', 15.0, 12, 4.88, 'Honorary / Institutional Waiver', false, true),
(3, 'Dr. Vikramaditya Rathore', 'vikram.rathore@iisc.ac.in', '+91 98200 77889', 'Indian Institute of Science Bangalore', 'Principal Research Scientist', 'Neuromorphic Hardware, Low-Power VLSI, TinyML, Verilog', 'Edge AI, Neuromorphic Chips, Cadence Simulation', 'Dr. Rathore has published over 80 Scopus-indexed papers in hardware acceleration.', 19.0, 14, 4.85, 'Rs. 12,000 per session', true, true)
ON CONFLICT (id) DO NOTHING;

-- 5. EVENTS & SESSIONS
INSERT INTO public.events (id, event_code, title, description, event_type, objectives, target_audience, eligibility, start_date, end_date, duration_hours, capacity, delivery_mode, venue, department_id, coordinator_faculty_id, status, expected_outcomes, learning_outcomes, estimated_budget, actual_expenditure) VALUES
(1, 'FDP-CSE-2026-001', 'Advanced Generative AI & Autonomous Agent Architectures in Higher Education', 'A comprehensive 5-day immersive faculty development programme exploring LLM orchestration, RAG pipelines, and agentic workflows for classroom pedagogy.', 'FDP', '1. Master Transformer architecture principles.\n2. Build production-grade RAG pipelines.\n3. Integrate autonomous multi-agent systems.', 'Faculty of CSE, IT, and AI/Data Science', 'Assistant Professors and above with Python knowledge', NOW() - INTERVAL '15 days', NOW() - INTERVAL '11 days', 40.0, 50, 'HYBRID', 'Auditorium Hall 3 / Hybrid Zoom Link', 1, 1, 'COMPLETED', 'Faculty will build generative AI modules and course materials.', 'Proficiency in PyTorch, LangChain, and Agentic workflows.', 85000.00, 78400.00),
(2, 'FDP-IT-2026-002', 'Cloud Native Microservices and Zero Trust DevSecOps', 'Hands-on training in building resilient cloud services using Kubernetes, Docker, automated CI/CD security scanning, and distributed telemetry.', 'WORKSHOP', '1. Container orchestration with K8s.\n2. Zero trust network architectures.\n3. Continuous vulnerability scanning.', 'Faculty of IT, CSE, and MCA', 'Faculty handling Cloud and Operating Systems courses', NOW() + INTERVAL '5 days', NOW() + INTERVAL '7 days', 16.0, 45, 'OFFLINE', 'Cloud Computing Lab - Room 402', 2, 2, 'APPROVED', 'Design hands-on lab experiments for undergraduate students.', 'Kubernetes deployment, secret management, and monitoring.', 45000.00, 0.00),
(3, 'FDP-ECE-2026-003', 'Edge AI, TinyML & Neuromorphic Chip Design', 'Exploring microelectronics, low-power edge accelerators, and hardware-aware deep learning compilation.', 'FDP', '1. Understand neuromorphic architecture.\n2. Deploy quantized models on microcontrollers.\n3. Hardware synthesis using Verilog.', 'Faculty of ECE, EEE, and Instrumentation', 'Faculty with VLSI / Embedded systems background', NOW() + INTERVAL '20 days', NOW() + INTERVAL '24 days', 32.0, 40, 'HYBRID', 'VLSI Design Center - Room 201', 3, 4, 'PENDING_APPROVAL', 'Curriculum upgrade for 4th year elective courses.', 'Verilog testbench simulation, TinyML deployment on ARM Cortex.', 60000.00, 0.00)
ON CONFLICT (id) DO NOTHING;

-- Sessions for Event 1
INSERT INTO public.event_sessions (id, event_id, title, description, session_date, start_time, end_time, resource_person_id, learning_objective, room_or_link) VALUES
(1, 1, 'Day 1: Modern Transformer Architectures & Attention Mechanisms', 'Mathematical breakdown of self-attention, multi-head projections, and rotary positional embeddings.', NOW() - INTERVAL '15 days', '09:30 AM', '01:00 PM', 1, 'Understand mathematical foundations of transformers', 'Auditorium Hall 3'),
(2, 1, 'Day 2: Retrieval Augmented Generation (RAG) & Vector Indexing', 'Chunking strategies, embedding models, vector search, and reranking algorithms.', NOW() - INTERVAL '14 days', '09:30 AM', '01:00 PM', 1, 'Implement production vector search with pgvector', 'Auditorium Hall 3'),
(3, 1, 'Day 3: Autonomous Agent Design & Multi-Agent Collaboration', 'ReAct pattern, tool use, memory architectures, and Agent 27 autonomous workflows.', NOW() - INTERVAL '13 days', '09:30 AM', '01:00 PM', 2, 'Build autonomous multi-agent loops', 'Auditorium Hall 3'),
(4, 1, 'Day 4: Fine-Tuning & Parameter Efficient Adaptation (LoRA/QLoRA)', 'Quantization, adapter matrices, dataset curation, and evaluation frameworks.', NOW() - INTERVAL '12 days', '09:30 AM', '01:00 PM', 1, 'Fine-tune open-weights models on domain data', 'Auditorium Hall 3'),
(5, 1, 'Day 5: Capstone Demonstrations & Institutional Integration', 'Participant project presentations and curriculum mapping.', NOW() - INTERVAL '11 days', '09:30 AM', '04:00 PM', 1, 'Deploy and evaluate peer projects', 'Auditorium Hall 3')
ON CONFLICT (id) DO NOTHING;

-- 6. PROPOSALS
INSERT INTO public.proposals (id, event_id, submitted_by, submitted_at, approval_status, approver_name, approver_role, remarks, reviewed_at) VALUES
(1, 1, 'Dr. Ayesha Khan', NOW() - INTERVAL '30 days', 'APPROVED', 'Dr. Priya Iyer', 'HOD', 'Approved. High priority for NAAC Criterion 6.3.2 accreditation norms.', NOW() - INTERVAL '28 days'),
(2, 2, 'Dr. Meera Rao', NOW() - INTERVAL '14 days', 'APPROVED', 'Dr. Priya Iyer', 'HOD', 'Approved with allocated laboratory budget.', NOW() - INTERVAL '12 days'),
(3, 3, 'Dr. Neha Reddy', NOW() - INTERVAL '3 days', 'PENDING', NULL, 'IQAC Coordinator', 'Awaiting IQAC financial committee signoff.', NULL)
ON CONFLICT (id) DO NOTHING;

-- 7. REGISTRATIONS & ATTENDANCE FOR EVENT 1
INSERT INTO public.registrations (id, event_id, faculty_id, participant_name, faculty_code, email, department, designation, registration_code, registration_token, qr_token, registration_status, eligibility_status, completion_status, attendance_status) VALUES
(1, 1, 1, 'Dr. Ayesha Khan', 'FAC-CSE-001', 'ayesha.khan@university.edu', 'CSE', 'Assistant Professor', 'REG-VU2026-0001', 'tok-001', 'REG-VU2026-0001:tok-001', 'CONFIRMED', 'ELIGIBLE', 'COMPLETED', 'PRESENT'),
(2, 1, 3, 'Dr. Arjun Sharma', 'FAC-IT-001', 'arjun.sharma@university.edu', 'IT', 'Assistant Professor', 'REG-VU2026-0002', 'tok-002', 'REG-VU2026-0002:tok-002', 'CONFIRMED', 'ELIGIBLE', 'COMPLETED', 'PRESENT'),
(3, 1, 7, 'Dr. Rohan Verma', 'FAC-CSE-003', 'rohan.verma@university.edu', 'CSE', 'Assistant Professor', 'REG-VU2026-0003', 'tok-003', 'REG-VU2026-0003:tok-003', 'CONFIRMED', 'ELIGIBLE', 'COMPLETED', 'PRESENT'),
(4, 1, 6, 'Dr. Kavya Nair', 'FAC-IT-002', 'kavya.nair@university.edu', 'IT', 'Assistant Professor', 'REG-VU2026-0004', 'tok-004', 'REG-VU2026-0004:tok-004', 'CONFIRMED', 'ELIGIBLE', 'COMPLETED', 'PRESENT')
ON CONFLICT (id) DO NOTHING;

-- Attendances
INSERT INTO public.attendances (event_id, session_id, faculty_id, registration_id, attendance_date, attendance_status, attendance_method) VALUES
(1, 1, 1, 1, NOW() - INTERVAL '15 days', 'PRESENT', 'QR'),
(1, 2, 1, 1, NOW() - INTERVAL '14 days', 'PRESENT', 'QR'),
(1, 3, 1, 1, NOW() - INTERVAL '13 days', 'PRESENT', 'QR'),
(1, 4, 1, 1, NOW() - INTERVAL '12 days', 'PRESENT', 'QR'),
(1, 5, 1, 1, NOW() - INTERVAL '11 days', 'PRESENT', 'QR'),
(1, 1, 3, 2, NOW() - INTERVAL '15 days', 'PRESENT', 'MANUAL'),
(1, 2, 3, 2, NOW() - INTERVAL '14 days', 'PRESENT', 'QR'),
(1, 3, 3, 2, NOW() - INTERVAL '13 days', 'PRESENT', 'QR'),
(1, 4, 3, 2, NOW() - INTERVAL '12 days', 'PRESENT', 'QR'),
(1, 5, 3, 2, NOW() - INTERVAL '11 days', 'PRESENT', 'QR');

-- 8. ASSESSMENTS (Pre & Post for Event 1)
INSERT INTO public.assessments (id, event_id, assessment_type, title, total_marks, passing_marks) VALUES
(1, 1, 'PRE', 'Pre-Programme Diagnostic Assessment: Generative AI Foundations', 100.0, 50.0),
(2, 1, 'POST', 'Post-Programme Competency Assessment: Generative AI & Agents', 100.0, 60.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assessment_questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, explanation) VALUES
(1, 'What is the primary computational bottleneck in standard Multi-Head Attention?', 'O(N) memory complexity with sequence length', 'O(N^2) time and memory complexity with sequence length', 'Linear projection weight initialization', 'Layer normalization gradient vanish', 'b', 25.0, 'Full self-attention calculates an N x N similarity matrix, resulting in quadratic complexity O(N^2).'),
(1, 'Which vector distance metric is invariant to vector magnitude?', 'Euclidean Distance', 'Manhattan Distance', 'Cosine Similarity', 'Hamming Distance', 'c', 25.0, 'Cosine similarity computes the cosine of the angle between two vectors, neutralizing magnitude differences.'),
(2, 'In Low-Rank Adaptation (LoRA), why is inference latency zero compared to standard prompting?', 'Adapter matrices can be mathematically merged into the frozen base weights before deployment', 'LoRA prunes 90% of model neurons', 'LoRA uses 1-bit quantization exclusively', 'LoRA executes in GPU SRAM only', 'a', 25.0, 'During deployment, W_merged = W_base + (B * A) * scaling, resulting in identical forward pass speed.'),
(2, 'What does Hake''s normalized learning gain formula g measure?', 'Raw percentage difference', 'The fraction of possible improvement actually achieved relative to baseline headroom', 'Standard deviation of class test grades', 'Post-test pass rate exclusively', 'b', 25.0, 'g = (Post - Pre) / (100 - Pre), measuring empirical competence gain normalized by initial headroom.');

-- Assessment Attempts (Empirical Proof of Learning Gain)
INSERT INTO public.assessment_attempts (assessment_id, faculty_id, score, percentage) VALUES
(1, 1, 50.0, 50.0),  -- Dr. Ayesha Pre-test: 50%
(2, 1, 92.0, 92.0),  -- Dr. Ayesha Post-test: 92% (+42pp gain, g = 0.84 High)
(1, 3, 44.0, 44.0),  -- Dr. Arjun Pre-test: 44%
(2, 3, 86.0, 86.0)   -- Dr. Arjun Post-test: 86% (+42pp gain, g = 0.75 High)
ON CONFLICT (assessment_id, faculty_id) DO NOTHING;

-- 9. CERTIFICATES
INSERT INTO public.certificates (id, certificate_code, event_id, faculty_id, issue_date, training_hours, verification_token, qr_data, status) VALUES
(1, 'CERT-CSE-2026-0001', 1, 1, NOW() - INTERVAL '10 days', 40.0, 'CERT-CSE-2026-8F2A', 'https://facultyforge.edu/verify-certificate/CERT-CSE-2026-8F2A', 'VALID'),
(2, 'CERT-IT-2026-0002', 1, 3, NOW() - INTERVAL '10 days', 40.0, 'CERT-IT-2026-4B9C', 'https://facultyforge.edu/verify-certificate/CERT-IT-2026-4B9C', 'VALID')
ON CONFLICT (id) DO NOTHING;

-- 10. 5-DIMENSIONAL FEEDBACK
INSERT INTO public.feedbacks (event_id, faculty_id, content_rating, trainer_rating, relevance_rating, practical_rating, organization_rating, comments, suggestions) VALUES
(1, 1, 5, 5, 5, 5, 5, 'Exemplary faculty development programme. The hands-on labs on autonomous agent coordination were directly applicable to our AI curriculum.', 'Provide extended compute cluster access post-workshop.'),
(1, 3, 5, 5, 4, 4, 5, 'Exceptional coverage of transformer architectures and practical RAG pipelines. Dr. Deshmukh explained complex math with unmatched clarity.', 'Organize a dedicated follow-up on fine-tuning small edge models.')
ON CONFLICT (event_id, faculty_id) DO NOTHING;

-- 11. FACULTY COMPLIANCE (40-Hour Rule Status)
INSERT INTO public.faculty_compliance (faculty_id, compliance_rule_id, completed_hours, required_hours, compliance_percentage, status) VALUES
(1, 1, 40.0, 40.0, 100.0, 'COMPLIANT'),
(2, 1, 24.0, 40.0, 60.0, 'ATTENTION_REQUIRED'),
(3, 1, 40.0, 40.0, 100.0, 'COMPLIANT'),
(4, 1, 16.0, 40.0, 40.0, 'NON_COMPLIANT'),
(5, 1, 44.0, 40.0, 110.0, 'COMPLIANT'),
(6, 1, 20.0, 40.0, 50.0, 'ATTENTION_REQUIRED'),
(7, 1, 12.0, 40.0, 30.0, 'NON_COMPLIANT'),
(8, 1, 28.0, 40.0, 70.0, 'ATTENTION_REQUIRED'),
(9, 1, 48.0, 40.0, 120.0, 'COMPLIANT'),
(10, 1, 16.0, 40.0, 40.0, 'NON_COMPLIANT'),
(11, 1, 32.0, 40.0, 80.0, 'ATTENTION_REQUIRED'),
(12, 1, 18.0, 40.0, 45.0, 'NON_COMPLIANT')
ON CONFLICT (faculty_id, compliance_rule_id) DO NOTHING;

-- Update sequences to avoid primary key collisions on new inserts
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM public.departments));
SELECT setval('faculty_id_seq', (SELECT MAX(id) FROM public.faculty));
SELECT setval('resource_persons_id_seq', (SELECT MAX(id) FROM public.resource_persons));
SELECT setval('events_id_seq', (SELECT MAX(id) FROM public.events));
SELECT setval('event_sessions_id_seq', (SELECT MAX(id) FROM public.event_sessions));
SELECT setval('proposals_id_seq', (SELECT MAX(id) FROM public.proposals));
SELECT setval('registrations_id_seq', (SELECT MAX(id) FROM public.registrations));
SELECT setval('assessments_id_seq', (SELECT MAX(id) FROM public.assessments));
SELECT setval('assessment_questions_id_seq', (SELECT MAX(id) FROM public.assessment_questions));
SELECT setval('certificates_id_seq', (SELECT MAX(id) FROM public.certificates));
SELECT setval('compliance_rules_id_seq', (SELECT MAX(id) FROM public.compliance_rules));
