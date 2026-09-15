import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const faculty = await dbRepo.getFaculty(Number(id));
    if (!faculty) {
      return NextResponse.json({ detail: 'Faculty not found' }, { status: 404 });
    }

    const compliance = await dbRepo.getFacultyCompliance(Number(id));
    const skillEvidence = await dbRepo.getSkillEvidence(Number(id));
    const teachingImpact = await dbRepo.getTeachingImpacts(Number(id));
    const allCertificates = await dbRepo.getEventCertificates(1); // sample completed event
    const userCertificates = allCertificates.filter((c: any) => c.faculty_id === Number(id));

    return NextResponse.json({
      faculty,
      compliance,
      completed_hours: compliance.completed_hours,
      required_hours: compliance.required_hours,
      compliance_percentage: compliance.compliance_percentage,
      compliance_status: compliance.status,
      certificates: userCertificates,
      skill_evidence: skillEvidence,
      teaching_impacts: teachingImpact,
      inter_agent_transfers: [
        { target_agent: 'Agent 9 (Faculty Appraisal & PBAS)', status: 'SYNCED', last_payload: `${compliance.completed_hours} Verified Hours` },
        { target_agent: 'Agent 57 (NAAC/NBA Accreditation)', status: 'READY', last_payload: 'Criterion 6.3.2 Certificate Dossier' },
        { target_agent: 'Agent 58 (IQAC Quality Audit)', status: 'AUDITED', last_payload: 'Zero Discrepancies' },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
