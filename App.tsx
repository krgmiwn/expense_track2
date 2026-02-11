
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Transaction, ScheduledTransaction, UserProfile, CURRENCIES } from './types';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Scheduled from './components/Scheduled';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';

const INITIAL_STATE: AppState = {
  transactions: [
    { id: '1', amount: 5000, category: 'Salary', type: 'INCOME', date: new Date().toISOString(), note: 'Monthly pay' },
    { id: '2', amount: 120, category: 'Food', type: 'EXPENSE', date: new Date().toISOString(), note: 'Dinner out' },
  ],
  scheduled: [],
  profile: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    currency: 'BDT'
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('fintrack_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'scheduled' | 'settings'>('dashboard');

  useEffect(() => {
    localStorage.setItem('fintrack_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    const newTransactions: Transaction[] = [];
    const updatedScheduled = state.scheduled.map(s => {
      const lastDate = s.lastProcessed || s.startDate;
      if (lastDate < today && s.frequency === 'DAILY') {
        newTransactions.push({
          id: Math.random().toString(36).substr(2, 9),
          amount: s.amount,
          category: s.category,
          type: s.type,
          date: new Date().toISOString(),
          note: `Auto-scheduled: ${s.note || s.category}`
        });
        updated = true;
        return { ...s, lastProcessed: today };
      }
      return s;
    });

    if (updated) {
      setState(prev => ({
        ...prev,
        transactions: [...newTransactions, ...prev.transactions],
        scheduled: updatedScheduled
      }));
    }
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
  }, []);

  const addScheduled = useCallback((stx: Omit<ScheduledTransaction, 'id'>) => {
    const newStx = { ...stx, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, scheduled: [...prev.scheduled, newStx] }));
  }, []);

  const deleteScheduled = useCallback((id: string) => {
    setState(prev => ({ ...prev, scheduled: prev.scheduled.filter(s => s.id !== id) }));
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} onAdd={addTransaction} onNavigateToScheduled={() => setActiveTab('scheduled')} />;
      case 'history':
        return <History transactions={state.transactions} onDelete={deleteTransaction} currency={state.profile.currency} />;
      case 'scheduled':
        return <Scheduled scheduled={state.scheduled} onAdd={addScheduled} onDelete={deleteScheduled} currency={state.profile.currency} />;
      case 'settings':
        return <Settings profile={state.profile} onUpdate={updateProfile} />;
      default:
        return <Dashboard state={state} onAdd={addTransaction} onNavigateToScheduled={() => setActiveTab('scheduled')} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{activeTab.toUpperCase()}</h1>
              <p className="text-slate-400 text-xs font-bold">{state.profile.name}'s FinTrack</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'short' })}</p>
              <p className="text-slate-700 font-bold text-sm">{new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
            </div>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
