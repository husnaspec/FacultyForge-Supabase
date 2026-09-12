from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.db.session import get_db
from app.schemas import (
    SkillGapAnalysisResponse, TrainingRecommendationResponse,
    ResourcePersonMatchResponse, FDPGenerateRequest, GeneratedFDPResponse,
    PredictiveTrainingPlanResponse,
    PeerMentorResponse, CareerGrowthRequest, CareerGrowthResponse,
    WhatIfSimulationRequest, WhatIfSimulationResponse,
    TrainingEquityResponse, KnowledgeSharingResponse
)
from app.agents.skill_gap_agent import skill_gap_agent
from app.agents.recommendation_agent import recommendation_agent
from app.agents.resource_matcher_agent import resource_matcher_agent
from app.agents.fdp_generator_agent import fdp_generator_agent
from app.agents.predictive_planner_agent import predictive_planner_agent
from app.agents.orchestrator import orchestrator
from app.agents.peer_mentor_agent import peer_mentor_agent
from app.agents.career_growth_agent import career_growth_agent
from app.agents.training_simulator_agent import training_simulator_agent
from app.agents.training_equity_agent import training_equity_agent
from app.agents.knowledge_sharing_agent import knowledge_sharing_agent
from app.models.agent_analysis import AgentAnalysis

router = APIRouter()

@router.post("/agents/skill-gap/{faculty_id}", response_model=SkillGapAnalysisResponse)
def run_skill_gap_analysis(faculty_id: int, db: Session = Depends(get_db)):
    try:
        return skill_gap_agent.analyze(db, faculty_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/agents/recommend-training/{faculty_id}", response_model=TrainingRecommendationResponse)
def run_training_recommendation(faculty_id: int, db: Session = Depends(get_db)):
    try:
        return recommendation_agent.recommend(db, faculty_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/agents/match-resource-person/{event_id}", response_model=ResourcePersonMatchResponse)
def match_resource_person(event_id: int, db: Session = Depends(get_db)):
    try:
        return resource_matcher_agent.match_for_event(db, event_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/agents/generate-fdp", response_model=GeneratedFDPResponse)
def generate_fdp(req: FDPGenerateRequest, db: Session = Depends(get_db)):
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Prompt cannot be empty.")
    
    return fdp_generator_agent.generate(
        db,
        prompt=req.prompt,
        department_id=req.department_id,
        target_days=req.target_duration_days or 2
    )

@router.get("/agents/training-plan", response_model=PredictiveTrainingPlanResponse)
def get_predictive_training_plan(
    department_id: Optional[int] = None,
    academic_year: str = "2026-2027",
    semester: str = "Odd Semester",
    db: Session = Depends(get_db)
):
    return predictive_planner_agent.forecast_training_demands(
        db,
        department_id=department_id,
        academic_year=academic_year,
        semester=semester
    )

@router.post("/agents/orchestrate-faculty/{faculty_id}")
def orchestrate_faculty(faculty_id: int, db: Session = Depends(get_db)):
    try:
        return orchestrator.run_faculty_development_pipeline(db, faculty_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/agents/logs")
def get_agent_analysis_logs(limit: int = 15, db: Session = Depends(get_db)):
    logs = db.query(AgentAnalysis).order_by(AgentAnalysis.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "agent_name": l.agent_name,
            "faculty_id": l.faculty_id,
            "event_id": l.event_id,
            "input_summary": l.input_summary,
            "confidence_score": l.confidence_score,
            "created_at": l.created_at
        } for l in logs
    ]

@router.get("/agents/peer-mentors/{faculty_id}", response_model=PeerMentorResponse)
def get_peer_mentors(
    faculty_id: int,
    skill_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        return peer_mentor_agent.match_peer_mentors(db, faculty_id, skill_name=skill_name)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/agents/career-path/{faculty_id}", response_model=CareerGrowthResponse)
def get_career_growth_path(
    faculty_id: int,
    req: CareerGrowthRequest,
    db: Session = Depends(get_db)
):
    try:
        return career_growth_agent.generate_career_path(db, faculty_id, goal=req.goal)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/agents/simulate-training", response_model=WhatIfSimulationResponse)
def simulate_training_impact(
    req: WhatIfSimulationRequest,
    db: Session = Depends(get_db)
):
    return training_simulator_agent.simulate_training(
        db,
        topic=req.topic,
        department_ids=req.department_ids,
        duration_hours=req.duration_hours,
        capacity=req.capacity,
        estimated_budget=req.estimated_budget
    )

@router.get("/agents/training-equity", response_model=TrainingEquityResponse)
def get_training_equity(
    department_id: Optional[int] = None,
    academic_year: str = "2026-2027",
    semester: str = "Odd Semester",
    db: Session = Depends(get_db)
):
    return training_equity_agent.analyze_equity(
        db,
        department_id=department_id,
        academic_year=academic_year,
        semester=semester
    )

@router.get("/agents/knowledge-sharing", response_model=KnowledgeSharingResponse)
def get_knowledge_sharing_recommendations(db: Session = Depends(get_db)):
    return knowledge_sharing_agent.recommend_sessions(db)
