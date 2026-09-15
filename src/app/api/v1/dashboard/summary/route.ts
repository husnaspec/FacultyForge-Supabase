import { NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET() {
  try {
    const summary = await dbRepo.getDashboardSummary();
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
