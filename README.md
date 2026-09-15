# FacultyForge AI — Agent 27 (Next.js + Supabase Architecture)
## Autonomous Faculty Development Programme & Workshop Intelligence Platform

**FacultyForge AI** is an enterprise-grade academic intelligence system designed for higher education institutions, engineering colleges, and universities. At its core is **Agent 27 (Faculty Development Programme & Workshop Agent)**, which automates the complete 10-stage lifecycle of faculty training, NAAC/NBA accreditation compliance, empirical learning gain measurement, cryptographic certificate verification, and institutional budget reconciliation.

---

## 1. Final Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Full-Stack Framework** | **Next.js 15 (App Router)** | Unified server & client components, route handlers, server actions |
| **UI** | **React 19 + TypeScript** | Strongly typed components, hooks, context, and widgets |
| **Styling** | **FacultyForge CSS Design System** | Cyber-HUD glassmorphism, scanlines, hardware-accelerated keyframes |
| **Server / API** | **Next.js Route Handlers** | Full REST API under `/api/v1/*` matching all endpoints |
| **Database** | **PostgreSQL on Supabase** | 22 normalized relational tables with foreign keys and cascading rules |
| **Database Access** | **Supabase JS SDK** | `@supabase/supabase-js` + `@supabase/ssr` with cookie-based session management |
| **Authentication** | **Supabase Auth** | Email/Password auth, session persistence, role-linked profiles |
| **Authorization** | **Role-Based Access + PostgreSQL RLS** | Roles: `ADMIN` (Coordinator), `HOD` (Approver), `FACULTY` (Participant) |
| **Validation** | **Zod** | Strictly validated schemas for events, proposals, attendance, etc. |
| **AI Layer** | **Deterministic Expert Engine + Pluggable LLM** | 100% test reliability offline in TypeScript; optional Gemini API adapter |
| **Deployment** | **Vercel** | Zero-config Next.js production deployments |
| **Source Control** | **`FacultyForge-Supabase`** | Clean repository ready for institutional version control |

---

## 2. Quick Start & Local Development

### Prerequisites:
- **Node.js**: v18.0+ (Tested on Node v24)
- **npm**: v9.0+

### Installation & Run:
```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open your browser at **`http://localhost:3000`**:
- **Landing Page**: `http://localhost:3000/`
- **Supabase Login / Auth**: `http://localhost:3000/login`
- **Agent 27 Workspace**: `http://localhost:3000/app`
- **Public Certificate Verification**: `http://localhost:3000/verify-certificate/CERT-CSE-2026-8F2A`

---

## 3. Supabase PostgreSQL Setup

The project includes ready-to-execute SQL migration and seed scripts:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase project dashboard.
3. Run `supabase/schema.sql` to provision all 22 tables, foreign keys, triggers, and Row Level Security (RLS) policies.
4. Run `supabase/seed.sql` to populate the initial institutional dataset (12 faculty, 4 departments, compliance rules, events, and assessments).
5. In your Supabase Dashboard under **Project Settings > API**, copy your **Project URL**, **Anon Key**, and **Service Role Key** into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

---

## 4. Production Build & Vercel Deployment

### Build Locally:
```bash
npm run build
npm run start
```

### Deploy to Vercel:
1. Push your code to the new repository (`FacultyForge-Supabase`).
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (your production URL)
   - `GEMINI_API_KEY` (optional)
   - `ENABLE_LLM` (optional, default `false`)
4. Click **Deploy**. Vercel will automatically build the Next.js App Router application.

---

## 5. Pushing to New GitHub Repository (`FacultyForge-Supabase`)

To publish this unified project to the new `FacultyForge-Supabase` GitHub repository:

```bash
# 1. Check current status
git status

# 2. Add remote for the new repository
git remote add supabase-repo https://github.com/YOUR_USERNAME/FacultyForge-Supabase.git

# 3. Stage and commit changes
git add .
git commit -m "feat: complete Next.js App Router + Supabase rebuild for FacultyForge AI (Agent 27)"

# 4. Push to main branch
git push -u supabase-repo main
```

---

## 6. Architecture & Autonomous Agent Features

Agent 27 automates the complete 10-stage sequential programme lifecycle:
1. **Event Proposal & Multi-Role Approval Routing** (HOD & IQAC approval chains).
2. **Capacity-Gated Registrations** with department eligibility checks.
3. **Resource Person Coordination** with travel and honorarium tracking.
4. **Mandatory Daily Attendance Tracking** supporting QR code check-in.
5. **Pre & Post Assessments** calculating normalized empirical **Learning Gain ($\Delta$ pp)** via Hake's formula.
6. **5-Dimensional Structured Feedback Matrix** (Content, Delivery, Relevance, Hands-on, Organization).
7. **Cryptographic QR-Verifiable Certificates** with instant public verification portal.
8. **IQAC Event Reports & Financial Statements** formatted for NAAC Criteria 6.3.2/6.3.3 and NBA Criteria 5 & 6.
9. **Faculty Digital Passports** tracking continuous professional development against the annual 40-hour rule.
10. **Inter-Agent Integration Bus** streaming real-time verified payloads to downstream governance agents (**Agents 9, 57, 58, 59, 60, and 62**).
