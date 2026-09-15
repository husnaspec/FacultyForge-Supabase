export interface RecommendationResult {
  title: string;
  topic: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  recommended_duration: string;
  confidence_score: number;
  recommended_event_id?: number;
}

export class RecommendationAgent {
  static generateRecommendations(
    faculty: { id: number; full_name: string; department_code?: string; existing_skills?: string | null; development_interests?: string | null },
    gaps: Array<{ skill_name: string; priority: string; gap_score: number }>,
    availableEvents: Array<{ id: number; title: string; objectives?: string | null; status: string }> = []
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = [];

    // Sort gaps by priority and gap score
    const sortedGaps = [...gaps].sort((a, b) => b.gap_score - a.gap_score);

    for (const gap of sortedGaps.slice(0, 3)) {
      // Check if an available event addresses this gap
      const matchingEvent = availableEvents.find(e =>
        e.title.toLowerCase().includes(gap.skill_name.toLowerCase()) ||
        (e.objectives && e.objectives.toLowerCase().includes(gap.skill_name.toLowerCase()))
      );

      recommendations.push({
        title: matchingEvent ? matchingEvent.title : `Faculty Upskilling Programme on ${gap.skill_name}`,
        topic: gap.skill_name,
        priority: gap.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM',
        reason: `Targeted to resolve verified skill gap (${gap.gap_score}% deficit) and fulfill institutional accreditation criteria.`,
        recommended_duration: '3 Days (24 Hours)',
        confidence_score: Number((0.85 + (gap.gap_score / 1000)).toFixed(2)),
        recommended_event_id: matchingEvent ? matchingEvent.id : undefined,
      });
    }

    return recommendations;
  }
}
