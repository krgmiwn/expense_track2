
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Transaction, ScheduledTransaction, UserProfile, Account, AccountType, Frequency } from './types';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Scheduled from './components/Scheduled';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

const SESSION_KEY = 'track_pro_session_v2';
const DATA_PREFIX = 'track_pro_v2_';

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'BANK', name: 'BANK', balance: 0, icon: 'university', color: 'bg-blue-600' },
  { id: 'BKASH', name: 'BKASH', balance: 0, icon: 'mobile-alt', color: 'bg-pink-500' },
  { id: 'NAGAD', name: 'NAGAD', balance: 0, icon: 'coins', color: 'bg-orange-500' },
  { id: 'ROCKET', name: 'ROCKET', balance: 0, icon: 'rocket', color: 'bg-purple-600' },
  { id: 'CARD', name: 'CARD', balance: 0, icon: 'credit-card', color: 'bg-slate-700' },
];

const EMPTY_STATE: AppState = {
  transactions: [],
  scheduled: [],
  accounts: INITIAL_ACCOUNTS,
  profile: {
    name: 'User',
    email: '',
    currency: 'BDT',
    isAuthenticated: false,
    theme: 'dark'
  }
};

const App: React.FC = () => {
  // Initialize state from session if available
  const [state, setState] = useState<AppState>(() => {
    const lastSessionEmail = localStorage.getItem(SESSION_KEY);
    if (lastSessionEmail) {
      const savedData = localStorage.getItem(`${DATA_PREFIX}${lastSessionEmail}`);
      if (savedData) {
        return JSON.parse(savedData);
      }
    }
    return EMPTY_STATE;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'scheduled' | 'settings'>('dashboard');
  const [isDataLoaded, setIsDataLoaded] = useState(() => !!localStorage.getItem(SESSION_KEY));
  const skipSave = useRef(!localStorage.getItem(SESSION_KEY));

  // Handle Login and Data Restoration
  const handleLogin = (user: UserProfile) => {
    const userKey = `${DATA_PREFIX}${user.email}`;
    const savedData = localStorage.getItem(userKey);
    
    localStorage.setItem(SESSION_KEY, user.email);
    
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setState({
        ...parsed,
        profile: { ...user, theme: parsed.profile?.theme || 'dark', isAuthenticated: true }
      });
    } else {
      setState({
        ...EMPTY_STATE,
        profile: { ...user, isAuthenticated: true },
        accounts: INITIAL_ACCOUNTS.map(a => ({ ...a, balance: 0 }))
      });
    }
    
    setIsDataLoaded(true);
    skipSave.current = false;
  };

  // Persist State to Storage whenever it changes
  useEffect(() => {
    if (!skipSave.current && state.profile.isAuthenticated && state.profile.email) {
      const userKey = `${DATA_PREFIX}${state.profile.email}`;
      localStorage.setItem(userKey, JSON.stringify(state));
    }
  }, [state]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 5) };
    setState(prev => {
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === tx.accountId) {
          return { ...acc, balance: tx.type === 'INCOME' ? acc.balance + tx.amount : acc.balance - tx.amount };
        }
        return acc;
      });
      return { ...prev, transactions: [newTx, ...prev.transactions], accounts: updatedAccounts };
    });
  }, []);

  const addScheduledTransaction = useCallback((stx: Omit<ScheduledTransaction, 'id'>) => {
    const newStx = { ...stx, id: Math.random().toString(36).substr(2, 5) };
    setState(prev => ({
      ...prev,
      scheduled: [newStx, ...prev.scheduled]
    }));
  }, []);

  const updateAccountBalance = useCallback((accountId: AccountType, newBalance: number) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(acc => acc.id === accountId ? { ...acc, balance: newBalance } : acc)
    }));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsDataLoaded(false);
    skipSave.current = true;
    setState(EMPTY_STATE);
    setActiveTab('dashboard');
  };

  const theme = state.profile.theme || 'dark';
  const isDark = theme === 'dark';

  if (!state.profile.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-500 overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
        <div className="max-w-md mx-auto space-y-4">
          <header className="flex justify-between items-center px-1 h-12">
            <span className={`text-xl font-black tracking-tighter uppercase ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>
              {new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </span>
          </header>
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              state={state} 
              onAdd={addTransaction} 
              onAddScheduled={addScheduledTransaction} 
              onNavigateToScheduled={() => setActiveTab('scheduled')} 
              onUpdateAccountBalance={updateAccountBalance}
            />
          )}
          {activeTab === 'history' && (
            <History 
              transactions={state.transactions} 
              onDelete={(id) => setState(p => ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }))} 
              currency={state.profile.currency} 
              theme={theme} 
            />
          )}
          {activeTab === 'scheduled' && (
            <Scheduled 
              scheduled={state.scheduled} 
              onAdd={addScheduledTransaction} 
              onDelete={(id) => setState(p => ({ ...p, scheduled: p.scheduled.filter(s => s.id !== id) }))} 
              currency={state.profile.currency} 
              theme={theme} 
            />
          )}
          {activeTab === 'settings' && (
            <Settings 
              profile={state.profile} 
              onUpdate={(p) => setState(s => ({ ...s, profile: { ...s.profile, ...p } }))} 
              onLogout={handleLogout} 
            />
          )}
        </div>
      </main>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={state.profile} />
    </div>
  );
};

export default App;
