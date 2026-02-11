import React from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  percentage: number;
  color: string;
  chartColor: string;
}

export const MetricCard = ({ title, value, percentage, color, chartColor }: MetricCardProps) => {
  return (
    <div className="card-base p-8 flex flex-col items-center flex-1">
      {/* Gauge */}
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-slate-100"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={352}
            strokeDashoffset={352 * (1 - percentage / 100)}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</span>
        </div>
      </div>
      
      <div className="text-2xl font-bold text-slate-800 mb-6">{value}</div>

      {/* Mini Chart */}
      <div className="w-full h-16">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
          <path
            d="M 0,30 Q 15,10 30,25 T 60,15 T 100,20"
            fill="none"
            stroke={chartColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 0,30 Q 15,10 30,25 T 60,15 T 100,20 L 100,40 L 0,40 Z"
            fill={chartColor}
            fillOpacity="0.1"
          />
        </svg>
        <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase mt-2">
          <span>Sun</span>
          <span>Sat</span>
        </div>
      </div>
    </div>
  );
};
