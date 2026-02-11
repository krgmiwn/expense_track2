
import React from 'react';
import { ICONS } from '../constants';
import { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  profile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: <ICONS.ChartPie /> },
    { id: 'history', label: 'History', icon: <ICONS.Wallet /> },
    { id: 'scheduled', label: 'Schedule', icon: <ICONS.Calendar /> },
    { id: 'settings', label: 'Settings', icon: <ICONS.Settings /> },
  ];

  const UserAvatar = () => (
    profile.picture ? (
      <img src={profile.picture} alt={profile.name} className="w-10 h-10 rounded-full border-2 border-indigo-50 shadow-sm" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-50 shadow-sm">
        {profile.name.charAt(0)}
      </div>
    )
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-6 text-indigo-600 font-bold text-xl flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ICONS.Wallet />
          </div>
          <span className="font-black tracking-tighter">FinTrack</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100">
            <UserAvatar />
            <div className="text-sm overflow-hidden">
              <p className="font-bold text-slate-700 truncate">{profile.name}</p>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight truncate">{profile.email.split('@')[0]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 px-6 py-3 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-slate-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
