export interface PlannedTrainingSlot {
  month: string;
  recommended_title: string;
  focus_area: string;
  target_department: string;
  expected_participants: number;
  duration_days: number;
  urgency: 'HIGH' | 'MEDIUM';
}

export class PredictivePlannerAgent {
  static generateAcademicPlan(
    departmentCode: string = 'CSE',
    academicYear: string = '2026-2027',
    semester: string = 'Odd Semester'
  ): PlannedTrainingSlot[] {
    const isOdd = semester.toLowerCase().includes('odd');

    if (isOdd) {
      return [
        {
          month: 'July',
          recommended_title: `Orientation on Outcome-Based Education (OBE) & Bloom's Taxonomy for ${departmentCode}`,
          focus_area: 'Pedagogy & Accreditation',
          target_department: departmentCode,
          expected_participants: 35,
          duration_days: 2,
          urgency: 'HIGH',
        },
        {
          month: 'August',
          recommended_title: `Advanced Deep Learning Architectures & PyTorch Foundations`,
          focus_area: 'Emerging Technologies',
          target_department: departmentCode,
          expected_participants: 45,
          duration_days: 5,
          urgency: 'HIGH',
        },
        {
          month: 'September',
          recommended_title: `Research Methodology, Scopus Indexing & Grant Proposal Drafting`,
          focus_area: 'Research & Innovation',
          target_department: departmentCode,
          expected_participants: 30,
          duration_days: 3,
          urgency: 'MEDIUM',
        },
        {
          month: 'October',
          recommended_title: `Cloud Native Microservices & Container Security`,
          focus_area: 'Industry Alignment',
          target_department: departmentCode,
          expected_participants: 40,
          duration_days: 3,
          urgency: 'HIGH',
        },
      ];
    }

    return [
      {
        month: 'January',
        recommended_title: `Generative AI & Agentic Pedagogical Integration in ${departmentCode}`,
        focus_area: 'AI Innovation',
        target_department: departmentCode,
        expected_participants: 50,
        duration_days: 5,
        urgency: 'HIGH',
      },
      {
        month: 'February',
        recommended_title: `Cyber Defense & Zero Trust Infrastructure Lab`,
        focus_area: 'Security & Systems',
        target_department: departmentCode,
        expected_participants: 35,
        duration_days: 3,
        urgency: 'MEDIUM',
      },
      {
        month: 'March',
        recommended_title: `Intellectual Property Rights (IPR) & Patent Filing Workshop`,
        focus_area: 'Innovation & Patents',
        target_department: departmentCode,
        expected_participants: 28,
        duration_days: 2,
        urgency: 'MEDIUM',
      },
    ];
  }
}
