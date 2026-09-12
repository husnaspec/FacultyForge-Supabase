import sys
import os
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.services.seed_service import seed_service

def run_20_step_demo():
    print("=" * 70)
    print("FACULTYFORGE AI - 20-STEP END-TO-END DEMO VERIFICATION")
    print("=" * 70)

    # Cleanly reset database to pristine demo state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_service.seed_all(db)
    db.close()

    client = TestClient(app)

    # STEP 1: Open Dashboard
    print("\n[STEP 1] Open Dashboard Summary...")
    res = client.get("/api/v1/dashboard/summary")
    assert res.status_code == 200
    dash = res.json()
    print(f"  -> Dashboard loaded. Total Faculty: {dash['total_faculty']}, Active Programmes: {dash['active_programmes']}, Avg Attendance: {dash['average_attendance']}%")

    # STEP 2: Open Dr. Ayesha Khan (Department: CSE)
    print("\n[STEP 2] Open Dr. Ayesha Khan (Department: CSE)...")
    res = client.get("/api/v1/faculty/1")
    assert res.status_code == 200
    ayesha = res.json()
    print(f"  -> Profile loaded: {ayesha['full_name']} | Code: {ayesha['faculty_code']} | Dept: {ayesha['department_name']} | Designation: {ayesha['designation']}")

    # STEP 3: Click RUN AI SKILL ANALYSIS
    print("\n[STEP 3] Click: RUN AI SKILL ANALYSIS...")
    res = client.post("/api/v1/agents/skill-gap/1")
    assert res.status_code == 200
    gaps = res.json()["skill_gaps"]
    print(f"  -> System identified {len(gaps)} competency gaps:")
    for g in gaps:
        print(f"     * [{g['priority']} PRIORITY] {g['skill']} (Current: {g['current_level']}, Required: {g['required_level']}, Gap Score: {g['gap_score']})")
    assert any(g["priority"] == "HIGH" and "Generative AI" in g["skill"] for g in gaps)
    assert any("Research Methodology" in g["skill"] for g in gaps)

    # STEP 4: Click GENERATE TRAINING RECOMMENDATIONS
    print("\n[STEP 4] Click: GENERATE TRAINING RECOMMENDATIONS...")
    res = client.post("/api/v1/agents/recommend-training/1")
    assert res.status_code == 200
    recs = res.json()["recommendations"]
    top_rec = recs[0]
    print(f"  -> Top Recommendation: '{top_rec['title']}' | Priority: {top_rec['priority']} | Confidence: {top_rec['confidence_score'] * 100:.1f}%")
    print(f"     Reasons: {'; '.join(top_rec['reasons'])}")

    # STEP 5: Go to AI FDP Generator -> Enter prompt
    prompt = "Create a 2-day FDP on Generative AI for Engineering Faculty"
    print(f"\n[STEP 5] Go to: AI FDP Generator -> Enter: '{prompt}'...")
    res = client.post("/api/v1/agents/generate-fdp", json={"prompt": prompt, "department_id": 1, "target_duration_days": 2})
    assert res.status_code == 200
    gen_data = res.json()
    event_id = gen_data["created_draft_event_id"]
    print(f"  -> Generated: '{gen_data['title']}' ({gen_data['duration_hours']} hours, {len(gen_data['schedule'])} sessions)")
    print(f"     Pre-test questions generated: {len(gen_data['pre_assessment_questions'])}, Post-test questions: {len(gen_data['post_assessment_questions'])}")

    # STEP 6: Save as Draft
    print("\n[STEP 6] Verify Saved as DRAFT...")
    res = client.get(f"/api/v1/events/{event_id}")
    assert res.status_code == 200
    assert res.json()["status"] == "DRAFT"
    print(f"  -> Event {res.json()['event_code']} verified in DRAFT status.")

    # STEP 7: Submit for Approval
    print("\n[STEP 7] Submit for Approval...")
    res = client.post(f"/api/v1/events/{event_id}/submit", json={"submitted_by": "Dr. Ayesha Khan"})
    assert res.status_code == 201
    prop = res.json()
    print(f"  -> Proposal submitted. Status: {prop['approval_status']} (Event status: PENDING_APPROVAL)")

    # STEP 8: Approve FDP (HOD Review)
    print("\n[STEP 8] HOD / IQAC Approves FDP...")
    res = client.post(f"/api/v1/proposals/{prop['id']}/approve", json={
        "approver_name": "Dr. Priya Iyer",
        "approver_role": "HOD",
        "remarks": "Approved with commendations. Fulfills department AICTE emerging technology upskilling mandate."
    })
    assert res.status_code == 200
    print(f"  -> Proposal approved. Remarks: '{res.json()['remarks']}'")

    # STEP 9: Open Registration
    print("\n[STEP 9] Open Programme Registration...")
    res = client.put(f"/api/v1/events/{event_id}", json={"status": "REGISTRATION_OPEN"})
    assert res.status_code == 200
    assert res.json()["status"] == "REGISTRATION_OPEN"
    print("  -> Programme status updated to REGISTRATION_OPEN.")

    # STEP 10: Register Faculty
    print("\n[STEP 10] Register Faculty (Dr. Ayesha Khan)...")
    res = client.post(f"/api/v1/events/{event_id}/register", json={"faculty_id": 1})
    assert res.status_code == 201
    reg = res.json()
    print(f"  -> Faculty {reg['faculty_name']} registered successfully. Reg Status: {reg['registration_status']}")

    # STEP 11: Run FIND BEST RESOURCE PERSON
    print("\n[STEP 11] Run: FIND BEST RESOURCE PERSON...")
    res = client.post(f"/api/v1/agents/match-resource-person/{event_id}")
    assert res.status_code == 200
    matches = res.json()["matches"]
    print(f"  -> Ranked {len(matches)} resource persons:")
    for m in matches[:3]:
        print(f"     1. {m['name']} ({m['organization']}) | Match Score: {m['match_score']} | Expertise: {m['expertise_match']} | Rating: {m['rating']}/5.0")
        print(f"        Reason: {m['reason']}")

    # STEP 12: Record Attendance
    print("\n[STEP 12] Record Attendance for Faculty...")
    res = client.post(f"/api/v1/attendance?event_id={event_id}", json={
        "faculty_id": 1,
        "attendance_status": "PRESENT",
        "attendance_method": "QR"
    })
    assert res.status_code == 201
    print(f"  -> Attendance recorded via QR check-in: {res.json()['attendance_status']}")

    # STEP 13: Complete PRE Test
    print("\n[STEP 13] Complete PRE Test (Diagnostic assessment)...")
    pre_assess = client.get(f"/api/v1/events/{event_id}/assessments").json()
    pre_obj = next(a for a in pre_assess if a["assessment_type"] == "PRE")
    pre_qs = pre_obj.get("questions", [])
    # Answer 1 correctly ('a') and 1 incorrectly ('c') to simulate ~50-54% baseline
    pre_answers = {}
    if len(pre_qs) >= 2:
        pre_answers[str(pre_qs[0]["id"])] = "a" # correct
        pre_answers[str(pre_qs[1]["id"])] = "c" # incorrect
    else:
        pre_answers["1"] = "a"

    res = client.post(f"/api/v1/assessments/{pre_obj['id']}/submit", json={
        "faculty_id": 1,
        "answers": pre_answers
    })
    assert res.status_code == 200
    pre_attempt = res.json()
    print(f"  -> PRE-Assessment Submitted: Score {pre_attempt['score']} ({pre_attempt['percentage']}%)")

    # STEP 14: Complete POST Test
    print("\n[STEP 14] Complete POST Test (Post-training competency)...")
    post_obj = next(a for a in pre_assess if a["assessment_type"] == "POST")
    post_qs = post_obj.get("questions", [])
    # Answer all correctly to demonstrate high post test score (~86-100%)
    post_answers = {str(q["id"]): "a" for q in post_qs}
    res = client.post(f"/api/v1/assessments/{post_obj['id']}/submit", json={
        "faculty_id": 1,
        "answers": post_answers
    })
    assert res.status_code == 200
    post_attempt = res.json()
    print(f"  -> POST-Assessment Submitted: Score {post_attempt['score']} ({post_attempt['percentage']}%)")

    # STEP 15: Show LEARNING GAIN
    print("\n[STEP 15] Show: LEARNING GAIN...")
    res = client.get(f"/api/v1/events/{event_id}/learning-impact")
    assert res.status_code == 200
    impact = res.json()
    print(f"  -> Pre Assessment Average: {impact['pre_average']}%")
    print(f"  -> Post Assessment Average: {impact['post_average']}%")
    print(f"  -> LEARNING GAIN: +{impact['learning_gain_pp']} percentage points")
    print(f"  -> Impact Level: {impact['impact_level']} | Attendance Rate: {impact['attendance_rate']}%")

    # STEP 16: Submit Feedback
    print("\n[STEP 16] Submit Participant Feedback...")
    res = client.post(f"/api/v1/events/{event_id}/feedback", json={
        "faculty_id": 1,
        "content_rating": 5,
        "trainer_rating": 5,
        "relevance_rating": 5,
        "practical_rating": 4,
        "organization_rating": 5,
        "comments": "Content highly relevant to modern engineering curriculum. Trainer highly rated and explained complex concepts clearly.",
        "suggestions": "Practical activities could be extended in future editions to allow more hands-on experimentation."
    })
    assert res.status_code == 201
    print(f"  -> Feedback registered. Ratings: 5/5 Content, 5/5 Trainer, 4/5 Practical")

    # STEP 17: Run Feedback Intelligence
    print("\n[STEP 17] Run: AI Feedback Intelligence...")
    res = client.get(f"/api/v1/events/{event_id}/feedback-intelligence")
    assert res.status_code == 200
    fb_intel = res.json()
    print(f"  -> OVERALL RATING: {fb_intel['overall_rating']} / 5.0")
    print(f"     STRENGTHS: {'; '.join(fb_intel['positive_themes'])}")
    print(f"     ISSUES: {'; '.join(fb_intel['negative_themes'])}")
    print(f"     RECOMMENDATIONS: {'; '.join(fb_intel['recommended_improvements'])}")

    # STEP 18: Generate Certificate
    print("\n[STEP 18] Generate Certificate...")
    res = client.post(f"/api/v1/events/{event_id}/generate-certificates")
    assert res.status_code == 200
    certs = res.json()
    assert len(certs) > 0
    cert = certs[0]
    print(f"  -> Certificate Generated! Code: {cert['certificate_code']} | Token: {cert['verification_token']}")
    
    # Public verification verification
    ver = client.get(f"/api/v1/certificates/verify/{cert['verification_token']}").json()
    print(f"     Public Verification: Status '{ver['verification_status']}' for {ver['participant_name']} in '{ver['event_name']}'")

    # STEP 19: Open Digital Passport
    print("\n[STEP 19] Open Faculty Digital Passport...")
    res = client.get("/api/v1/faculty/1/passport")
    assert res.status_code == 200
    passport = res.json()
    print(f"  -> Digital Passport: {passport['full_name']} ({passport['department_name']})")
    print(f"     FDPs Completed: {passport['fdps_completed']} | Training Hours: {passport['total_training_hours']} hrs | Certificates: {passport['certificates_count']}")
    print(f"     Skills Acquired: {', '.join(passport['skills_acquired'])}")
    print(f"     Avg Learning Gain: +{passport['average_learning_gain_pp']} percentage points")
    print(f"     Compliance: {passport['compliance']['completed_hours']}/{passport['compliance']['required_hours']} hrs ({passport['compliance']['status']})")

    # STEP 20: Open Strategy Dashboard
    print("\n[STEP 20] Open University Training Strategy Dashboard...")
    res = client.get("/api/v1/dashboard/strategy")
    assert res.status_code == 200
    strat = res.json()
    print("  -> University Strategy Analytics loaded:")
    print("     Top Training Demands:")
    for d in strat["training_demand"][:3]:
        print(f"       * {d['topic']} (Demand Score: {d['demand_score']}) -> Targets: {', '.join(d['target_depts'])}")
    print(f"     Department Development Scores:")
    for ds in strat["department_development_score"]:
        print(f"       * {ds['department']}: Score {ds['development_score']}/100 ({ds['training_hours_completed']} hrs)")

    print("\n" + "=" * 70)
    print("DEMO VERIFICATION COMPLETE: ALL 20 SCENARIO STEPS SUCCEEDED!")
    print("=" * 70)

if __name__ == "__main__":
    run_20_step_demo()
