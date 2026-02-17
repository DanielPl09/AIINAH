import type { HealthScores, QuestionResponse, UserHealthProfile } from '@/types/health';

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

function scoreSleepHours(hours: number): number {
  if (hours >= 7 && hours <= 9) return 10;
  if (hours >= 6 && hours < 7) return 7;
  if (hours >= 5 && hours < 6) return 5;
  if (hours < 5) return 2;
  if (hours > 9 && hours <= 10) return 7;
  return 4;
}

function scoreSteps(dailySteps: number): number {
  if (dailySteps >= 10000) return 10;
  if (dailySteps >= 7500) return 8;
  if (dailySteps >= 5000) return 6;
  if (dailySteps >= 2500) return 4;
  return 2;
}

function calculateLifestyleScore(
  answers: Map<string, QuestionResponse>,
  alcohol: string,
  smoking: string,
): number {
  let score = 10;

  const alcLower = alcohol.toLowerCase();
  if (alcLower.includes('daily') || alcLower.includes('every day')) score -= 4;
  else if (alcLower.includes('week')) score -= 2;
  else if (alcLower.includes('month')) score -= 1;

  if (smoking.toLowerCase().includes('yes')) {
    const cigarettesPerDay = getAnswerAsNumber(answers, 'smoking_02', 0);
    if (cigarettesPerDay > 20) score -= 6;
    else if (cigarettesPerDay > 10) score -= 4;
    else if (cigarettesPerDay > 0) score -= 3;
  }

  return Math.max(1, score);
}

export function calculateScores(
  answers: Map<string, QuestionResponse>,
  userProfile: UserHealthProfile,
): HealthScores {
  const stressLevel = getAnswerAsNumber(answers, 'stress_01', 5);
  const sleepQuality = getAnswerAsNumber(answers, 'sleep_01', 5);
  const sleepHours = getAnswerAsNumber(answers, 'sleep_03', userProfile.wearableData.lastNightSleep);
  const exerciseDays = getAnswerAsNumber(answers, 'activity_01', 0);
  const energyLevel = getAnswerAsNumber(answers, 'activity_03', 5);
  const lonelinessLevel = getAnswerAsNumber(answers, 'loneliness_01', 5);
  const socialSupport = getAnswerAsString(answers, 'loneliness_02', 'no');
  const alcoholFreq = getAnswerAsString(answers, 'alcohol_01', 'never');
  const smoking = getAnswerAsString(answers, 'smoking_01', 'no');

  const stressScore = 11 - stressLevel;

  const sleepScore = Math.min(10, Math.max(1,
    (sleepQuality * 0.6) + (scoreSleepHours(sleepHours) * 0.4),
  ));

  const activityScore = Math.min(10, Math.max(1,
    (exerciseDays / 7 * 7) + (energyLevel * 0.3) + (scoreSteps(userProfile.wearableData.dailySteps) * 0.3),
  ));

  const lonelinessScore = 11 - lonelinessLevel;
  const socialBonus = socialSupport.toLowerCase().includes('yes') ? 2 : 0;
  const adjustedLonelinessScore = Math.min(10, lonelinessScore + socialBonus);

  const lifestyleScore = calculateLifestyleScore(answers, alcoholFreq, smoking);

  const overallScore = Math.round(
    (stressScore * 0.25) +
    (sleepScore * 0.25) +
    (activityScore * 0.20) +
    (adjustedLonelinessScore * 0.15) +
    (lifestyleScore * 0.15),
  );

  return {
    stressScore: Math.round(stressScore),
    sleepScore: Math.round(sleepScore),
    activityScore: Math.round(activityScore),
    lonelinessScore: Math.round(adjustedLonelinessScore),
    lifestyleScore: Math.round(lifestyleScore),
    overallScore,
  };
}
