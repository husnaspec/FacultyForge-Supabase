export interface SimulationInput {
  budget: number;
  planned_programmes_count: number;
  targeted_faculty_count: number;
  department_code?: string;
}

export interface SimulationResult {
  projected_compliance_rate: number; // e.g. 88.5%
  compliance_lift: number; // e.g. +24.5 pp
  projected_skill_gap_reduction: number; // e.g. -38.0%
  projected_accreditation_score_increase: number; // e.g. +14.2
  estimated_cost_per_faculty: number;
  roi_summary: string;
}

export class TrainingSimulatorAgent {
  static simulate(input: SimulationInput): SimulationResult {
    const budget = Math.max(10000, input.budget || 50000);
    const count = Math.max(1, input.planned_programmes_count || 3);
    const facultyCount = Math.max(5, input.targeted_faculty_count || 20);

    const costPerFaculty = Math.round(budget / facultyCount);

    // Compute empirical models
    const liftFactor = Math.min(45, (count * 6.5) + (budget / 10000) * 1.8);
    const baselineCompliance = 52.0;
    const projectedCompliance = Math.min(100.0, Number((baselineCompliance + liftFactor).toFixed(1)));
    const gapReduction = Math.min(65.0, Number((count * 9.2 + (budget / 15000) * 2.1).toFixed(1)));
    const accreditationLift = Number(((count * 3.1) + (projectedCompliance / 12)).toFixed(1));

    return {
      projected_compliance_rate: projectedCompliance,
      compliance_lift: Number((projectedCompliance - baselineCompliance).toFixed(1)),
      projected_skill_gap_reduction: gapReduction,
      projected_accreditation_score_increase: accreditationLift,
      estimated_cost_per_faculty: costPerFaculty,
      roi_summary: `Investing Rs. ${budget.toLocaleString()} across ${count} targeted FDPs will elevate department compliance to ${projectedCompliance}% and reduce skill deficits by ${gapReduction}%.`,
    };
  }
}
