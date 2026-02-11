
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
                theme: "outline", 
                size: "medium", 
                width: 260, 
                shape: "pill",
                text: "continue_with",
                logo_alignment: "left"
              }
            );
          }
        } catch (e) {
          console.error("GSI Init Error:", e);
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[160px] animate-pulse duration-[10s]"></div>

      <div className="max-w-sm w-full bg-white/5 backdrop-blur-2xl rounded-[3.5rem] p-8 shadow-[0_48px_96px_-16px_rgba(0,0,0,0.8)] border border-white/10 relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl mb-6 shadow-xl shadow-indigo-600/50 transform -rotate-6">
            <i className="fas fa-wallet"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase">MY TRACK PRO</h1>
          <p className="text-indigo-400/60 font-black uppercase tracking-[0.4em] text-[8px]">Intelligence Layer</p>
        </div>

        <div className="space-y-6">
          <div className="bg-black/30 backdrop-blur-xl p-6 rounded-[3rem] border border-white/5 flex flex-col items-center">
            <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Gateway</h2>
            
            <button 
              onClick={handleGuestLogin}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-[1.5rem] font-black text-base hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 mb-6 active:scale-95"
            >
              <i className="fas fa-bolt mr-2"></i> Quick Entry
            </button>

            <div className="w-full flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[7px] font-black uppercase text-white/10 tracking-[0.3em]">Sync</span>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            <div className="w-full flex justify-center py-1 rounded-[2rem] bg-white shadow-lg active:scale-95 transition-transform overflow-hidden">
               <div id="googleBtn" className="relative z-10 w-full flex justify-center min-h-[32px]"></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <i className="fas fa-shield-halved text-white/20 text-sm mb-2"></i>
              <p className="text-[7px] font-black text-white/10 uppercase tracking-widest">Secure</p>
            </div>
            <div>
              <i className="fas fa-microchip text-white/20 text-sm mb-2"></i>
              <p className="text-[7px] font-black text-white/10 uppercase tracking-widest">Neural</p>
            </div>
            <div>
              <i className="fas fa-infinity text-white/20 text-sm mb-2"></i>
              <p className="text-[7px] font-black text-white/10 uppercase tracking-widest">Pro</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
