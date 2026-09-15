import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { SkillGapAgent } from '@/lib/ai/skillGapAgent';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const faculty = await dbRepo.getFaculty(Number(id));
    if (!faculty) {
      return NextResponse.json({ detail: 'Faculty not found' }, { status: 404 });
    }

    const gaps = SkillGapAgent.analyzeFaculty({
      full_name: faculty.full_name,
      department_code: faculty.department?.code || 'CSE',
      existing_skills: faculty.existing_skills,
      development_interests: faculty.development_interests,
      years_of_experience: faculty.years_of_experience,
    });

    return NextResponse.json(gaps);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
