import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;

    const persons = await dbRepo.getResourcePersons(search);
    return NextResponse.json(persons);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
