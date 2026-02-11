/**
 * Health Avatar Demo - Conversation State Machine
 * Deterministic conversation flow without external LLM
 * 
 * This class manages the entire conversation lifecycle:
 * - Session initialization with wearable data hook
 * - Question progression with context-aware responses
 * - Branching logic based on user answers
 * - Health risk assessment and scoring
 * - Summary generation with red flags
 */

import type {
    UserHealthProfile,
    HealthQuestion,
    QuestionResponse,
    SessionSummary,
    HealthScores,
    HealthRedFlags,
} from '@/types/health';
import {
    MOCK_USER_PROFILE,
    QUESTION_FLOW,
    getQuestionById,
} from './mockData';

/**
 * Response object returned after processing user input
 */
interface ConversationResponse {
    /** Text for the avatar to speak/display */
    textToSpeak: string;

    /** Whether the session has completed */
    isFinished: boolean;

    /** Optional UI state updates (progress, current category, etc.) */
    uiUpdate?: {
        currentQuestionIndex: number;
        totalQuestions: number;
        currentCategory: string;
        progress: number;
    };

    /** Summary available when session is finished */
    summary?: SessionSummary;
}

/**
 * Conversation State Machine
 * Manages the health assessment conversation flow
 */
export class ConversationManager {
    private userProfile: UserHealthProfile;
    private currentStepIndex: number = -1; // -1 = not started
    private answers: Map<string, QuestionResponse> = new Map();
    private sessionStartTime: Date | null = null;
    private hasGivenStressEmpathy: boolean = false;

    private waitingForConsent: boolean = true;

    constructor() {
        this.userProfile = MOCK_USER_PROFILE;
    }

    /**
     * Start a new health assessment session
     * Returns personalized opening message using wearable data
     */
    startSession(): string {
        this.sessionStartTime = new Date();
        this.currentStepIndex = 0;
        this.answers.clear();
        this.hasGivenStressEmpathy = false;
        this.waitingForConsent = true;

        const { name } = this.userProfile;

        // Intro with Consent Request
        const openingMessage = `Hello ${name}, my name is Lisa, your personal virtual doctor. ` +
            `I have a few questions to ask you today to check on your health. ` +
            `Are you ready to start?`;

        return openingMessage;
    }

    /**
     * Process user's response and determine next step
     * Implements branching logic and context-aware responses
     */
    processUserResponse(userText: string): ConversationResponse {
        // Handle session not started
        if (this.currentStepIndex === -1) {
            return {
                textToSpeak: "Please start the session first by saying 'begin' or 'start'.",
                isFinished: false,
            };
        }

        // Handle Consent Flow
        if (this.waitingForConsent) {
            const lowerText = userText.toLowerCase();
            const affirmative = ['yes', 'sure', 'ready', 'ok', 'yeah', 'yep', 'go ahead'];

            if (affirmative.some(word => lowerText.includes(word))) {
                this.waitingForConsent = false;
                this.currentStepIndex = 0;

                // Wearable Data Hook
                const { wearableData } = this.userProfile;
                const { lastNightSleep, dailySteps } = wearableData;
                const firstQuestion = QUESTION_FLOW[0];

                const hookMessage = `Great. I noticed from your wearable that you only got ${lastNightSleep} hours of sleep last night, ` +
                    `and you've taken ${dailySteps.toLocaleString()} steps today. ` +
                    `Let's keep that in mind as we go through the assessment.\n\n` +
                    `First question: ${firstQuestion.text}${this.getHintText(firstQuestion)}`;

                return {
                    textToSpeak: hookMessage,
                    isFinished: false,
                    uiUpdate: this.getUIUpdate(),
                };
            } else {
                return {
                    textToSpeak: "No problem, take your time. Let me know when you are ready to start.",
                    isFinished: false,
                };
            }
        }

        // Standard Question Flow
        if (this.currentStepIndex === 0 && this.answers.size === 0) {
            // Logic handled above in consent block now, strict check to prevent double step
        }

        // Get current question
        const currentQuestion = QUESTION_FLOW[this.currentStepIndex];

        // Parse and store the answer
        const parsedAnswer = this.parseAnswer(userText, currentQuestion);
        const response: QuestionResponse = {
            questionId: currentQuestion.id,
            answer: parsedAnswer,
            timestamp: new Date().toISOString(),
        };

        this.answers.set(currentQuestion.id, response);

        // Check for branching logic (stress empathy)
        const branchingResponse = this.checkBranchingLogic(currentQuestion, parsedAnswer);
        if (branchingResponse) {
            return branchingResponse;
        }

        // Move to next question
        this.currentStepIndex++;

        // Check if session is complete
        if (this.currentStepIndex >= QUESTION_FLOW.length) {
            return this.finishSession();
        }

        // Get next question
        const nextQuestion = QUESTION_FLOW[this.currentStepIndex];

        return {
            textToSpeak: `${nextQuestion.text}${this.getHintText(nextQuestion)}`,
            isFinished: false,
            uiUpdate: this.getUIUpdate(),
        };
    }

