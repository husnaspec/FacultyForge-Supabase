import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { qrCheckInSchema } from '@/lib/validations/attendance.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = qrCheckInSchema.parse(body);

    const eventId = validated.event_id || 1;
    const registrations = await dbRepo.getEventRegistrations(eventId);

    // Match QR token (format: REG-VU2026-0001:token-1 or token-1)
    const matchingReg = registrations.find(r => r.qr_token === validated.qr_token || r.registration_token === validated.qr_token || r.registration_code === validated.qr_token);

    if (!matchingReg) {
      return NextResponse.json({ detail: 'Invalid or unrecognized QR token' }, { status: 404 });
    }

    const recorded = await dbRepo.recordAttendance(eventId, {
      session_id: validated.session_id || 1,
      faculty_id: matchingReg.faculty_id,
      registration_id: matchingReg.id,
      attendance_status: 'PRESENT',
      attendance_method: 'QR',
    });

    return NextResponse.json({
      status: 'SUCCESS',
      message: `Verified attendance for ${matchingReg.participant_name}`,
      participant: matchingReg.participant_name,
      attendance: recorded,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 400 });
  }
}
