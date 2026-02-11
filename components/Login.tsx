
import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [showOriginError, setShowOriginError] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      try {
        const base64Url = response.credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        
        onLogin({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          currency: 'BDT',
          isAuthenticated: true
        });
      } catch (error) {
        console.error("Error decoding Google credential:", error);
      }
    };

    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: "328953328253-qifhee0a8v8pf5u3gaankb48uu8lc1oq.apps.googleusercontent.com", 
            callback: handleCredentialResponse,
            auto_select: false,
            use_fedcm_for_prompt: false,
            itp_support: true,
          });

          const btnParent = document.getElementById("googleBtn");
          if (btnParent) {
            window.google.accounts.id.renderButton(
              btnParent,
              { 
                theme: "outline", // Changed from 'filled_blue' to 'outline' for a full white look
                size: "medium", 
                width: 320, 
                shape: "pill",
                text: "continue_with",
                logo_alignment: "left"
              }
            );
          }
        } catch (e) {
          console.error("GSI Init Error:", e);
          setShowOriginError(true);
        }
      }
    };

    if (window.google && window.google.accounts) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          initGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onLogin]);

  const handleGuestLogin = () => {
    onLogin({
      name: 'Guest User',
      email: 'guest@fintrack.local',
      currency: 'BDT',
      isAuthenticated: true
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Liquid Crystal Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600/30 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[160px] animate-pulse duration-[10s]"></div>

      <div className="max-w-md w-full bg-white/10 backdrop-blur-3xl rounded-[4rem] p-10 shadow-[0_48px_128px_-16px_rgba(0,0,0,0.6)] border border-white/20 relative z-10 animate-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center text-white text-4xl mb-6 shadow-2xl shadow-indigo-500/50 transform -rotate-6">
            <i className="fas fa-wallet"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">FinTrack Pro</h1>
          <p className="text-indigo-200/40 font-black uppercase tracking-[0.4em] text-[10px]">Liquid Crystal Intelligence</p>
        </div>

        <div className="space-y-6">
          <div className="bg-black/20 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white/5 shadow-inner flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 text-center">Identity Portal</h2>
            
            {/* Unified Solid Blue Button Design */}
            <button 
              onClick={handleGuestLogin}
              className="w-full py-5 px-8 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-4 active:scale-95 mb-6"
            >
              <i className="fas fa-bolt"></i> Quick Entry
            </button>

            <div className="w-full flex items-center gap-6 mb-6">
              <div className="h-[1px] flex-1 bg-white/10"></div>
              <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Cloud Sync</span>
              <div className="h-[1px] flex-1 bg-white/10"></div>
            </div>

            {/* Google Button Container - White Background and Theme set to Outline */}
            <div className="w-full flex justify-center py-1 px-1 rounded-[2.5rem] bg-white shadow-xl relative group overflow-hidden transition-transform active:scale-95">
               <div id="googleBtn" className="relative z-10 w-full flex justify-center min-h-[32px]"></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-white/5 text-white/40 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-white/5">
                <i className="fas fa-lock text-sm"></i>
              </div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Secure</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white/5 text-white/40 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-white/5">
                <i className="fas fa-brain text-sm"></i>
              </div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Neural</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white/5 text-white/40 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-white/5">
                <i className="fas fa-sync text-sm"></i>
              </div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Live</p>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-[9px] text-white/10 font-black uppercase tracking-[0.4em] leading-loose">
          Secure Encrypted Transaction Layer <br/>
          <span className="text-indigo-400/40 hover:text-indigo-300 transition-colors cursor-pointer">Privacy Protocol v3.5</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
