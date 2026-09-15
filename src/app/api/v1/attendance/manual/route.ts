import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventId = Number(body.event_id || 1);

    const recorded = await dbRepo.recordAttendance(eventId, {
      ...body,
      attendance_method: 'MANUAL',
    });

    return NextResponse.json({
      status: 'SUCCESS',
      attendance: recorded,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
