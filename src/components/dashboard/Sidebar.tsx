import React from 'react';
import { Home, LayoutGrid, Activity, Calendar, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarIconProps {
  icon: React.ElementType;
  active?: boolean;
}

const SidebarIcon = ({ icon: Icon, active }: SidebarIconProps) => (
  <div className={cn(
    "p-3 rounded-2xl transition-all cursor-pointer",
    active 
      ? "text-blue-600 bg-blue-50 shadow-sm" 
      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
  )}>
    <Icon size={22} />
  </div>
);

export const Sidebar = () => {
  return (
    <aside className="w-20 min-h-screen bg-white/40 backdrop-blur-md border-r border-slate-100 flex flex-col items-center py-8 gap-8 fixed left-0 top-0 z-40">
      <div className="w-10 h-10 bg-blue-600 rounded-2xl mb-4 flex items-center justify-center text-white font-bold">A</div>
      
      <div className="flex flex-col gap-4">
        <SidebarIcon icon={Home} active />
        <SidebarIcon icon={LayoutGrid} />
        <SidebarIcon icon={Activity} />
        <SidebarIcon icon={Calendar} />
        <SidebarIcon icon={Settings} />
      </div>

      <div className="mt-auto">
        <SidebarIcon icon={LogOut} />
      </div>
    </aside>
  );
};