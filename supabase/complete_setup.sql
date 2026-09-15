-- ==============================================================================
-- FACULTYFORGE AI - AGENT 27: SUPABASE POSTGRESQL SCHEMA WITH RLS
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to Supabase Auth auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'FACULTY' CHECK (role IN ('ADMIN', 'HOD', 'FACULTY')),
    faculty_id BIGINT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 2. DEPARTMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 3. FACULTY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculty (
    id BIGSERIAL PRIMARY KEY,
    faculty_code VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department_id BIGINT NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    years_of_experience NUMERIC(4, 1) DEFAULT 0.0,
    teaching_interests TEXT,
    research_interests TEXT,
    existing_skills TEXT,
    development_interests TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Add foreign key from profiles.faculty_id to faculty.id if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_profiles_faculty'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT fk_profiles_faculty 
        FOREIGN KEY (faculty_id) REFERENCES public.faculty(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. RESOURCE PERSONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_persons (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(50),
    organization VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    expertise TEXT NOT NULL,
    topics TEXT,
    biography TEXT,
    years_of_experience NUMERIC(4, 1) DEFAULT 0.0,
    total_sessions INT DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 4.5,
    honorarium_expectation VARCHAR(100),
    travel_required BOOLEAN DEFAULT FALSE,
    availability_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 5. EVENTS & PROGRAMMES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    event_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'FDP',
    objectives TEXT,
    target_audience VARCHAR(200),
    eligibility VARCHAR(200),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    duration_hours NUMERIC(5, 1) DEFAULT 16.0,
    capacity INT DEFAULT 50,
    delivery_mode VARCHAR(50) DEFAULT 'HYBRID',
    venue VARCHAR(200),
    department_id BIGINT NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    coordinator_faculty_id BIGINT REFERENCES public.faculty(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    expected_outcomes TEXT,
    learning_outcomes TEXT,
    estimated_budget NUMERIC(12, 2) DEFAULT 0.00,
    actual_expenditure NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 6. EVENT SESSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_sessions (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    session_date TIMESTAMPTZ,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    resource_person_id BIGINT REFERENCES public.resource_persons(id) ON DELETE SET NULL,
    learning_objective TEXT,
    room_or_link VARCHAR(250)
);

-- ------------------------------------------------------------------------------
-- 7. PROPOSALS & APPROVAL ROUTING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    submitted_by VARCHAR(150) NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    approver_name VARCHAR(150),
    approver_role VARCHAR(100),
    remarks TEXT,
    reviewed_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 8. REGISTRATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    faculty_id BIGINT REFERENCES public.faculty(id) ON DELETE SET NULL,
    participant_name VARCHAR(150),
    faculty_code VARCHAR(50),
    email VARCHAR(120),
    phone VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100),
    institution_name VARCHAR(200) DEFAULT 'Vignan''s University',
    years_of_experience NUMERIC(4, 1),
    teaching_interests TEXT,
    research_interests TEXT,
    registration_code VARCHAR(100),
    registration_token VARCHAR(100),
    qr_token VARCHAR(255),
    registered_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    registration_status VARCHAR(50) DEFAULT 'CONFIRMED',
    eligibility_status VARCHAR(50) DEFAULT 'ELIGIBLE',
    completion_status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    attendance_status VARCHAR(50) DEFAULT 'PENDING'
);

-- ------------------------------------------------------------------------------
-- 9. ATTENDANCES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendances (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    session_id BIGINT REFERENCES public.event_sessions(id) ON DELETE SET NULL,
    faculty_id BIGINT REFERENCES public.faculty(id) ON DELETE SET NULL,
    registration_id BIGINT REFERENCES public.registrations(id) ON DELETE SET NULL,
    attendance_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    attendance_status VARCHAR(20) DEFAULT 'PRESENT',
    attendance_method VARCHAR(20) DEFAULT 'MANUAL',
    check_in_time TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 10. ASSESSMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessments (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    assessment_type VARCHAR(20) NOT NULL CHECK (assessment_type IN ('PRE', 'POST')),
    title VARCHAR(200) NOT NULL,
    total_marks NUMERIC(5, 2) DEFAULT 100.0,
    passing_marks NUMERIC(5, 2) DEFAULT 50.0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option VARCHAR(5) NOT NULL,
    marks NUMERIC(4, 2) DEFAULT 10.0,
    explanation TEXT
);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    score NUMERIC(5, 2) DEFAULT 0.0,
    percentage NUMERIC(5, 2) DEFAULT 0.0,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_assessment_faculty_attempt UNIQUE (assessment_id, faculty_id)
);

-- ------------------------------------------------------------------------------
-- 11. FEEDBACKS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    content_rating INT NOT NULL DEFAULT 5,
    trainer_rating INT NOT NULL DEFAULT 5,
    relevance_rating INT NOT NULL DEFAULT 5,
    practical_rating INT NOT NULL DEFAULT 4,
    organization_rating INT NOT NULL DEFAULT 5,
    comments TEXT,
    suggestions TEXT,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_event_faculty_feedback UNIQUE (event_id, faculty_id)
);

-- ------------------------------------------------------------------------------
-- 12. CERTIFICATES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
    id BIGSERIAL PRIMARY KEY,
    certificate_code VARCHAR(100) NOT NULL UNIQUE,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    issue_date TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    training_hours NUMERIC(5, 1) DEFAULT 16.0,
    verification_token VARCHAR(100) NOT NULL UNIQUE,
    qr_data TEXT,
    status VARCHAR(20) DEFAULT 'VALID',
    CONSTRAINT uq_event_faculty_certificate UNIQUE (event_id, faculty_id)
);

