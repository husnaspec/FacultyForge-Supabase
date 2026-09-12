# FacultyForge AI: Intelligent Faculty Development & Training Platform

> **Tagline:** *"From Training Needs to Measurable Faculty Growth"*  
> **Core Differentiator:** *Existing FDP systems manage events. FacultyForge AI manages faculty growth.*

---

## 1. Executive Summary & Problem Statement

In higher education institutions, Faculty Development Programmes (FDPs), workshops, and Short-Term Training Programmes (STTPs) have historically been managed as logistical events. Institutional committees track participant registrations and attendance sheets, but struggle to answer fundamental strategic questions:

- Did the faculty member actually close their verified pedagogical and technological skill gaps?
- What was the quantifiable, empirical **Learning Gain** between pre-test and post-test assessments?
- Are upcoming programmes designed proactively based on department-wide competency deficits, or chosen ad-hoc?
- Can institutional faculty development dossiers be audited cleanly for **NBA Tier-1, NAAC Criterion 6, and UGC continuous professional development (CPD)** benchmarks?

**FacultyForge AI** re-architects faculty development around **measurable faculty growth**. It unifies autonomous multi-agent intelligence, accreditation-aligned psychometrics, personalized development passports, and predictive institutional strategy into a single modern platform.

---

## 2. Complete End-to-End Lifecycle

```
FACULTY DATA
(skills + past FDPs + assessments + feedback + teaching/research areas)
        ↓
AI SKILL-GAP ANALYSIS AGENT
        ↓
PERSONALIZED TRAINING RECOMMENDATION AGENT
        ↓
BEST RESOURCE PERSON MATCHER AGENT
        ↓
AI FDP GENERATOR AGENT (Draft Syllabus, Schedule, Budget, Pre/Post Tests)
        ↓
PROPOSAL & HOD/IQAC APPROVAL WORKFLOW
        ↓
FACULTY REGISTRATION (Capacity & Duplicate Protection)
        ↓
SESSION-WISE ATTENDANCE (Manual & QR Architecture)
        ↓
DIAGNOSTIC PRE-ASSESSMENT
        ↓
FDP / WORKSHOP DELIVERY
        ↓
COMPETENCY POST-ASSESSMENT
        ↓
LEARNING GAIN ANALYSIS AGENT (Absolute Percentage Points Delta)
        ↓
AI FEEDBACK INTELLIGENCE AGENT (Thematic Sentiment Mining)
        ↓
CRYPTOGRAPHIC VERIFIABLE DIGITAL CERTIFICATES
        ↓
FACULTY DEVELOPMENT DIGITAL PASSPORT UPDATE
        ↓
INSTITUTIONAL COMPLIANCE AUDIT AGENT (Configurable CPD Targets)
        ↓
PREDICTIVE TRAINING PLANNER AGENT
        ↓
UNIVERSITY TRAINING STRATEGY DASHBOARD
```

---

## 3. Technology Stack

- **Frontend:**
  - React 18 / Vite 8
  - React Router 7
  - Lucide Icons
  - Pure Modern CSS Design System (Zero Tailwind/Bootstrap bloat, dark-mode SaaS styling)
- **Backend:**
  - Python 3.10+ / FastAPI
  - SQLAlchemy 2.0 (ORM)
  - Pydantic v2 (Data validation & schemas)
  - SQLite (Zero-config local relational database, configurable to PostgreSQL)
- **AI & Analytics Layer:**
  - Dual-mode AI architecture:
    1. **Mode 1 (Default):** Deterministic intelligent algorithm engine (runs offline, 100% reliable for hackathon demos, zero API keys required).
    2. **Mode 2:** External LLM integration via environment variables (`AI_PROVIDER="llm"`, `AI_API_KEY="your-key"`).

---

## 4. Multi-Agent Architecture

FacultyForge AI deploys **10 specialized intelligent services and agents**:

