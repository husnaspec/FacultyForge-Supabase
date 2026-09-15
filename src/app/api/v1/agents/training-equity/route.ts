import { NextResponse } from 'next/server';
import { TrainingEquityAgent } from '@/lib/ai/trainingEquityAgent';

export async function GET() {
  try {
    const report = TrainingEquityAgent.evaluateEquity();
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
