from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ======================= DEPARTMENT SCHEMAS =======================
class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class DepartmentResponse(DepartmentBase):
    id: int
    created_at: datetime
    faculty_count: Optional[int] = 0
    event_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ======================= FACULTY SCHEMAS =======================
class FacultyBase(BaseModel):
    faculty_code: str
    full_name: str
    email: EmailStr
    department_id: int
    designation: str
    qualification: str
    years_of_experience: float = 0.0
    teaching_interests: Optional[str] = None
    research_interests: Optional[str] = None
    existing_skills: Optional[str] = None
    development_interests: Optional[str] = None
    is_active: bool = True

class FacultyCreate(FacultyBase):
    pass

class FacultyUpdate(BaseModel):
    faculty_code: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    years_of_experience: Optional[float] = None
    teaching_interests: Optional[str] = None
    research_interests: Optional[str] = None
    existing_skills: Optional[str] = None
    development_interests: Optional[str] = None
    is_active: Optional[bool] = None

class FacultyResponse(FacultyBase):
    id: int
    created_at: datetime
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# ======================= RESOURCE PERSON SCHEMAS =======================
class ResourcePersonBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    organization: str
    designation: str
    expertise: str
    topics: Optional[str] = None
    biography: Optional[str] = None
    years_of_experience: float = 0.0
    total_sessions: int = 0
    average_rating: float = 4.5
    honorarium_expectation: Optional[str] = None
    travel_required: bool = False
    availability_notes: Optional[str] = None
    is_active: bool = True

class ResourcePersonCreate(ResourcePersonBase):
    pass

class ResourcePersonUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    organization: Optional[str] = None
    designation: Optional[str] = None
    expertise: Optional[str] = None
    topics: Optional[str] = None
    biography: Optional[str] = None
    years_of_experience: Optional[float] = None
    total_sessions: Optional[int] = None
    average_rating: Optional[float] = None
    honorarium_expectation: Optional[str] = None
    travel_required: Optional[bool] = None
    availability_notes: Optional[str] = None
    is_active: Optional[bool] = None

