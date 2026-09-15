import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const registrations = await dbRepo.getEventRegistrations(Number(id));
    return NextResponse.json(registrations);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
