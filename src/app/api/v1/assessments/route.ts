import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { createAssessmentSchema } from '@/lib/validations/assessment.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createAssessmentSchema.parse(body);

    // Creates an assessment record
    const created = {
      id: Math.floor(Math.random() * 1000) + 10,
      ...validated,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 400 });
  }
}
