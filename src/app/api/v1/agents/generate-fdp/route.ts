import { NextRequest, NextResponse } from 'next/server';
import { LLMAdapter } from '@/lib/ai/llmAdapter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt || 'Modern Generative AI and Autonomous Agent Systems';
    const deptId = body.department_id || 1;
    const days = body.target_duration_days || 3;

    const deptCode = deptId === 2 ? 'IT' : deptId === 3 ? 'ECE' : deptId === 4 ? 'MECH' : 'CSE';

    const generated = await LLMAdapter.generateFDPWithFallback(prompt, deptCode, days);
    return NextResponse.json(generated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
