from sqlalchemy import Column, Integer, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)

    # 1 to 5 ratings
    content_rating = Column(Integer, nullable=False, default=5)
    trainer_rating = Column(Integer, nullable=False, default=5)
    relevance_rating = Column(Integer, nullable=False, default=5)
    practical_rating = Column(Integer, nullable=False, default=4)
    organization_rating = Column(Integer, nullable=False, default=5)

    comments = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("event_id", "faculty_id", name="uq_event_faculty_feedback"),
    )

    event = relationship("Event", back_populates="feedbacks")
    faculty = relationship("Faculty", back_populates="feedbacks")
