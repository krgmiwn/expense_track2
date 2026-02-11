
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Transaction, ScheduledTransaction, UserProfile, Account, AccountType, Frequency } from './types';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Scheduled from './components/Scheduled';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

const INITIAL_ACCOUNTS: Account[] = [
  { id: 'BANK', name: 'BANK', balance: 15000, icon: 'university', color: 'bg-blue-600' },
  { id: 'BKASH', name: 'BKASH', balance: 5000, icon: 'mobile-alt', color: 'bg-pink-500' },
  { id: 'NAGAD', name: 'NAGAD', balance: 2500, icon: 'coins', color: 'bg-orange-500' },
  { id: 'ROCKET', name: 'ROCKET', balance: 1200, icon: 'rocket', color: 'bg-purple-600' },
  { id: 'CARD', name: 'CARD', balance: 0, icon: 'credit-card', color: 'bg-slate-700' },
];

const INITIAL_STATE: AppState = {
  transactions: [],
  scheduled: [],
  accounts: INITIAL_ACCOUNTS,
  profile: {
    name: 'User',
    email: '',
    currency: 'BDT',
    isAuthenticated: false
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('track_nano_v1');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'scheduled' | 'settings'>('dashboard');

  useEffect(() => {
    localStorage.setItem('track_nano_v1', JSON.stringify(state));
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

  if (!state.profile.isAuthenticated) {
    return <Login onLogin={(u) => setState(p => ({ ...p, profile: { ...u, isAuthenticated: true } }))} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar p-2 pb-16">
        <div className="max-w-md mx-auto space-y-2">
          <header className="flex justify-between items-center px-1 h-6">
            <span className="text-[10px] font-black text-indigo-500 tracking-tighter uppercase">{activeTab}</span>
            <span className="text-[8px] font-bold text-slate-700">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
          </header>
          
          {activeTab === 'dashboard' && <Dashboard state={state} onAdd={addTransaction} onAddScheduled={() => {}} onNavigateToScheduled={() => setActiveTab('scheduled')} />}
          {activeTab === 'history' && <History transactions={state.transactions} onDelete={(id) => setState(p => ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }))} currency={state.profile.currency} />}
          {activeTab === 'scheduled' && <Scheduled scheduled={state.scheduled} onAdd={() => {}} onDelete={() => {}} currency={state.profile.currency} />}
          {activeTab === 'settings' && <Settings profile={state.profile} onUpdate={(p) => setState(s => ({ ...s, profile: { ...s.profile, ...p } }))} onLogout={() => setState(INITIAL_STATE)} />}
        </div>
      </main>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={state.profile} />
    </div>
  );
};

export default App;