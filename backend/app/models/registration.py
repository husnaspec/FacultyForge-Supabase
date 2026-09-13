from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True) # Nullable for external/guest registrations
    
    # Self-registration participant details
    participant_name = Column(String(150), nullable=True)
    faculty_code = Column(String(50), nullable=True)
    email = Column(String(120), nullable=True)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    institution_name = Column(String(200), nullable=True)
    years_of_experience = Column(Float, nullable=True)
    teaching_interests = Column(Text, nullable=True)
    research_interests = Column(Text, nullable=True)

    # Identifiers & QR Tokens
    registration_code = Column(String(100), nullable=True, index=True) # e.g. REG-VU2026-0042
    registration_token = Column(String(100), nullable=True, index=True)
    qr_token = Column(String(255), nullable=True, index=True)

    registered_at = Column(DateTime, default=datetime.utcnow)
    
    # Status: CONFIRMED, WAITLISTED, CANCELLED, REVOKED
    registration_status = Column(String(50), default="CONFIRMED")
    eligibility_status = Column(String(50), default="ELIGIBLE") # ELIGIBLE, PENDING, INELIGIBLE
    completion_status = Column(String(50), default="IN_PROGRESS") # IN_PROGRESS, COMPLETED, INCOMPLETE
    attendance_status = Column(String(50), default="PENDING") # PENDING, PRESENT, ABSENT

    event = relationship("Event", back_populates="registrations")
    faculty = relationship("Faculty", back_populates="registrations")
    attendances = relationship("Attendance", back_populates="registration", cascade="all, delete-orphan")

