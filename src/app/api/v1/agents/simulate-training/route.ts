import { NextRequest, NextResponse } from 'next/server';
import { TrainingSimulatorAgent } from '@/lib/ai/trainingSimulator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = TrainingSimulatorAgent.simulate({
      budget: Number(body.budget || 50000),
      planned_programmes_count: Number(body.planned_programmes_count || 3),
      targeted_faculty_count: Number(body.targeted_faculty_count || 20),
      department_code: body.department_code,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