| Agent | Module | Primary Purpose & Methodology |
|---|---|---|
| **1. Skill Gap Agent** | `agents/skill_gap_agent.py` | Multi-vector analysis of teaching/research areas, existing skills, past FDP history, and diagnostic assessments to identify HIGH/MEDIUM/LOW priority competency deficits. |
| **2. Recommendation Agent** | `agents/recommendation_agent.py` | Synthesizes personalized development pathways by aligning individual skill gaps with approved upcoming institutional workshops. |
| **3. Resource Person Matcher** | `agents/resource_matcher_agent.py` | Multi-criteria ranking across Jaccard keyword vectors, participant feedback ratings, training delivery count, and event syllabus fit. |
| **4. FDP Generator Agent** | `agents/fdp_generator_agent.py` | Synthesizes complete accreditation-compliant FDP blueprints, session schedules, and psychometric pre/post questions from text prompts. Always saves initially as **DRAFT**. |
| **5. Learning Impact Agent** | `agents/learning_impact_agent.py` | Computes empirical cognitive shifts between pre and post tests strictly in **absolute percentage points** (+XX pp) with impact classification. |
| **6. Feedback Intelligence Agent** | `agents/feedback_agent.py` | Semantic theme extraction and sentiment analysis across 5 rating dimensions, positive highlights, and bottlenecks. |
| **7. Compliance Agent** | `agents/compliance_agent.py` | Continuous audit against configurable institutional benchmarks (e.g. 40 hrs/year CPD target), computing risk health indexes. |
| **8. Predictive Training Planner** | `agents/predictive_planner_agent.py` | Aggregates institution-wide competency deficits and enrollment history to forecast next-semester demand scores and target departments. |
| **9. Report Dossier Agent** | `agents/report_agent.py` | Assembles a formal 17-section institutional dossier for NBA/NAAC accreditors, complete with financial disclosures and attendance audits. |
| **10. Agent Orchestrator** | `agents/orchestrator.py` | Coordinates end-to-end execution pipelines across agents triggered by explicit API calls. |

---

## 5. Directory Structure

