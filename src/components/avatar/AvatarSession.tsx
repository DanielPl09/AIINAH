'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { StreamingEvents, TaskType } from '@heygen/streaming-avatar';
import { ConversationManager } from '@/lib/conversation';
import type { SessionSummary, AnswerType } from '@/types/health';
import { AvatarVideo } from './AvatarVideo';
import { ChatOverlay } from './ChatOverlay';
import { InputBar } from './InputBar';

export interface SessionData {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentCategory: string;
  progress: number;
  isActive: boolean;
  isFinished: boolean;
}

interface AvatarSessionProps {
  isLoading: boolean;
  isConnected: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  avatar: any;
  onSessionDataUpdate?: (data: SessionData) => void;
  onSessionComplete?: (summary: SessionSummary) => void;
  onEndSession: () => void;
}

export function AvatarSession({
  isLoading,
  isConnected,
  videoRef,
  avatar,
  onSessionDataUpdate,
  onSessionComplete,
  onEndSession,
}: AvatarSessionProps) {
  const conversationManager = useRef<ConversationManager | null>(null);

  const [sessionData, setSessionData] = useState<SessionData>({
    currentQuestionIndex: 0,
    totalQuestions: 0,
    currentCategory: 'intro',
    progress: 0,
    isActive: false,
    isFinished: false,
  });

  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  // Chat state — show current question only
  const [currentAvatarMessage, setCurrentAvatarMessage] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [currentAnswerType, setCurrentAnswerType] = useState<AnswerType | null>(null);
  const [currentRange, setCurrentRange] = useState<{ min: number; max: number } | null>(null);
  const [waitingForConsent, setWaitingForConsent] = useState(false);

  // Initialize ConversationManager
  useEffect(() => {
    if (!conversationManager.current) {
      conversationManager.current = new ConversationManager();
    }
  }, []);

  // Start health session when stream is ready
  const startHealthSession = useCallback(async () => {
    if (!avatar || !conversationManager.current || hasStartedConversation) return;

    try {
      const openingMessage = conversationManager.current.startSession();
      setHasStartedConversation(true);
      setSessionData(prev => ({ ...prev, isActive: true }));
      setIsAvatarSpeaking(true);
      setCurrentAvatarMessage(openingMessage);
      setCurrentHint(null);
      setCurrentAnswerType(null);
      setCurrentRange(null);
      setWaitingForConsent(true);

      await avatar.speak({
        text: openingMessage,
        taskType: TaskType.REPEAT,
      });

      if (isVoiceMode) {
        try {
          await avatar.startVoiceChat({ useSilencePrompt: false });
        } catch (voiceErr: any) {
          console.error('startVoiceChat() failed:', voiceErr?.message);
        }
      }
    } catch (error) {
      console.error('Failed to start health session:', error);
      setIsAvatarSpeaking(false);
    }
  }, [avatar, hasStartedConversation, isVoiceMode]);

  // Process user message through conversation engine
  const handleUserMessage = useCallback(async (userText: string) => {
    if (!conversationManager.current || !avatar || sessionData.isFinished) return;

    try {
      const response = conversationManager.current.processUserResponse(userText);

      if (response.uiUpdate) {
        const updatedSessionData: SessionData = {
          currentQuestionIndex: response.uiUpdate.currentQuestionIndex,
          totalQuestions: response.uiUpdate.totalQuestions,
          currentCategory: response.uiUpdate.currentCategory,
          progress: response.uiUpdate.progress,
          isActive: !response.isFinished,
          isFinished: response.isFinished,
        };
        setSessionData(updatedSessionData);
        onSessionDataUpdate?.(updatedSessionData);

        // Update answer type for input bar
        setCurrentAnswerType(response.uiUpdate.answerType ?? null);
        setCurrentRange(response.uiUpdate.range ?? null);
      }

      setIsAvatarSpeaking(true);
      setCurrentAvatarMessage(response.textToSpeak);
      setCurrentHint(response.currentHint ?? null);
      setWaitingForConsent(false);

      await avatar.speak({
        text: response.textToSpeak,
        taskType: TaskType.REPEAT,
      });

      if (response.isFinished && response.summary) {
        setSessionData(prev => ({ ...prev, isFinished: true, isActive: false }));
        setCurrentAnswerType(null);
        setCurrentRange(null);
        onSessionComplete?.(response.summary);
      }
    } catch (error) {
      console.error('Error processing user response:', error);
    }
  }, [avatar, sessionData.isFinished, onSessionDataUpdate, onSessionComplete]);

  // HeyGen SDK event listeners
  useEffect(() => {
    if (!avatar) return;

    const handleUserStart = () => { /* user started speaking */ };

    const handleUserStop = (event: any) => {
      const userText = event.detail?.text || event.detail?.message || event.detail;
      if (userText && typeof userText === 'string') {
        handleUserMessage(userText);
      }
    };

    const handleAvatarStartTalking = () => {
      setIsAvatarSpeaking(true);
    };

    const handleAvatarStopTalking = () => {
      setIsAvatarSpeaking(false);
      if (sessionData.isActive && !sessionData.isFinished && isVoiceMode) {
        avatar.startListening();
      }
    };

    avatar.on?.(StreamingEvents.USER_START, handleUserStart);
    avatar.on?.(StreamingEvents.USER_STOP, handleUserStop);
    avatar.on?.(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);
    avatar.on?.(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStopTalking);

    return () => {
      avatar.off?.(StreamingEvents.USER_START, handleUserStart);
      avatar.off?.(StreamingEvents.USER_STOP, handleUserStop);
      avatar.off?.(StreamingEvents.AVATAR_START_TALKING, handleAvatarStartTalking);
      avatar.off?.(StreamingEvents.AVATAR_STOP_TALKING, handleAvatarStopTalking);
    };
  }, [avatar, sessionData.isActive, sessionData.isFinished, handleUserMessage, isVoiceMode]);

  // Auto-start when stream becomes ready
  useEffect(() => {
    if (isConnected && !hasStartedConversation) {
      const timer = setTimeout(() => startHealthSession(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, hasStartedConversation, startHealthSession]);

  return (
    <>
      <AvatarVideo
        videoRef={videoRef}
        isConnected={isConnected}
        isLoading={isLoading}
        onEndSession={onEndSession}
      />
      <ChatOverlay
        currentQuestion={currentAvatarMessage}
        hint={currentHint}
        isVisible={isConnected && !!currentAvatarMessage}
      />
      <InputBar
        onSendText={handleUserMessage}
        isVoiceMode={isVoiceMode}
        onToggleVoice={() => setIsVoiceMode(!isVoiceMode)}
        isAvatarSpeaking={isAvatarSpeaking}
        isConnected={isConnected}
        currentAnswerType={waitingForConsent ? 'consent' : (currentAnswerType ?? undefined)}
        currentRange={currentRange ?? undefined}
      />
    </>
  );
}
