from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.models.compliance import ComplianceRule
from app.schemas import ComplianceRuleCreate, ComplianceRuleResponse
from app.services.compliance_service import compliance_service

router = APIRouter()

@router.post("/compliance/rules", response_model=ComplianceRuleResponse, status_code=status.HTTP_201_CREATED)
def create_compliance_rule(rule_in: ComplianceRuleCreate, db: Session = Depends(get_db)):
    existing = db.query(ComplianceRule).filter(ComplianceRule.rule_name == rule_in.rule_name).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Compliance rule with this name already exists.")

    rule = ComplianceRule(**rule_in.dict())
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.get("/compliance/rules", response_model=List[ComplianceRuleResponse])
def list_compliance_rules(db: Session = Depends(get_db)):
    return db.query(ComplianceRule).all()

@router.get("/compliance/dashboard")
def get_compliance_dashboard(db: Session = Depends(get_db)):
    return compliance_service.get_compliance_dashboard(db)
