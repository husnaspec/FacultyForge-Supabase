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
