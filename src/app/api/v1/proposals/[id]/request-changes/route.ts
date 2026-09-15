import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const approverName = body.approver_name || 'Dr. Priya Iyer';
    const approverRole = body.approver_role || 'HOD';
    const remarks = body.remarks || 'Please adjust timetable to avoid exam conflicts.';

    const updated = await dbRepo.reviewProposal(Number(id), 'CHANGES_REQUESTED', approverName, approverRole, remarks);
    if (!updated) {
      return NextResponse.json({ detail: 'Proposal not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
