
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Transaction, ScheduledTransaction, UserProfile, Account, AccountType, Frequency } from './types';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Scheduled from './components/Scheduled';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'BANK', name: 'Bank', balance: 15000, icon: 'university', color: 'bg-blue-600' },
  { id: 'BKASH', name: 'bKash', balance: 5000, icon: 'mobile-alt', color: 'bg-pink-500' },
  { id: 'NAGAD', name: 'Nagad', balance: 2500, icon: 'coins', color: 'bg-orange-500' },
  { id: 'ROCKET', name: 'Rocket', balance: 1200, icon: 'rocket', color: 'bg-purple-600' },
  { id: 'CARD', name: 'Card', balance: 0, icon: 'credit-card', color: 'bg-slate-700' },
];

const INITIAL_STATE: AppState = {
  transactions: [],
  scheduled: [],
  accounts: INITIAL_ACCOUNTS,
  profile: {
    name: 'Guest User',
    email: '',
    currency: 'BDT',
    isAuthenticated: false
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fintrack_state_v3');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'scheduled' | 'settings'>('dashboard');

  useEffect(() => {
    localStorage.setItem('fintrack_state_v3', JSON.stringify(state));
  }, [state]);

  const handleLogin = (user: UserProfile) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...user, isAuthenticated: true }
    }));
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      profile: { ...INITIAL_STATE.profile, isAuthenticated: false }
    }));
  };

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
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

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => {
      const txToDelete = prev.transactions.find(t => t.id === id);
      if (!txToDelete) return prev;
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === txToDelete.accountId) {
          return { ...acc, balance: txToDelete.type === 'INCOME' ? acc.balance - txToDelete.amount : acc.balance + txToDelete.amount };
        }
        return acc;
      });
      return { ...prev, transactions: prev.transactions.filter(t => t.id !== id), accounts: updatedAccounts };
    });
  }, []);

  const addScheduled = useCallback((stx: Omit<ScheduledTransaction, 'id'>) => {
    const newStx = { ...stx, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, scheduled: [...prev.scheduled, newStx] }));
  }, []);

  const deleteScheduled = useCallback((id: string) => {
    setState(prev => ({ ...prev, scheduled: prev.scheduled.filter(s => s.id !== id) }));
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile: { ...prev.profile, ...profile } }));
  }, []);

  if (!state.profile.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={state.profile} />
      <main className="flex-1 overflow-y-auto no-scrollbar p-3 md:p-6 pb-24 md:pb-6">
        <div className="max-w-md mx-auto space-y-4">
          <header className="flex justify-between items-center px-1">
            <h1 className="text-sm font-black text-white/90 uppercase tracking-tighter">{activeTab}</h1>
            <div className="text-right">
              <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
            </div>
          </header>
          {activeTab === 'dashboard' && <Dashboard state={state} onAdd={addTransaction} onAddScheduled={addScheduled} onNavigateToScheduled={() => setActiveTab('scheduled')} />}
          {activeTab === 'history' && <History transactions={state.transactions} onDelete={deleteTransaction} currency={state.profile.currency} />}
          {activeTab === 'scheduled' && <Scheduled scheduled={state.scheduled} onAdd={addScheduled} onDelete={deleteScheduled} currency={state.profile.currency} />}
          {activeTab === 'settings' && <Settings profile={state.profile} onUpdate={updateProfile} onLogout={handleLogout} />}
        </div>
      </main>
    </div>
  );
};

export default App;