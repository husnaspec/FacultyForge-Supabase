import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const submittedBy = body.submitted_by || 'Admin Coordinator';

    const proposal = await dbRepo.submitProposal(Number(id), submittedBy);
    return NextResponse.json(proposal);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
