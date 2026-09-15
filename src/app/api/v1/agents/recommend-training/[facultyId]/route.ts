import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { SkillGapAgent } from '@/lib/ai/skillGapAgent';
import { RecommendationAgent } from '@/lib/ai/recommendationAgent';

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

    const events = await dbRepo.getEvents();
    const recommendations = RecommendationAgent.generateRecommendations(faculty, gaps, events);

    return NextResponse.json({
      status: 'SUCCESS',
      faculty_id: Number(facultyId),
      recommendations_count: recommendations.length,
      recommendations,
      agent_name: 'Agent 27 Training Recommendation Engine',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
