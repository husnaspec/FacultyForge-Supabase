from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("event_sessions.id"), nullable=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=True)
    attendance_date = Column(DateTime, default=datetime.utcnow)
    
    # Status: PRESENT, ABSENT
    attendance_status = Column(String(20), default="PRESENT")
    # Method: MANUAL, QR
    attendance_method = Column(String(20), default="MANUAL")
    check_in_time = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="attendances")
    session = relationship("EventSession", back_populates="attendances")
    faculty = relationship("Faculty", back_populates="attendances")
    registration = relationship("Registration", back_populates="attendances")

