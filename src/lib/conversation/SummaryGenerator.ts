import type {
  SessionSummary,
  HealthScores,
  HealthRedFlags,
  QuestionResponse,
  UserHealthProfile,
} from '@/types/health';
import { calculateScores } from './HealthScorer';
import { identifyRedFlags } from './RedFlagDetector';
import { generateRecommendations } from './RecommendationGenerator';

function getOverallAssessment(score: number): string {
  if (score >= 8) return 'Excellent Health';
  if (score >= 6) return 'Good Health';
  if (score >= 4) return 'Fair - Needs Improvement';
  return 'Poor - Immediate Action Needed';
}

function generateSummaryText(
  scores: HealthScores,
  redFlags: HealthRedFlags,
  userName: string,
): string {
  const overallAssessment = getOverallAssessment(scores.overallScore);

  let summary = `${userName}, based on your responses and wearable data, here's your health snapshot:\n\n`;

  summary += `**Overall Health Score: ${scores.overallScore}/10** - ${overallAssessment}\n\n`;

  summary += `**Category Breakdown:**\n`;
  summary += `- Stress Management: ${scores.stressScore}/10\n`;
  summary += `- Sleep Quality: ${scores.sleepScore}/10\n`;
  summary += `- Physical Activity: ${scores.activityScore}/10\n`;
  summary += `- Social Connection: ${scores.lonelinessScore}/10\n`;
  summary += `- Lifestyle Factors: ${scores.lifestyleScore}/10\n\n`;

  if (redFlags.critical.length > 0) {
    summary += `⚠️ **Critical Concerns:**\n`;
    redFlags.critical.forEach((flag: string) => { summary += `- ${flag}\n`; });
    summary += '\n';
  }

  if (redFlags.warnings.length > 0) {
    summary += `⚡ **Warnings:**\n`;
    redFlags.warnings.forEach((flag: string) => { summary += `- ${flag}\n`; });
    summary += '\n';
  }

  return summary;
}

export function generateSummary(
  answers: Map<string, QuestionResponse>,
  userProfile: UserHealthProfile,
  sessionStartTime: Date | null,
): SessionSummary {
  const scores = calculateScores(answers, userProfile);
  const redFlags = identifyRedFlags(scores, answers);
  const recommendations = generateRecommendations(scores, redFlags);
  const summaryText = generateSummaryText(scores, redFlags, userProfile.name);

  const durationMinutes = sessionStartTime
    ? Math.round((Date.now() - sessionStartTime.getTime()) / 60000)
    : 0;

  return {
    scores,
    redFlags,
    summaryText,
    recommendations,
    completedAt: new Date().toISOString(),
    durationMinutes,
  };
}
