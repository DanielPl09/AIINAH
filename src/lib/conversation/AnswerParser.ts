import type { HealthQuestion } from '@/types/health';

export function parseAnswer(userText: string, question: HealthQuestion): string | number {
  const text = userText.trim().toLowerCase();

  switch (question.answerType) {
    case 'yes-no':
      if (text.includes('yes') || text.includes('yeah') || text.includes('yep')) {
        return 'yes';
      }
      if (text.includes('no') || text.includes('nope') || text.includes('nah')) {
        return 'no';
      }
      return userText;

    case 'numeric':
    case 'scale': {
      const numbers = userText.match(/\d+\.?\d*/);
      if (numbers) {
        const num = parseFloat(numbers[0]);
        if (question.range) {
          return Math.max(question.range.min, Math.min(question.range.max, num));
        }
        return num;
      }
      return 0;
    }

    case 'text':
    default:
      return userText.trim();
  }
}
