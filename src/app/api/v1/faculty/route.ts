import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department_id') ? Number(searchParams.get('department_id')) : undefined;
    const search = searchParams.get('search') || undefined;

    const faculty = await dbRepo.getFacultyList(departmentId, search);
    return NextResponse.json(faculty);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
