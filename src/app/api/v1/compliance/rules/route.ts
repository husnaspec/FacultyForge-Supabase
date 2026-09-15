import { NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET() {
  try {
    const rules = await dbRepo.getComplianceRules();
    return NextResponse.json(rules);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
