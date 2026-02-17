import { Activity } from 'lucide-react';
import { WidgetShell } from './WidgetShell';

interface StressLevelWidgetProps {
  level: number;
  label: string;
}

export function StressLevelWidget({ level, label }: StressLevelWidgetProps) {
  return (
    <WidgetShell title="Stress Level" icon={Activity} className="col-span-2 min-h-[130px]" index={0}>
      <div className="flex flex-col justify-center h-full gap-3">
        <div className="flex justify-between items-end px-1">
          <span className="text-2xl font-bold text-amber-400 text-glow-amber">{label}</span>
          <span className="text-sm font-bold text-amber-400/80 animate-pulse-glow">{level}/100</span>
        </div>
        <div className="relative h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full shadow-glow-amber transition-all duration-700"
            style={{ width: `${level}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-medium px-1 uppercase tracking-wider">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      </div>
    </WidgetShell>
  );
}
