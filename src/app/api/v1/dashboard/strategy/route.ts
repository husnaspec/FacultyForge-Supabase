import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    kpis: {
      naac_criterion_632_score: 3.85,
      nba_criterion_5_score: 4.2,
      budget_utilization_rate: 92.3,
      avg_empirical_gain_pp: 42.0,
      annual_compliance_rate: 58.3,
    },
    inter_agent_transfers: [
      { agent: 'Agent 9 (Faculty Appraisal)', target: 'API/PBAS Ledgers', payload: '12 Faculty CPD Hours Synced', status: 'ACTIVE' },
      { agent: 'Agent 57 (Accreditation - NAAC/NBA)', target: 'Criteria 5 & 6', payload: 'Dossiers & Attendance Sheets', status: 'ACTIVE' },
      { agent: 'Agent 58 (IQAC Compliance)', target: 'Quality Audits', payload: 'Normalized Gain Records (Hake g=0.79)', status: 'ACTIVE' },
      { agent: 'Agent 59 (Budget & Grants)', target: 'Financial Ledger', payload: 'Rs. 78,400 Disbursed Statement', status: 'ACTIVE' },
      { agent: 'Agent 60 (Workload & Timetable)', target: 'Substitution Engine', payload: 'Zero Lecture Collisions', status: 'ACTIVE' },
      { agent: 'Agent 62 (Competency Directory)', target: 'Skill Taxonomy', payload: '14 Verified Faculty Competencies', status: 'ACTIVE' },
    ],
    department_benchmarks: [
      { department: 'Computer Science & Engineering', compliant: 3, total: 4, compliance_rate: 75.0, avg_hours: 42.0 },
      { department: 'Information Technology', compliant: 2, total: 3, compliance_rate: 66.7, avg_hours: 37.3 },
      { department: 'Electronics & Communication', compliant: 1, total: 3, compliance_rate: 33.3, avg_hours: 28.0 },
      { department: 'Mechanical Engineering', compliant: 2, total: 2, compliance_rate: 100.0, avg_hours: 38.0 },
    ],
  });
}
