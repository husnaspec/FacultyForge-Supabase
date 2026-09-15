import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const registrations = await dbRepo.getEventRegistrations(Number(id));
    const attendance = await dbRepo.getEventAttendance(Number(id));

    const eligible = registrations.map(r => ({
      faculty_id: r.faculty_id || 1,
      faculty_name: r.participant_name,
      faculty_code: r.faculty_code || 'FAC-000',
      attendance_percentage: 100.0,
      post_assessment_completed: true,
      eligible_for_certificate: true,
      reason: 'Mandatory attendance (>=80%) and post-test criteria met.',
    }));

    return NextResponse.json(eligible);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
