export interface CareerMilestone {
  title: string;
  category: 'PEDAGOGY' | 'RESEARCH' | 'LEADERSHIP' | 'ACCREDITATION';
  status: 'ACHIEVED' | 'IN_PROGRESS' | 'PENDING';
  required_hours_or_credits: string;
  recommended_action: string;
}

export interface CareerGrowthPath {
  faculty_name: string;
  current_designation: string;
  target_role: string;
  readiness_percentage: number;
  milestones: CareerMilestone[];
}

export class CareerGrowthAgent {
  static generatePath(
    faculty: { full_name: string; designation: string; years_of_experience: number; existing_skills?: string | null },
    targetRole: string = 'Associate Professor'
  ): CareerGrowthPath {
    const exp = faculty.years_of_experience || 3;
    const isProf = faculty.designation.toLowerCase().includes('professor') && !faculty.designation.toLowerCase().includes('assistant');
    const isAssoc = faculty.designation.toLowerCase().includes('associate');

    let readiness = 60;
    if (isProf) readiness = 95;
    else if (isAssoc) readiness = 82;
    else readiness = Math.min(85, Math.round(50 + exp * 5));

    const milestones: CareerMilestone[] = [
      {
        title: 'Outcome-Based Education (OBE) Master Trainer',
        category: 'PEDAGOGY',
        status: exp >= 5 ? 'ACHIEVED' : 'IN_PROGRESS',
        required_hours_or_credits: '40 Hours CPD',
        recommended_action: 'Complete Institutional OBE & Bloom Taxonomy certification.',
      },
      {
        title: 'Scopus / WoS Q1/Q2 Indexed Research Publications',
        category: 'RESEARCH',
        status: exp >= 8 ? 'ACHIEVED' : 'IN_PROGRESS',
        required_hours_or_credits: '2 Core Papers',
        recommended_action: 'Co-author research papers leveraging verified laboratory data.',
      },
      {
        title: 'FDP Programme Coordinator & External Resource Person',
        category: 'LEADERSHIP',
        status: exp >= 6 ? 'ACHIEVED' : 'PENDING',
        required_hours_or_credits: '1 Programme Coordinated',
        recommended_action: 'Initiate and submit an FDP proposal through Agent 27 proposal portal.',
      },
      {
        title: 'Accreditation Criteria 5 & 6 File Custodian',
        category: 'ACCREDITATION',
        status: exp >= 7 ? 'ACHIEVED' : 'PENDING',
        required_hours_or_credits: 'IQAC Audit Signoff',
        recommended_action: 'Maintain tamper-proof digital passports and verifiable certificates.',
      },
    ];

    return {
      faculty_name: faculty.full_name,
      current_designation: faculty.designation,
      target_role: targetRole,
      readiness_percentage: readiness,
      milestones,
    };
  }
}
