
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
    { id: 'history', label: 'LEDGER', icon: <ICONS.Wallet /> },
    { id: 'scheduled', label: 'AUTO', icon: <ICONS.Calendar /> },
    { id: 'settings', label: 'PROFILE', icon: <ICONS.Settings /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 h-16 flex justify-around items-center px-6 z-[100]">
      {menuItems.map((item) => (
        <button 
          key={item.id} 
          onClick={() => setActiveTab(item.id)} 
          className={`flex flex-col items-center gap-1 transition-all py-1 active:scale-95 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-600'}`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[7px] font-black uppercase tracking-[0.2em]">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
