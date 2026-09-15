import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const proposals = await dbRepo.getProposals(status);
    return NextResponse.json(proposals);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
