
import React from 'react';
import { ICONS } from '../constants';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  profile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile }) => {
  const isDark = profile.theme === 'dark';
  const menuItems = [
    { id: 'dashboard', label: 'HOME', icon: <ICONS.ChartPie /> },
    { id: 'history', label: 'FLOW', icon: <ICONS.Wallet /> },
    { id: 'scheduled', label: 'AUTO', icon: <ICONS.Calendar /> },
    { id: 'settings', label: 'SET', icon: <ICONS.Settings /> },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-2xl border-t h-20 flex justify-around items-center px-4 z-[100] transition-all duration-500 ${isDark ? 'bg-slate-950/95 border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]' : 'bg-white/95 border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]'}`}>
      {menuItems.map((item) => (
        <button 
          key={item.id} 
          onClick={() => setActiveTab(item.id)} 
          className={`flex flex-col items-center gap-1.5 transition-all p-2 active:scale-90 ${activeTab === item.id ? 'text-indigo-500' : (isDark ? 'text-slate-500' : 'text-slate-300')}`}
        >
          <span className="text-2xl transition-transform duration-300 transform group-active:scale-110">{item.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
