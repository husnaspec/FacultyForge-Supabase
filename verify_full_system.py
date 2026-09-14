import urllib.request
import json
import sqlite3
import time
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def api_call(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        req.data = body
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            parsed = json.loads(content)
        except Exception:
            parsed = {"error": content}
        return e.code, parsed

def run():
    print("==================================================")
    print("STARTING COMPLETE REAL DR. VEDA TEST JOURNEY (30 STEPS)")
    print("==================================================")

    # 0. Check or create Dr. Veda in Faculty table
    conn = sqlite3.connect("backend/facultyforge.db")
    c = conn.cursor()
    c.execute("SELECT id, faculty_code, full_name, email, department_id FROM faculty WHERE full_name LIKE '%Veda%' OR faculty_code = 'VU-FAC-0105'")
    row = c.fetchone()
    if not row:
        print("[0] Creating Dr. Veda faculty record...")
        c.execute("""
            INSERT INTO faculty (faculty_code, full_name, email, department_id, designation, qualification, years_of_experience, teaching_interests, research_interests, development_interests, is_active)
            VALUES ('VU-FAC-0105', 'Dr. Veda Prakash', 'dr.veda@vignan.ac.in', 1, 'Associate Professor', 'Ph.D. in Computer Science', 8.5, 'Artificial Intelligence, Machine Learning', 'Generative AI, Large Language Models', 'Prompt Engineering & Pedagogical AI', 1)
        """)
        conn.commit()
        c.execute("SELECT id, faculty_code, full_name, email, department_id FROM faculty WHERE faculty_code = 'VU-FAC-0105'")
        row = c.fetchone()
    conn.close()

    veda_id, veda_code, veda_name, veda_email, veda_dept = row
    print(f"[0] Dr. Veda ready: ID={veda_id}, Code={veda_code}, Name={veda_name}, Email={veda_email}")

    # Step 1: Create Event (DRAFT)
    print("\n--- STEP 1: CREATE EVENT ---")
    st, ev_res = api_call("/events", method="POST", data={
        "title": "AI for Engineers Day",
        "department_id": veda_dept,
        "event_type": "FDP",
        "duration_hours": 16.0,
        "capacity": 50,
        "delivery_mode": "HYBRID",
        "description": "Comprehensive FDP on engineering generative AI applications and pedagogical transformation.",
        "objectives": "Equip faculty to construct and evaluate domain-specific LLM architectures.",
        "learning_outcomes": "Demonstrated mastery of LLM integration and diagnostic prompt pipelines.",
        "estimated_budget": 45000.0,
        "target_audience": "Faculty in CSE, IT, and Allied Engineering"
    })
    assert st == 201, f"Create event failed: {st}, {ev_res}"
    event_id = ev_res["id"]
    print(f"PASS: Event created with ID {event_id}, Status={ev_res['status']}")

    # Step 2: Submit Proposal
    print("\n--- STEP 2: SUBMIT PROPOSAL ---")
    st, prop_res = api_call(f"/events/{event_id}/submit", method="POST", data={"submitted_by": "FDP Coordinator"})
    assert st == 201, f"Submit proposal failed: {st}, {prop_res}"
    prop_id = prop_res["id"]
    print(f"PASS: Proposal submitted with ID {prop_id}, Status={prop_res['approval_status']}")

    # Step 3: Approve Proposal
    print("\n--- STEP 3: APPROVE PROPOSAL ---")
    st, app_res = api_call(f"/proposals/{prop_id}/approve", method="POST", data={
        "approver_name": "Prof. K. R. Rao",
        "approver_role": "HOD",
        "remarks": "Approved. Directly addresses departmental AICTE continuous development targets."
    })
    assert st == 200, f"Approve proposal failed: {st}, {app_res}"
    print(f"PASS: Proposal approved, Event Status={app_res['approval_status']}")

    # Step 4: Open Registration
    print("\n--- STEP 4: OPEN REGISTRATION ---")
    st, upd_res = api_call(f"/events/{event_id}", method="PUT", data={"status": "REGISTRATION_OPEN"})
    assert st == 200, f"Open registration failed: {st}, {upd_res}"
    print(f"PASS: Event updated to Status={upd_res['status']}")

    # Step 5: Register Dr. Veda
    print("\n--- STEP 5: REGISTER DR. VEDA ---")
    st, reg_res = api_call(f"/events/{event_id}/register", method="POST", data={
        "full_name": veda_name,
        "faculty_code": veda_code,
        "email": veda_email,
        "department": "Computer Science & Engineering",
        "designation": "Associate Professor",
        "institution_name": "Vignan's Foundation for Science, Technology & Research",
        "years_of_experience": 8.5,
        "teaching_interests": "Artificial Intelligence, Machine Learning",
        "research_interests": "Generative AI, Large Language Models",
        "consent": True
    })
    assert st == 201, f"Registration failed: {st}, {reg_res}"
    reg_id = reg_res["id"]
    reg_code = reg_res["registration_code"]
    qr_token = reg_res["qr_token"]
    print(f"PASS: Registered Dr. Veda! Reg ID={reg_id}, Code={reg_code}, QR Token={qr_token}")

    # Step 6 & 7: Verify Unique Registration ID & QR Token
    print("\n--- STEP 6 & 7: VERIFY REG ID & QR TOKEN ---")
    assert reg_code.startswith("REG-VU2026-"), f"Unexpected code: {reg_code}"
    assert ":" in qr_token, f"Unexpected token: {qr_token}"
    print(f"PASS: Unique Code: {reg_code}, Secure QR Token: {qr_token[:25]}...")

    # Step 8: Attendance Desk shows Dr. Veda
    print("\n--- STEP 8: ATTENDANCE DESK SHOWS DR. VEDA ---")
    st, att_list = api_call(f"/events/{event_id}/attendance")
    assert st == 200, f"Get attendance failed: {st}, {att_list}"
    # Registrations list check
    st, reg_list = api_call(f"/events/{event_id}/registrations")
    assert any(r["id"] == reg_id for r in reg_list), "Dr. Veda not in event registrations"
    print(f"PASS: Attendance desk cohort includes Dr. Veda. Total Registered={len(reg_list)}")

    # Step 9: Mark attendance manually
    print("\n--- STEP 9: MARK ATTENDANCE MANUALLY ---")
    # First create a session if none exist
    st, ev_detail = api_call(f"/events/{event_id}")
    sessions = ev_detail.get("sessions", [])
    if not sessions:
        st, sess_res = api_call(f"/events/{event_id}/sessions", method="POST", data={
            "title": "Day 1 Morning: Generative AI Foundations",
            "start_time": "09:30 AM",
            "end_time": "12:30 PM",
            "learning_objective": "Understand transformer foundations"
        })
        session_id = sess_res["id"]
    else:
        session_id = sessions[0]["id"]

    st, man_res = api_call("/attendance/manual", method="POST", data={
        "event_id": event_id,
        "registration_id": reg_id,
        "session_id": session_id,
        "attendance_status": "PRESENT"
    })
    assert st == 200, f"Manual attendance failed: {st}, {man_res}"
    print(f"PASS: Manual check-in recorded for Dr. Veda. Status={man_res['attendance_status']}")

    # Step 10: Test QR attendance
    print("\n--- STEP 10: TEST QR ATTENDANCE ---")
    # Create second session to test QR
    st, sess_res2 = api_call(f"/events/{event_id}/sessions", method="POST", data={
        "title": "Day 1 Afternoon: LLM Prompt Tuning Lab",
        "start_time": "02:00 PM",
        "end_time": "05:00 PM",
        "learning_objective": "Hands-on parameter efficient fine-tuning"
    })
    session_id2 = sess_res2["id"]

    st, qr_res = api_call("/attendance/qr-checkin", method="POST", data={
        "event_id": event_id,
        "session_id": session_id2,
        "qr_token": qr_token
    })
    assert st == 200, f"QR attendance failed: {st}, {qr_res}"
    print(f"PASS: QR check-in verified for Dr. Veda! Method={qr_res.get('attendance_method', 'QR')}")

    # Step 11 & 12: Create PRE Assessment & Questions
    print("\n--- STEP 11 & 12: CREATE PRE ASSESSMENT & QUESTIONS ---")
    st, pre_assess = api_call("/assessments", method="POST", data={
        "event_id": event_id,
        "assessment_type": "PRE",
        "title": "Diagnostic Pre-Assessment: AI for Engineers",
        "total_marks": 20.0,
        "passing_marks": 10.0
    })
    assert st == 201, f"Create PRE assessment failed: {st}, {pre_assess}"
    pre_id = pre_assess["id"]

    st, q1 = api_call(f"/assessments/{pre_id}/questions", method="POST", data={
        "question_text": "What attention mechanism is central to Transformer neural networks?",
        "option_a": "Scaled Dot-Product Self-Attention",
        "option_b": "Convolutional Pooling Attention",
        "option_c": "Recurrent Gate Attention",
        "option_d": "Markov Chain Attention",
        "correct_option": "a",
        "marks": 10.0,
        "explanation": "Self-attention computes dynamic weights across all token pairs."
    })
    assert st == 201
    st, q2 = api_call(f"/assessments/{pre_id}/questions", method="POST", data={
        "question_text": "In few-shot prompt engineering, what does 'shot' refer to?",
        "option_a": "Number of GPU training epochs",
        "option_b": "Exemplar input-output demonstrations provided in context",
        "option_c": "Learning rate magnitude",
        "option_d": "Batch size multiplier",
        "correct_option": "b",
        "marks": 10.0,
        "explanation": "Shots are in-context input/output examples."
    })
    assert st == 201
    print(f"PASS: PRE Assessment created (ID {pre_id}) with 2 diagnostic questions.")

    # Step 13 & 14: Take PRE Assessment & Store Score
    print("\n--- STEP 13 & 14: TAKE PRE ASSESSMENT ---")
    # Dr. Veda gets 1 correct, 1 incorrect on diagnostic pre-test (50%)
    st, pre_sub = api_call(f"/assessments/{pre_id}/submit", method="POST", data={
        "faculty_id": veda_id,
        "answers": {
            str(q1["id"]): "a", # correct
            str(q2["id"]): "a"  # incorrect
        }
    })
    assert st == 200, f"Submit PRE failed: {st}, {pre_sub}"
    pre_score = pre_sub["percentage"]
    print(f"PASS: PRE Assessment submitted. Score: {pre_score}% ({pre_sub['score']} / 20 Marks)")
    assert pre_score == 50.0, f"Expected 50.0, got {pre_score}"

    # Step 15: Create POST Assessment & Questions
    print("\n--- STEP 15: CREATE POST ASSESSMENT & QUESTIONS ---")
    st, post_assess = api_call("/assessments", method="POST", data={
        "event_id": event_id,
        "assessment_type": "POST",
        "title": "Competency Post-Assessment: AI for Engineers",
        "total_marks": 20.0,
        "passing_marks": 10.0
    })
    assert st == 201, f"Create POST assessment failed: {st}, {post_assess}"
    post_id = post_assess["id"]

    st, pq1 = api_call(f"/assessments/{post_id}/questions", method="POST", data={
        "question_text": "What parameter-efficient fine-tuning technique freezes backbone weights and trains rank decomposition matrices?",
        "option_a": "Full Parameter Fine-Tuning",
        "option_b": "LoRA (Low-Rank Adaptation)",
        "option_c": "Quantized K-Means",
        "option_d": "Random Matrix Masking",
        "correct_option": "b",
        "marks": 10.0,
        "explanation": "LoRA decomposes weight updates into low-rank matrices."
    })
    assert st == 201
    st, pq2 = api_call(f"/assessments/{post_id}/questions", method="POST", data={
        "question_text": "What prompt technique forces an LLM to generate intermediate reasoning steps before arriving at an answer?",
        "option_a": "Zero-shot direct prompting",
        "option_b": "Chain-of-Thought (CoT) Prompting",
        "option_c": "Greedy Top-K Sampling",
        "option_d": "Temperature decay",
        "correct_option": "b",
        "marks": 10.0,
        "explanation": "Chain-of-thought encourages reasoning pathways."
    })
    assert st == 201
    print(f"PASS: POST Assessment created (ID {post_id}) with 2 competency questions.")

    # Step 16 & 17: Take POST Assessment & Store Score
    print("\n--- STEP 16 & 17: TAKE POST ASSESSMENT ---")
    # Dr. Veda scores 100% on post-test after completing the training!
    st, post_sub = api_call(f"/assessments/{post_id}/submit", method="POST", data={
        "faculty_id": veda_id,
        "answers": {
            str(pq1["id"]): "b", # correct
            str(pq2["id"]): "b"  # correct
        }
    })
    assert st == 200, f"Submit POST failed: {st}, {post_sub}"
    post_score = post_sub["percentage"]
    print(f"PASS: POST Assessment submitted. Score: {post_score}% ({post_sub['score']} / 20 Marks)")
    assert post_score == 100.0, f"Expected 100.0, got {post_score}"

    # Step 18: Calculate Real Learning Gain
    print("\n--- STEP 18: CALCULATE REAL LEARNING GAIN ---")
    st, impact_data = api_call(f"/events/{event_id}/learning-impact")
    assert st == 200, f"Get learning impact failed: {st}, {impact_data}"
    gain_pp = impact_data["learning_gain_pp"]
    print(f"PASS: Real Learning Gain calculated: Pre={impact_data['pre_average']}%, Post={impact_data['post_average']}%, Gain=+{gain_pp} percentage points!")
    assert gain_pp == 50.0, f"Expected +50.0 pp learning gain, got {gain_pp}"

    # Step 19 & 20: Submit Real Feedback & Analyze Feedback
    print("\n--- STEP 19 & 20: SUBMIT & ANALYZE REAL FEEDBACK ---")
    st, fb_res = api_call(f"/events/{event_id}/feedback", method="POST", data={
        "faculty_id": veda_id,
        "content_rating": 5,
        "trainer_rating": 5,
        "relevance_rating": 5,
        "practical_rating": 5,
        "organization_rating": 4,
        "comments": "Exceptional hands-on laboratory sessions with clear LoRA and chain-of-thought demonstrations.",
        "suggestions": "Allocate additional GPU credits for post-workshop project incubation."
    })
    assert st == 201, f"Submit feedback failed: {st}, {fb_res}"
    print(f"PASS: Feedback submitted by Dr. Veda. Overall={fb_res['content_rating']}/5")

    st, intel_res = api_call(f"/events/{event_id}/feedback-intelligence")
    assert st == 200, f"Get feedback intelligence failed: {st}, {intel_res}"
    print(f"PASS: Feedback Intelligence computed: Overall Rating={intel_res['overall_rating']}/5.0 across {intel_res['total_responses']} response(s)")
    assert intel_res["total_responses"] == 1
    assert intel_res["has_feedback"] == True

    # Step 21: Create Skill Evidence
    print("\n--- STEP 21: CREATE SKILL EVIDENCE ---")
    st, ev_add = api_call(f"/faculty/{veda_id}/skill-evidence", method="POST", data={
        "skill_name": "Generative AI",
        "evidence_type": "ASSESSMENT_RESULT",
        "evidence_reference": f"Completed POST Assessment for {ev_res['title']} with 100% score",
        "score": 100.0,
        "verified": True,
        "verified_by": "Academic Assessment Council"
    })
    assert st == 201, f"Add skill evidence failed: {st}, {ev_add}"
    print(f"PASS: Verified skill evidence logged for 'Generative AI' (Score: 100.0%)")

    # Step 22: Record Teaching Impact
    print("\n--- STEP 22: RECORD TEACHING IMPACT ---")
    st, impact_rec = api_call(f"/faculty/{veda_id}/teaching-impact", method="POST", data={
        "event_id": event_id,
        "skill_name": "Generative AI",
        "application_type": "CLASSROOM",
        "application_description": f"Integrated LLM prompt debugging into B.Tech CSE Advanced Machine Learning laboratory curriculum (Event {event_id}).",
        "self_rating": 5,
        "impact_status": "VERIFIED"
    })
    assert st == 201, f"Record teaching impact failed: {st}, {impact_rec}"
    print(f"PASS: Teaching impact recorded and verified in classroom teaching!")

    # Step 22.5: Mark Event Completed
    st, comp_ev = api_call(f"/events/{event_id}", method="PUT", data={"status": "COMPLETED"})
    assert st == 200, f"Complete event failed: {st}, {comp_ev}"

    # Step 23: Generate Certificate
    print("\n--- STEP 23: GENERATE CERTIFICATE ---")
    st, cert_res = api_call(f"/events/{event_id}/generate-certificates", method="POST", data={
        "faculty_ids": [veda_id]
    })
    assert st == 200, f"Generate certificate failed: {st}, {cert_res}"
    cert_list = cert_res.get("certificates", []) if isinstance(cert_res, dict) else cert_res
    assert len(cert_list) >= 1, f"Certificate was not generated for Dr. Veda: {cert_res}"
    cert = cert_list[0]
    cert_code = cert["certificate_code"]
    cert_tok = cert["verification_token"]
    print(f"PASS: Certificate generated! Code={cert_code}, Token={cert_tok}")

    # Step 24: Public Certificate Verification
    print("\n--- STEP 24: PUBLIC CERTIFICATE VERIFICATION ---")
    st, verify_res = api_call(f"/certificates/verify/{cert_tok}")
    assert st == 200, f"Verify certificate failed: {st}, {verify_res}"
    assert verify_res["is_valid"] == True
    assert verify_res["participant_name"] == veda_name
    print(f"PASS: Token-verifiable certificate verified successfully: Status={verify_res['verification_status']}")

    # Step 25: Digital Passport Updates
    print("\n--- STEP 25: DIGITAL PASSPORT UPDATES ---")
    st, pass_res = api_call(f"/faculty/{veda_id}/digital-passport")
    assert st == 200, f"Get passport failed: {st}, {pass_res}"
    print(f"PASS: Digital Passport for {pass_res['full_name']}:")
    print(f"      - FDPs Completed: {pass_res['fdps_completed']}")
    print(f"      - Training Hours: {pass_res['total_training_hours']} hrs")
    print(f"      - Certificates: {pass_res['certificates_count']}")
    print(f"      - Average Learning Gain: +{pass_res['average_learning_gain_pp']} pp")
    print(f"      - Verified Skills: {len(pass_res['verified_skills'])}")
    print(f"      - Applied Learning Records: {len(pass_res['applied_learning'])}")
    assert pass_res["certificates_count"] >= 1
    assert pass_res["average_learning_gain_pp"] == 50.0

    # Step 26: Compliance Updates
    print("\n--- STEP 26: COMPLIANCE UPDATES ---")
    st, comp_res = api_call(f"/faculty/{veda_id}/compliance")
    assert st == 200, f"Get compliance failed: {st}, {comp_res}"
    print(f"PASS: Faculty Compliance Status={comp_res['status']}, Completed={comp_res['completed_hours']}/{comp_res['required_hours']} hrs ({comp_res['compliance_percentage']}%)")

    # Step 27: FDP Effectiveness Updates
    print("\n--- STEP 27: FDP EFFECTIVENESS UPDATES ---")
    # Complete event to evaluate ROI
    api_call(f"/events/{event_id}", method="PUT", data={"status": "COMPLETED"})
    st, eff_res = api_call(f"/events/{event_id}/effectiveness")
    assert st == 200, f"Get effectiveness failed: {st}, {eff_res}"
    print(f"PASS: FDP Effectiveness calculated from real metrics: Overall Score={eff_res['overall_effectiveness_score']}/100, Impact={eff_res['impact_level']}")
    assert eff_res["overall_effectiveness_score"] > 0

    # Step 28: Department Skill Heatmap Updates
    print("\n--- STEP 28: HEATMAP UPDATES ---")
    st, hm_res = api_call("/agents/department-heatmap")
    assert st == 200, f"Get heatmap failed: {st}, {hm_res}"
    print(f"PASS: Heatmap updated with real departmental metrics. Readiness index: {hm_res['summary']['overall_readiness_index']}")

    # Step 29: Strategy Dashboard Updates
    print("\n--- STEP 29: STRATEGY DASHBOARD UPDATES ---")
    st, strat_res = api_call("/dashboard/strategy-analytics")
    assert st == 200, f"Get strategy analytics failed: {st}, {strat_res}"
    print(f"PASS: Strategy Dashboard loaded real metrics:")
    print(f"      - Total Faculty: {strat_res['summary']['total_faculty']}")
    print(f"      - Certificates: {strat_res['summary']['certificates_count']}")
    print(f"      - Learning Gains tracked: {len(strat_res['learning_gain_by_fdp'])}")
    print(f"      - Training Demand items: {len(strat_res['training_demand'])}")

    # Step 30: Database Persistence Check
    print("\n--- STEP 30: DATABASE PERSISTENCE VERIFICATION ---")
    conn2 = sqlite3.connect("backend/facultyforge.db")
    c2 = conn2.cursor()
    c2.execute("SELECT COUNT(*) FROM registrations WHERE faculty_id = ? AND event_id = ?", (veda_id, event_id))
    db_reg_count = c2.fetchone()[0]
    c2.execute("SELECT COUNT(*) FROM attendances WHERE faculty_id = ? AND event_id = ?", (veda_id, event_id))
    db_att_count = c2.fetchone()[0]
    c2.execute("SELECT COUNT(*) FROM assessment_attempts WHERE faculty_id = ?", (veda_id,))
    db_att_attempts = c2.fetchone()[0]
    c2.execute("SELECT COUNT(*) FROM certificates WHERE faculty_id = ? AND event_id = ?", (veda_id, event_id))
    db_cert_count = c2.fetchone()[0]
    c2.execute("SELECT COUNT(*) FROM feedbacks WHERE faculty_id = ? AND event_id = ?", (veda_id, event_id))
    db_fb_count = c2.fetchone()[0]
    c2.execute("SELECT COUNT(*) FROM skill_evidence WHERE faculty_id = ?", (veda_id,))
    db_ev_count = c2.fetchone()[0]
    c2.execute("SELECT COUNT(*) FROM teaching_impacts WHERE faculty_id = ?", (veda_id,))
    db_imp_count = c2.fetchone()[0]
    conn2.close()

    print(f"PASS: Persistent records confirmed in SQLite:")
    print(f"      - Registrations in DB: {db_reg_count}")
    print(f"      - Attendances in DB: {db_att_count}")
    print(f"      - Assessment Attempts in DB: {db_att_attempts}")
    print(f"      - Certificates in DB: {db_cert_count}")
    print(f"      - Feedback in DB: {db_fb_count}")
    print(f"      - Skill Evidence in DB: {db_ev_count}")
    print(f"      - Teaching Impact in DB: {db_imp_count}")

    assert db_reg_count >= 1
    assert db_att_count >= 2
    assert db_att_attempts >= 2
    assert db_cert_count >= 1
    assert db_fb_count >= 1
    assert db_ev_count >= 1
    assert db_imp_count >= 1

    print("\n==================================================")
    print("ALL 30 STEPS OF DR. VEDA TEST JOURNEY PASSED 100%!")
    print("==================================================")

if __name__ == "__main__":
    run()
