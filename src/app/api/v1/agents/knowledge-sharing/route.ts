import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    {
      faculty_name: 'Dr. Ayesha Khan',
      skill_name: 'Generative AI & LLMs',
      certification_date: '2026-03-01',
      recommended_event_to_lead: 'Hands-on Workshop: Fine-Tuning Open Source LLMs with LoRA',
      target_audience: 'Junior CSE Faculty & M.Tech Scholars',
      urgency: 'HIGH',
    },
    {
      faculty_name: 'Dr. Arjun Sharma',
      skill_name: 'Zero Trust Cybersecurity',
      certification_date: '2026-02-15',
      recommended_event_to_lead: 'Department Seminar: Implementing Zero Trust in University Network Infrastructure',
      target_audience: 'IT & Systems Administration Faculty',
      urgency: 'HIGH',
    },
    {
      faculty_name: 'Dr. Farhan Ali',
      skill_name: 'Additive Manufacturing & CAD',
      certification_date: '2026-01-20',
      recommended_event_to_lead: 'Laboratory Demonstration: 3D Prototyping & Thermal Analysis',
      target_audience: 'Mechanical Engineering Faculty',
      urgency: 'MEDIUM',
    },
  ]);
}
