'use client';

import { Loader2, PhoneOff } from 'lucide-react';

interface AvatarVideoProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isConnected: boolean;
  isLoading: boolean;
  onEndSession: () => void;
}

export function AvatarVideo({ videoRef, isConnected, isLoading, onEndSession }: AvatarVideoProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* End Session Button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={onEndSession}
          className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-rose-500/30 transition-all backdrop-blur-sm active:scale-95"
        >
          <PhoneOff size={14} />
          End Session
        </button>
      </div>

      {/* Loading State — absolute overlay so it's always centered */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="relative">
            <Loader2 className="w-14 h-14 animate-spin text-cyan-500/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse shadow-glow-cyan" />
            </div>
          </div>
          <p className="mt-6 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">
            Establishing Stream
          </p>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
