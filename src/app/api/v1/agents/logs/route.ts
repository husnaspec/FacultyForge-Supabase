import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: 1, agent_name: 'Skill Gap Diagnostic Engine', status: 'SUCCESS', target: 'Faculty Roster', execution_time_ms: 12, timestamp: new Date().toISOString() },
    { id: 2, agent_name: 'Training Recommendation Engine', status: 'SUCCESS', target: 'Faculty Profiles', execution_time_ms: 18, timestamp: new Date().toISOString() },
    { id: 3, agent_name: 'Learning Gain Empirical Calculator', status: 'SUCCESS', target: 'Event #1 Pre/Post Tests', execution_time_ms: 8, timestamp: new Date().toISOString() },
    { id: 4, agent_name: 'Inter-Agent Accreditation Bus', status: 'DISPATCHED', target: 'Agents 9, 57, 58, 59, 60, 62', execution_time_ms: 24, timestamp: new Date().toISOString() },
  ]);
}
