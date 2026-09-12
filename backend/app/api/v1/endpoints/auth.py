from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RoleSwitchRequest(BaseModel):
    role: str # "ADMIN", "HOD", "FACULTY"
    faculty_id: int = 1

@router.get("/auth/roles")
def get_available_roles():
    return {
        "roles": [
            {
                "role": "ADMIN",
                "label": "Admin / FDP Coordinator",
                "description": "Create FDPs, AI Generator, proposals, attendance, certificates, run agents, view reports."
            },
            {
                "role": "HOD",
                "label": "HOD / IQAC / Approver",
                "description": "Review proposals, approve/reject FDPs, view compliance, department analytics."
            },
            {
                "role": "FACULTY",
                "label": "Faculty Member (Dr. Ayesha Khan)",
                "description": "Digital Passport, take assessments, view skill gaps, register for FDPs, certificates."
            }
        ]
    }
