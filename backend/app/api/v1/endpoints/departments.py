from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.department import Department
from app.schemas import DepartmentCreate, DepartmentUpdate, DepartmentResponse

router = APIRouter()

@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(dept_in: DepartmentCreate, db: Session = Depends(get_db)):
    existing = db.query(Department).filter(
        (Department.name == dept_in.name) | (Department.code == dept_in.code)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Department with this name or code already exists.")
    
    dept = Department(**dept_in.dict())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept

@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).all()
    res = []
    for d in depts:
        resp = DepartmentResponse.from_orm(d)
        resp.faculty_count = len(d.faculty_members) if d.faculty_members else 0
        resp.event_count = len(d.events) if d.events else 0
        res.append(resp)
    return res

@router.get("/departments/{id}", response_model=DepartmentResponse)
def get_department(id: int, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")
    resp = DepartmentResponse.from_orm(dept)
    resp.faculty_count = len(dept.faculty_members) if dept.faculty_members else 0
    resp.event_count = len(dept.events) if dept.events else 0
    return resp

@router.put("/departments/{id}", response_model=DepartmentResponse)
def update_department(id: int, dept_in: DepartmentUpdate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found.")
    
    for field, val in dept_in.dict(exclude_unset=True).items():
        setattr(dept, field, val)
    
    db.commit()
    db.refresh(dept)
    resp = DepartmentResponse.from_orm(dept)
    resp.faculty_count = len(dept.faculty_members) if dept.faculty_members else 0
    resp.event_count = len(dept.events) if dept.events else 0
    return resp
