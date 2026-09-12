from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from datetime import datetime
from app.db.base import Base

class AgentAnalysis(Base):
    __tablename__ = "agent_analyses"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), nullable=False, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    input_summary = Column(Text, nullable=True)
    output_json = Column(Text, nullable=False) # JSON encoded string
    confidence_score = Column(Float, default=0.90)
    created_at = Column(DateTime, default=datetime.utcnow)
