from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class FacultySkill(Base):
    __tablename__ = "faculty_skills"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    proficiency_level = Column(String(50), default="INTERMEDIATE") # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    source = Column(String(100), default="SELF_REPORTED") # SELF_REPORTED, FDP_ASSESSMENT, CERTIFICATE
    verification_status = Column(String(50), default="UNVERIFIED") # UNVERIFIED, PARTIALLY_VERIFIED, VERIFIED
    last_updated = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty", back_populates="skills")


class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    current_level = Column(String(50), default="BEGINNER")
    required_level = Column(String(50), default="INTERMEDIATE")
    gap_score = Column(Float, default=70.0) # 0 to 100
    priority = Column(String(50), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    explanation = Column(Text, nullable=True)
    identified_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="ACTIVE") # ACTIVE, IN_PROGRESS, RESOLVED

    faculty = relationship("Faculty", back_populates="skill_gaps")


class TrainingRecommendation(Base):
    __tablename__ = "training_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    title = Column(String(250), nullable=False)
    topic = Column(String(150), nullable=False)
    priority = Column(String(50), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    reason = Column(Text, nullable=True)
    recommended_duration = Column(String(50), default="3 Days")
    recommended_event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    confidence_score = Column(Float, default=0.85)
    generated_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="PENDING") # PENDING, ENROLLED, COMPLETED

    faculty = relationship("Faculty", back_populates="recommendations")
    recommended_event = relationship("Event")
