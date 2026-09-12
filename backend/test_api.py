import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.services.seed_service import seed_service

# Initialize and seed
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_service.seed_all(db)
db.close()

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    print("[OK] Health endpoint OK")

def test_departments():
    response = client.get("/api/v1/departments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    print(f"[OK] Departments OK ({len(data)} departments found)")

def test_faculty():
    response = client.get("/api/v1/faculty")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 12
    print(f"[OK] Faculty OK ({len(data)} faculty members found)")

def test_resource_persons():
    response = client.get("/api/v1/resource-persons")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    print(f"[OK] Resource Persons OK ({len(data)} persons found)")

def test_events_and_proposals():
    response = client.get("/api/v1/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 5
    print(f"[OK] Events OK ({len(events)} events found)")

    # Test creating new draft FDP
    import uuid
    rand_code = f"FFAI-TEST-{uuid.uuid4().hex[:6].upper()}"
    new_event = {
        "event_code": rand_code,
        "title": "Quantum Computing Fundamentals",
        "description": "Introductory quantum algorithms workshop.",
        "event_type": "FDP",
        "department_id": 1,
        "duration_hours": 16.0,
        "capacity": 30,
        "delivery_mode": "HYBRID",
        "estimated_budget": 20000.0,
        "actual_expenditure": 0.0
    }
    create_res = client.post("/api/v1/events", json=new_event)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["status"] == "DRAFT"
    print("[OK] Event Creation in DRAFT state OK")

    # Submit proposal
    submit_res = client.post(f"/api/v1/events/{created['id']}/submit", json={"submitted_by": "Test Coordinator"})
    assert submit_res.status_code == 201
    prop = submit_res.json()
    assert prop["approval_status"] == "PENDING"
    print("[OK] Proposal Submission OK")

    # Approve proposal
    approve_res = client.post(f"/api/v1/proposals/{prop['id']}/approve", json={"approver_name": "Dr. Priya Iyer", "approver_role": "HOD", "remarks": "Approved"})
    assert approve_res.status_code == 200
    assert approve_res.json()["approval_status"] == "APPROVED"
    print("[OK] Proposal Approval OK")

def test_skill_gap_and_recommendation_agents():
    # Dr. Ayesha Khan (faculty_id = 1)
    gap_res = client.post("/api/v1/agents/skill-gap/1")
    assert gap_res.status_code == 200
    gaps_data = gap_res.json()
    assert len(gaps_data["skill_gaps"]) >= 2
    # Verify high priority Generative AI gap exists
    skills = [g["skill"] for g in gaps_data["skill_gaps"]]
    assert any("Generative AI" in s for s in skills)
    print(f"[OK] Skill Gap Agent OK (Identified {len(gaps_data['skill_gaps'])} gaps for {gaps_data['faculty_name']})")

    # Recommendation agent
    rec_res = client.post("/api/v1/agents/recommend-training/1")
    assert rec_res.status_code == 200
    recs_data = rec_res.json()
    assert len(recs_data["recommendations"]) >= 1
    print(f"[OK] Training Recommendation Agent OK ({recs_data['recommendations'][0]['title']})")

def test_fdp_generator_and_resource_matcher():
    gen_res = client.post("/api/v1/agents/generate-fdp", json={
        "prompt": "Create a 2-day FDP on Generative AI for Engineering Faculty",
        "department_id": 1,
        "target_duration_days": 2
    })
    assert gen_res.status_code == 200
    blueprint = gen_res.json()
    assert "Generative AI" in blueprint["title"]
    assert len(blueprint["schedule"]) >= 4
    assert len(blueprint["pre_assessment_questions"]) >= 2
    assert len(blueprint["post_assessment_questions"]) >= 2
    assert blueprint["created_draft_event_id"] is not None
    print("[OK] AI FDP Generator Agent OK (Created draft event, sessions, assessments)")

    # Match resource person for generated event
    draft_id = blueprint["created_draft_event_id"]
    match_res = client.post(f"/api/v1/agents/match-resource-person/{draft_id}")
    assert match_res.status_code == 200
    matches = match_res.json()["matches"]
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match["match_score"] >= 70
    print(f"[OK] Resource Person Matcher Agent OK (Top match: {top_match['name']} with score {top_match['match_score']})")

def test_learning_gain_and_feedback():
    # Event 1 (Cybersecurity)
    impact_res = client.get("/api/v1/events/1/learning-impact")
    assert impact_res.status_code == 200
    impact = impact_res.json()
    assert impact["learning_gain_pp"] > 0
    print(f"[OK] Learning Impact Agent OK (Learning Gain: +{impact['learning_gain_pp']} percentage points, Pre: {impact['pre_average']}%, Post: {impact['post_average']}%)")

    # Feedback intelligence
    fb_res = client.get("/api/v1/events/1/feedback-intelligence")
    assert fb_res.status_code == 200
    fb_intel = fb_res.json()
    assert fb_intel["overall_rating"] >= 4.0
    assert len(fb_intel["positive_themes"]) > 0
    assert len(fb_intel["negative_themes"]) > 0
    print(f"[OK] Feedback Intelligence Agent OK (Rating: {fb_intel['overall_rating']}/5.0)")

def test_passport_and_compliance():
    passport_res = client.get("/api/v1/faculty/1/passport")
    assert passport_res.status_code == 200
    passport = passport_res.json()
    assert passport["faculty_code"] == "FAC-CSE-001"
    assert passport["compliance"] is not None
    assert len(passport["skills_acquired"]) > 0
    print(f"[OK] Faculty Digital Passport OK ({passport['full_name']} has {passport['total_training_hours']} hrs, {len(passport['skills_acquired'])} skills)")

    # Certificate verification
    certs = client.get("/api/v1/certificates/event/1").json()
    assert len(certs) > 0
    token = certs[0]["verification_token"]
    verify_res = client.get(f"/api/v1/certificates/verify/{token}")
    assert verify_res.status_code == 200
    ver_data = verify_res.json()
    assert ver_data["is_valid"] is True
    print(f"[OK] Certificate Verification OK (Code: {ver_data['certificate_code']}, Status: {ver_data['verification_status']})")

def test_predictive_planner_and_dashboard():
    plan_res = client.get("/api/v1/agents/training-plan")
    assert plan_res.status_code == 200
    demands = plan_res.json()["demands"]
    assert len(demands) >= 4
    print(f"[OK] Predictive Training Planner Agent OK (Top Demand: {demands[0]['topic']} Score: {demands[0]['demand_score']})")

    # Dashboard Summary
    dash_res = client.get("/api/v1/dashboard/summary")
    assert dash_res.status_code == 200
    dash = dash_res.json()
    assert dash["total_faculty"] >= 12
    assert dash["average_attendance"] > 0
    print("[OK] Dashboard Summary OK")

    # Strategy Dashboard
    strat_res = client.get("/api/v1/dashboard/strategy")
    assert strat_res.status_code == 200
    strat = strat_res.json()
    assert len(strat["skill_gap_categories"]) > 0
    assert len(strat["department_development_score"]) >= 4
    print("[OK] University Strategy Dashboard OK")

if __name__ == "__main__":
    print("==================================================")
    print("RUNNING FACULTYFORGE AI BACKEND TEST SUITE")
    print("==================================================")
    test_health()
    test_departments()
    test_faculty()
    test_resource_persons()
    test_events_and_proposals()
    test_skill_gap_and_recommendation_agents()
    test_fdp_generator_and_resource_matcher()
    test_learning_gain_and_feedback()
    test_passport_and_compliance()
    test_predictive_planner_and_dashboard()
    print("==================================================")
    print("ALL 10 BACKEND TEST SUITES PASSED SUCCESSFULLY!")
    print("==================================================")
