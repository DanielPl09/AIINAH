'use client';

import React from 'react';
import { Activity, Moon, Mic2, Brain, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';

import type { UserHealthProfile } from '@/types/health';

interface GlassAnalyticsPanelProps {
  sessionData?: {
    currentQuestionIndex: number;
    totalQuestions: number;
    currentCategory: string;
    progress: number;
    isActive: boolean;
  };
  data?: UserHealthProfile;
}

/**
 * GlassAnalyticsPanel - Live Session Metrics Display
 * Updates in real-time based on conversation progress
 */
export const GlassAnalyticsPanel = ({ sessionData, data }: GlassAnalyticsPanelProps) => {
  // Default values for when session hasn't started
  const progress = sessionData?.progress || 0;
  const category = sessionData?.currentCategory || 'intro';
  const questionIndex = sessionData?.currentQuestionIndex || 0;
  const totalQuestions = sessionData?.totalQuestions || 16;
  const isActive = sessionData?.isActive || false;

  // Calculate category-specific metrics
  const getCategoryIcon = () => {
    switch (category) {
      case 'stress': return Brain;
      case 'sleep': return Moon;
      case 'activity': return Activity;
      case 'loneliness': return Users;
      case 'alcohol':
      case 'smoking':
      case 'lifestyle': return Heart;
      default: return Mic2;
    }
  };

  const getCategoryColor = () => {
    switch (category) {
      case 'stress': return 'from-yellow-400 to-orange-500';
      case 'sleep': return 'from-blue-400 to-indigo-500';
      case 'activity': return 'from-green-400 to-emerald-500';
      case 'loneliness': return 'from-purple-400 to-pink-500';
      case 'alcohol':
      case 'smoking':
      case 'lifestyle': return 'from-rose-400 to-red-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const CategoryIcon = getCategoryIcon();
  const categoryColor = getCategoryColor();
  return (
    <div className="mx-auto bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 shadow-xl flex items-center justify-between gap-6 min-w-[320px]">
      {/* Status */}
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
        <span className="text-white/80 text-sm font-medium">Monitoring Vitals...</span>
      </div>

      {/* Vitals HUD */}
      <div className="flex items-center">
        {/* Stress */}
        <div className="flex flex-col items-center px-4 border-l border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Stress</span>
          <div className="flex items-center gap-1.5">
            <Brain size={14} className="text-orange-300" />
            <span className="text-sm font-bold text-white">
              {data?.medicalHistory.baselineStress ? `${data.medicalHistory.baselineStress}/10` : '--'}
            </span>
          </div>
        </div>

        {/* Sleep */}
        <div className="flex flex-col items-center px-4 border-l border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Sleep</span>
          <div className="flex items-center gap-1.5">
            <Moon size={14} className="text-indigo-300" />
            <span className="text-sm font-bold text-white">
              {data?.wearableData.lastNightSleep ? `${data.wearableData.lastNightSleep}h` : '--'}
            </span>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="flex flex-col items-center px-4 border-l border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">HR</span>
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-rose-300" />
            <span className="text-sm font-bold text-white">
              {data?.wearableData.restingHeartRate ? `${data.wearableData.restingHeartRate}` : '--'}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col items-center px-4 border-l border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">Steps</span>
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-300" />
            <span className="text-sm font-bold text-white">
              {data?.wearableData.dailySteps ? (data.wearableData.dailySteps / 1000).toFixed(1) + 'k' : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
