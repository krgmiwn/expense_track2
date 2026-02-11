
import React, { useState } from 'react';
import { UserProfile, CURRENCIES } from '../types';
import { ICONS } from '../constants';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-8">System Preferences</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-3xl text-indigo-600 font-bold border-4 border-white shadow-sm">
            {formData.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Personal Profile</h4>
            <p className="text-slate-400 text-sm">Update your information and regional settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Currency Settings</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                type="button"
                onClick={() => setFormData({ ...formData, currency: c.code })}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  formData.currency === c.code 
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-2xl font-bold mb-1">{c.symbol}</span>
                <span className="text-xs font-bold uppercase">{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
          <div>
            {saved && (
              <span className="text-emerald-500 font-semibold flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Settings saved successfully
              </span>
            )}
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
