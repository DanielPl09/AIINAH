'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType
} from '@heygen/streaming-avatar';
import { HEYGEN_CONFIG } from '@/lib/config';

interface HeyGenSession {
  sessionId: string;
  status: 'connecting' | 'connected' | 'disconnected';
}

export const useHeyGenAvatar = (avatarId: string) => {
  const [session, setSession] = useState<HeyGenSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);

  const startSession = useCallback(async () => {
    if (avatar.current) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/heygen-token', { method: 'POST' });
      const { token, error } = await res.json();
      if (error) throw new Error(error);

      avatar.current = new StreamingAvatar({ token });

      // The SDK uses CustomEvent patterns for its events
      const handleStreamReady = (event: any) => {
        console.log('Stream is ready:', event.detail);
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error);
          };
        }
      };

      avatar.current.on(StreamingEvents.STREAM_READY, handleStreamReady);
      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setSession(null);
      });

      // Also listen for talking events for UI feedback if needed
      avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => console.log('Avatar start talking', e.detail));
      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => console.log('Avatar stop talking', e.detail));

      const sessionData = await avatar.current.createStartAvatar({
        avatarName: avatarId,
        quality: AvatarQuality.High,
        language: HEYGEN_CONFIG.LANGUAGE,
        voice: {
          voiceId: HEYGEN_CONFIG.VOICE_ID,
          rate: HEYGEN_CONFIG.VOICE_RATE,
        },
        disableIdleTimeout: true,
      });

      setSession({
        sessionId: sessionData.session_id,
        status: 'connected'
      });

    } catch (err: any) {
      console.error("❌ Failed to start avatar session");
      console.error("Error message:", err?.message);
      console.error("Error code:", err?.code);
      console.error("Error details:", err?.details || err?.error);
      console.error("Full error:", JSON.stringify(err, null, 2));
      avatar.current = null;
    } finally {
      setIsLoading(false);
    }
  }, [avatarId]);

  const endSession = useCallback(async () => {
    if (avatar.current) {
      try {
        await avatar.current.stopAvatar();
      } catch (e) {
        console.error("Error stopping session", e);
      }
      avatar.current = null;
    }
    setSession(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (avatar.current && session?.sessionId) {
      await avatar.current.speak({
        text,
        taskType: TaskType.REPEAT,
      });
    }
  }, [session]);

  useEffect(() => {
    return () => {
      if (avatar.current) {
        avatar.current.stopAvatar().catch(console.error);
      }
    };
  }, []);

  return {
    session,
    isLoading,
    videoRef,
    avatarRef: avatar,
    startSession,
    endSession,
    speak
  };
};
