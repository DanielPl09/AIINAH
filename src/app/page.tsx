import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TopicGrid } from '@/components/dashboard/TopicGrid';
import { Bell, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import { MOCK_USER_PROFILE } from '@/lib/mockData';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-20 p-10">
        {/* Top Navigation */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm relative bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-slate-900 font-bold">Amit Cohen</h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-black text-blue-900 tracking-tight">AIINAH</h1>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Health & Wellness</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative text-slate-400">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Overview Controls */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h3>
          <div className="flex gap-2">
            <button className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-slate-400">
              <Calendar size={18} />
            </button>
            <select className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-sm font-bold text-slate-500 outline-none">
              <option>Month</option>
              <option>Week</option>
            </select>
          </div>
        </div>

        {/* Overview Row */}
        <div className="flex gap-6 mb-12">
          <MetricCard
            title="Overall Score"
            value={Math.round(((MOCK_USER_PROFILE.wearableData.dailySteps / 10000 * 100) + (MOCK_USER_PROFILE.wearableData.lastNightSleep / 8 * 100)) / 2).toString()}
            percentage={Math.round(((MOCK_USER_PROFILE.wearableData.dailySteps / 10000 * 100) + (MOCK_USER_PROFILE.wearableData.lastNightSleep / 8 * 100)) / 2)}
            color="text-blue-500"
            chartColor="#3B82F6"
          />
          <MetricCard
            title="Daily Activity"
            value={`${MOCK_USER_PROFILE.wearableData.dailySteps.toLocaleString()} steps`}
            percentage={Math.min(Math.round(MOCK_USER_PROFILE.wearableData.dailySteps / 10000 * 100), 100)}
            color="text-emerald-500"
            chartColor="#10B981"
          />
          <MetricCard
            title="Sleep Quality"
            value={`${MOCK_USER_PROFILE.wearableData.lastNightSleep}h`}
            percentage={Math.min(Math.round(MOCK_USER_PROFILE.wearableData.lastNightSleep / 8 * 100), 100)}
            color="text-cyan-400"
            chartColor="#22D3EE"
          />
        </div>

        {/* Bottom Grid */}
        <TopicGrid />

        {/* Start Check-in FAB */}
        <Link
          href="/chat"
          className="fixed bottom-10 right-10 bg-blue-600 text-white flex items-center gap-3 px-8 py-5 rounded-[2rem] font-bold shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 z-50 group"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Activity size={24} />
          </div>
          <span className="text-lg">Start Check-in</span>
        </Link>
      </main>
    </div>
  );
}
