import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await dbRepo.addSkillEvidence(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
