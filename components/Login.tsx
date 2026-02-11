
import React, { useEffect } from 'react';
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
                theme: "filled_blue", 
                size: "large",
                width: 320,
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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-violet-600/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      <div className="absolute top-[30%] left-[40%] w-1 h-1 bg-white rounded-full shadow-[0_0_100px_50px_rgba(255,255,255,0.05)]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] mb-8 transform hover:scale-105 transition-transform duration-500">
            <i className="fas fa-layer-group text-white text-3xl"></i>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
            MyTrack <span className="text-indigo-500">Pro</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em]">Financial Sovereignty</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-white text-lg font-black tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Identify to continue</p>
          </div>

          <div className="space-y-4">
            <div id="googleBtn" className="flex justify-center transition-opacity hover:opacity-90 active:scale-[0.98]"></div>
            
            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Or</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <button 
              onClick={handleGuestLogin}
              className="w-full py-4.5 px-8 bg-white/5 hover:bg-white/10 text-white rounded-full font-black text-sm transition-all border border-white/5 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <i className="fas fa-user-secret text-slate-400 group-hover:text-indigo-400 transition-colors"></i>
              Continue as Guest
            </button>
          </div>

          <div className="pt-4 flex justify-between px-2">
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <i className="fas fa-bolt-lightning text-xs text-indigo-400"></i>
              <span className="text-[7px] font-black text-white uppercase tracking-tighter">Fast</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <i className="fas fa-fingerprint text-xs text-indigo-400"></i>
              <span className="text-[7px] font-black text-white uppercase tracking-tighter">Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 opacity-40">
              <i className="fas fa-brain text-xs text-indigo-400"></i>
              <span className="text-[7px] font-black text-white uppercase tracking-tighter">Smart</span>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em]">
          Version 2.5 • Powered by NanoAI
        </p>
      </div>
    </div>
  );
};

export default Login;
