import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { createEventSchema } from '@/lib/validations/event.schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const departmentId = searchParams.get('department_id') ? Number(searchParams.get('department_id')) : undefined;
    const search = searchParams.get('search') || undefined;

    const events = await dbRepo.getEvents({ status, department_id: departmentId, search });
    return NextResponse.json(events);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createEventSchema.parse(body);
    const created = await dbRepo.createEvent(validated);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || err }, { status: 400 });
  }
}
