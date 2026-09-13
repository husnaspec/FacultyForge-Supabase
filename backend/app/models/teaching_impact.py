from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class TeachingImpact(Base):
    __tablename__ = "teaching_impacts"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    skill_name = Column(String(100), nullable=False, index=True)

    # Application Types: CLASSROOM, RESEARCH, LAB, ASSESSMENT, CONTENT_CREATION, PROJECT_GUIDANCE
    application_type = Column(String(50), nullable=False)
    application_description = Column(Text, nullable=False)
    evidence_url = Column(String(255), nullable=True)
    self_rating = Column(Float, default=4.0) # 1 to 5 scale
    reviewer_rating = Column(Float, nullable=True)

    # Impact Status: PLANNED, APPLIED, VERIFIED
    impact_status = Column(String(50), default="APPLIED")
    applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(String(150), nullable=True)

    faculty = relationship("Faculty", back_populates="teaching_impacts")
    event = relationship("Event", back_populates="teaching_impacts")

    @property
    def description(self) -> str:
        return self.application_description

    @property
    def evidence_reference(self) -> str:
        return self.evidence_url

    @property
    def status(self) -> str:
        return self.impact_status
