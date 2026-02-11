/**
 * Health Avatar Demo - Type Definitions
 * Strict typing for wearable data, medical history, and session outputs
 */

/**
 * Wearable device data snapshot
 * Represents the latest readings from user's health tracking device
 */
export interface WearableData {
    /** Hours of sleep from previous night */
    lastNightSleep: number;

    /** Resting heart rate in beats per minute */
    restingHeartRate: number;

    /** Total steps taken today */
    dailySteps: number;
}

/**
 * User's medical and psychological baseline
 * Historical context for personalized health recommendations
 */
export interface MedicalHistory {
    /** Baseline stress level (1-10 scale) */
    baselineStress: number;

    /** Known medical conditions or health concerns */
    conditions?: string[];

    /** Medications currently being taken */
    medications?: string[];

    /** Date of last medical checkup */
    lastCheckup?: string;
}

/**
 * Complete user health profile
 * Combines wearable data with medical history
 */
export interface UserHealthProfile {
    name: string;
    wearableData: WearableData;
    medicalHistory: MedicalHistory;
}

/**
 * Health risk flags identified during session
 * Categorized by severity level
 */
export interface HealthRedFlags {
    /** Critical issues requiring immediate attention */
    critical: string[];

    /** Warning signs that need monitoring */
    warnings: string[];

    /** General concerns for awareness */
    notices: string[];
}

/**
 * Calculated health metrics from session
 * Derived from user responses and wearable data
 */
export interface HealthScores {
    /** Overall stress level (1-10) */
    stressScore: number;

    /** Sleep quality assessment (1-10) */
    sleepScore: number;

    /** Physical activity level (1-10) */
    activityScore: number;

    /** Social connection level (1-10) */
    lonelinesScore: number;

    /** Lifestyle risk factors (1-10) */
    lifestyleScore: number;

    /** Composite health score (1-10) */
    overallScore: number;
}

/**
 * Session output summary
 * Complete analysis and recommendations from the health chat
 */
export interface SessionSummary {
    /** Calculated health metrics */
    scores: HealthScores;

    /** Identified health concerns */
    redFlags: HealthRedFlags;

    /** AI-generated summary of the session */
    summaryText: string;

    /** Personalized recommendations */
    recommendations: string[];

    /** Timestamp of session completion */
    completedAt: string;

    /** Session duration in minutes */
    durationMinutes: number;
}

/**
 * Answer type constraints for question flow
 */
export type AnswerType = 'scale' | 'yes-no' | 'text' | 'numeric';

/**
 * Individual question in the health assessment flow
 */
export interface HealthQuestion {
    /** Unique identifier */
    id: string;

    /** Question category */
    category: 'stress' | 'sleep' | 'activity' | 'loneliness' | 'alcohol' | 'smoking';

    /** Question text presented to user */
    text: string;

    /** Expected answer type */
    answerType: AnswerType;

    /** Optional range for numeric/scale answers */
    range?: {
        min: number;
        max: number;
    };

    /** Optional helper text */
    hint?: string;
}

/**
 * User's response to a health question
 */
export interface QuestionResponse {
    questionId: string;
    answer: string | number;
    timestamp: string;
}
