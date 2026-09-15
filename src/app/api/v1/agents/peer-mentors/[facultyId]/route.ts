import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { PeerMentorAgent } from '@/lib/ai/peerMentorAgent';

export async function GET(request: NextRequest, { params }: { params: Promise<{ facultyId: string }> }) {
  try {
    const { facultyId } = await params;
    const { searchParams } = new URL(request.url);
    const skillName = searchParams.get('skill_name') || 'Python';

    const allFaculty = await dbRepo.getFacultyList();
    const matches = PeerMentorAgent.findMentors(
      Number(facultyId),
      skillName,
      allFaculty.map((f: any) => ({
        id: f.id,
        full_name: f.full_name,
        designation: f.designation,
        department: f.department?.name,
        years_of_experience: f.years_of_experience,
        existing_skills: f.existing_skills,
      }))
    );

    return NextResponse.json(matches);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
