from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.services.dashboard_service import dashboard_service
from app.services.skill_heatmap_service import skill_heatmap_service

router = APIRouter()

@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    return dashboard_service.get_summary_metrics(db)

@router.get("/dashboard/strategy")
def get_dashboard_strategy(db: Session = Depends(get_db)):
    return dashboard_service.get_strategy_analytics(db)

@router.get("/dashboard/skill-heatmap")
def get_dashboard_skill_heatmap(
    department_id: Optional[int] = None,
    skill_category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return skill_heatmap_service.get_skill_heatmap(
        db,
        department_id=department_id,
        skill_category=skill_category
    )
