import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    skills: [
      { name: 'Generative AI & LLMs', cse: 85, it: 65, ece: 40, mech: 25 },
      { name: 'Cloud Native Microservices', cse: 80, it: 90, ece: 35, mech: 20 },
      { name: 'Zero Trust Cybersecurity', cse: 70, it: 85, ece: 30, mech: 15 },
      { name: 'Edge AI & TinyML', cse: 60, it: 50, ece: 90, mech: 45 },
      { name: 'Outcome Based Education (OBE)', cse: 90, it: 85, ece: 80, mech: 95 },
      { name: 'Additive Manufacturing / CAD', cse: 20, it: 15, ece: 40, mech: 95 },
      { name: 'Autonomous Robotics', cse: 65, it: 45, ece: 75, mech: 90 },
      { name: 'Grant Proposal Writing', cse: 75, it: 70, ece: 65, mech: 80 },
    ],
  });
}