class ResourcePersonResponse(ResourcePersonBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ======================= EVENT SESSION SCHEMAS =======================
class EventSessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    session_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    resource_person_id: Optional[int] = None
    learning_objective: Optional[str] = None
    room_or_link: Optional[str] = None

class EventSessionCreate(EventSessionBase):
    pass

class EventSessionResponse(EventSessionBase):
    id: int
    event_id: int
    resource_person_name: Optional[str] = None

    class Config:
        from_attributes = True

# ======================= EVENT SCHEMAS =======================
class EventBase(BaseModel):
    event_code: Optional[str] = None
    title: str
    description: Optional[str] = None
    event_type: str = "FDP" # FDP, WORKSHOP, SEMINAR, TRAINING, STTP
    objectives: Optional[str] = None
    target_audience: Optional[str] = None
    eligibility: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_hours: float = 16.0
    capacity: int = 50
    delivery_mode: str = "HYBRID"
    venue: Optional[str] = None
    department_id: int
    coordinator_faculty_id: Optional[int] = None
    status: str = "DRAFT"
    expected_outcomes: Optional[str] = None
    learning_outcomes: Optional[str] = None
    estimated_budget: float = 0.0
    actual_expenditure: float = 0.0

class EventCreate(EventBase):
    sessions: Optional[List[EventSessionCreate]] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    objectives: Optional[str] = None
    target_audience: Optional[str] = None
    eligibility: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    duration_hours: Optional[float] = None
    capacity: Optional[int] = None
    delivery_mode: Optional[str] = None
    venue: Optional[str] = None
    department_id: Optional[int] = None
    coordinator_faculty_id: Optional[int] = None
    status: Optional[str] = None
    expected_outcomes: Optional[str] = None
    learning_outcomes: Optional[str] = None
    estimated_budget: Optional[float] = None
    actual_expenditure: Optional[float] = None

class EventResponse(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime
    department_name: Optional[str] = None
    coordinator_name: Optional[str] = None
    registered_count: Optional[int] = 0
    sessions: Optional[List[EventSessionResponse]] = []

    class Config:
        from_attributes = True

# ======================= PROPOSAL SCHEMAS =======================
class ProposalSubmitRequest(BaseModel):
    submitted_by: str = "Admin Coordinator"

class ProposalReviewRequest(BaseModel):
    approver_name: str
    approver_role: str = "HOD" # HOD, IQAC, DEAN
    remarks: Optional[str] = None

class ProposalResponse(BaseModel):
    id: int
    event_id: int
    submitted_by: str
    submitted_at: datetime
    approval_status: str
    approver_name: Optional[str] = None
    approver_role: Optional[str] = None
    remarks: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    event_title: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# ======================= REGISTRATION SCHEMAS =======================
class RegistrationCreate(BaseModel):
    faculty_id: Optional[int] = None
    full_name: Optional[str] = None
    faculty_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    institution_name: Optional[str] = "Vignan's University"
    years_of_experience: Optional[float] = 0.0
    teaching_interests: Optional[str] = None
    research_interests: Optional[str] = None
    consent: Optional[bool] = True

class RegistrationResponse(BaseModel):
    id: int
    registration_id: Optional[int] = None
    event_id: int
    faculty_id: Optional[int] = None
    faculty_name: Optional[str] = None
    participant_name: Optional[str] = None
    faculty_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    institution_name: Optional[str] = None
    registration_code: Optional[str] = None
    registration_token: Optional[str] = None
    qr_token: Optional[str] = None
    attendance_status: Optional[str] = "PENDING"
    registered_at: datetime
    registration_status: str
    eligibility_status: str
    completion_status: str

    class Config:
        from_attributes = True

# ======================= ATTENDANCE SCHEMAS =======================
class AttendanceRecordRequest(BaseModel):
    session_id: Optional[int] = None
    faculty_id: Optional[int] = None
    registration_id: Optional[int] = None
    attendance_status: str = "PRESENT" # PRESENT, ABSENT
    attendance_method: str = "MANUAL" # MANUAL, QR

class AttendanceQRCheckinRequest(BaseModel):
    event_id: int
    qr_token: str
    session_id: Optional[int] = None

class AttendanceManualRequest(BaseModel):
    event_id: int
    registration_id: Optional[int] = None
    faculty_id: Optional[int] = None
    session_id: Optional[int] = None
    attendance_status: str = "PRESENT" # PRESENT, ABSENT

class AttendanceBulkRequest(BaseModel):
    event_id: int
    session_id: Optional[int] = None
    records: List[Dict[str, Any]] # [{"faculty_id": 1, "attendance_status": "PRESENT"}]

class AttendanceResponse(BaseModel):
    id: int
    event_id: int
    session_id: Optional[int] = None
    faculty_id: Optional[int] = None
    registration_id: Optional[int] = None
    faculty_name: Optional[str] = None
    participant_name: Optional[str] = None
    faculty_code: Optional[str] = None
    department: Optional[str] = None
    attendance_date: datetime
    attendance_status: str
    attendance_method: str
    check_in_time: datetime

    class Config:
        from_attributes = True

# ======================= ASSESSMENT SCHEMAS =======================
class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str # 'a', 'b', 'c', or 'd'
    marks: float = 10.0
    explanation: Optional[str] = None

class QuestionResponse(BaseModel):
    id: int
    assessment_id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    marks: float
    explanation: Optional[str] = None
    # correct_option is masked for taking exams unless submitted

    class Config:
        from_attributes = True

class AssessmentCreate(BaseModel):
    event_id: int
    assessment_type: str # PRE or POST
    title: str
    total_marks: float = 100.0
    passing_marks: float = 50.0
    questions: Optional[List[QuestionCreate]] = None

class AssessmentResponse(BaseModel):
    id: int
    event_id: int
    assessment_type: str
    title: str
    total_marks: float
    passing_marks: float
    created_at: datetime
    questions: Optional[List[QuestionResponse]] = []

    class Config:
        from_attributes = True

class AssessmentSubmitRequest(BaseModel):
    faculty_id: int
    answers: Dict[str, str] # {"<question_id>": "a"}

class AssessmentAttemptResponse(BaseModel):
    id: int
    assessment_id: int
    faculty_id: int
    faculty_name: Optional[str] = None
    score: float
    percentage: float
    submitted_at: datetime

    class Config:
        from_attributes = True

# ======================= FEEDBACK SCHEMAS =======================
class FeedbackCreate(BaseModel):
    faculty_id: int
    content_rating: int = Field(ge=1, le=5)
    trainer_rating: int = Field(ge=1, le=5)
    relevance_rating: int = Field(ge=1, le=5)
    practical_rating: int = Field(ge=1, le=5)
    organization_rating: int = Field(ge=1, le=5)
    comments: Optional[str] = None
    suggestions: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    event_id: int
    faculty_id: int
    faculty_name: Optional[str] = None
    content_rating: int
    trainer_rating: int
    relevance_rating: int
    practical_rating: int
    organization_rating: int
    comments: Optional[str] = None
    suggestions: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True

# ======================= CERTIFICATE SCHEMAS =======================
class CertificateGenerateRequest(BaseModel):
    faculty_ids: Optional[List[int]] = None # If None, generate for all eligible participants

class CertificateResponse(BaseModel):
    id: int
    certificate_code: str
    event_id: int
    event_title: Optional[str] = None
    faculty_id: int
    faculty_name: Optional[str] = None
    issue_date: datetime
    training_hours: float
    verification_token: str
    qr_data: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class CertificateVerifyResponse(BaseModel):
    is_valid: bool
    certificate_code: str
    participant_name: str
    event_name: str
    event_type: str
    duration_hours: float
    issue_date: str
    organizing_department: str
    verification_status: str # "VALID CERTIFICATE" or "INVALID/REVOKED"

# ======================= COMPLIANCE SCHEMAS =======================
class ComplianceRuleCreate(BaseModel):
    rule_name: str
    description: Optional[str] = None
    minimum_training_hours: float = 40.0
    period_type: str = "ANNUAL"
    required_topics: Optional[str] = None
    is_active: bool = True

class ComplianceRuleResponse(ComplianceRuleCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FacultyComplianceResponse(BaseModel):
    faculty_id: int
    faculty_name: str
    faculty_code: str
    department_name: str
    rule_name: str
    completed_hours: float
    required_hours: float
    remaining_hours: float
    compliance_percentage: float
    status: str # COMPLIANT, ATTENTION_REQUIRED, NON_COMPLIANT
    last_calculated: datetime

# ======================= DIGITAL PASSPORT SCHEMAS =======================
class DigitalPassportResponse(BaseModel):
    faculty_id: int
    faculty_code: str
    full_name: str
    department_name: str
    designation: str
    qualification: str
    years_of_experience: float
    
    # Quantitative Stats
    fdps_completed: int
    workshops_completed: int
    total_training_hours: float
    certificates_count: int
    
    # Skills Acquired
    skills_acquired: List[str]
    
    # Learning Gain
    average_learning_gain_pp: float # percentage points
    
    # Active Skill Gaps
    skill_gaps: List[Dict[str, Any]]
    
    # Next Recommended Training
    next_recommended_training: Optional[Dict[str, Any]] = None
    
    # Compliance Status
    compliance: Dict[str, Any]
    
    # Timeline / Completed Events
    training_history: List[Dict[str, Any]]

    # Extended Digital Passport Intelligence
    verified_skills: Optional[List[Dict[str, Any]]] = None
    skill_evidences: Optional[List[Dict[str, Any]]] = None
    applied_learning: Optional[List[Dict[str, Any]]] = None
    career_goal: Optional[Dict[str, Any]] = None
    peer_mentors: Optional[List[Dict[str, Any]]] = None
    fdp_effectiveness_history: Optional[List[Dict[str, Any]]] = None

# ======================= AGENT & INTELLIGENCE SCHEMAS =======================
class SkillGapItem(BaseModel):
    skill: str
    current_level: str
    required_level: str
    gap_score: float
    priority: str # LOW, MEDIUM, HIGH, CRITICAL
    reason: str

class SkillGapAnalysisResponse(BaseModel):
    faculty_id: int
    faculty_name: str
    department: str
    skill_gaps: List[SkillGapItem]
    overall_readiness_score: float
    analysis_summary: str
    generated_at: datetime

class TrainingRecommendationItem(BaseModel):
    title: str
    topic: str
    priority: str
    recommended_duration: str
    confidence_score: float
    reasons: List[str]
    suggested_delivery_mode: str
    aligned_gap: str

class TrainingRecommendationResponse(BaseModel):
    faculty_id: int
    faculty_name: str
    recommendations: List[TrainingRecommendationItem]
    generated_at: datetime

class ResourcePersonMatchItem(BaseModel):
    resource_person_id: int
    name: str
    organization: str
    designation: str
    match_score: float # e.g. 94
    expertise_match: float # e.g. 96
    rating: float # e.g. 4.8
    experience_years: float
    reason: str
    expertise_areas: List[str]

class ResourcePersonMatchResponse(BaseModel):
    event_id: int
    event_title: str
    matches: List[ResourcePersonMatchItem]

class FDPGenerateRequest(BaseModel):
    prompt: str
    department_id: Optional[int] = None
    target_duration_days: Optional[int] = 2

class GeneratedFDPResponse(BaseModel):
    title: str
    event_type: str
    description: str
    objectives: str
    target_audience: str
    eligibility: str
    duration_hours: float
    capacity: int
    delivery_mode: str
    expected_outcomes: str
    learning_outcomes: str
    estimated_budget: float
    trainer_expertise_requirement: str
    registration_description: str
    certificate_eligibility_criteria: str
    schedule: List[Dict[str, Any]] # day-wise sessions
    pre_assessment_questions: List[Dict[str, Any]]
    post_assessment_questions: List[Dict[str, Any]]
    feedback_questions: List[str]
    final_report_outline: List[str]
    created_draft_event_id: Optional[int] = None

class LearningImpactResponse(BaseModel):
    event_id: int
    event_title: str
    pre_average: float
    post_average: float
    learning_gain_pp: float # percentage points, e.g. +32
    attendance_rate: float
    completion_rate: float
    improvement_distribution: Dict[str, int]
    impact_level: str # HIGH, MODERATE, LOW, PENDING
    participant_count: int
    explanation: str
    has_data: Optional[bool] = False

class FeedbackIntelligenceResponse(BaseModel):
    event_id: int
    event_title: str
    total_responses: int
    overall_rating: float # out of 5
    metrics: Dict[str, float] # content, trainer, relevance, practical, organization
    positive_themes: List[str]
    negative_themes: List[str]
    trainer_sentiment: str
    practical_sentiment: str
    common_requests: List[str]
    recommended_improvements: List[str]
    sentiment_distribution: Dict[str, int]
    has_feedback: Optional[bool] = False

class PredictiveTrainingDemandItem(BaseModel):
    rank: int
    topic: str
    demand_score: float
    target_departments: List[str]
    suggested_capacity: int
    suggested_duration: str
    priority: str
    reason: str
    recommended_programme_title: str

class PredictiveTrainingPlanResponse(BaseModel):
    academic_year: str
    semester: str
    demands: List[PredictiveTrainingDemandItem]
    insights: List[str]
    generated_at: datetime

class EventReportResponse(BaseModel):
    programme_overview: Dict[str, Any]
    objectives: List[str]
    target_audience: str
    schedule: List[Dict[str, Any]]
    resource_persons: List[Dict[str, Any]]
    participant_information: Dict[str, Any]
    attendance_summary: Dict[str, Any]
    pre_assessment: Dict[str, Any]
    post_assessment: Dict[str, Any]
    learning_gain: Dict[str, Any]
    feedback_intelligence: Dict[str, Any]
    programme_outcomes: List[str]
    certificates: Dict[str, Any]
    budget: Dict[str, Any]
    supporting_information: str
    recommendations: List[str]

# ======================= NEW FEATURES SCHEMAS =======================

# 1. Peer Mentor Matcher
class PeerMentorMatchItem(BaseModel):
    mentor_faculty_id: int
    mentor_name: str
    match_score: float
    skill_level: str
    department: Optional[str] = None
    designation: Optional[str] = None
    years_of_experience: Optional[float] = 0.0
    reason: str

class PeerMentorResponse(BaseModel):
    faculty_id: int
    faculty_name: Optional[str] = None
    skill_gap: str
    mentor_matches: List[PeerMentorMatchItem]

# 2. Skill Evidence
class SkillEvidenceCreate(BaseModel):
    skill_name: str
    evidence_type: str # ASSESSMENT, CERTIFICATE, PROJECT, TRAINER_EVALUATION, PRACTICAL_ACTIVITY, WORKSHOP_COMPLETION
    evidence_reference: str
    score: Optional[float] = None
    verified: bool = True
    verified_by: Optional[str] = None

class SkillEvidenceResponse(BaseModel):
    id: int
    faculty_id: int
    skill_name: str
    evidence_type: str
    evidence_reference: str
    score: Optional[float] = None
    verified: bool
    verified_by: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VerifiedSkillItem(BaseModel):
    skill_name: str
    proficiency_level: str
    verification_status: str # UNVERIFIED, PARTIALLY_VERIFIED, VERIFIED
    evidence_count: int
    evidence_types: List[str]
    last_verified: Optional[datetime] = None

# 3. Teaching Impact
class TeachingImpactCreate(BaseModel):
    faculty_id: Optional[int] = None
    event_id: Optional[int] = None
    skill_name: str
    application_type: str # CLASSROOM, RESEARCH, LAB, ASSESSMENT, CONTENT_CREATION, PROJECT_GUIDANCE
    application_description: Optional[str] = None
    description: Optional[str] = None # Alias
    evidence_url: Optional[str] = None
    evidence_reference: Optional[str] = None # Alias
    self_rating: float = 4.0
    reviewer_rating: Optional[float] = None
    impact_status: Optional[str] = "APPLIED" # PLANNED, APPLIED, VERIFIED
    status: Optional[str] = None # Alias
    applied_at: Optional[datetime] = None

class TeachingImpactVerify(BaseModel):
    reviewer_rating: Optional[float] = None
    verified_by: Optional[str] = "HOD / IQAC Review"

class TeachingImpactResponse(BaseModel):
    id: int
    faculty_id: int
    faculty_name: Optional[str] = None
    event_id: Optional[int] = None
    event_title: Optional[str] = None
    skill_name: str
    application_type: str
    application_description: str
    description: Optional[str] = None # Alias
    evidence_url: Optional[str] = None
    evidence_reference: Optional[str] = None # Alias
    self_rating: float
    reviewer_rating: Optional[float] = None
    impact_status: str
    status: Optional[str] = None # Alias
    applied_at: Optional[datetime] = None
    created_at: datetime
    verified_at: Optional[datetime] = None
    verified_by: Optional[str] = None

    class Config:
        from_attributes = True

# 4. FDP Effectiveness
class FDPEffectivenessResponse(BaseModel):
    event_id: int
    event_title: str
    event_code: str
    learning_score: float
    attendance_score: float
    completion_score: float
    feedback_score: float
    application_score: float
    cost_efficiency_score: float
    overall_effectiveness_score: float
    impact_level: str # LOW, MEDIUM, HIGH, EXCELLENT
    actual_expenditure: float
    completed_participants: int
    cost_per_participant: float
    weights: Dict[str, float]
    breakdown_explanations: List[str]

# 5. Career Growth Path
class CareerGrowthRequest(BaseModel):
    goal: str # RESEARCH_MENTOR, AI_ENABLED_EDUCATOR, ACADEMIC_LEADER, INDUSTRY_READY_FACULTY, INNOVATION_MENTOR, PUBLICATION_FOCUSED_RESEARCHER

class CareerGrowthStep(BaseModel):
    step_number: int
    skill_or_milestone: str
    priority: str # HIGH, MEDIUM, LOW
    current_status: str # COMPLETED, IN_PROGRESS, RECOMMENDED
    recommended_training: str
    reason: str

class CareerGrowthResponse(BaseModel):
    faculty_id: int
    faculty_name: str
    goal: str
    goal_title: str
    description: str
    target_timeline_months: int
    current_progress_percentage: float
    path: List[CareerGrowthStep]
    next_recommended_step: Optional[str] = None
    ai_guidance: Optional[str] = None

# 6. Skill Heatmap
class SkillHeatmapCell(BaseModel):
    skill_name: str
    department_id: int
    department_code: str
    score: float # 0 to 100
    level: str # LOW, MEDIUM, HIGH
    faculty_count_with_skill: int
    faculty_with_gap: int

class DepartmentSkillHeatmapResponse(BaseModel):
    departments: List[Dict[str, Any]]
    skills: List[str]
    matrix: Dict[str, Dict[str, Dict[str, Any]]] # skill -> dept_code -> {score, level, ...}
    summary: Dict[str, Any]

# 7. What-If Training Simulator
class WhatIfSimulationRequest(BaseModel):
    topic: str
    department_ids: List[int]
    duration_hours: float = 16.0
    capacity: int = 50
    estimated_budget: float = 40000.0

class WhatIfSimulationResponse(BaseModel):
    programme_title: str
    topic: str
    eligible_faculty: int
    potential_participants: int
    relevant_skill_gaps: int
    projected_skill_gaps_addressed: float # percentage e.g. 63.0
    projected_skill_gaps_addressed_count: int
    departments_benefited: List[str]
    estimated_cost_per_participant: float
    expected_learning_impact: str # HIGH, MODERATE, LOW
    expected_compliance_improvement: float # e.g. +14.5%
    projected_compliance_hours_added: float
    priority_score: float
    is_projected: bool = True
    disclaimer: str = "ESTIMATED / PROJECTED VALUES: Calculated using deterministic institutional data models and competency heuristics."
    explanation: str
    draft_creation_payload: Dict[str, Any]

# 8. Training Equity
class TrainingEquityFacultyItem(BaseModel):
    faculty_id: int
    faculty_name: str
    faculty_code: str
    department: str
    programmes_attended: int
    training_hours: float
    last_attended_date: Optional[str] = None
    participation_status: str # HIGH_PARTICIPATION, BALANCED, NEEDS_OPPORTUNITY

class TrainingEquityResponse(BaseModel):
    total_faculty: int
    highly_trained_count: int
    moderately_trained_count: int
    no_recent_training_count: int
    participation_equity_score: float # 0 to 100
    potential_issue: str
    recommendations: List[str]
    distribution: Dict[str, int]
    faculty_list: List[TrainingEquityFacultyItem]

# 9. Knowledge Sharing Recommender
class KnowledgeSharingItem(BaseModel):
    recommended_faculty_id: int
    recommended_faculty_name: str
    designation: str
    department: str
    topic: str
    source_event_title: str
    learning_gain_achieved: float
    target_department: str
    suggested_duration: str
    reason: str
    impact_score: float

class KnowledgeSharingResponse(BaseModel):
    recommendations: List[KnowledgeSharingItem]
    total_recommended: int
    rationale: str
