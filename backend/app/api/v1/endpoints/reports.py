from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas import EventReportResponse
from app.agents.report_agent import report_agent

router = APIRouter()

@router.get("/events/{id}/report", response_model=EventReportResponse)
def get_event_report(id: int, db: Session = Depends(get_db)):
    try:
        return report_agent.generate_report(db, id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
