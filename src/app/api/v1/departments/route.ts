import { NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET() {
  try {
    const departments = await dbRepo.getDepartments();
    return NextResponse.json(departments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
