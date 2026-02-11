'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Activity, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SessionSummary } from '@/types/health';

interface SummaryModalProps {
    summary: SessionSummary;
}

export const SummaryModal = ({ summary }: SummaryModalProps) => {
    const router = useRouter();

    // Helper to determine severity color
    const getSeverityColor = (type: 'critical' | 'warning' | 'notice') => {
        switch (type) {
            case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'notice': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // Extract primary focus based on lowest score
    const getPrimaryFocus = () => {
        const scores = summary.scores;
        const lowest = Object.entries(scores)
            .filter(([key]) => key !== 'overallScore')
            .sort(([, a], [, b]) => a - b)[0];

        if (!lowest) return { title: 'General Wellness', color: 'text-blue-600', bg: 'bg-blue-50' };

        const key = lowest[0];
        switch (key) {
            case 'sleepScore': return { title: 'Sleep Improvement', color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'stressScore': return { title: 'Stress Management', color: 'text-orange-600', bg: 'bg-orange-50' };
            case 'activityScore': return { title: 'Physical Activity', color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'lonelinesScore': return { title: 'Social Connection', color: 'text-purple-600', bg: 'bg-purple-50' };
            default: return { title: 'Lifestyle Balance', color: 'text-rose-600', bg: 'bg-rose-50' };
        }
    };

    const focus = getPrimaryFocus();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <CheckCircle2 size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Daily Check-in Complete</h2>
                        <p className="text-slate-500 text-sm font-medium">Session Duration: {summary.durationMinutes} min • {new Date(summary.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                {/* Content - Split View */}
                <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LEFT: Clinician View (Flags & Recommendations) */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Activity size={12} />
                                Clinical Findings
                            </h3>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {summary.redFlags.critical.map((flag, i) => (
                                    <span key={`crit-${i}`} className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor('critical')} flex items-center gap-1.5`}>
                                        <AlertTriangle size={10} />
                                        {flag}
                                    </span>
                                ))}
                                {summary.redFlags.warnings.map((flag, i) => (
                                    <span key={`warn-${i}`} className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor('warning')} flex items-center gap-1.5`}>
                                        <AlertCircle size={10} />
                                        {flag}
                                    </span>
                                ))}
                                {summary.redFlags.notices.map((flag, i) => (
                                    <span key={`note-${i}`} className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor('notice')}`}>
                                        {flag}
                                    </span>
                                ))}
                                {summary.redFlags.critical.length === 0 && summary.redFlags.warnings.length === 0 && summary.redFlags.notices.length === 0 && (
                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
                                        No Significant Flags
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Clinical Recommendations</h3>
                            <ul className="space-y-3">
                                {summary.recommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 group-hover:bg-blue-600 transition-colors" />
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT: Patient Plan */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar size={12} />
                            Your Care Plan
                        </h3>

                        {/* Focus Card */}
                        <div className={`p-6 rounded-xl ${focus.bg} border border-opacity-50 border-current shadow-sm`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${focus.color} opacity-60`}>Current Focus</span>
                            <h4 className={`text-lg font-bold ${focus.color} mt-1 mb-3`}>{focus.title}</h4>
                            <div className="w-full h-1 bg-current opacity-10 rounded-full mb-4" />
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-2xl">🎯</div>
                                <div>
                                    <span className="text-xs font-bold opacity-60 uppercase block mb-1">SMART Goal</span>
                                    <p className="text-sm font-medium text-slate-700 leading-snug">
                                        {summary.recommendations[0] || "Maintain current healthy habits."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                <span className="text-2xl font-black text-slate-800">{summary.scores.overallScore}</span>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Health Score</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                <span className="text-2xl font-black text-slate-800">{summary.redFlags.critical.length + summary.redFlags.warnings.length}</span>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Active Alerts</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group"
                    >
                        <span>Back to Dashboard</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
