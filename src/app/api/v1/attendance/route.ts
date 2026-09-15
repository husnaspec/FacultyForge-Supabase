import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { attendanceRecordSchema } from '@/lib/validations/attendance.schema';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get('event_id');
    const body = await request.json();

    const eventId = Number(eventIdParam || body.event_id);
    const validated = attendanceRecordSchema.parse({ ...body, event_id: eventId });

    const created = await dbRepo.recordAttendance(eventId, validated);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 400 });
  }
}
