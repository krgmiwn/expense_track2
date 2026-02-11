
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
    <div className="space-y-6 pb-4">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl text-white font-black shadow-2xl shadow-indigo-600/30">
            {profile.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-white text-2xl tracking-tighter uppercase">{profile.name}</h4>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Identification</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 outline-none font-black text-white shadow-inner text-base"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Currency Engine</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 outline-none font-black text-white shadow-inner text-base"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onUpdate(formData)}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all mt-4"
          >
            Update Profile
          </button>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black rounded-[2rem] uppercase tracking-widest text-[10px] active:scale-95 transition-all"
      >
        Terminate Session
      </button>
    </div>
  );
};

export default Settings;
