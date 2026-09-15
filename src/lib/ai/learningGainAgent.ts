export interface LearningGainResult {
  pre_score: number;
  post_score: number;
  absolute_gain: number; // Delta pp (post - pre)
  normalized_gain: number; // Hake's g = (post - pre) / (100 - pre)
  gain_category: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGATIVE';
  effectiveness_label: string;
}

export class LearningGainAgent {
  /**
   * Calculates empirical learning gain using Hake's Normalized Gain formula.
   * g = (Post - Pre) / (100 - Pre)
   */
  static calculateGain(preScore: number, postScore: number): LearningGainResult {
    const pre = Math.max(0, Math.min(100, preScore));
    const post = Math.max(0, Math.min(100, postScore));
    const absoluteGain = Number((post - pre).toFixed(2));

    let normalizedGain = 0;
    if (pre >= 100) {
      normalizedGain = post >= 100 ? 1.0 : 0.0;
    } else {
      normalizedGain = Number(((post - pre) / (100 - pre)).toFixed(4));
    }

    let gainCategory: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGATIVE' = 'LOW';
    let effectivenessLabel = 'Low Empirical Gain';

    if (normalizedGain >= 0.70) {
      gainCategory = 'HIGH';
      effectivenessLabel = 'Exemplary Empirical Gain (High)';
    } else if (normalizedGain >= 0.30) {
      gainCategory = 'MEDIUM';
      effectivenessLabel = 'Satisfactory Empirical Gain (Medium)';
    } else if (normalizedGain >= 0) {
      gainCategory = 'LOW';
      effectivenessLabel = 'Marginal Empirical Gain (Low)';
    } else {
      gainCategory = 'NEGATIVE';
      effectivenessLabel = 'Negative Learning Outcome Detected';
    }

    return {
      pre_score: pre,
      post_score: post,
      absolute_gain: absoluteGain,
      normalized_gain: Math.max(0, normalizedGain),
      gain_category: gainCategory,
      effectiveness_label: effectivenessLabel,
    };
  }

  static calculateCohortGain(attempts: Array<{ pre_score: number; post_score: number }>) {
    if (attempts.length === 0) {
      return {
        average_pre: 0,
        average_post: 0,
        average_absolute_gain: 0,
        average_normalized_gain: 0,
        high_gain_count: 0,
        cohort_size: 0,
      };
    }

    let sumPre = 0;
    let sumPost = 0;
    let sumNormalized = 0;
    let highGainCount = 0;

    for (const item of attempts) {
      sumPre += item.pre_score;
      sumPost += item.post_score;
      const res = this.calculateGain(item.pre_score, item.post_score);
      sumNormalized += res.normalized_gain;
      if (res.gain_category === 'HIGH') highGainCount++;
    }

    const n = attempts.length;
    return {
      average_pre: Number((sumPre / n).toFixed(2)),
      average_post: Number((sumPost / n).toFixed(2)),
      average_absolute_gain: Number(((sumPost - sumPre) / n).toFixed(2)),
      average_normalized_gain: Number((sumNormalized / n).toFixed(4)),
      high_gain_count: highGainCount,
      cohort_size: n,
    };
  }
}
