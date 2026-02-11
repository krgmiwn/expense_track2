
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
    { id: 'dashboard', label: 'Home', icon: <ICONS.ChartPie /> },
    { id: 'history', label: 'Ledger', icon: <ICONS.Wallet /> },
    { id: 'scheduled', label: 'Auto', icon: <ICONS.Calendar /> },
    { id: 'settings', label: 'Prof', icon: <ICONS.Settings /> },
  ];

  return (
    <>
      <aside className="hidden md:flex w-48 bg-slate-900 m-4 rounded-[2rem] flex-col p-4 shadow-xl border border-white/5">
        <div className="px-3 py-4 text-indigo-400 font-black text-sm flex items-center gap-2">
          <ICONS.Wallet />
          <span className="tracking-tight uppercase text-[10px]">MY TRACK <span className="text-white">PRO</span></span>
        </div>
        <nav className="flex-1 space-y-1 mt-6">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="font-black text-[9px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Optimized Android Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] px-3 pb-4">
        <nav className="bg-slate-900/90 backdrop-blur-xl rounded-[1.5rem] px-6 py-2.5 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.4)] border border-white/10">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-0.5 transition-all p-2 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`}>
              <span className="text-base">{item.icon}</span>
              <span className="text-[6px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;