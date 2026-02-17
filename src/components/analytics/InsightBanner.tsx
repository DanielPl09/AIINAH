'use client';

import { Activity, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightBannerProps {
  message: string;
}

export function InsightBanner({ message }: InsightBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="col-span-2 bg-indigo-500/10 rounded-widget border border-indigo-500/20 p-3.5 flex items-center justify-between gap-3 min-h-[70px]"
    >
      <div className="flex items-center gap-3">
        <div className="w-0.5 h-8 bg-indigo-400 rounded-full shrink-0" />
        <div className="bg-indigo-500/20 p-1.5 rounded-lg shrink-0">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <p className="text-xs text-slate-300 leading-snug line-clamp-2">
          <span className="font-bold text-indigo-400">Insight:</span>{' '}
          {message}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
    </motion.div>
  );
}
