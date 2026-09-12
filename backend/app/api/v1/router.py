from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    departments,
    faculty,
    resource_persons,
    events,
    proposals,
    registrations,
    attendance,
    assessments,
    feedback,
    certificates,
    compliance,
    agents,
    reports,
    dashboard,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, tags=["Auth & Roles"])
api_router.include_router(departments.router, tags=["Departments"])
api_router.include_router(faculty.router, tags=["Faculty"])
api_router.include_router(resource_persons.router, tags=["Resource Persons"])
api_router.include_router(events.router, tags=["Events & FDPs"])
api_router.include_router(proposals.router, tags=["Proposals & Approvals"])
api_router.include_router(registrations.router, tags=["Registrations"])
api_router.include_router(attendance.router, tags=["Attendance"])
api_router.include_router(assessments.router, tags=["Assessments & Learning Impact"])
api_router.include_router(feedback.router, tags=["Feedback Intelligence"])
api_router.include_router(certificates.router, tags=["Certificates"])
api_router.include_router(compliance.router, tags=["Compliance"])
api_router.include_router(agents.router, tags=["AI Agents"])
api_router.include_router(reports.router, tags=["Reports"])
api_router.include_router(dashboard.router, tags=["Dashboard & Strategy"])
