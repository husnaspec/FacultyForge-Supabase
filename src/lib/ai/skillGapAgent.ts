export interface IdentifiedSkillGap {
  skill_name: string;
  current_level: 'NONE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  required_level: 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  gap_score: number; // 0 to 100
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
}

export class SkillGapAgent {
  private static DEPARTMENT_BENCHMARKS: Record<string, Array<{ name: string; target: 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'; priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' }>> = {
    CSE: [
      { name: 'Generative AI & LLMs', target: 'ADVANCED', priority: 'CRITICAL' },
      { name: 'Cloud Native Microservices', target: 'ADVANCED', priority: 'HIGH' },
      { name: 'Vector Databases & RAG', target: 'INTERMEDIATE', priority: 'HIGH' },
      { name: 'Outcome Based Education (OBE)', target: 'EXPERT', priority: 'CRITICAL' },
      { name: 'Grant Writing & Scopus Publishing', target: 'ADVANCED', priority: 'HIGH' },
    ],
    IT: [
      { name: 'Zero Trust Cybersecurity', target: 'ADVANCED', priority: 'CRITICAL' },
      { name: 'DevOps & CI/CD Pipelines', target: 'ADVANCED', priority: 'HIGH' },
      { name: 'Full Stack Engineering', target: 'ADVANCED', priority: 'MEDIUM' },
      { name: 'Cloud Infrastructure & Kubernetes', target: 'ADVANCED', priority: 'CRITICAL' },
      { name: 'Outcome Based Education (OBE)', target: 'EXPERT', priority: 'CRITICAL' },
    ],
    ECE: [
      { name: 'Edge AI & TinyML', target: 'ADVANCED', priority: 'CRITICAL' },
      { name: 'Neuromorphic Hardware & VLSI', target: 'ADVANCED', priority: 'HIGH' },
      { name: '5G/6G MIMO Signal Processing', target: 'ADVANCED', priority: 'MEDIUM' },
      { name: 'FPGA Prototyping', target: 'ADVANCED', priority: 'HIGH' },
      { name: 'Outcome Based Education (OBE)', target: 'EXPERT', priority: 'CRITICAL' },
    ],
    MECH: [
      { name: 'Additive Manufacturing & 3D Printing', target: 'ADVANCED', priority: 'HIGH' },
      { name: 'AI for Autonomous Robotics', target: 'ADVANCED', priority: 'CRITICAL' },
      { name: 'Computational Fluid Dynamics (CFD)', target: 'ADVANCED', priority: 'MEDIUM' },
      { name: 'Industry 4.0 & Smart Factory', target: 'INTERMEDIATE', priority: 'HIGH' },
      { name: 'Outcome Based Education (OBE)', target: 'EXPERT', priority: 'CRITICAL' },
    ],
  };

  static analyzeFaculty(faculty: {
    full_name: string;
    department_code: string;
    existing_skills?: string | null;
    development_interests?: string | null;
    years_of_experience?: number;
  }): IdentifiedSkillGap[] {
    const dept = faculty.department_code || 'CSE';
    const benchmarks = this.DEPARTMENT_BENCHMARKS[dept] || this.DEPARTMENT_BENCHMARKS['CSE'];
    const existingStr = (faculty.existing_skills || '').toLowerCase();
    const interestsStr = (faculty.development_interests || '').toLowerCase();

    const gaps: IdentifiedSkillGap[] = [];

    for (const b of benchmarks) {
      const skillLower = b.name.toLowerCase();
      const hasSkill = existingStr.includes(skillLower) || existingStr.split(',').some(s => skillLower.includes(s.trim()));
      const wantsSkill = interestsStr.includes(skillLower) || interestsStr.split(',').some(s => skillLower.includes(s.trim()));

      let currentLevel: 'NONE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'NONE';
      let gapScore = 80;

      if (hasSkill) {
        currentLevel = 'INTERMEDIATE';
        gapScore = b.target === 'EXPERT' ? 40 : 20;
      } else if (wantsSkill) {
        currentLevel = 'BEGINNER';
        gapScore = 65;
      }

      // If gap exists
      if (gapScore > 0 && currentLevel !== 'ADVANCED') {
        gaps.push({
          skill_name: b.name,
          current_level: currentLevel,
          required_level: b.target,
          gap_score: gapScore,
          priority: b.priority === 'CRITICAL' ? 'CRITICAL' : gapScore >= 70 ? 'HIGH' : 'MEDIUM',
          explanation: `Institutional accreditation benchmarks for ${dept} recommend ${b.target} competency in ${b.name}. Current verified profile shows ${currentLevel}.`,
        });
      }
    }

    return gaps;
  }
}
