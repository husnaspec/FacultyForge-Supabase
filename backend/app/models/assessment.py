from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    # Type: PRE, POST
    assessment_type = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    total_marks = Column(Float, default=100.0)
    passing_marks = Column(Float, default=50.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(Text, nullable=False)
    option_b = Column(Text, nullable=False)
    option_c = Column(Text, nullable=False)
    option_d = Column(Text, nullable=False)
    correct_option = Column(String(5), nullable=False) # 'a', 'b', 'c', or 'd'
    marks = Column(Float, default=10.0)
    explanation = Column(Text, nullable=True)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("assessment_id", "faculty_id", name="uq_assessment_faculty_attempt"),
    )

    assessment = relationship("Assessment", back_populates="attempts")
    faculty = relationship("Faculty", back_populates="assessment_attempts")
