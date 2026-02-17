'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHeyGenAvatar } from '@/hooks/useHeyGen';
import { HEYGEN_CONFIG } from '@/lib/config';
import { AnalyticsPanel } from '@/components/analytics';

const AvatarSession = dynamic(
  () => import('@/components/avatar/AvatarSession').then(mod => ({ default: mod.AvatarSession })),
  { ssr: false },
);

export default function HomePage() {
  const { session, isLoading, videoRef, avatarRef, startSession, endSession } = useHeyGenAvatar(HEYGEN_CONFIG.AVATAR_ID);
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = async () => {
    setHasJoined(true);
    await startSession();
  };

  useEffect(() => {
    return () => { endSession(); };
  }, [endSession]);

  return (
    <main className="h-screen w-full bg-slate-950 grid grid-rows-[56px_1fr] grid-cols-[1fr_340px] overflow-hidden font-sans">
      {/* TOP BAR */}
      <header className="col-span-2 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <span className="text-cyan-400 font-bold text-xs">A</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">AIINAH</h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">Health Session</p>
          </div>
        </div>

        {/* Center: session status */}
        <div className="flex items-center gap-2">
          {hasJoined && session?.status === 'connected' ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live</span>
            </div>
          ) : hasJoined ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Connecting</span>
            </div>
          ) : null}
        </div>

        {/* Right: end session */}
        <div className="w-24 flex justify-end">
          {hasJoined && (
            <button
              onClick={endSession}
              className="text-[10px] font-bold text-slate-500 hover:text-rose-400 uppercase tracking-wider transition-colors"
            >
              End
            </button>
          )}
        </div>
      </header>

      {/* VIDEO STREAM */}
      <section className="relative bg-slate-950 flex items-center justify-center p-4 min-w-0 overflow-hidden">
        <div className="relative w-full max-w-4xl h-full bg-slate-900 rounded-2xl overflow-hidden ring-1 ring-cyan-500/20 shadow-glow-cyan">
          <AvatarSession
            isLoading={isLoading && hasJoined}
            isConnected={session?.status === 'connected'}
            videoRef={videoRef}
            avatar={avatarRef.current}
            onEndSession={endSession}
          />

          {/* Join Overlay */}
          {!hasJoined && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={handleJoin}
                className="bg-cyan-600 text-white px-7 py-3.5 rounded-2xl font-bold text-lg shadow-glow-cyan-md hover:bg-cyan-500 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border border-cyan-500/30"
              >
                <div className="bg-white/10 p-2 rounded-xl">
                  <Mic size={20} />
                </div>
                Start Session
              </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* ANALYTICS PANEL */}
      <AnalyticsPanel userName="Amit Cohen" />
    </main>
  );
}