```
FDPX/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app initialization, CORS, and auto-seeding
│   │   ├── core/
│   │   │   └── config.py            # Environment configuration & settings
│   │   ├── db/
│   │   │   ├── base.py              # Declarative base
│   │   │   └── session.py           # Engine & sessionmaker
│   │   ├── models/                  # SQLAlchemy Relational Models
│   │   │   ├── department.py
│   │   │   ├── faculty.py
│   │   │   ├── resource_person.py
│   │   │   ├── event.py
│   │   │   ├── proposal.py
│   │   │   ├── registration.py
│   │   │   ├── attendance.py
│   │   │   ├── assessment.py
│   │   │   ├── feedback.py
│   │   │   ├── certificate.py
│   │   │   ├── skill.py
│   │   │   ├── compliance.py
│   │   │   └── agent_analysis.py
│   │   ├── schemas/                 # Pydantic Schemas
│   │   │   └── __init__.py
│   │   ├── services/                # Core Business Logic & Calculations
│   │   │   ├── ai_provider.py       # Dual-mode AI provider (Deterministic & LLM)
│   │   │   ├── assessment_service.py # Scoring & Learning Gain (+pp)
│   │   │   ├── certificate_service.py# Cryptographic tokens & eligibility verification
│   │   │   ├── compliance_service.py# Configurable hours benchmarks
│   │   │   ├── dashboard_service.py # Dynamic university analytics
│   │   │   ├── passport_service.py  # Digital Passport aggregation
│   │   │   └── seed_service.py      # Rich demo dataset generator
│   │   ├── agents/                  # 10 Multi-Agent Implementations
│   │   │   ├── orchestrator.py
│   │   │   ├── skill_gap_agent.py
│   │   │   ├── recommendation_agent.py
│   │   │   ├── resource_matcher_agent.py
│   │   │   ├── fdp_generator_agent.py
│   │   │   ├── learning_impact_agent.py
│   │   │   ├── feedback_agent.py
│   │   │   ├── compliance_agent.py
│   │   │   ├── predictive_planner_agent.py
│   │   │   └── report_agent.py
│   │   └── api/
│   │       └── v1/
│   │           ├── router.py
│   │           └── endpoints/       # Modular FastAPI Route Handlers
│   │               ├── health.py
│   │               ├── auth.py
│   │               ├── departments.py
│   │               ├── faculty.py
│   │               ├── resource_persons.py
│   │               ├── events.py
│   │               ├── proposals.py
│   │               ├── registrations.py
│   │               ├── attendance.py
│   │               ├── assessments.py
│   │               ├── feedback.py
│   │               ├── certificates.py
│   │               ├── compliance.py
│   │               ├── agents.py
│   │               ├── reports.py
│   │               └── dashboard.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── run.py                       # Uvicorn runner script
│   └── test_api.py                  # Complete backend automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/              # StatusBadge, MetricCard, Modal, Navbar, Sidebar
│   │   ├── context/                 # AuthContext (Demo Role Switcher)
│   │   ├── layouts/                 # AppLayout Shell
│   │   ├── pages/                   # 15+ Interactive Full Pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── StrategyDashboard.jsx
│   │   │   ├── FacultyList.jsx
│   │   │   ├── FacultyProfile.jsx
│   │   │   ├── FacultyDigitalPassport.jsx
│   │   │   ├── DepartmentsList.jsx
│   │   │   ├── FDPList.jsx
│   │   │   ├── FDPCreate.jsx
│   │   │   ├── FDPDetail.jsx
│   │   │   ├── AIFDPGenerator.jsx
│   │   │   ├── ProposalsPage.jsx
│   │   │   ├── RegistrationsPage.jsx
│   │   │   ├── AttendancePage.jsx
│   │   │   ├── AssessmentsPage.jsx
│   │   │   ├── FeedbackIntelligencePage.jsx
│   │   │   ├── CertificatesPage.jsx
│   │   │   ├── CertificateVerificationPage.jsx
│   │   │   ├── AIIntelligenceHub.jsx
│   │   │   ├── CompliancePage.jsx
│   │   │   ├── ResourcePersonsList.jsx
│   │   │   ├── EventReportPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/
│   │   │   └── api.js               # Centralized API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Polished University SaaS theme
│   ├── package.json
│   └── vite.config.js
├── verify_full_system.py            # End-to-end 20-step verification test
└── README.md
```

---

## 6. Installation & Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies (if not already installed)
pip install -r requirements.txt

# 3. Start the FastAPI server
python run.py
```
*The backend starts at `http://127.0.0.1:8000`. On first start, it automatically creates all SQLite tables and seeds rich demo data.*  
*Interactive Swagger API documentation is accessible at: `http://127.0.0.1:8000/docs`*

### Frontend Setup
```bash
# 1. Open a second terminal and navigate to frontend
cd frontend

# 2. Install packages
npm install

# 3. Start the Vite development server
npm run dev
```
*The frontend starts at `http://localhost:5173`.*

---

## 7. The 20-Step Demo Walkthrough

The repository includes `verify_full_system.py` which executes and proves this exact 20-step workflow:

1. **Open Dashboard:** View live metrics across 12 faculty, 4 departments, active workshops, and 78% compliance.
2. **Open Dr. Ayesha Khan:** Navigate to Assistant Professor Dr. Ayesha Khan in the CSE department.
3. **Run AI Skill Analysis:** Click `RUN AI SKILL ANALYSIS`. Agent identifies:
   - `Generative AI` (**HIGH PRIORITY**, Gap score 76.0)
   - `Research Methodology` (**MEDIUM PRIORITY**, Gap score 62.0)
