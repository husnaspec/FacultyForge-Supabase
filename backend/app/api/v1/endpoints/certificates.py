from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.event import Event
from app.models.certificate import Certificate
from app.schemas import (
    CertificateGenerateRequest,
    CertificateResponse,
    CertificateVerifyResponse,
    EventEligibilityResponse,
    CertificateGenerationResult,
)
from app.services.certificate_service import certificate_service

router = APIRouter()

@router.get("/events/{id}/certificate-eligibility", response_model=EventEligibilityResponse)
def get_event_certificate_eligibility(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")
    return certificate_service.get_event_eligibility(db, id)

@router.post("/events/{id}/generate-certificates", response_model=CertificateGenerationResult)
def generate_event_certificates(id: int, req: Optional[CertificateGenerateRequest] = None, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    if req and req.faculty_ids:
        generated_certs = []
        skipped_reasons = []
        for f_id in req.faculty_ids:
            eligibility = certificate_service.check_eligibility(db, id, f_id)
            if eligibility["is_eligible"]:
                try:
                    cert = certificate_service.generate_certificate_for_faculty(db, id, f_id, force=True)
                    generated_certs.append(cert)
                except Exception as e:
                    skipped_reasons.append(f"Faculty {f_id}: {str(e)}")
            else:
                skipped_reasons.append(f"Faculty {f_id}: {eligibility['reason']}")
        result = {
            "generated_count": len(generated_certs),
            "skipped_count": len(skipped_reasons),
            "reasons": skipped_reasons,
            "certificates": generated_certs
        }
    else:
        result = certificate_service.generate_all_eligible_certificates(db, id)

    cert_responses = []
    for c in result["certificates"]:
        resp = CertificateResponse.from_orm(c)
        resp.event_title = c.event.title if c.event else None
        resp.faculty_name = c.faculty.full_name if c.faculty else None
        cert_responses.append(resp)

    return {
        "generated_count": result["generated_count"],
        "skipped_count": result["skipped_count"],
        "reasons": result["reasons"],
        "certificates": cert_responses
    }

@router.get("/certificates/verify/{token}", response_model=CertificateVerifyResponse)
def verify_certificate_token(token: str, db: Session = Depends(get_db)):
    data = certificate_service.verify_token(db, token)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid certificate token. Certificate record not found or revoked.")
    return data

@router.get("/certificates/event/{id}", response_model=List[CertificateResponse])
def get_event_certificates(id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    certs = db.query(Certificate).filter(Certificate.event_id == id).all()
    results = []
    for c in certs:
        resp = CertificateResponse.from_orm(c)
        resp.event_title = c.event.title if c.event else None
        resp.faculty_name = c.faculty.full_name if c.faculty else None
        results.append(resp)
    return results
