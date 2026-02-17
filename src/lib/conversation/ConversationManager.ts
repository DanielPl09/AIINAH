import type {
  UserHealthProfile,
  HealthQuestion,
  QuestionResponse,
  SessionSummary,
  AnswerType,
} from '@/types/health';
import { MOCK_USER_PROFILE, QUESTION_FLOW } from '../mockData';
import { parseAnswer } from './AnswerParser';
import { checkBranchingLogic } from './BranchingEngine';
import { generateSummary } from './SummaryGenerator';

export interface ConversationResponse {
  textToSpeak: string;
  isFinished: boolean;
  currentHint?: string | null;
  uiUpdate?: {
    currentQuestionIndex: number;
    totalQuestions: number;
    currentCategory: string;
    progress: number;
    answerType?: AnswerType;
    range?: { min: number; max: number };
  };
  summary?: SessionSummary;
}

export class ConversationManager {
  private userProfile: UserHealthProfile;
  private currentStepIndex: number = -1;
  private answers: Map<string, QuestionResponse> = new Map();
  private sessionStartTime: Date | null = null;
  private hasGivenStressEmpathy: boolean = false;
  private waitingForConsent: boolean = true;

  constructor() {
    this.userProfile = MOCK_USER_PROFILE;
  }

  startSession(): string {
    this.sessionStartTime = new Date();
    this.currentStepIndex = 0;
    this.answers.clear();
    this.hasGivenStressEmpathy = false;
    this.waitingForConsent = true;

    const { name } = this.userProfile;

    return (
      `Hello ${name}, my name is Lisa, your personal virtual doctor. ` +
      `I have a few questions to ask you today to check on your health. ` +
      `Are you ready to start?`
    );
  }

  processUserResponse(userText: string): ConversationResponse {
    if (this.currentStepIndex === -1) {
      return {
        textToSpeak: "Please start the session first by saying 'begin' or 'start'.",
        isFinished: false,
      };
    }

    if (this.waitingForConsent) {
      return this.handleConsent(userText);
    }

    const currentQuestion = QUESTION_FLOW[this.currentStepIndex];

    const parsedAnswer = parseAnswer(userText, currentQuestion);
    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      answer: parsedAnswer,
      timestamp: new Date().toISOString(),
    };
    this.answers.set(currentQuestion.id, response);

    const branching = checkBranchingLogic(
      currentQuestion,
      parsedAnswer,
      this.currentStepIndex,
      this.hasGivenStressEmpathy,
      (idx) => this.getUIUpdateAt(idx),
    );

    if (branching.response) {
      this.currentStepIndex = branching.newStepIndex;
      this.hasGivenStressEmpathy = branching.empathyGiven;
      return branching.response;
    }

    this.currentStepIndex++;

    if (this.currentStepIndex >= QUESTION_FLOW.length) {
      return this.finishSession();
    }

    const nextQuestion = QUESTION_FLOW[this.currentStepIndex];

    return {
      textToSpeak: nextQuestion.text,
      isFinished: false,
      currentHint: nextQuestion.hint ?? null,
      uiUpdate: this.getUIUpdate(),
    };
  }

  generateSessionSummary(): SessionSummary {
    return generateSummary(this.answers, this.userProfile, this.sessionStartTime);
  }

  getState() {
    return {
      currentStepIndex: this.currentStepIndex,
      totalQuestions: QUESTION_FLOW.length,
      answeredQuestions: this.answers.size,
      isActive: this.currentStepIndex >= 0,
    };
  }

  reset() {
    this.currentStepIndex = -1;
    this.answers.clear();
    this.sessionStartTime = null;
    this.hasGivenStressEmpathy = false;
    this.waitingForConsent = true;
  }

  private handleConsent(userText: string): ConversationResponse {
    const lowerText = userText.toLowerCase();
    const affirmative = ['yes', 'sure', 'ready', 'ok', 'yeah', 'yep', 'go ahead'];

    if (affirmative.some(word => lowerText.includes(word))) {
      this.waitingForConsent = false;
      this.currentStepIndex = 0;

      const { wearableData } = this.userProfile;
      const { lastNightSleep, dailySteps } = wearableData;
      const firstQuestion = QUESTION_FLOW[0];

      const hookMessage =
        `Great. I noticed from your wearable that you only got ${lastNightSleep} hours of sleep last night, ` +
        `and you've taken ${dailySteps.toLocaleString()} steps today. ` +
        `Let's keep that in mind as we go through the assessment.\n\n` +
        `First question: ${firstQuestion.text}`;

      return {
        textToSpeak: hookMessage,
        isFinished: false,
        currentHint: firstQuestion.hint ?? null,
        uiUpdate: this.getUIUpdate(),
      };
    }

    return {
      textToSpeak: 'No problem, take your time. Let me know when you are ready to start.',
      isFinished: false,
    };
  }

  private finishSession(): ConversationResponse {
    const summary = this.generateSessionSummary();

    const closingMessage =
      `Thank you for completing the health check-in, ${this.userProfile.name}!\n\n` +
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

  private getUIUpdate(): ConversationResponse['uiUpdate'] {
    return this.getUIUpdateAt(this.currentStepIndex);
  }

  private getUIUpdateAt(stepIndex: number): ConversationResponse['uiUpdate'] {
    const question = QUESTION_FLOW[stepIndex];
    return {
      currentQuestionIndex: stepIndex,
      totalQuestions: QUESTION_FLOW.length,
      currentCategory: question.category,
      progress: Math.round((stepIndex / QUESTION_FLOW.length) * 100),
      answerType: question.answerType,
      range: question.range,
    };
  }
}
