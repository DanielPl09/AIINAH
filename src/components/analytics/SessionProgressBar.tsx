'use client';

import { cn } from '@/lib/utils';

const CATEGORIES = ['stress', 'sleep', 'activity', 'loneliness', 'alcohol', 'smoking'] as const;

interface SessionProgressBarProps {
  currentCategory?: string;
  progress?: number;
}

export function SessionProgressBar({ currentCategory, progress = 0 }: SessionProgressBarProps) {
  const currentIdx = CATEGORIES.indexOf(currentCategory as typeof CATEGORIES[number]);

  return (
    <div className="flex items-center gap-1.5 px-1">
      {CATEGORIES.map((cat, idx) => {
        const isCompleted = currentIdx > idx || progress === 100;
        const isCurrent = currentIdx === idx && progress < 100;

        return (
          <div
            key={cat}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-500',
              isCompleted && 'bg-cyan-400 shadow-glow-cyan',
              isCurrent && 'bg-cyan-400/60 animate-pulse-glow',
              !isCompleted && !isCurrent && 'bg-slate-700',
            )}
          />
        );
      })}
    </div>
  );
}
