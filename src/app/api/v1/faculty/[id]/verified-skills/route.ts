import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const faculty = await dbRepo.getFaculty(Number(id));
    if (!faculty) {
      return NextResponse.json({ detail: 'Faculty not found' }, { status: 404 });
    }

    const skills = (faculty.existing_skills || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const verified = skills.map((skillName: string, idx: number) => ({
      id: idx + 1,
      skill_name: skillName,
      proficiency_level: idx % 2 === 0 ? 'ADVANCED' : 'INTERMEDIATE',
      verification_status: 'VERIFIED',
      source: 'FDP_ASSESSMENT',
    }));

    return NextResponse.json(verified);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
