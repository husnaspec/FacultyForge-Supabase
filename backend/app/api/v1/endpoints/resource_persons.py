from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.resource_person import ResourcePerson
from app.schemas import ResourcePersonCreate, ResourcePersonUpdate, ResourcePersonResponse

router = APIRouter()

@router.post("/resource-persons", response_model=ResourcePersonResponse, status_code=status.HTTP_201_CREATED)
def create_resource_person(rp_in: ResourcePersonCreate, db: Session = Depends(get_db)):
    existing = db.query(ResourcePerson).filter(ResourcePerson.email == rp_in.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Resource person with this email already exists.")
    
    rp = ResourcePerson(**rp_in.dict())
    db.add(rp)
    db.commit()
    db.refresh(rp)
    return rp

@router.get("/resource-persons", response_model=List[ResourcePersonResponse])
def list_resource_persons(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ResourcePerson)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (ResourcePerson.name.ilike(s)) |
            (ResourcePerson.organization.ilike(s)) |
            (ResourcePerson.expertise.ilike(s)) |
            (ResourcePerson.topics.ilike(s))
        )
    return query.all()

@router.get("/resource-persons/{id}", response_model=ResourcePersonResponse)
def get_resource_person(id: int, db: Session = Depends(get_db)):
    rp = db.query(ResourcePerson).filter(ResourcePerson.id == id).first()
    if not rp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource person not found.")
    return rp

@router.put("/resource-persons/{id}", response_model=ResourcePersonResponse)
def update_resource_person(id: int, rp_in: ResourcePersonUpdate, db: Session = Depends(get_db)):
    rp = db.query(ResourcePerson).filter(ResourcePerson.id == id).first()
    if not rp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource person not found.")
    
    for field, val in rp_in.dict(exclude_unset=True).items():
        setattr(rp, field, val)

    db.commit()
    db.refresh(rp)
    return rp
