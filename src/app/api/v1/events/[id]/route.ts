import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';
import { updateEventSchema } from '@/lib/validations/event.schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await dbRepo.getEvent(Number(id));
    if (!event) {
      return NextResponse.json({ detail: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateEventSchema.parse(body);
    const updated = await dbRepo.updateEvent(Number(id), validated);
    if (!updated) {
      return NextResponse.json({ detail: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
