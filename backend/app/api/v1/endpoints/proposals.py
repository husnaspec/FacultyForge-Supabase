from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.event import Event
from app.models.proposal import Proposal
from app.schemas import ProposalSubmitRequest, ProposalReviewRequest, ProposalResponse

router = APIRouter()

@router.post("/events/{id}/submit", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
def submit_proposal(id: int, req: ProposalSubmitRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    if event.status not in ["DRAFT", "REJECTED"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot submit proposal for event in '{event.status}' state.")

    # Create new proposal record
    proposal = Proposal(
        event_id=event.id,
        submitted_by=req.submitted_by,
        submitted_at=datetime.utcnow(),
        approval_status="PENDING"
    )
    db.add(proposal)
    event.status = "PENDING_APPROVAL"
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(proposal)

    resp = ProposalResponse.from_orm(proposal)
    resp.event_title = event.title
    resp.department_name = event.department.name if event.department else None
    return resp

@router.get("/proposals", response_model=List[ProposalResponse])
def list_proposals(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Proposal)
    if status:
        query = query.filter(Proposal.approval_status == status.upper())
    
    proposals = query.order_by(Proposal.submitted_at.desc()).all()
    results = []
    for p in proposals:
        resp = ProposalResponse.from_orm(p)
        resp.event_title = p.event.title if p.event else None
        resp.department_name = p.event.department.name if p.event and p.event.department else None
        results.append(resp)
    return results

@router.post("/proposals/{id}/approve", response_model=ProposalResponse)
def approve_proposal(id: int, req: ProposalReviewRequest, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

    proposal.approval_status = "APPROVED"
    proposal.approver_name = req.approver_name
    proposal.approver_role = req.approver_role
    proposal.remarks = req.remarks or "Approved as compliant with institutional development priorities."
    proposal.reviewed_at = datetime.utcnow()

    if proposal.event:
        proposal.event.status = "APPROVED"
        proposal.event.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(proposal)

    resp = ProposalResponse.from_orm(proposal)
    resp.event_title = proposal.event.title if proposal.event else None
    resp.department_name = proposal.event.department.name if proposal.event and proposal.event.department else None
    return resp

@router.post("/proposals/{id}/reject", response_model=ProposalResponse)
def reject_proposal(id: int, req: ProposalReviewRequest, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

    if not req.remarks or not req.remarks.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Remarks are mandatory when rejecting a proposal.")

    proposal.approval_status = "REJECTED"
    proposal.approver_name = req.approver_name
    proposal.approver_role = req.approver_role
    proposal.remarks = req.remarks
    proposal.reviewed_at = datetime.utcnow()

    if proposal.event:
        proposal.event.status = "REJECTED"
        proposal.event.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(proposal)

    resp = ProposalResponse.from_orm(proposal)
    resp.event_title = proposal.event.title if proposal.event else None
    resp.department_name = proposal.event.department.name if proposal.event and proposal.event.department else None
    return resp

@router.post("/proposals/{id}/request-changes", response_model=ProposalResponse)
def request_changes_proposal(id: int, req: ProposalReviewRequest, db: Session = Depends(get_db)):
    proposal = db.query(Proposal).filter(Proposal.id == id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")

    if not req.remarks or not req.remarks.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Remarks are mandatory when requesting changes.")

    proposal.approval_status = "CHANGES_REQUESTED"
    proposal.approver_name = req.approver_name
    proposal.approver_role = req.approver_role
    proposal.remarks = req.remarks
    proposal.reviewed_at = datetime.utcnow()

    if proposal.event:
        proposal.event.status = "DRAFT" # Return to DRAFT for coordinator editing
        proposal.event.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(proposal)

    resp = ProposalResponse.from_orm(proposal)
    resp.event_title = proposal.event.title if proposal.event else None
    resp.department_name = proposal.event.department.name if proposal.event and proposal.event.department else None
    return resp
