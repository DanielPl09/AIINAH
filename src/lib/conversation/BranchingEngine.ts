import type { HealthQuestion } from '@/types/health';
import type { ConversationResponse } from './ConversationManager';
import { QUESTION_FLOW } from '../mockData';

interface BranchingResult {
  response: ConversationResponse | null;
  newStepIndex: number;
  empathyGiven: boolean;
}

export function checkBranchingLogic(
  question: HealthQuestion,
  answer: string | number,
  currentStepIndex: number,
  hasGivenStressEmpathy: boolean,
  getUIUpdate: (stepIndex: number) => ConversationResponse['uiUpdate'],
): BranchingResult {
  if (
    question.id === 'stress_01' &&
    typeof answer === 'number' &&
    answer > 4 &&
    !hasGivenStressEmpathy
  ) {
    const empathyMessage = answer >= 7
      ? `I hear you - a ${answer}/10 stress level is quite high. ` +
        `It's really important that you're taking time for this check-in. ` +
        `Let me ask you a follow-up question to better understand what's going on.\n\n`
      : `A ${answer}/10 suggests you're experiencing some stress. ` +
        `That's completely normal, and I'm here to help. ` +
        `Let me ask a follow-up.\n\n`;

    const newIndex = currentStepIndex + 1;
    const nextQuestion = QUESTION_FLOW[newIndex];

    return {
      response: {
        textToSpeak: empathyMessage + nextQuestion.text,
        isFinished: false,
        currentHint: nextQuestion.hint ?? null,
        uiUpdate: getUIUpdate(newIndex),
      },
      newStepIndex: newIndex,
      empathyGiven: true,
    };
  }

  return {
    response: null,
    newStepIndex: currentStepIndex,
    empathyGiven: hasGivenStressEmpathy,
  };
}
