
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

  // Process scheduled transactions on load
  useEffect(() => {
    const processScheduled = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let hasChanges = false;
      const newTransactions: Transaction[] = [];
      const updatedScheduled = state.scheduled.map(stx => {
        const startDate = new Date(stx.startDate);
        const lastProcessed = stx.lastProcessed ? new Date(stx.lastProcessed) : null;
        
        let shouldProcess = false;
        
        // Logic to determine if recurring transaction should trigger
        if (startDate <= today) {
          if (!lastProcessed) {
            shouldProcess = true;
          } else {
            const diffDays = Math.floor((today.getTime() - lastProcessed.getTime()) / (1000 * 3600 * 24));
            
            if (stx.frequency === 'DAILY' && diffDays >= 1) shouldProcess = true;
            if (stx.frequency === 'WEEKLY' && diffDays >= 7) shouldProcess = true;
            if (stx.frequency === 'MONTHLY') {
              const months = (today.getFullYear() - lastProcessed.getFullYear()) * 12 + (today.getMonth() - lastProcessed.getMonth());
              if (months >= 1) shouldProcess = true;
            }
          }
        }

        if (shouldProcess) {
          hasChanges = true;
          const tx: Transaction = {
            id: Math.random().toString(36).substr(2, 9),
            amount: stx.amount,
            category: stx.category,
            type: stx.type,
            accountId: stx.accountId,
            date: today.toISOString(),
            note: `[Auto] ${stx.note || stx.category}`
          };
          newTransactions.push(tx);
          return { ...stx, lastProcessed: today.toISOString() };
        }
        return stx;
      });

      if (hasChanges) {
        setState(prev => {
          const updatedAccounts = [...prev.accounts];
          newTransactions.forEach(tx => {
            const idx = updatedAccounts.findIndex(a => a.id === tx.accountId);
            if (idx !== -1) {
              updatedAccounts[idx] = {
                ...updatedAccounts[idx],
                balance: tx.type === 'INCOME' ? updatedAccounts[idx].balance + tx.amount : updatedAccounts[idx].balance - tx.amount
              };
            }
          });

          return {
            ...prev,
            transactions: [...newTransactions, ...prev.transactions],
            scheduled: updatedScheduled,
            accounts: updatedAccounts
          };
        });
      }
    };

    if (state.profile.isAuthenticated) {
      processScheduled();
    }
  }, [state.profile.isAuthenticated]);

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
          return {
            ...acc,
            balance: tx.type === 'INCOME' ? acc.balance + tx.amount : acc.balance - tx.amount
          };
        }
        return acc;
      });

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        accounts: updatedAccounts
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => {
      const txToDelete = prev.transactions.find(t => t.id === id);
      if (!txToDelete) return prev;

      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === txToDelete.accountId) {
          return {
            ...acc,
            balance: txToDelete.type === 'INCOME' ? acc.balance - txToDelete.amount : acc.balance + txToDelete.amount
          };
        }
        return acc;
      });

      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        accounts: updatedAccounts
      };
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            state={state} 
            onAdd={addTransaction} 
            onAddScheduled={addScheduled}
            onNavigateToScheduled={() => setActiveTab('scheduled')} 
          />
        );
      case 'history':
        return <History transactions={state.transactions} onDelete={deleteTransaction} currency={state.profile.currency} />;
      case 'scheduled':
        return <Scheduled scheduled={state.scheduled} onAdd={addScheduled} onDelete={deleteScheduled} currency={state.profile.currency} />;
      case 'settings':
        return <Settings profile={state.profile} onUpdate={updateProfile} onLogout={handleLogout} />;
      default:
        return (
          <Dashboard 
            state={state} 
            onAdd={addTransaction} 
            onAddScheduled={addScheduled}
            onNavigateToScheduled={() => setActiveTab('scheduled')} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden flex-col md:flex-row">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={state.profile} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{activeTab}</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{state.profile.name.split(' ')[0]}'s MY TRACK PRO</p>
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