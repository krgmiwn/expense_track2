
import React from 'react';
import { ICONS } from '../constants';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  profile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'HOME', icon: <ICONS.ChartPie /> },
    { id: 'history', label: 'FLOW', icon: <ICONS.Wallet /> },
    { id: 'scheduled', label: 'AUTO', icon: <ICONS.Calendar /> },
    { id: 'settings', label: 'SET', icon: <ICONS.Settings /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 h-20 flex justify-around items-center px-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
      {menuItems.map((item) => (
        <button 
          key={item.id} 
          onClick={() => setActiveTab(item.id)} 
          className={`flex flex-col items-center gap-1.5 transition-all p-2 active:scale-90 ${activeTab === item.id ? 'text-indigo-500' : 'text-slate-500'}`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
