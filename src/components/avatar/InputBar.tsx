'use client';

import { useState, useMemo } from 'react';
import { ArrowUp, Mic, MicOff, Keyboard } from 'lucide-react';
import type { AnswerType } from '@/types/health';

interface InputBarProps {
  onSendText: (text: string) => void;
  isVoiceMode: boolean;
  onToggleVoice: () => void;
  isAvatarSpeaking: boolean;
  isConnected: boolean;
  currentAnswerType?: AnswerType | 'consent';
  currentRange?: { min: number; max: number };
}

interface QuickReply {
  label: string;
  value: string;
}

function getQuickReplies(
  answerType?: AnswerType | 'consent',
  range?: { min: number; max: number },
): QuickReply[] {
  if (!answerType) return [];

  switch (answerType) {
    case 'consent':
      return [
        { label: "Yes, I'm ready", value: "Yes, I'm ready" },
        { label: 'Not yet', value: 'Not yet' },
      ];

    case 'yes-no':
      return [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' },
      ];

    case 'scale':
      return [
        { label: '1-3 (Low)', value: '2' },
        { label: '4-5', value: '5' },
        { label: '6-7', value: '7' },
        { label: '8-10 (High)', value: '9' },
      ];

    case 'numeric': {
      if (!range) return [];
      const { min, max } = range;

      // Sleep hours (0-24)
      if (min === 0 && max === 24) {
        return [
          { label: '< 5 hours', value: '4' },
          { label: '5-6 hours', value: '5.5' },
          { label: '7-8 hours', value: '7.5' },
          { label: '9+ hours', value: '9' },
        ];
      }

      // Exercise days (0-7)
      if (min === 0 && max === 7) {
        return [
          { label: '0 days', value: '0' },
          { label: '1-2 days', value: '2' },
          { label: '3-4 days', value: '4' },
          { label: '5-7 days', value: '6' },
        ];
      }

      // Close connections (0-100)
      if (min === 0 && max === 100) {
        return [
          { label: '0', value: '0' },
          { label: '1-3', value: '2' },
          { label: '4-6', value: '5' },
          { label: '7+', value: '7' },
        ];
      }

      // Drinks / cigarettes (0-50 or 0-100)
      if (min === 0 && max <= 100) {
        return [
          { label: '0', value: '0' },
          { label: '1-2', value: '2' },
          { label: '3-5', value: '4' },
          { label: '6+', value: '6' },
        ];
      }

      return [];
    }

    case 'text':
      // No quick replies for free-text
      return [];

    default:
      return [];
  }
}

export function InputBar({
  onSendText,
  isVoiceMode,
  onToggleVoice,
  isAvatarSpeaking,
  isConnected,
  currentAnswerType,
  currentRange,
}: InputBarProps) {
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const quickReplies = useMemo(
    () => getQuickReplies(currentAnswerType, currentRange),
    [currentAnswerType, currentRange],
  );

  // Show text input expanded by default for 'text' type questions
  const isTextQuestion = currentAnswerType === 'text';
  const textInputVisible = isTextQuestion || showTextInput;

  if (!isConnected) return null;

  const handleSend = () => {
    if (!inputText.trim() || isAvatarSpeaking) return;
    onSendText(inputText.trim());
    setInputText('');
    setShowTextInput(false);
  };

  const handleQuickReply = (value: string) => {
    if (isAvatarSpeaking) return;
    onSendText(value);
    setShowTextInput(false);
    setInputText('');
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 z-50">
      <div className="max-w-xl mx-auto flex flex-col gap-2.5">
        {/* Quick-reply buttons */}
        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {quickReplies.map((qr) => (
              <button
                key={qr.label}
                onClick={() => handleQuickReply(qr.value)}
                disabled={isAvatarSpeaking}
                className="
                  bg-slate-800/80 border border-slate-700 rounded-full
                  px-4 py-2 text-sm text-white font-medium
                  hover:border-cyan-500/50 hover:bg-cyan-500/10
                  active:scale-95 transition-all backdrop-blur-md
                  disabled:opacity-40 disabled:cursor-not-allowed
                  shadow-lg
                "
              >
                {qr.label}
              </button>
            ))}
          </div>
        )}

        {/* Text input area */}
        {textInputVisible ? (
          <div className="bg-slate-800/90 rounded-full shadow-2xl flex items-center p-2 border border-slate-700 backdrop-blur-md">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isVoiceMode ? 'Listening...' : 'Type your answer...'}
              disabled={isVoiceMode || isAvatarSpeaking}
              autoFocus
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-5 text-white placeholder:text-slate-500 text-sm font-medium disabled:opacity-50"
            />

            <div className="flex items-center gap-2 pr-1">
              {inputText.trim().length > 0 && (
                <button
                  onClick={handleSend}
                  disabled={isAvatarSpeaking}
                  className="p-2.5 bg-cyan-600 text-white rounded-full hover:bg-cyan-500 transition-all shadow-glow-cyan active:scale-95 flex-shrink-0"
                >
                  <ArrowUp size={16} strokeWidth={3} />
                </button>
              )}

              <button
                onClick={onToggleVoice}
                className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                  isVoiceMode
                    ? 'bg-rose-500 text-white shadow-glow-rose animate-pulse'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
                }`}
              >
                {isVoiceMode ? <Mic size={16} /> : <MicOff size={16} />}
              </button>
            </div>
          </div>
        ) : (
          /* Collapsed: "Type instead..." toggle + mic */
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowTextInput(true)}
              className="
                flex items-center gap-2
                bg-slate-800/60 border border-slate-700/50 rounded-full
                px-4 py-2 text-xs text-slate-400 font-medium
                hover:border-slate-600 hover:text-slate-300
                transition-all backdrop-blur-md
              "
            >
              <Keyboard size={14} />
              Type instead...
            </button>

            <button
              onClick={onToggleVoice}
              className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                isVoiceMode
                  ? 'bg-rose-500 text-white shadow-glow-rose animate-pulse'
                  : 'bg-slate-700/80 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
              }`}
            >
              {isVoiceMode ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
          </div>
        )}

        {isVoiceMode && (
          <p className="text-center text-cyan-400/80 text-[10px] font-bold uppercase tracking-wider animate-pulse">
            Microphone active
          </p>
        )}
      </div>
    </div>
  );
}