    /**
     * Parse user's text answer based on expected answer type
     */
    private parseAnswer(userText: string, question: HealthQuestion): string | number {
        const text = userText.trim().toLowerCase();

        switch (question.answerType) {
            case 'yes-no':
                if (text.includes('yes') || text.includes('yeah') || text.includes('yep')) {
                    return 'yes';
                }
                if (text.includes('no') || text.includes('nope') || text.includes('nah')) {
                    return 'no';
                }
                return userText; // Return original if unclear

            case 'numeric':
            case 'scale':
                // Extract first number from text
                const numbers = userText.match(/\d+\.?\d*/);
                if (numbers) {
                    const num = parseFloat(numbers[0]);
                    // Validate range if specified
                    if (question.range) {
                        return Math.max(question.range.min, Math.min(question.range.max, num));
                    }
                    return num;
                }
                return 0; // Default if no number found

            case 'text':
            default:
                return userText.trim();
        }
    }

    /**
     * Check for branching logic conditions
     * Currently implements: Stress > 4 → Empathetic follow-up
     */
    private checkBranchingLogic(
        question: HealthQuestion,
        answer: string | number
    ): ConversationResponse | null {
        // Branching: High stress level (> 4) triggers empathy
        if (
            question.id === 'stress_01' &&
            typeof answer === 'number' &&
            answer > 4 &&
            !this.hasGivenStressEmpathy
        ) {
            this.hasGivenStressEmpathy = true;

            const empathyMessage = answer >= 7
                ? `I hear you - a ${answer}/10 stress level is quite high. 😔 ` +
                `It's really important that you're taking time for this check-in. ` +
                `Let me ask you a follow-up question to better understand what's going on.\n\n`
                : `A ${answer}/10 suggests you're experiencing some stress. ` +
                `That's completely normal, and I'm here to help. ` +
                `Let me ask a follow-up.\n\n`;

            const nextQuestion = QUESTION_FLOW[this.currentStepIndex + 1];
            this.currentStepIndex++;

            return {
                textToSpeak: empathyMessage + nextQuestion.text + this.getHintText(nextQuestion),
                isFinished: false,
                uiUpdate: this.getUIUpdate(),
            };
        }

        return null;
    }

    /**
     * Generate hint text if available
     */
    private getHintText(question: HealthQuestion): string {
        return question.hint ? `\n\n💡 ${question.hint}` : '';
    }

    /**
     * Get current UI state for progress tracking
     */
    private getUIUpdate() {
        return {
            currentQuestionIndex: this.currentStepIndex,
            totalQuestions: QUESTION_FLOW.length,
            currentCategory: QUESTION_FLOW[this.currentStepIndex].category,
            progress: Math.round((this.currentStepIndex / QUESTION_FLOW.length) * 100),
        };
    }

    /**
     * Finish the session and generate comprehensive summary
     */
    private finishSession(): ConversationResponse {
        const summary = this.generateSummary();

        const closingMessage = `Thank you for completing the health check-in, ${this.userProfile.name}! 🎉\n\n` +
            `I've analyzed your responses along with your wearable data. ` +
            `Let me share what I found...`;

        return {
            textToSpeak: closingMessage,
            isFinished: true,
            summary,
            uiUpdate: {
                currentQuestionIndex: QUESTION_FLOW.length,
                totalQuestions: QUESTION_FLOW.length,
                currentCategory: 'complete',
                progress: 100,
            },
        };
    }

