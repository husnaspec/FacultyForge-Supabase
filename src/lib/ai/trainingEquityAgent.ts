export interface EquityMetric {
  group_name: string;
  total_faculty: number;
  participating_faculty: number;
  participation_rate: number; // percentage
  average_hours_completed: number;
  parity_status: 'BALANCED' | 'UNDERREPRESENTED' | 'EXEMPLARY';
}

export interface TrainingEquityReport {
  overall_equity_index: number; // 0 to 1.0 (1.0 = perfect parity)
  gender_parity: EquityMetric[];
  designation_parity: EquityMetric[];
  department_parity: EquityMetric[];
  recommendations: string[];
}

export class TrainingEquityAgent {
  static evaluateEquity(): TrainingEquityReport {
    return {
      overall_equity_index: 0.88,
      gender_parity: [
        {
          group_name: 'Female Faculty',
          total_faculty: 6,
          participating_faculty: 5,
          participation_rate: 83.3,
          average_hours_completed: 36.4,
          parity_status: 'BALANCED',
        },
        {
          group_name: 'Male Faculty',
          total_faculty: 6,
          participating_faculty: 5,
          participation_rate: 83.3,
          average_hours_completed: 34.8,
          parity_status: 'BALANCED',
        },
      ],
      designation_parity: [
        {
          group_name: 'Assistant Professors',
          total_faculty: 7,
          participating_faculty: 6,
          participation_rate: 85.7,
          average_hours_completed: 38.0,
          parity_status: 'EXEMPLARY',
        },
        {
          group_name: 'Associate Professors',
          total_faculty: 3,
          participating_faculty: 3,
          participation_rate: 100.0,
          average_hours_completed: 34.0,
          parity_status: 'BALANCED',
        },
        {
          group_name: 'Professors',
          total_faculty: 2,
          participating_faculty: 2,
          participation_rate: 100.0,
          average_hours_completed: 46.0,
          parity_status: 'EXEMPLARY',
        },
      ],
      department_parity: [
        {
          group_name: 'Computer Science & Engineering (CSE)',
          total_faculty: 4,
          participating_faculty: 4,
          participation_rate: 100.0,
          average_hours_completed: 42.0,
          parity_status: 'EXEMPLARY',
        },
        {
          group_name: 'Information Technology (IT)',
          total_faculty: 3,
          participating_faculty: 3,
          participation_rate: 100.0,
          average_hours_completed: 37.3,
          parity_status: 'BALANCED',
        },
        {
          group_name: 'Electronics & Communication (ECE)',
          total_faculty: 3,
          participating_faculty: 2,
          participation_rate: 66.7,
          average_hours_completed: 28.0,
          parity_status: 'UNDERREPRESENTED',
        },
        {
          group_name: 'Mechanical Engineering (MECH)',
          total_faculty: 2,
          participating_faculty: 2,
          participation_rate: 100.0,
          average_hours_completed: 38.0,
          parity_status: 'BALANCED',
        },
      ],
      recommendations: [
        'Organize dedicated VLSI / Microelectronics FDP for ECE faculty to achieve 100% institutional compliance.',
        'High parity maintained between male and female faculty participation (equity index 0.88).',
        'Assistant professors demonstrate highest eagerness for technical upskilling.',
      ],
    };
  }
}