-- ------------------------------------------------------------------------------
-- 13. SKILLS & RECOMMENDATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculty_skills (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    proficiency_level VARCHAR(50) DEFAULT 'INTERMEDIATE',
    source VARCHAR(100) DEFAULT 'SELF_REPORTED',
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    last_updated TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.skill_gaps (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    current_level VARCHAR(50) DEFAULT 'BEGINNER',
    required_level VARCHAR(50) DEFAULT 'INTERMEDIATE',
    gap_score NUMERIC(5, 2) DEFAULT 70.0,
    priority VARCHAR(50) DEFAULT 'HIGH',
    explanation TEXT,
    identified_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS public.training_recommendations (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    topic VARCHAR(150) NOT NULL,
    priority VARCHAR(50) DEFAULT 'HIGH',
    reason TEXT,
    recommended_duration VARCHAR(50) DEFAULT '3 Days',
    recommended_event_id BIGINT REFERENCES public.events(id) ON DELETE SET NULL,
    confidence_score NUMERIC(4, 2) DEFAULT 0.85,
    generated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    status VARCHAR(50) DEFAULT 'PENDING'
);

-- ------------------------------------------------------------------------------
-- 14. COMPLIANCE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.compliance_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    minimum_training_hours NUMERIC(5, 1) DEFAULT 40.0,
    period_type VARCHAR(50) DEFAULT 'ANNUAL',
    required_topics TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.faculty_compliance (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    compliance_rule_id BIGINT NOT NULL REFERENCES public.compliance_rules(id) ON DELETE CASCADE,
    completed_hours NUMERIC(5, 1) DEFAULT 0.0,
    required_hours NUMERIC(5, 1) DEFAULT 40.0,
    compliance_percentage NUMERIC(5, 2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'ATTENTION_REQUIRED',
    last_calculated TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_faculty_compliance_rule UNIQUE (faculty_id, compliance_rule_id)
);

-- ------------------------------------------------------------------------------
-- 15. AGENT TELEMETRY & ANALYSES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_analyses (
    id BIGSERIAL PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    faculty_id BIGINT REFERENCES public.faculty(id) ON DELETE CASCADE,
    event_id BIGINT REFERENCES public.events(id) ON DELETE CASCADE,
    input_summary TEXT,
    output_json TEXT NOT NULL,
    confidence_score NUMERIC(4, 2) DEFAULT 0.90,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 16. SKILL EVIDENCE & TEACHING IMPACTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skill_evidence (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    evidence_reference TEXT NOT NULL,
    score NUMERIC(5, 2),
    verified BOOLEAN DEFAULT TRUE,
    verified_by VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.teaching_impacts (
    id BIGSERIAL PRIMARY KEY,
    faculty_id BIGINT NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
    event_id BIGINT REFERENCES public.events(id) ON DELETE SET NULL,
    skill_name VARCHAR(100) NOT NULL,
    application_type VARCHAR(50) NOT NULL,
    application_description TEXT NOT NULL,
    evidence_url VARCHAR(255),
    self_rating NUMERIC(3, 1) DEFAULT 4.0,
    reviewer_rating NUMERIC(3, 1),
    impact_status VARCHAR(50) DEFAULT 'APPLIED',
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    verified_at TIMESTAMPTZ,
    verified_by VARCHAR(150)
);

-- ------------------------------------------------------------------------------
-- 17. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', 'FACULTY')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 18. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_impacts ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
CREATE POLICY "Public profiles can be viewed by all authenticated users"
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Read access policies for core catalogs (departments, faculty, events, resource persons)
CREATE POLICY "Allow public read for departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow public read for faculty" ON public.faculty FOR SELECT USING (true);
CREATE POLICY "Allow public read for resource persons" ON public.resource_persons FOR SELECT USING (true);
CREATE POLICY "Allow public read for events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public read for event sessions" ON public.event_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read for compliance rules" ON public.compliance_rules FOR SELECT USING (true);

-- Certificate verification is PUBLIC
CREATE POLICY "Allow public read for certificates" ON public.certificates FOR SELECT USING (true);

-- Authenticated modifications
CREATE POLICY "Allow authenticated read on registrations" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Allow insert on registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update on registrations" ON public.registrations FOR UPDATE USING (true);

CREATE POLICY "Allow read on attendances" ON public.attendances FOR SELECT USING (true);
CREATE POLICY "Allow write on attendances" ON public.attendances FOR ALL USING (true);

CREATE POLICY "Allow read on assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Allow read on assessment questions" ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY "Allow read on assessment attempts" ON public.assessment_attempts FOR SELECT USING (true);
CREATE POLICY "Allow write on assessment attempts" ON public.assessment_attempts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on feedbacks" ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY "Allow insert on feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read on faculty skills" ON public.faculty_skills FOR SELECT USING (true);
CREATE POLICY "Allow write on faculty skills" ON public.faculty_skills FOR ALL USING (true);

CREATE POLICY "Allow read on skill gaps" ON public.skill_gaps FOR SELECT USING (true);
CREATE POLICY "Allow write on skill gaps" ON public.skill_gaps FOR ALL USING (true);

CREATE POLICY "Allow read on training recommendations" ON public.training_recommendations FOR SELECT USING (true);
CREATE POLICY "Allow write on training recommendations" ON public.training_recommendations FOR ALL USING (true);

CREATE POLICY "Allow read on faculty compliance" ON public.faculty_compliance FOR SELECT USING (true);
CREATE POLICY "Allow write on faculty compliance" ON public.faculty_compliance FOR ALL USING (true);

CREATE POLICY "Allow read on proposals" ON public.proposals FOR SELECT USING (true);
CREATE POLICY "Allow write on proposals" ON public.proposals FOR ALL USING (true);

CREATE POLICY "Allow read on skill evidence" ON public.skill_evidence FOR SELECT USING (true);
CREATE POLICY "Allow write on skill evidence" ON public.skill_evidence FOR ALL USING (true);

CREATE POLICY "Allow read on teaching impacts" ON public.teaching_impacts FOR SELECT USING (true);
CREATE POLICY "Allow write on teaching impacts" ON public.teaching_impacts FOR ALL USING (true);

CREATE POLICY "Allow read on agent analyses" ON public.agent_analyses FOR SELECT USING (true);
CREATE POLICY "Allow write on agent analyses" ON public.agent_analyses FOR ALL USING (true);

CREATE POLICY "Allow write on events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow write on event sessions" ON public.event_sessions FOR ALL USING (true);
CREATE POLICY "Allow write on certificates" ON public.certificates FOR ALL USING (true);
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
