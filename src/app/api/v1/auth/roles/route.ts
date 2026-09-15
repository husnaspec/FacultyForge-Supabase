import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    roles: [
      {
        role: 'ADMIN',
        label: 'Admin / FDP Coordinator',
        description: 'Create FDPs, AI Generator, proposals, attendance, certificates, run agents, view reports.',
      },
      {
        role: 'HOD',
        label: 'HOD / IQAC / Approver',
        description: 'Review proposals, approve/reject FDPs, view compliance, department analytics.',
      },
      {
        role: 'FACULTY',
        label: 'Faculty Member (Dr. Ayesha Khan)',
        description: 'Digital Passport, take assessments, view skill gaps, register for FDPs, certificates.',
      },
    ],
  });
}
