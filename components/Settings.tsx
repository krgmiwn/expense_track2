
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-widest text-sm text-slate-400">Preferences</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            {profile.picture ? (
              <img src={profile.picture} className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-lg" alt="Profile" />
            ) : (
              <div className="w-20 h-20 bg-indigo-100 rounded-[2rem] flex items-center justify-center text-3xl text-indigo-600 font-bold border-4 border-white shadow-lg">
                {formData.name.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="font-black text-slate-800 text-lg tracking-tight">{profile.name}</h4>
              <p className="text-slate-400 text-xs font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
            <div>
              {saved && (
                <span className="text-emerald-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-check-circle"></i> Saved
                </span>
              )}
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Security</h3>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-4 border-2 border-rose-50 text-rose-500 font-black rounded-2xl hover:bg-rose-50 transition-all active:scale-95"
        >
          <i className="fas fa-sign-out-alt"></i> Sign Out Account
        </button>
        <p className="mt-4 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">FinTrack Pro v3.0.1</p>
      </div>
    </div>
  );
};

export default Settings;
