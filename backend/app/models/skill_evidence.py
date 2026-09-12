from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class SkillEvidence(Base):
    __tablename__ = "skill_evidence"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    skill_name = Column(String(100), nullable=False, index=True)
    
    # Evidence Types: ASSESSMENT, CERTIFICATE, PROJECT, TRAINER_EVALUATION, PRACTICAL_ACTIVITY, WORKSHOP_COMPLETION
    evidence_type = Column(String(50), nullable=False)
    evidence_reference = Column(Text, nullable=False)
    score = Column(Float, nullable=True)
    verified = Column(Boolean, default=True)
    verified_by = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty = relationship("Faculty", back_populates="skill_evidences")
