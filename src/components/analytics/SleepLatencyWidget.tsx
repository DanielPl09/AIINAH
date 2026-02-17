import { Moon } from 'lucide-react';
import { WidgetShell } from './WidgetShell';

interface SleepLatencyWidgetProps {
  minutes: number;
  normMinutes: number;
}

export function SleepLatencyWidget({ minutes, normMinutes }: SleepLatencyWidgetProps) {
  const maxMinutes = normMinutes * 5;
  const fraction = Math.min(1, minutes / maxMinutes);
  const circumference = 2 * Math.PI * 42;
  const strokeLength = circumference * fraction;

  return (
    <WidgetShell title="Sleep Onset Latency" icon={Moon} className="col-span-2 min-h-[200px]" index={1}>
      <div className="flex flex-col pt-1 pb-1 w-full">
        <div className="flex items-center justify-between gap-4 px-2">
          {/* SVG Circular Gauge */}
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="6" />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${strokeLength} ${circumference}`}
                className="animate-draw-in drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white leading-none">{minutes}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">min</span>
            </div>
          </div>

          {/* Comparison */}
          <div className="flex flex-col items-center flex-1 text-center gap-2.5">
            <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center ring-2 ring-rose-500/30">
              <Moon className="text-rose-400 w-5 h-5" />
            </div>
            <div className="text-xs font-medium text-slate-400 leading-tight">
              higher than<br />
              <span className="text-white font-bold text-sm">{normMinutes} min</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg py-1.5 text-center mt-3 shrink-0">
          <span className="text-emerald-400 font-bold text-[10px] tracking-wide uppercase">
            {normMinutes} minute norm
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}
