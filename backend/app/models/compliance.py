from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(150), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    minimum_training_hours = Column(Float, default=40.0)
    period_type = Column(String(50), default="ANNUAL") # ANNUAL, SEMESTER, BIENNIAL
    required_topics = Column(Text, nullable=True) # Comma-separated topics e.g. "Teaching Methodology, Research, Emerging Technologies"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    faculty_compliances = relationship("FacultyCompliance", back_populates="rule", cascade="all, delete-orphan")


class FacultyCompliance(Base):
    __tablename__ = "faculty_compliance"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    compliance_rule_id = Column(Integer, ForeignKey("compliance_rules.id"), nullable=False)
    completed_hours = Column(Float, default=0.0)
    required_hours = Column(Float, default=40.0)
    compliance_percentage = Column(Float, default=0.0)
    # Status: COMPLIANT, ATTENTION_REQUIRED, NON_COMPLIANT
    status = Column(String(50), default="ATTENTION_REQUIRED")
    last_calculated = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("faculty_id", "compliance_rule_id", name="uq_faculty_compliance_rule"),
    )

    faculty = relationship("Faculty", back_populates="compliances")
    rule = relationship("ComplianceRule", back_populates="faculty_compliances")
