import { NextRequest, NextResponse } from 'next/server';
import { PredictivePlannerAgent } from '@/lib/ai/predictivePlanner';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deptId = searchParams.get('department_id') || '1';
    const year = searchParams.get('academic_year') || '2026-2027';
    const sem = searchParams.get('semester') || 'Odd Semester';

    const deptCode = deptId === '2' ? 'IT' : deptId === '3' ? 'ECE' : deptId === '4' ? 'MECH' : 'CSE';

    const plan = PredictivePlannerAgent.generateAcademicPlan(deptCode, year, sem);
    return NextResponse.json({
      department_code: deptCode,
      academic_year: year,
      semester: sem,
      training_plan: plan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
