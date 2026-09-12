import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.services.seed_service import seed_service

# Initialize test client
client = TestClient(app)

def test_peer_mentor_matcher():
    print("\n--- Testing Feature 1: Faculty Peer Mentor Matcher ---")
    res = client.get("/api/v1/agents/peer-mentors/1?skill_name=Research Methodology")
    assert res.status_code == 200
    data = res.json()
    assert data["faculty_id"] == 1
    assert data["skill_gap"] == "Research Methodology"
    assert len(data["mentor_matches"]) > 0
    top = data["mentor_matches"][0]
    print(f"  [OK] Top Mentor: {top['mentor_name']} | Dept: {top['department']} | Score: {top['match_score']} | Level: {top['skill_level']}")
    print(f"       Reason: {top['reason']}")
    assert "Meera Rao" in top["mentor_name"] or top["match_score"] >= 85

def test_skill_evidence_validator():
    print("\n--- Testing Feature 2: Skill Evidence Validator ---")
    # Add new evidence
    res = client.post("/api/v1/faculty/1/skill-evidence", json={
        "skill_name": "Generative AI",
        "evidence_type": "PROJECT",
        "evidence_reference": "Automated RAG-enabled Student Course Advisor Capstone",
        "score": 94.0,
        "verified": True,
        "verified_by": "Academic Advisory Board"
    })
    assert res.status_code == 201
    created_ev = res.json()
    assert created_ev["skill_name"] == "Generative AI"
    assert created_ev["verified"] is True
    print(f"  [OK] Added Evidence: {created_ev['evidence_type']} for {created_ev['skill_name']} (ID: {created_ev['id']})")

    # Get evidence list
    res_list = client.get("/api/v1/faculty/1/skill-evidence")
    assert res_list.status_code == 200
    evidences = res_list.json()
    assert len(evidences) >= 3
    print(f"  [OK] Found {len(evidences)} evidence records for Dr. Ayesha Khan")

    # Get verified skills
    res_verified = client.get("/api/v1/faculty/1/verified-skills")
    assert res_verified.status_code == 200
    verified_skills = res_verified.json()
    genai_skill = next((s for s in verified_skills if "Generative AI" in s["skill_name"]), None)
    assert genai_skill is not None
    assert genai_skill["verification_status"] == "VERIFIED"
    assert genai_skill["evidence_count"] >= 3
    print(f"  [OK] Verified Skill: {genai_skill['skill_name']} ({genai_skill['proficiency_level']}) -> Status: {genai_skill['verification_status']} ({genai_skill['evidence_count']} evidence items)")

def test_teaching_impact_tracker():
    print("\n--- Testing Feature 3: Teaching Impact Tracker ---")
    res = client.post("/api/v1/faculty/1/teaching-impact", json={
        "event_id": 1,
        "skill_name": "Generative AI",
        "application_type": "CLASSROOM",
        "application_description": "Integrated real-time LLM code generation exercises into Data Structures laboratory.",
        "evidence_url": "https://lms.university.edu/course/cs201",
        "self_rating": 5.0,
        "reviewer_rating": 4.9,
        "impact_status": "APPLIED"
    })
    assert res.status_code == 201
    imp = res.json()
    assert imp["faculty_name"] == "Dr. Ayesha Khan"
    assert imp["impact_status"] == "APPLIED"
    print(f"  [OK] Recorded Teaching Impact: {imp['application_type']} -> '{imp['application_description'][:60]}...'")

    # Faculty teaching impact query
    res_fac = client.get("/api/v1/faculty/1/teaching-impact")
    assert res_fac.status_code == 200
    assert len(res_fac.json()) >= 1

    # Event teaching impact query
    res_evt = client.get("/api/v1/events/1/teaching-impact")
    assert res_evt.status_code == 200
    print(f"  [OK] Event 1 has {len(res_evt.json())} applied learning records")

def test_fdp_effectiveness_score():
    print("\n--- Testing Feature 4: FDP Effectiveness / ROI Score ---")
    res = client.get("/api/v1/events/1/effectiveness")
    assert res.status_code == 200
    eff = res.json()
    assert "overall_effectiveness_score" in eff
    assert "cost_per_participant" in eff
    print(f"  [OK] Event: '{eff['event_title']}'")
    print(f"       Overall Effectiveness Score: {eff['overall_effectiveness_score']}/100 | Impact: {eff['impact_level']}")
    print(f"       Learning Gain Score: {eff['learning_score']}/100 (Weight: 30%)")
    print(f"       Attendance Score: {eff['attendance_score']}/100 (Weight: 15%)")
    print(f"       Completion Score: {eff['completion_score']}/100 (Weight: 15%)")
    print(f"       Feedback Score: {eff['feedback_score']}/100 (Weight: 20%)")
    print(f"       Application Score: {eff['application_score']}/100 (Weight: 10%)")
    print(f"       Cost Efficiency Score: {eff['cost_efficiency_score']}/100 (Weight: 10%)")
    print(f"       Cost per Participant: Rs. {eff['cost_per_participant']:.0f}")

def test_career_growth_agent():
    print("\n--- Testing Feature 5: Faculty Career Growth Path ---")
    res = client.post("/api/v1/agents/career-path/1", json={"goal": "RESEARCH_MENTOR"})
    assert res.status_code == 200
    cg = res.json()
    assert cg["goal"] == "RESEARCH_MENTOR"
    assert len(cg["path"]) >= 5
    print(f"  [OK] Career Goal: {cg['goal_title']} (Target Timeline: {cg['target_timeline_months']} months)")
    print(f"       Current Progress: {cg['current_progress_percentage']}%")
    print(f"       Next Step: {cg['next_recommended_step']}")
    for s in cg["path"]:
        print(f"       * Step {s['step_number']}: {s['skill_or_milestone']} [{s['current_status']}] -> {s['recommended_training']}")

