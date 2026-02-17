import type { HealthScores, HealthRedFlags } from '@/types/health';

export function generateRecommendations(scores: HealthScores, redFlags: HealthRedFlags): string[] {
  const recommendations: string[] = [];

  if (scores.sleepScore <= 5) {
    recommendations.push(
      '🌙 Prioritize sleep: Aim for 7-9 hours. Create a bedtime routine and avoid screens 1 hour before bed.',
    );
  }

  if (scores.activityScore <= 5) {
    recommendations.push(
      '🚶 Increase daily movement: Start with a 15-minute walk, gradually building to 10,000 steps/day.',
    );
  }

  if (scores.stressScore <= 5) {
    recommendations.push(
      '🧘 Stress management: Try deep breathing, meditation, or talk to a mental health professional.',
    );
  }

  if (scores.lonelinessScore <= 5) {
    recommendations.push(
      '👥 Build social connections: Reach out to a friend, join a group activity, or seek community support.',
    );
  }

  if (scores.lifestyleScore <= 6) {
    recommendations.push(
      '💊 Consider lifestyle changes: Reduce alcohol intake and explore smoking cessation programs if applicable.',
    );
  }

  if (redFlags.critical.length > 0 || scores.overallScore <= 5) {
    recommendations.push(
      '⚕️ Consult a healthcare provider: Your assessment suggests professional medical advice would be beneficial.',
    );
  }

  return recommendations;
}
