from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class ResourcePerson(Base):
    __tablename__ = "resource_persons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    organization = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=False)
    expertise = Column(Text, nullable=False)   # comma-separated keywords or areas
    topics = Column(Text, nullable=True)      # comma-separated or summary
    biography = Column(Text, nullable=True)
    years_of_experience = Column(Float, default=0.0)
    total_sessions = Column(Integer, default=0)
    average_rating = Column(Float, default=4.5)
    honorarium_expectation = Column(String(100), nullable=True)
    travel_required = Column(Boolean, default=False)
    availability_notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("EventSession", back_populates="resource_person")
