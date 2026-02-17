'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ChatOverlayProps {
  currentQuestion: string | null;
  hint?: string | null;
  isVisible: boolean;
}

export function ChatOverlay({ currentQuestion, hint, isVisible }: ChatOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && currentQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute bottom-28 left-0 right-0 px-6 z-40 pointer-events-none"
        >
          <div className="max-w-xl mx-auto">
            <div className="bg-slate-900/85 backdrop-blur-xl rounded-2xl border border-slate-700/40 shadow-2xl px-5 py-4">
              {/* Avatar label */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-cyan-400 text-[9px] font-bold">L</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Lisa
                </span>
              </div>

              {/* Question text */}
              <p className="text-white text-sm font-medium leading-relaxed">
                {currentQuestion}
              </p>

              {/* Hint */}
              {hint && (
                <div className="mt-3 flex items-start gap-2">
                  <span className="text-amber-400/80 text-xs mt-px">&#128161;</span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {hint}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
