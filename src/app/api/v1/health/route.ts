import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    agent: 'Agent 27 - Faculty Development Programme & Workshop Agent',
    platform: 'FacultyForge AI',
    framework: 'Next.js App Router',
    database: 'PostgreSQL on Supabase',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
}
