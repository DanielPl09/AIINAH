'use client';

import { Share2 } from 'lucide-react';
import { StressLevelWidget } from './StressLevelWidget';
import { SleepLatencyWidget } from './SleepLatencyWidget';
import { VoiceToneWidget } from './VoiceToneWidget';
import { InsightBanner } from './InsightBanner';
import { SessionProgressBar } from './SessionProgressBar';

const VOICE_TONE_DATA = [
  { t: 1, val: 30 }, { t: 2, val: 50 }, { t: 3, val: 45 },
  { t: 4, val: 80 }, { t: 5, val: 70 }, { t: 6, val: 110 }, { t: 7, val: 95 },
];

interface AnalyticsPanelProps {
  userName: string;
}

export function AnalyticsPanel({ userName }: AnalyticsPanelProps) {
  return (
    <aside className="bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="p-5 flex flex-col gap-3 shrink-0 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="w-9" />
          <div className="text-center">
            <h2 className="font-bold text-white text-sm">{userName}</h2>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center justify-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </p>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-cyan-400">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <SessionProgressBar currentCategory="stress" progress={0} />
      </header>

      {/* Widgets */}
      <div className="flex-1 p-4 grid grid-cols-2 auto-rows-min gap-3 overflow-y-auto custom-scrollbar">
        <StressLevelWidget level={85} label="High" />
        <SleepLatencyWidget minutes={60} normMinutes={20} />
        <VoiceToneWidget data={VOICE_TONE_DATA} label="Tense" />
        <InsightBanner message="High cortisol levels detected. 10min breathing recommended." />
      </div>
    </aside>
  );
}
