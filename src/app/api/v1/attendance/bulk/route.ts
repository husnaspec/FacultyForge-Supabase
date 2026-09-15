import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventId = Number(body.event_id || 1);
    const sessionId = Number(body.session_id || 1);
    const attendees = body.attendees || [];

    const recorded: any[] = [];
    for (const item of attendees) {
      const rec = await dbRepo.recordAttendance(eventId, {
        session_id: sessionId,
        faculty_id: item.faculty_id,
        registration_id: item.registration_id,
        attendance_status: item.attendance_status || 'PRESENT',
        attendance_method: 'MANUAL',
      });
      recorded.push(rec);
    }

    return NextResponse.json({
      status: 'SUCCESS',
      recorded_count: recorded.length,
      records: recorded,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
