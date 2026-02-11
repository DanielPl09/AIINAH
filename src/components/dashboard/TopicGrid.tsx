import React from 'react';
import { Moon, Users, Dumbbell, Heart, Apple, History, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const topics = [
  { name: 'Sleep Analysis', icon: Moon, bg: 'bg-blue-600', text: 'text-white' },
  { name: 'Relationship Dynamics', icon: Users, bg: 'bg-cyan-500', text: 'text-white' },
  { name: 'Fitness & Vitals', icon: Dumbbell, bg: 'bg-emerald-500', text: 'text-white' },
  { name: 'Social Connections', icon: Heart, bg: 'bg-teal-500', text: 'text-white' },
  { name: 'Nutrition', icon: Apple, bg: 'bg-green-500', text: 'text-white' },
  { name: 'Family History Analysis', icon: History, bg: 'bg-green-700', text: 'text-white' },
];

export const TopicGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic, i) => (
        <Link
          key={i}
          href="/chat"
          className={`${topic.bg} ${topic.text} rounded-3xl p-6 flex items-center justify-between shadow-lg shadow-black/5 hover:scale-[1.02] transition-all group`}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <topic.icon size={22} />
            </div>
            <span className="font-bold text-lg">{topic.name}</span>
          </div>
          <ChevronRight size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
};