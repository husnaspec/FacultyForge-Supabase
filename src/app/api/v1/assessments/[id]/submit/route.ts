import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { submitAssessmentSchema } from '@/lib/validations/assessment.schema';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = submitAssessmentSchema.parse(body);

    const attempt = await dbRepo.submitAssessment(
      Number(id),
      validated.faculty_id,
      validated.answers,
      validated.score,
      validated.percentage
    );

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Assessment submitted and scored successfully.',
      attempt,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 400 });
  }
}
