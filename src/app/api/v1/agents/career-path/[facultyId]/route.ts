import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { CareerGrowthAgent } from '@/lib/ai/careerGrowthAgent';

export async function POST(request: NextRequest, { params }: { params: Promise<{ facultyId: string }> }) {
  try {
    const { facultyId } = await params;
    const body = await request.json().catch(() => ({}));
    const goal = body.goal || 'Associate Professor';

    const faculty = await dbRepo.getFaculty(Number(facultyId));
    if (!faculty) {
      return NextResponse.json({ detail: 'Faculty not found' }, { status: 404 });
    }

    const path = CareerGrowthAgent.generatePath(faculty, goal);
    return NextResponse.json(path);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
