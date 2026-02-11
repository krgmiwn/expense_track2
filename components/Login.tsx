
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
                theme: "outline", 
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Liquid Crystal Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[160px] animate-pulse duration-[10s]"></div>

      <div className="max-w-md w-full bg-white/5 backdrop-blur-3xl rounded-[5rem] p-12 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.8)] border border-white/10 relative z-10 animate-in zoom-in-95 duration-700">
        <div className="text-center mb-12">
          <div className="w-28 h-28 bg-indigo-600 rounded-[3rem] mx-auto flex items-center justify-center text-white text-5xl mb-8 shadow-2xl shadow-indigo-600/50 transform -rotate-6 transition-transform hover:rotate-0 cursor-pointer">
            <i className="fas fa-wallet"></i>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">MY TRACK PRO</h1>
          <p className="text-indigo-400/60 font-black uppercase tracking-[0.5em] text-[10px]">Liquid Crystal Intelligence</p>
        </div>

        <div className="space-y-8">
          <div className="bg-black/30 backdrop-blur-2xl p-10 rounded-[4rem] border border-white/5 shadow-inner flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-10 text-center">Auth Gateway</h2>
            
            <button 
              onClick={handleGuestLogin}
              className="w-full py-6 px-8 bg-indigo-600 text-white rounded-[2.2rem] font-black text-lg hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 active:scale-95 mb-8"
            >
              <i className="fas fa-bolt"></i> Quick Entry
            </button>

            <div className="w-full flex items-center gap-6 mb-8">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black uppercase text-white/10 tracking-[0.4em]">Cloud Sync</span>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            {/* Premium Full White Google Button Wrapper */}
            <div className="w-full flex justify-center py-1 px-1 rounded-[2.5rem] bg-white shadow-[0_12px_40px_-12px_rgba(255,255,255,0.3)] relative group overflow-hidden transition-transform active:scale-95">
               <div id="googleBtn" className="relative z-10 w-full flex justify-center min-h-[36px]"></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 text-center px-4">
            <div>
              <i className="fas fa-shield-halved text-white/20 text-xl mb-3"></i>
              <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Encrypted</p>
            </div>
            <div>
              <i className="fas fa-microchip text-white/20 text-xl mb-3"></i>
              <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Neural</p>
            </div>
            <div>
              <i className="fas fa-infinity text-white/20 text-xl mb-3"></i>
              <p className="text-[8px] font-black text-white/10 uppercase tracking-widest">Stateless</p>
            </div>
          </div>
        </div>

        <p className="mt-14 text-center text-[9px] text-white/10 font-black uppercase tracking-[0.4em] leading-loose">
          Enterprise Financial Intelligence <br/>
          <span className="text-indigo-400/40 hover:text-indigo-300 transition-colors cursor-pointer">System Manifest v3.8</span>
        </p>
      </div>
    </div>
  );
};

export default Login;