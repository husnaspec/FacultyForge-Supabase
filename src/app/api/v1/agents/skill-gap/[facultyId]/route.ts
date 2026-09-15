import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { SkillGapAgent } from '@/lib/ai/skillGapAgent';

export async function POST(request: NextRequest, { params }: { params: Promise<{ facultyId: string }> }) {
  try {
    const { facultyId } = await params;
    const faculty = await dbRepo.getFaculty(Number(facultyId));
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

    return NextResponse.json({
      status: 'SUCCESS',
      faculty_id: Number(facultyId),
      gaps_count: gaps.length,
      skill_gaps: gaps,
      agent_name: 'Agent 27 Skill Gap Diagnostic Engine',
      confidence_score: 0.94,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
