from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_code = Column(String(100), unique=True, nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)
    training_hours = Column(Float, default=16.0)
    verification_token = Column(String(100), unique=True, nullable=False, index=True)
    qr_data = Column(Text, nullable=True)
    status = Column(String(20), default="VALID") # VALID, REVOKED

    __table_args__ = (
        UniqueConstraint("event_id", "faculty_id", name="uq_event_faculty_certificate"),
    )

    event = relationship("Event", back_populates="certificates")
    faculty = relationship("Faculty", back_populates="certificates")
