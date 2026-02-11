
import React, { useState } from 'react';
import { UserProfile, CURRENCIES } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl text-white font-black shadow-xl">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-white text-xl tracking-tight uppercase">{profile.name}</h4>
            <p className="text-indigo-400 text-[8px] font-black uppercase tracking-[0.3em]">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 outline-none font-black text-white shadow-inner text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Base Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 outline-none font-black text-white shadow-inner text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onUpdate(formData)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-transform"
          >
            Save Manifest
          </button>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-5 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black rounded-3xl uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
      >
        Terminate Session
      </button>
    </div>
  );
};

export default Settings;
