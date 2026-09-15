export interface ComplianceEvaluation {
  completed_hours: number;
  required_hours: number;
  compliance_percentage: number;
  status: 'COMPLIANT' | 'ATTENTION_REQUIRED' | 'NON_COMPLIANT';
  deficit_hours: number;
  compliance_badge: string;
  recommendation_action: string;
}

export class ComplianceAgent {
  static evaluateCompliance(completedHours: number, requiredHours: number = 40.0): ComplianceEvaluation {
    const completed = Math.max(0, completedHours);
    const required = Math.max(1, requiredHours);
    const percentage = Number(((completed / required) * 100).toFixed(1));
    const deficit = Math.max(0, Number((required - completed).toFixed(1)));

    let status: 'COMPLIANT' | 'ATTENTION_REQUIRED' | 'NON_COMPLIANT' = 'NON_COMPLIANT';
    let badge = 'badge-high';
    let action = 'Immediate enrollment in upcoming FDPs required to avoid appraisal deduction.';

    if (completed >= required) {
      status = 'COMPLIANT';
      badge = 'badge-low'; // green in FacultyForge theme
      action = 'Institutional annual norm fulfilled. Eligible for PBAS/API accreditation points.';
    } else if (percentage >= 50.0) {
      status = 'ATTENTION_REQUIRED';
      badge = 'badge-medium';
      action = `Requires ${deficit} additional training hours before academic term conclusion.`;
    }

    return {
      completed_hours: completed,
      required_hours: required,
      compliance_percentage: percentage,
      status,
      deficit_hours: deficit,
      compliance_badge: badge,
      recommendation_action: action,
    };
  }
}
