from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    registered_at = Column(DateTime, default=datetime.utcnow)
    
    # Status: CONFIRMED, WAITLISTED, CANCELLED
    registration_status = Column(String(50), default="CONFIRMED")
    eligibility_status = Column(String(50), default="ELIGIBLE") # ELIGIBLE, PENDING, INELIGIBLE
    completion_status = Column(String(50), default="IN_PROGRESS") # IN_PROGRESS, COMPLETED, INCOMPLETE

    __table_args__ = (
        UniqueConstraint("event_id", "faculty_id", name="uq_event_faculty_registration"),
    )

    event = relationship("Event", back_populates="registrations")
    faculty = relationship("Faculty", back_populates="registrations")
