/**
 * Health Avatar Demo - Mock Data
 * Simulated user profile and question flow for demonstration
 */

import type { UserHealthProfile, HealthQuestion } from '@/types/health';

/**
 * Mock user profile with realistic wearable data
 * 
 * THE HOOK: Low sleep (5.5 hours) and low activity (1200 steps)
 * This triggers specific health concern logic in the assessment
 */
export const MOCK_USER_PROFILE: UserHealthProfile = {
    name: "Amit",

    wearableData: {
        // Low sleep - under recommended 7-9 hours
        // This should trigger sleep-related red flags
        lastNightSleep: 5.5,

        // Normal resting heart rate (60-100 bpm is typical)
        restingHeartRate: 72,

        // Very low step count - well below recommended 10,000 steps
        // This should trigger activity-related concerns
        dailySteps: 1200,
    },

    medicalHistory: {
        // Moderate baseline stress level
        baselineStress: 3,

        // No pre-existing conditions in this demo profile
        conditions: [],

        // Optional fields not populated for this demo
        medications: [],
    },
};

/**
 * Question flow for health assessment
 * Order: Stress → Sleep → Activity → Loneliness → Alcohol → Smoking
 * 
 * Each question includes:
 * - Category for grouping and analysis
 * - Clear question text
 * - Answer type for validation
 * - Range constraints where applicable
 */
export const QUESTION_FLOW: HealthQuestion[] = [
    // 1. STRESS
    {
        id: 'stress_01',
        category: 'stress',
        text: 'On a scale of 1-10, how stressed have you been feeling lately?',
        answerType: 'scale',
        range: {
            min: 1,
            max: 10,
        },
        hint: '1 = Not stressed at all, 10 = Extremely stressed',
    },
    {
        id: 'stress_02',
        category: 'stress',
        text: 'What are your main sources of stress right now?',
        answerType: 'text',
        hint: 'E.g., work, relationships, health, finances',
    },

    // 2. SLEEP
    {
        id: 'sleep_01',
        category: 'sleep',
        text: 'How would you rate your sleep quality over the past week?',
        answerType: 'scale',
        range: {
            min: 1,
            max: 10,
        },
        hint: '1 = Very poor, 10 = Excellent',
    },
    {
        id: 'sleep_02',
        category: 'sleep',
        text: 'Do you have difficulty falling asleep or staying asleep?',
        answerType: 'yes-no',
    },
    {
        id: 'sleep_03',
        category: 'sleep',
        text: 'On average, how many hours of sleep do you typically get per night?',
        answerType: 'numeric',
        range: {
            min: 0,
            max: 24,
        },
        hint: 'Enter a number (e.g., 7.5)',
    },

    // 3. ACTIVITY
    {
        id: 'activity_01',
        category: 'activity',
        text: 'How many days per week do you engage in physical exercise?',
        answerType: 'numeric',
        range: {
            min: 0,
            max: 7,
        },
        hint: 'Exercise includes walking, running, gym, sports, etc.',
    },
    {
        id: 'activity_02',
        category: 'activity',
        text: 'What type of physical activities do you enjoy or regularly do?',
        answerType: 'text',
        hint: 'E.g., walking, running, yoga, swimming, cycling',
    },
    {
        id: 'activity_03',
        category: 'activity',
        text: 'On a scale of 1-10, how would you rate your current energy levels?',
        answerType: 'scale',
        range: {
            min: 1,
            max: 10,
        },
        hint: '1 = Constantly exhausted, 10 = Full of energy',
    },

    // 4. LONELINESS
    {
        id: 'loneliness_01',
        category: 'loneliness',
        text: 'How often do you feel lonely or socially isolated?',
        answerType: 'scale',
        range: {
            min: 1,
            max: 10,
        },
        hint: '1 = Never lonely, 10 = Constantly lonely',
    },
    {
        id: 'loneliness_02',
        category: 'loneliness',
        text: 'Do you have people you can talk to about personal matters?',
        answerType: 'yes-no',
    },
    {
        id: 'loneliness_03',
        category: 'loneliness',
        text: 'How many close friends or family members do you regularly connect with?',
        answerType: 'numeric',
        range: {
            min: 0,
            max: 100,
        },
        hint: 'Regular connection = at least weekly',
    },

    // 5. ALCOHOL
    {
        id: 'alcohol_01',
        category: 'alcohol',
        text: 'How often do you consume alcohol?',
        answerType: 'text',
        hint: 'E.g., daily, weekly, monthly, rarely, never',
    },
    {
        id: 'alcohol_02',
        category: 'alcohol',
        text: 'On days when you drink, how many standard drinks do you typically have?',
        answerType: 'numeric',
        range: {
            min: 0,
            max: 50,
        },
        hint: 'Standard drink = 1 beer, 1 glass of wine, or 1 shot',
    },

    // 6. SMOKING
    {
        id: 'smoking_01',
        category: 'smoking',
        text: 'Do you currently smoke cigarettes or use tobacco products?',
        answerType: 'yes-no',
    },
    {
        id: 'smoking_02',
        category: 'smoking',
        text: 'If yes, how many cigarettes or tobacco products per day?',
        answerType: 'numeric',
        range: {
            min: 0,
            max: 100,
        },
        hint: 'Enter 0 if you do not smoke',
    },
];

/**
 * Helper function to get questions by category
 */
export function getQuestionsByCategory(
    category: HealthQuestion['category']
): HealthQuestion[] {
    return QUESTION_FLOW.filter((q) => q.category === category);
}

/**
 * Helper function to get question by ID
 */
export function getQuestionById(id: string): HealthQuestion | undefined {
    return QUESTION_FLOW.find((q) => q.id === id);
}

/**
 * Get total number of questions
 */
export const TOTAL_QUESTIONS = QUESTION_FLOW.length;

/**
 * Get categories in order
 */
export const QUESTION_CATEGORIES = [
    'stress',
    'sleep',
    'activity',
    'loneliness',
    'alcohol',
    'smoking',
] as const;
