
import React, { useEffect } from 'react';
import { UserProfile } from '../types';

// Add global declaration to fix TypeScript errors for the Google Identity Services SDK on the window object
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
    /* global google */
    const handleCredentialResponse = (response: any) => {
      try {
        // Decode JWT to get user info (simplified for demo)
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
          currency: 'BDT'
        });
      } catch (error) {
        console.error("Error decoding Google credential:", error);
      }
    };

    // Initialize Google Sign-In
    const initGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          /**
           * IMPORTANT: You MUST replace this with your actual Client ID 
           * from the Google Cloud Console to fix the "Error 401: invalid_client".
           * Visit: https://console.cloud.google.com/
           */
          client_id: "543781254327-placeholder.apps.googleusercontent.com", 
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
        
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          }
        });
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
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
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 text-center">Secure Access</h2>
            <div id="googleBtn" className="w-full min-h-[50px] flex justify-center"></div>
            <p className="mt-2 text-[9px] text-center text-slate-400 font-bold uppercase tracking-tight">
              Developer: Update Client ID in Google Console
            </p>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-slate-100"></div>
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Trust & Privacy</span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
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
          By signing in you agree to our <br/>
          <span className="text-indigo-500 cursor-pointer">Terms</span> & <span className="text-indigo-500 cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
