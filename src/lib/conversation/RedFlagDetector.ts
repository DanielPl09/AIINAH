import type { HealthScores, HealthRedFlags, QuestionResponse } from '@/types/health';

function getAnswerAsNumber(
  answers: Map<string, QuestionResponse>,
  questionId: string,
  defaultValue: number,
): number {
  const response = answers.get(questionId);
  if (!response) return defaultValue;
  return typeof response.answer === 'number' ? response.answer : defaultValue;
}

function getAnswerAsString(
  answers: Map<string, QuestionResponse>,
  questionId: string,
  defaultValue: string,
): string {
  const response = answers.get(questionId);
  if (!response) return defaultValue;
  return typeof response.answer === 'string' ? response.answer : String(response.answer);
}

export function identifyRedFlags(
  scores: HealthScores,
  answers: Map<string, QuestionResponse>,
): HealthRedFlags {
  const critical: string[] = [];
  const warnings: string[] = [];
  const notices: string[] = [];

  if (scores.sleepScore <= 3) {
    critical.push('Severely inadequate sleep detected - only 5.5 hours last night');
  }

  if (scores.stressScore <= 3) {
    critical.push('Dangerously high stress levels (7+/10)');
  }

  const smoking = getAnswerAsString(answers, 'smoking_01', 'no');
  if (smoking.toLowerCase().includes('yes')) {
    const cigarettesPerDay = getAnswerAsNumber(answers, 'smoking_02', 0);
    if (cigarettesPerDay > 10) {
      critical.push(`Heavy smoking detected (${cigarettesPerDay} cigarettes/day)`);
    }
  }

  if (scores.sleepScore > 3 && scores.sleepScore <= 5) {
    warnings.push('Poor sleep quality affecting overall health');
  }

  if (scores.activityScore <= 4) {
    warnings.push('Very low physical activity - only 1,200 steps today');
  }

  if (scores.stressScore > 3 && scores.stressScore <= 5) {
    warnings.push('Elevated stress levels need attention');
  }

  if (scores.lonelinessScore <= 4) {
    warnings.push('Social isolation concerns detected');
  }

  if (scores.activityScore > 4 && scores.activityScore <= 6) {
    notices.push('Physical activity below recommended levels');
  }

  if (scores.sleepScore > 5 && scores.sleepScore <= 7) {
    notices.push('Sleep quality could be improved');
  }

  if (scores.lifestyleScore <= 7) {
    notices.push('Lifestyle factors (alcohol/smoking) present health risks');
  }

  return { critical, warnings, notices };
}
