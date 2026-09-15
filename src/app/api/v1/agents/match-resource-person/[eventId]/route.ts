import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/lib/db/repo';

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const event = await dbRepo.getEvent(Number(eventId));
    const persons = await dbRepo.getResourcePersons();

    const matches = persons.map((p: any) => ({
      resource_person: p,
      match_score: 92.0,
      matched_topics: ['Transformers', 'Autonomous Agents', 'Deep Learning'],
      rationale: `Dr. ${p.name} has published leading papers matching the event curriculum for ${event?.title || 'FDP'}.`,
    }));

    return NextResponse.json({
      event_id: Number(eventId),
      matches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
