'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WidgetShellProps {
  title: string;
  icon: ElementType;
  className?: string;
  index?: number;
  children: ReactNode;
}

export function WidgetShell({ title, icon: Icon, children, className, index = 0 }: WidgetShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className={cn(
        'bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-widget p-5 relative overflow-hidden flex flex-col',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-700/60">
            <Icon className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.1em]">{title}</h3>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0 relative">
        {children}
      </div>
    </motion.div>
  );
}
