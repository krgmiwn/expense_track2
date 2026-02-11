
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
    { id: 'scheduled', label: 'Automate', icon: <ICONS.Calendar /> },
    { id: 'settings', label: 'Profile', icon: <ICONS.Settings /> },
  ];

  const UserAvatar = () => (
    profile.picture ? (
      <img src={profile.picture} alt={profile.name} className="w-12 h-12 rounded-2xl border-2 border-white/40 shadow-xl" />
    ) : (
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black border-2 border-white/40 shadow-xl">
        {profile.name.charAt(0)}
      </div>
    )
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 liquid-glass m-6 rounded-[3rem] flex-col p-6 shadow-2xl">
        <div className="px-4 py-8 text-indigo-600 font-black text-2xl flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 transform -rotate-6">
            <ICONS.Wallet />
          </div>
          <span className="tracking-tighter text-slate-800">FIN<span className="text-indigo-600">TRACK</span></span>
        </div>
        
        <nav className="flex-1 px-2 py-8 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 translate-x-2' 
                  : 'text-slate-400 hover:bg-white/40 hover:text-slate-600'
              }`}
            >
              <span className={`text-2xl transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
              <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-4 p-4 bg-white/40 rounded-3xl border border-white/40 backdrop-blur-md">
            <UserAvatar />
            <div className="text-sm overflow-hidden">
              <p className="font-black text-slate-800 truncate tracking-tight">{profile.name}</p>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">Verified Liquid</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Floating Glass Bottom Nav */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <nav className="liquid-glass rounded-[2.5rem] px-8 py-5 flex justify-between items-center shadow-2xl border border-white/40">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-2 transition-all ${
                activeTab === item.id ? 'text-indigo-600 scale-125' : 'text-slate-400 opacity-60'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className={`w-1.5 h-1.5 rounded-full bg-indigo-600 transition-all ${activeTab === item.id ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
