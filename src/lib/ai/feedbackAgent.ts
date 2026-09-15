export interface FeedbackMetrics {
  total_responses: number;
  average_content: number;
  average_trainer: number;
  average_relevance: number;
  average_practical: number;
  average_organization: number;
  overall_score: number; // Out of 5.0
  sentiment_label: 'EXCELLENT' | 'VERY_GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';
  recommendations: string[];
}

export class FeedbackAgent {
  static analyzeFeedbacks(feedbacks: Array<{
    content_rating: number;
    trainer_rating: number;
    relevance_rating: number;
    practical_rating: number;
    organization_rating: number;
    comments?: string | null;
  }>): FeedbackMetrics {
    if (feedbacks.length === 0) {
      return {
        total_responses: 0,
        average_content: 0,
        average_trainer: 0,
        average_relevance: 0,
        average_practical: 0,
        average_organization: 0,
        overall_score: 0,
        sentiment_label: 'SATISFACTORY',
        recommendations: ['Collect participant feedback upon programme completion.'],
      };
    }

    const count = feedbacks.length;
    let sContent = 0;
    let sTrainer = 0;
    let sRelevance = 0;
    let sPractical = 0;
    let sOrg = 0;

    for (const f of feedbacks) {
      sContent += f.content_rating;
      sTrainer += f.trainer_rating;
      sRelevance += f.relevance_rating;
      sPractical += f.practical_rating;
      sOrg += f.organization_rating;
    }

    const avgContent = Number((sContent / count).toFixed(2));
    const avgTrainer = Number((sTrainer / count).toFixed(2));
    const avgRelevance = Number((sRelevance / count).toFixed(2));
    const avgPractical = Number((sPractical / count).toFixed(2));
    const avgOrg = Number((sOrg / count).toFixed(2));
    const overall = Number(((avgContent + avgTrainer + avgRelevance + avgPractical + avgOrg) / 5).toFixed(2));

    let sentiment: 'EXCELLENT' | 'VERY_GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' = 'VERY_GOOD';
    if (overall >= 4.7) sentiment = 'EXCELLENT';
    else if (overall >= 4.0) sentiment = 'VERY_GOOD';
    else if (overall >= 3.0) sentiment = 'SATISFACTORY';
    else sentiment = 'NEEDS_IMPROVEMENT';

    const recommendations: string[] = [];
    if (avgPractical < 4.2) {
      recommendations.push('Increase allocated laboratory and hands-on session time by at least 30%.');
    }
    if (avgOrg < 4.2) {
      recommendations.push('Streamline pre-event session kit distribution and venue punctuality.');
    }
    if (avgTrainer >= 4.8) {
      recommendations.push('Resource person delivery highly praised; consider retaining speaker for future advanced series.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain high pedagogical standards and integrate direct student project outcomes.');
    }

    return {
      total_responses: count,
      average_content: avgContent,
      average_trainer: avgTrainer,
      average_relevance: avgRelevance,
      average_practical: avgPractical,
      average_organization: avgOrg,
      overall_score: overall,
      sentiment_label: sentiment,
      recommendations,
    };
  }
}
