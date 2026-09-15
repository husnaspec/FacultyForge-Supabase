import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id') ? Number(searchParams.get('session_id')) : undefined;

    const attendances = await dbRepo.getEventAttendance(Number(id), sessionId);
    return NextResponse.json(attendances);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
