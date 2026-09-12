from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    submitted_by = Column(String(150), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Status: PENDING, APPROVED, REJECTED, CHANGES_REQUESTED
    approval_status = Column(String(50), default="PENDING", index=True)
    approver_name = Column(String(150), nullable=True)
    approver_role = Column(String(100), nullable=True) # HOD, IQAC, DEAN
    remarks = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    event = relationship("Event", back_populates="proposals")
