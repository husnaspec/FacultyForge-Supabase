export interface PeerMentorMatch {
  mentor_id: number;
  mentor_name: string;
  mentor_designation: string;
  department: string;
  matched_skill: string;
  mentor_experience: number;
  match_score: number; // 0 to 100
  mentorship_rationale: string;
}

export class PeerMentorAgent {
  static findMentors(
    targetFacultyId: number,
    skillName: string,
    facultyList: Array<{
      id: number;
      full_name: string;
      designation: string;
      department?: string;
      years_of_experience: number;
      existing_skills?: string | null;
    }>
  ): PeerMentorMatch[] {
    const cleanSkill = skillName.toLowerCase();
    const mentors: PeerMentorMatch[] = [];

    for (const f of facultyList) {
      if (f.id === targetFacultyId) continue;

      const skillsStr = (f.existing_skills || '').toLowerCase();
      if (skillsStr.includes(cleanSkill) || cleanSkill.split(' ').some(w => w.length > 3 && skillsStr.includes(w))) {
        // Seniority weighting
        const expWeight = Math.min(30, f.years_of_experience * 2.5);
        const matchScore = Math.min(98, Math.round(65 + expWeight));

        mentors.push({
          mentor_id: f.id,
          mentor_name: f.full_name,
          mentor_designation: f.designation,
          department: f.department || 'Allied Department',
          matched_skill: skillName,
          mentor_experience: f.years_of_experience,
          match_score: matchScore,
          mentorship_rationale: `${f.full_name} has demonstrated verified expertise in ${skillName} with ${f.years_of_experience} years of academic and research experience.`,
        });
      }
    }

    return mentors.sort((a, b) => b.match_score - a.match_score);
  }
}
