import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const events = await dbRepo.getEvents();
    const registered = events.filter((e: any) => e.status === 'COMPLETED' || e.coordinator_faculty_id === Number(id));
    return NextResponse.json(registered);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