4. **Generate Training Recommendations:** Click `GENERATE TRAINING RECOMMENDATIONS`. System recommends:
   - *Generative AI for Engineering Education* (91% confidence score).
5. **AI FDP Generator:** Navigate to `AI FDP Generator`, enter prompt:  
   *"Create a 2-day FDP on Generative AI for Engineering Faculty"*.
6. **Save as Draft:** System automatically synthesizes complete syllabus, day-wise schedule, and pre/post questions, saving the event in **DRAFT** state.
7. **Submit Proposal:** Click `Submit for Approval`. Event status updates to `PENDING_APPROVAL`.
8. **Approve FDP:** Switch role to HOD / IQAC, review proposal, and click `Approve` with remarks.
9. **Open Registration:** Programme status updates to `REGISTRATION_OPEN`.
10. **Register Faculty:** Register Dr. Ayesha Khan with duplicate prevention and capacity controls.
11. **Find Best Resource Person:** Click `FIND BEST RESOURCE PERSON`. Agent ranks candidates (e.g. Dr. Anirudh Sen, Match Score 76.2%).
12. **Record Attendance:** Verify attendance via session marking or QR scanner mode.
13. **Complete Pre-Test:** Participant completes diagnostic pre-test (baseline average ~50%).
14. **Complete Post-Test:** Participant completes post-training test (~86-100%).
15. **Show Learning Gain:** View **Learning Gain: +32.5 percentage points** (strictly calculated as percentage points delta, never false percentage growth).
16. **Submit Feedback:** Submit 5-criterion feedback (5/5 Content, 5/5 Trainer, 4/5 Practical).
17. **AI Feedback Intelligence:** Synthesizes overall rating (4.8/5.0), positive themes, and bottlenecks (*"Practical activities could be expanded"*).
18. **Generate Certificate:** Issues cryptographic token (`FFAI-FDP-2026-XXXXXX`). Test public verification at `/verify-certificate/:token`.
19. **Open Digital Passport:** Dr. Ayesha Khan's passport displays acquired skills (`Generative AI`, `Machine Learning`), 40.0 verified training hours, certificates, and compliant status.
20. **Open Strategy Dashboard:** University-wide analytics display Top Training Demands, Department Development Scores, and next-semester predictive roadmap.

---

## 8. Verification & Automated Testing

Run the automated test suites anytime:

```bash
# Run backend test suite (All 10 test suites)
python backend/test_api.py

# Run complete 20-step demo verification
python verify_full_system.py

# Validate production build of the frontend
cd frontend && npm run build
```

---

## 9. Intelligence Feature Matrix

| Feature | Real Database Analytics | Rule-Based Multi-Agent | Optional External LLM |
|---|:---:|:---:|:---:|
| **Skill-Gap Analysis** | ✓ | ✓ | ✓ |
| **Training Recommendations** | ✓ | ✓ | ✓ |
| **Resource Person Matcher** | ✓ | ✓ | - |
| **FDP Blueprint Generator** | ✓ | ✓ | ✓ |
| **Learning Gain Calculation** | ✓ (Pure Math +pp) | - | - |
| **Feedback Intelligence** | ✓ | ✓ | ✓ |
| **Predictive Training Planner** | ✓ | ✓ | - |
| **Compliance Tracking** | ✓ | ✓ | - |
| **Digital Passport** | ✓ | - | - |
| **Final Accreditation Dossier**| ✓ | ✓ | - |

---

## 10. External LLM Integration

FacultyForge AI is designed to run offline out-of-the-box. To connect Gemini or another LLM:

1. Open `backend/.env` (or copy from `.env.example`).
2. Update the following configuration:
```env
AI_PROVIDER="llm"
AI_API_KEY="your-gemini-or-openai-api-key"
AI_MODEL="gemini-1.5-flash"
```
3. Restart the backend. When configured, `ai_provider.py` automatically routes natural-language generative prompts to the external model while falling back gracefully if offline.
