from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    faculty_code = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    designation = Column(String(100), nullable=False)
    qualification = Column(String(100), nullable=False)
    years_of_experience = Column(Float, default=0.0)
    teaching_interests = Column(Text, nullable=True)     # comma-separated or text
    research_interests = Column(Text, nullable=True)     # comma-separated or text
    existing_skills = Column(Text, nullable=True)        # comma-separated
    development_interests = Column(Text, nullable=True)  # comma-separated
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="faculty_members")
    skills = relationship("FacultySkill", back_populates="faculty", cascade="all, delete-orphan")
    skill_gaps = relationship("SkillGap", back_populates="faculty", cascade="all, delete-orphan")
    recommendations = relationship("TrainingRecommendation", back_populates="faculty", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="faculty", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="faculty", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="faculty", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="faculty", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="faculty", cascade="all, delete-orphan")
    compliances = relationship("FacultyCompliance", back_populates="faculty", cascade="all, delete-orphan")
    skill_evidences = relationship("SkillEvidence", back_populates="faculty", cascade="all, delete-orphan")
    teaching_impacts = relationship("TeachingImpact", back_populates="faculty", cascade="all, delete-orphan")
