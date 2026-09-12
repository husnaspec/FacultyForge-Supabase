from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_code = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(250), nullable=False, index=True)
    description = Column(Text, nullable=True)
    event_type = Column(String(50), default="FDP") # FDP, WORKSHOP, SEMINAR, TRAINING, STTP
    objectives = Column(Text, nullable=True)
    target_audience = Column(String(200), nullable=True)
    eligibility = Column(String(200), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    duration_hours = Column(Float, default=16.0)
    capacity = Column(Integer, default=50)
    delivery_mode = Column(String(50), default="HYBRID") # OFFLINE, ONLINE, HYBRID
    venue = Column(String(200), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    coordinator_faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)

    # Status: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, REGISTRATION_OPEN, ONGOING, COMPLETED, CANCELLED
    status = Column(String(50), default="DRAFT", index=True)
    expected_outcomes = Column(Text, nullable=True)
    learning_outcomes = Column(Text, nullable=True)
    estimated_budget = Column(Float, default=0.0)
    actual_expenditure = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="events")
    coordinator = relationship("Faculty", foreign_keys=[coordinator_faculty_id])
    sessions = relationship("EventSession", back_populates="event", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="event", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="event", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="event", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="event", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="event", cascade="all, delete-orphan")
    teaching_impacts = relationship("TeachingImpact", back_populates="event", cascade="all, delete-orphan")


class EventSession(Base):
    __tablename__ = "event_sessions"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    session_date = Column(DateTime, nullable=True)
    start_time = Column(String(20), nullable=True)
    end_time = Column(String(20), nullable=True)
    resource_person_id = Column(Integer, ForeignKey("resource_persons.id"), nullable=True)
    learning_objective = Column(Text, nullable=True)
    room_or_link = Column(String(250), nullable=True)

    event = relationship("Event", back_populates="sessions")
    resource_person = relationship("ResourcePerson", back_populates="sessions")
    attendances = relationship("Attendance", back_populates="session", cascade="all, delete-orphan")
