'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, ArrowUp, Mic, MicOff } from 'lucide-react';
import { StreamingEvents, TaskType } from '@heygen/streaming-avatar';
import { ConversationManager } from '@/lib/ConversationManager';
import type { SessionSummary } from '@/types/health';

interface AvatarStreamProps {
  isLoading: boolean;
  isConnected: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  avatar: any; // HeyGen StreamingAvatar instance
  onSessionDataUpdate?: (data: SessionData) => void;
  onSessionComplete?: (summary: SessionSummary) => void;
}

export interface SessionData {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentCategory: string;
  progress: number;
  isActive: boolean;
  isFinished: boolean;
}

/**
 * AvatarStream - Session Orchestrator
 * Bridges HeyGen SDK events with ConversationManager logic
 * Manages the interactive conversation loop without external LLM
 */
export const AvatarStream = ({
  isLoading,
  isConnected,
  videoRef,
  avatar,
  onSessionDataUpdate,
  onSessionComplete
}: AvatarStreamProps) => {
  // Conversation Manager - The Brain
  const conversationManager = useRef<ConversationManager | null>(null);

  // Session State
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
  const [waitingForUser, setWaitingForUser] = useState(false);

  // Input State
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  /**
   * Initialize Conversation Manager
   */
  useEffect(() => {
    if (!conversationManager.current) {
      conversationManager.current = new ConversationManager();
    }
  }, []);

  /**
   * Start the health assessment session
   * Called when avatar stream is ready
   */
  const startHealthSession = useCallback(async () => {
    if (!avatar || !conversationManager.current || hasStartedConversation) return;

    try {
      // Get opening message from conversation manager
      const openingMessage = conversationManager.current.startSession();

      setHasStartedConversation(true);
      setSessionData(prev => ({ ...prev, isActive: true }));

      // Avatar speaks the opening (THE HOOK: references wearable data)
      setIsAvatarSpeaking(true);

      console.log('📝 Attempting avatar.speak()...');
      try {
        await avatar.speak({
          text: openingMessage,
          task_type: 'repeat',
          taskType: 'repeat'
        } as any);
        console.log('🎙️ Avatar: ', openingMessage);
        console.log('✅ speak() succeeded');
      } catch (speakErr: any) {
        console.error('❌ speak() failed:', speakErr?.message);
        console.error('Response:', speakErr?.responseText);
        throw speakErr;
      }

      // Start voice chat ONLY if voice mode is active (it defaults to false now)
      if (isVoiceMode) {
        console.log('🎤 Attempting startVoiceChat()...');
        try {
          await avatar.startVoiceChat({
            useSilencePrompt: false,
          });
          console.log('✅ Voice chat enabled');
        } catch (voiceErr: any) {
          console.error('❌ startVoiceChat() failed:', voiceErr?.message);
        }
      }

    } catch (error) {
      console.error('Failed to start health session:', error);
      setIsAvatarSpeaking(false);
    }
  }, [avatar, hasStartedConversation, isVoiceMode]);

  /**
   * Process user's spoken response
   * Core of the interactive loop
   */
  const handleUserMessage = useCallback(async (userText: string) => {
    if (!conversationManager.current || !avatar || sessionData.isFinished) return;

    console.log('👤 User:', userText);
    setWaitingForUser(false);

    try {
      // Process response through our logic engine
      const response = conversationManager.current.processUserResponse(userText);

      // Update session state with UI metrics
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

        // Notify parent component for analytics panel
        if (onSessionDataUpdate) {
          onSessionDataUpdate(updatedSessionData);
        }
      }

      // Avatar speaks the response
      setIsAvatarSpeaking(true);
      await avatar.speak({
        text: response.textToSpeak,
        task_type: 'repeat',
        taskType: 'repeat'
      } as any);

      console.log('🎙️ Avatar:', response.textToSpeak);

      // Handle session completion
      if (response.isFinished && response.summary) {
        setSessionData(prev => ({ ...prev, isFinished: true, isActive: false }));

        if (onSessionComplete) {
          onSessionComplete(response.summary);
        }

        console.log('✅ Session Complete:', response.summary);
      }

    } catch (error) {
      console.error('Error processing user response:', error);
    }
  }, [avatar, sessionData.isFinished, onSessionDataUpdate, onSessionComplete]);

  /**
   * Handle text input submission
   */
  const handleSendText = useCallback(async () => {
    if (!inputText.trim() || isAvatarSpeaking) return;

    const text = inputText;
    setInputText(''); // Clear input immediately
    await handleUserMessage(text);
  }, [inputText, isAvatarSpeaking, handleUserMessage]);

  /**
   * Setup HeyGen SDK event listeners
   * Manages the conversation flow based on avatar states
   */
  useEffect(() => {
    if (!avatar) return;

    // USER_START: User starts speaking
    const handleUserStart = () => {
      console.log('🎤 User started speaking');
      setWaitingForUser(false);
    };

    // USER_STOP: User finished speaking - this gives us the transcript
    const handleUserStop = (event: any) => {
      console.log('🔇 User stopped speaking');
      const userText = event.detail?.text || event.detail?.message || event.detail;
      if (userText && typeof userText === 'string') {
        handleUserMessage(userText);
      }
    };

    // AVATAR_START_TALKING: Avatar begins speaking
    const handleAvatarStartTalking = () => {
      console.log('🔊 Avatar started talking');
      setIsAvatarSpeaking(true);
      setWaitingForUser(false);
    };

    // AVATAR_STOP_TALKING: Avatar finished speaking
    const handleAvatarStopTalking = () => {
      console.log('🔇 Avatar stopped talking');
      setIsAvatarSpeaking(false);

      // If session is active and not finished
      if (sessionData.isActive && !sessionData.isFinished) {
        // Only switch to "Listening" state if Voice Mode is active
        if (isVoiceMode) {
          setWaitingForUser(true);
          avatar.startListening(); // Ensure mic is open
        } else {
          // In Text Mode, we just wait for user input (no specific state change needed)
          setWaitingForUser(false);
        }
      }
    };

    // Register HeyGen event listeners
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

  /**
   * Auto-start conversation when stream becomes ready
   */
  useEffect(() => {
    if (isConnected && !hasStartedConversation) {
      // Small delay to ensure stream is fully ready
      const timer = setTimeout(() => {
        startHealthSession();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, hasStartedConversation, startHealthSession]);

  /**
   * Expose method for testing/manual user input
   * This allows parent components to simulate user responses
   */
  useEffect(() => {
    // Make handleUserMessage available globally for testing
    if (typeof window !== 'undefined') {
      (window as any).sendUserMessage = handleUserMessage;
    }
  }, [handleUserMessage]);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] animate-pulse">
            Establishing Stream
          </p>
        </div>
      )}

      {/* Actual Video */}
      <video
        ref={videoRef}
        className={`w-full h-full object-contain transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'
          }`}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />



      {/* Interaction Controls - Floating Bottom Bar (WhatsApp Style) */}
      {isConnected && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50">
          <div className="bg-white rounded-full shadow-2xl flex items-center p-2 border border-slate-100 ring-4 ring-white/30 backdrop-blur-md">

            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder={isVoiceMode ? "Listening..." : "Type a message..."}
              disabled={isVoiceMode || isAvatarSpeaking}
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-6 text-slate-800 placeholder:text-slate-400 text-lg font-medium disabled:opacity-50"
            />

            {/* Actions Group */}
            <div className="flex items-center gap-2 pr-1">

              {/* Send Button (Only show if text exists) */}
              {inputText.trim().length > 0 && (
                <button
                  onClick={handleSendText}
                  disabled={isAvatarSpeaking}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95 flex-shrink-0"
                >
                  <ArrowUp size={20} strokeWidth={3} />
                </button>
              )}

              {/* Mic Toggle */}
              <button
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={`p-3 rounded-full transition-all flex-shrink-0 ${isVoiceMode
                  ? 'bg-rose-500 text-white shadow-lg animate-pulse'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
              >
                {isVoiceMode ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>
          </div>

          {/* Helper Text */}
          {isVoiceMode && (
            <p className="text-center text-white/90 text-xs font-bold mt-3 drop-shadow-md animate-pulse">
              Microphone is active. Speak now.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
