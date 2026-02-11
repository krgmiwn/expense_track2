
import React, { useState, useRef } from 'react';
import { UserProfile, CURRENCIES } from '../types';

interface SettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdate, onLogout }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, picture: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-6 mb-10">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer"
          >
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl text-white font-black shadow-2xl shadow-indigo-600/30 overflow-hidden">
              {formData.picture ? (
                <img src={formData.picture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0)
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold">
                <i className="fas fa-camera"></i>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange}
            />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-white text-2xl tracking-tighter uppercase truncate">{profile.name}</h4>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1 truncate">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Identification</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 outline-none font-black text-white shadow-inner text-base focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] px-2">Currency Engine</label>
            <div className="relative">
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 outline-none font-black text-white shadow-inner text-base appearance-none focus:border-indigo-500/50 transition-colors"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
              <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none text-xs"></i>
            </div>
          </div>
          <button
            onClick={() => onUpdate(formData)}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all mt-4 hover:bg-indigo-500"
          >
            Update Profile
          </button>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 font-black rounded-[2rem] uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-rose-500/20"
      >
        Terminate Session
      </button>
    </div>
  );
};

export default Settings;
