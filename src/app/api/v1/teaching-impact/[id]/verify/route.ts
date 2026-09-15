import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({
      status: 'VERIFIED',
      id: Number(id),
      reviewer_rating: body.reviewer_rating || 5.0,
      verified_by: 'IQAC Accreditation File Custodian',
      verified_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
