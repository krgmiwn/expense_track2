
import React, { useState } from 'react';
import { UserProfile, CURRENCIES } from '../types';
import { ICONS } from '../constants';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-600 pb-20">
      <div className="liquid-glass rounded-[3.5rem] p-10 shadow-2xl border border-white/40">
        <h3 className="text-xl font-black text-slate-800 mb-10 tracking-tighter">System Persona</h3>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/40 shadow-xl">
            <div className="relative group">
              {profile.picture ? (
                <img src={profile.picture} className="w-28 h-28 rounded-[2rem] border-4 border-white shadow-2xl group-hover:scale-105 transition-transform" alt="Profile" />
              ) : (
                <div className="w-28 h-28 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl text-white font-black border-4 border-white shadow-2xl group-hover:rotate-6 transition-all">
                  {formData.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg cursor-pointer">
                <i className="fas fa-camera text-xs"></i>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="font-black text-slate-800 text-2xl tracking-tight">{profile.name}</h4>
              <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{profile.email}</p>
              <div className="mt-4 flex gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-full border border-emerald-200">Active Liquidity</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase rounded-full border border-indigo-200">Pro Tier</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Identity Signature</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/50 border-2 border-white/40 rounded-[1.5rem] px-6 py-5 focus:bg-white focus:border-indigo-400 outline-none transition-all font-black text-slate-800 shadow-inner text-lg"
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Currency standard</label>
              <div className="relative">
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full bg-white/50 border-2 border-white/40 rounded-[1.5rem] px-6 py-5 focus:bg-white focus:border-indigo-400 outline-none transition-all font-black text-slate-800 shadow-inner appearance-none text-lg"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
                <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${saved ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
              {saved && (
                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Manifest Saved</span>
              )}
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-12 py-5 rounded-[1.5rem] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 uppercase tracking-widest text-sm"
            >
              Update Core
            </button>
          </div>
        </form>
      </div>

      <div className="liquid-glass rounded-[3rem] p-10 shadow-2xl border border-white/40 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-rose-500/10 transition-all"></div>
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8">Security & Session</h3>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-4 py-6 border-2 border-rose-100 bg-rose-50/30 text-rose-500 font-black rounded-[2rem] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-lg group"
        >
          <i className="fas fa-power-off transition-transform group-hover:rotate-12"></i> 
          <span className="uppercase tracking-widest text-xs">Terminate Session</span>
        </button>
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-40">Liquid Engine v3.5.0-Crystal</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
