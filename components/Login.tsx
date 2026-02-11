
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
              { theme: "outline", size: "large", width: "100%", shape: "pill" }
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/40 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-white relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl mb-6 shadow-xl shadow-indigo-100">
            <i className="fas fa-wallet"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">FinTrack Pro</h1>
          <p className="text-slate-500 font-medium">Smart Finance for the Modern Age</p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Get Started</h2>
            
            <button 
              onClick={handleGuestLogin}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-full font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 mb-6"
            >
              <i className="fas fa-rocket"></i> Continue as Guest
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Or login with</span>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>

            <div id="googleBtn" className="w-full min-h-[50px] flex justify-center overflow-hidden"></div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xs">
                <i className="fas fa-tools"></i>
              </div>
              <p className="text-[10px] text-amber-700 font-black leading-tight uppercase tracking-tight">
                Developer Configuration
              </p>
            </div>
            <p className="text-[10px] text-amber-600 leading-relaxed">
              If Google Login shows an "Origin Error", copy this URL and add it to your Authorized JavaScript Origins in the Google Console:<br/>
              <code className="bg-amber-100/50 px-1.5 py-0.5 rounded text-amber-800 font-bold block mt-1 break-all">{window.location.origin}</code>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl mx-auto flex items-center justify-center mb-2">
                <i className="fas fa-shield-alt"></i>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Secure</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl mx-auto flex items-center justify-center mb-2">
                <i className="fas fa-bolt"></i>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Fast</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl mx-auto flex items-center justify-center mb-2">
                <i className="fas fa-user-secret"></i>
              </div>
              <p className="text-[10px] font-bold text-slate-400">Private</p>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          By continuing you agree to our <br/>
          <span className="text-indigo-500 cursor-pointer">Terms</span> & <span className="text-indigo-500 cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