    /**
     * Generate comprehensive health summary
     * Analyzes answers + wearable data to produce scores and red flags
     */
    generateSummary(): SessionSummary {
        const scores = this.calculateScores();
        const redFlags = this.identifyRedFlags(scores);
        const recommendations = this.generateRecommendations(scores, redFlags);
        const summaryText = this.generateSummaryText(scores, redFlags);

        const durationMinutes = this.sessionStartTime
            ? Math.round((Date.now() - this.sessionStartTime.getTime()) / 60000)
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

    /**
     * Calculate health scores from answers and wearable data
     */
    private calculateScores(): HealthScores {
        // Extract key answers
        const stressLevel = this.getAnswerAsNumber('stress_01', 5);
        const sleepQuality = this.getAnswerAsNumber('sleep_01', 5);
        const sleepHours = this.getAnswerAsNumber('sleep_03', this.userProfile.wearableData.lastNightSleep);
        const exerciseDays = this.getAnswerAsNumber('activity_01', 0);
        const energyLevel = this.getAnswerAsNumber('activity_03', 5);
        const lonelinessLevel = this.getAnswerAsNumber('loneliness_01', 5);
        const socialSupport = this.getAnswerAsString('loneliness_02', 'no');
        const alcoholFreq = this.getAnswerAsString('alcohol_01', 'never');
        const smoking = this.getAnswerAsString('smoking_01', 'no');

        // Calculate individual scores (higher is better, 1-10 scale)
        const stressScore = 11 - stressLevel; // Invert stress (low stress = high score)

        const sleepScore = Math.min(10, Math.max(1,
            (sleepQuality * 0.6) + (this.scoreSleepHours(sleepHours) * 0.4)
        ));

        const activityScore = Math.min(10, Math.max(1,
            (exerciseDays / 7 * 7) + (energyLevel * 0.3) + (this.scoreSteps() * 0.3)
        ));

        const lonelinesScore = 11 - lonelinessLevel; // Invert loneliness
        const socialBonus = socialSupport.toLowerCase().includes('yes') ? 2 : 0;
        const adjustedLonelinesScore = Math.min(10, lonelinesScore + socialBonus);

        const lifestyleScore = this.calculateLifestyleScore(alcoholFreq, smoking);

        // Overall score (weighted average)
        const overallScore = Math.round(
            (stressScore * 0.25) +
            (sleepScore * 0.25) +
            (activityScore * 0.20) +
            (adjustedLonelinesScore * 0.15) +
            (lifestyleScore * 0.15)
        );

        return {
            stressScore: Math.round(stressScore),
            sleepScore: Math.round(sleepScore),
            activityScore: Math.round(activityScore),
            lonelinesScore: Math.round(adjustedLonelinesScore),
            lifestyleScore: Math.round(lifestyleScore),
            overallScore,
        };
    }

    /**
     * Score sleep hours (7-9 hours is optimal)
     */
    private scoreSleepHours(hours: number): number {
        if (hours >= 7 && hours <= 9) return 10;
        if (hours >= 6 && hours < 7) return 7;
        if (hours >= 5 && hours < 6) return 5;
        if (hours < 5) return 2;
        if (hours > 9 && hours <= 10) return 7;
        return 4; // > 10 hours
    }

    /**
     * Score daily steps (10,000 is target)
     */
    private scoreSteps(): number {
        const steps = this.userProfile.wearableData.dailySteps;
        if (steps >= 10000) return 10;
        if (steps >= 7500) return 8;
        if (steps >= 5000) return 6;
        if (steps >= 2500) return 4;
        return 2;
    }

    /**
     * Calculate lifestyle risk score based on alcohol and smoking
     */
    private calculateLifestyleScore(alcohol: string, smoking: string): number {
        let score = 10;

        // Alcohol penalties
        const alcLower = alcohol.toLowerCase();
        if (alcLower.includes('daily') || alcLower.includes('every day')) score -= 4;
        else if (alcLower.includes('week')) score -= 2;
        else if (alcLower.includes('month')) score -= 1;

        // Smoking penalties
        if (smoking.toLowerCase().includes('yes')) {
            const cigarettesPerDay = this.getAnswerAsNumber('smoking_02', 0);
            if (cigarettesPerDay > 20) score -= 6;
            else if (cigarettesPerDay > 10) score -= 4;
            else if (cigarettesPerDay > 0) score -= 3;
        }

        return Math.max(1, score);
    }

    /**
     * Identify health red flags based on scores and thresholds
     */
    private identifyRedFlags(scores: HealthScores): HealthRedFlags {
        const critical: string[] = [];
        const warnings: string[] = [];
        const notices: string[] = [];

        // Critical flags (score <= 3 or specific high-risk conditions)
        if (scores.sleepScore <= 3) {
            critical.push('Severely inadequate sleep detected - only 5.5 hours last night');
        }

        if (scores.stressScore <= 3) {
            critical.push('Dangerously high stress levels (7+/10)');
        }

        const smoking = this.getAnswerAsString('smoking_01', 'no');
        if (smoking.toLowerCase().includes('yes')) {
            const cigarettesPerDay = this.getAnswerAsNumber('smoking_02', 0);
            if (cigarettesPerDay > 10) {
                critical.push(`Heavy smoking detected (${cigarettesPerDay} cigarettes/day)`);
            }
        }

        // Warning flags (score 4-5)
        if (scores.sleepScore > 3 && scores.sleepScore <= 5) {
            warnings.push('Poor sleep quality affecting overall health');
        }

        if (scores.activityScore <= 4) {
            warnings.push('Very low physical activity - only 1,200 steps today');
        }

        if (scores.stressScore > 3 && scores.stressScore <= 5) {
            warnings.push('Elevated stress levels need attention');
        }

        if (scores.lonelinesScore <= 4) {
            warnings.push('Social isolation concerns detected');
        }

        // Notice flags (score 6-7, room for improvement)
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

    /**
     * Generate personalized recommendations
     */
    private generateRecommendations(scores: HealthScores, redFlags: HealthRedFlags): string[] {
        const recommendations: string[] = [];

        // Sleep recommendations
        if (scores.sleepScore <= 5) {
            recommendations.push(
                '🌙 Prioritize sleep: Aim for 7-9 hours. Create a bedtime routine and avoid screens 1 hour before bed.'
            );
        }

        // Activity recommendations
        if (scores.activityScore <= 5) {
            recommendations.push(
                '🚶 Increase daily movement: Start with a 15-minute walk, gradually building to 10,000 steps/day.'
            );
        }

        // Stress management
        if (scores.stressScore <= 5) {
            recommendations.push(
                '🧘 Stress management: Try deep breathing, meditation, or talk to a mental health professional.'
            );
        }

        // Social connection
        if (scores.lonelinesScore <= 5) {
            recommendations.push(
                '👥 Build social connections: Reach out to a friend, join a group activity, or seek community support.'
            );
        }

        // Lifestyle
        if (scores.lifestyleScore <= 6) {
            recommendations.push(
                '💊 Consider lifestyle changes: Reduce alcohol intake and explore smoking cessation programs if applicable.'
            );
        }

        // General recommendation
        if (redFlags.critical.length > 0 || scores.overallScore <= 5) {
            recommendations.push(
                '⚕️ Consult a healthcare provider: Your assessment suggests professional medical advice would be beneficial.'
            );
        }

        return recommendations;
    }

    /**
     * Generate human-readable summary text
     */
    private generateSummaryText(scores: HealthScores, redFlags: HealthRedFlags): string {
        const { name } = this.userProfile;
        const overallAssessment = this.getOverallAssessment(scores.overallScore);

        let summary = `${name}, based on your responses and wearable data, here's your health snapshot:\n\n`;

        summary += `**Overall Health Score: ${scores.overallScore}/10** - ${overallAssessment}\n\n`;

        summary += `**Category Breakdown:**\n`;
        summary += `- Stress Management: ${scores.stressScore}/10\n`;
        summary += `- Sleep Quality: ${scores.sleepScore}/10\n`;
        summary += `- Physical Activity: ${scores.activityScore}/10\n`;
        summary += `- Social Connection: ${scores.lonelinesScore}/10\n`;
        summary += `- Lifestyle Factors: ${scores.lifestyleScore}/10\n\n`;

        // Add red flags section
        if (redFlags.critical.length > 0) {
            summary += `⚠️ **Critical Concerns:**\n`;
            redFlags.critical.forEach((flag: string) => summary += `- ${flag}\n`);
            summary += '\n';
        }

        if (redFlags.warnings.length > 0) {
            summary += `⚡ **Warnings:**\n`;
            redFlags.warnings.forEach((flag: string) => summary += `- ${flag}\n`);
            summary += '\n';
        }

        return summary;
    }

    /**
     * Get overall assessment label
     */
    private getOverallAssessment(score: number): string {
        if (score >= 8) return 'Excellent Health';
        if (score >= 6) return 'Good Health';
        if (score >= 4) return 'Fair - Needs Improvement';
        return 'Poor - Immediate Action Needed';
    }

    /**
     * Helper: Get answer as number with fallback
     */
    private getAnswerAsNumber(questionId: string, defaultValue: number): number {
        const response = this.answers.get(questionId);
        if (!response) return defaultValue;
        return typeof response.answer === 'number' ? response.answer : defaultValue;
    }

    /**
     * Helper: Get answer as string with fallback
     */
    private getAnswerAsString(questionId: string, defaultValue: string): string {
        const response = this.answers.get(questionId);
        if (!response) return defaultValue;
        return typeof response.answer === 'string' ? response.answer : String(response.answer);
    }

    /**
     * Get current session state (for debugging/testing)
     */
    getState() {
        return {
            currentStepIndex: this.currentStepIndex,
            totalQuestions: QUESTION_FLOW.length,
            answeredQuestions: this.answers.size,
            isActive: this.currentStepIndex >= 0,
        };
    }

    /**
     * Reset the session
     */
    reset() {
        this.currentStepIndex = -1;
        this.answers.clear();
        this.sessionStartTime = null;
        this.hasGivenStressEmpathy = false;
        this.waitingForConsent = true;
    }
}
