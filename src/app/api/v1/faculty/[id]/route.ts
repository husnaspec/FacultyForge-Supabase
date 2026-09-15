import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const faculty = await dbRepo.getFaculty(Number(id));
    if (!faculty) {
      return NextResponse.json({ detail: 'Faculty not found' }, { status: 404 });
    }
    return NextResponse.json(faculty);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
