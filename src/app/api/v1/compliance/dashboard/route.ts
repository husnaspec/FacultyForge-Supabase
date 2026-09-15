import { NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET() {
  try {
    const dashboard = await dbRepo.getComplianceDashboard();
    return NextResponse.json(dashboard);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
