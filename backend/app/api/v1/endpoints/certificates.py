from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.event import Event
from app.models.certificate import Certificate
from app.schemas import CertificateGenerateRequest, CertificateResponse, CertificateVerifyResponse
from app.services.certificate_service import certificate_service

router = APIRouter()

@router.post("/events/{id}/generate-certificates", response_model=List[CertificateResponse])
def generate_event_certificates(id: int, req: Optional[CertificateGenerateRequest] = None, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found.")

    certs = []
    if req and req.faculty_ids:
        for f_id in req.faculty_ids:
            try:
                cert = certificate_service.generate_certificate_for_faculty(db, id, f_id)
                certs.append(cert)
            except Exception as e:
                pass
    else:
        certs = certificate_service.generate_all_eligible_certificates(db, id)

    results = []
    for c in certs:
        resp = CertificateResponse.from_orm(c)
        resp.event_title = c.event.title if c.event else None
        resp.faculty_name = c.faculty.full_name if c.faculty else None
        results.append(resp)
    return results

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