def test_department_skill_heatmap():
    print("\n--- Testing Feature 6: Department Skill Heatmap ---")
    res = client.get("/api/v1/dashboard/skill-heatmap")
    assert res.status_code == 200
    hm = res.json()
    assert len(hm["departments"]) >= 4
    assert len(hm["skills"]) >= 5
    assert "Generative AI" in hm["matrix"]
    print(f"  [OK] Skill Heatmap loaded. Tracked {len(hm['departments'])} departments across {len(hm['skills'])} skills")
    cse_genai = hm["matrix"]["Generative AI"]["CSE"]
    print(f"       CSE Generative AI Level: {cse_genai['level']} (Score: {cse_genai['score']})")
    it_cyber = hm["matrix"]["Cybersecurity"]["IT"]
    print(f"       IT Cybersecurity Level: {it_cyber['level']} (Score: {it_cyber['score']})")

def test_what_if_training_simulator():
    print("\n--- Testing Feature 7: What-If Training Simulator ---")
    res = client.post("/api/v1/agents/simulate-training", json={
        "topic": "Generative AI for Engineering Faculty",
        "department_ids": [1, 2],
        "duration_hours": 18,
        "capacity": 60,
        "estimated_budget": 50000
    })
    assert res.status_code == 200
    sim = res.json()
    assert sim["is_projected"] is True
    assert sim["potential_participants"] <= 60
    assert sim["estimated_cost_per_participant"] > 0
    print(f"  [OK] Simulation: '{sim['programme_title']}'")
    print(f"       Potential Participants: {sim['potential_participants']} (Eligible: {sim['eligible_faculty']})")
    print(f"       Projected Skill Gaps Addressed: {sim['projected_skill_gaps_addressed']}%")
    print(f"       Estimated Cost / Participant: Rs. {sim['estimated_cost_per_participant']:.0f}")
    print(f"       Expected Impact: {sim['expected_learning_impact']} | Priority Score: {sim['priority_score']}/100")
    print(f"       Draft Creation Payload Present: {'title' in sim['draft_creation_payload']}")

def test_training_equity_agent():
    print("\n--- Testing Feature 8: Training Fatigue & Participation Equity ---")
    res = client.get("/api/v1/agents/training-equity")
    assert res.status_code == 200
    eq = res.json()
    assert "participation_equity_score" in eq
    assert len(eq["faculty_list"]) >= 12
    print(f"  [OK] Participation Equity Score: {eq['participation_equity_score']}/100")
    print(f"       Cohorts: {eq['highly_trained_count']} High Participation, {eq['moderately_trained_count']} Balanced, {eq['no_recent_training_count']} Needs Opportunity")
    print(f"       Institutional Assessment: {eq['potential_issue']}")
    print(f"       Recommendations Count: {len(eq['recommendations'])}")

def test_knowledge_sharing_recommender():
    print("\n--- Testing Feature 9: Internal Knowledge Sharing Recommender ---")
    res = client.get("/api/v1/agents/knowledge-sharing")
    assert res.status_code == 200
    ks = res.json()
    assert len(ks["recommendations"]) > 0
    top = ks["recommendations"][0]
    print(f"  [OK] Top Knowledge Sharing Host: {top['recommended_faculty_name']} ({top['department']})")
    print(f"       Topic: {top['topic']}")
    print(f"       Target: {top['target_department']} | Format: {top['suggested_duration']}")
    print(f"       Learning Gain Achieved: +{top['learning_gain_achieved']}% | Impact Score: {top['impact_score']}")

def test_extended_digital_passport():
    print("\n--- Testing Feature 10: Extended Digital Passport ---")
    res = client.get("/api/v1/faculty/1/passport")
    assert res.status_code == 200
    passport = res.json()
    assert "verified_skills" in passport
    assert "skill_evidences" in passport
    assert "applied_learning" in passport
    assert "peer_mentors" in passport
    assert "career_goal" in passport
    assert "fdp_effectiveness_history" in passport
    print(f"  [OK] Digital Passport for {passport['full_name']} successfully loaded with all 6 new extended sections:")
    print(f"       * Verified Skills: {len(passport['verified_skills'])} skills")
    print(f"       * Evidence Items: {len(passport['skill_evidences'])} records")
    print(f"       * Applied Learning: {len(passport['applied_learning'])} classroom/lab applications")
    print(f"       * Peer Mentors: {len(passport['peer_mentors'])} matches")
    print(f"       * Career Goal: {passport['career_goal']['goal_title'] if passport['career_goal'] else 'N/A'}")
    print(f"       * FDP Effectiveness History: {len(passport['fdp_effectiveness_history'])} programmes evaluated")

def run_all_new_feature_tests():
    print("=" * 70)
    print("RUNNING FACULTYFORGE AI - EXTENSION TEST SUITE (10 NEW FEATURES)")
    print("=" * 70)
    test_peer_mentor_matcher()
    test_skill_evidence_validator()
    test_teaching_impact_tracker()
    test_fdp_effectiveness_score()
    test_career_growth_agent()
    test_department_skill_heatmap()
    test_what_if_training_simulator()
    test_training_equity_agent()
    test_knowledge_sharing_recommender()
    test_extended_digital_passport()
    print("\n" + "=" * 70)
    print("ALL 10 NEW FEATURE API SUITES PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    run_all_new_feature_tests()
