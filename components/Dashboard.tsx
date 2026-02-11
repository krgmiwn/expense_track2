
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, AccountType, Frequency } from '../types';
import { getFinancialAdvice, parseNeuralCommand } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd, onAddScheduled }) => {
  const [advice, setAdvice] = useState<string>('Neural sync active.');
  const [isAdding, setIsAdding] = useState(false);
  const [prescheduleMode, setPrescheduleMode] = useState(false);
  const [neuralInput, setNeuralInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [form, setForm] = useState({
    amount: 0, category: 'Other', type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    accountId: 'BANK' as AccountType, date: new Date().toISOString(),
    frequency: 'MONTHLY' as Frequency, startDate: new Date().toISOString().split('T')[0], note: ''
  });

  useEffect(() => {
    const fetch = async () => setAdvice(await getFinancialAdvice(state));
    fetch();
  }, [state.transactions.length]);

  const symbol = CURRENCIES.find(c => c.code === state.profile.currency)?.symbol || '$';
  const balance = useMemo(() => state.accounts.reduce((s, a) => s + a.balance, 0), [state.accounts]);

  const handleNeural = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!neuralInput.trim()) return;
    setIsProcessing(true);
    const parsed = await parseNeuralCommand(neuralInput);
    if (parsed?.amount) {
      onAdd({ ...parsed, date: new Date().toISOString(), note: parsed.note || neuralInput });
      setNeuralInput('');
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-3">
      {/* Ultra-Slim Neural Command */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-1 shadow-lg">
        <form onSubmit={handleNeural} className="relative flex items-center">
          <i className={`fas fa-${isProcessing ? 'circle-notch animate-spin' : 'brain'} absolute left-3 text-[10px] text-indigo-500`}></i>
          <input 
            type="text" placeholder="Neural: 'Lunch 200 Bank'" 
            value={neuralInput} onChange={e => setNeuralInput(e.target.value)}
            className="w-full bg-transparent text-white px-8 py-2.5 text-[10px] font-bold outline-none"
          />
        </form>
      </div>

      {/* Slim-Cockpit Balance Card */}
      <div className="liquid-card-gradient rounded-[1.8rem] p-5 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <p className="text-[7px] font-black uppercase tracking-[0.3em] opacity-60 mb-0.5">Liquidity</p>
            <h2 className="text-3xl font-black tracking-tighter">{symbol}{balance.toLocaleString()}</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setForm(f => ({ ...f, type: 'INCOME' })); setIsAdding(true); }} className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg active:scale-90"><i className="fas fa-plus text-xs"></i></button>
            <button onClick={() => { setForm(f => ({ ...f, type: 'EXPENSE' })); setIsAdding(true); }} className="w-9 h-9 bg-rose-500 rounded-full flex items-center justify-center shadow-lg active:scale-90"><i className="fas fa-minus text-xs"></i></button>
          </div>
        </div>
      </div>

      {/* Micro-Account Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {state.accounts.map(acc => (
          <div key={acc.id} className="flex-shrink-0 flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 py-1.5">
            <div className={`w-4 h-4 ${acc.color} rounded-full flex items-center justify-center text-[7px]`}><i className={`fas fa-${acc.icon}`}></i></div>
            <span className="text-[8px] font-black uppercase text-white/40">{acc.name}</span>
            <span className="text-[9px] font-bold text-white/90">{symbol}{acc.balance.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* AI Pulse Mini */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex gap-3 items-start">
        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg"><i className="fas fa-robot text-[8px] text-white"></i></div>
        <p className="text-[9px] text-white/70 leading-tight italic font-medium">"{advice}"</p>
      </div>

      {/* Trajectory Compact */}
      <div className="bg-white/5 border border-white/5 rounded-[1.8rem] p-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Trajectory</span>
          <span className="text-[7px] font-black uppercase text-emerald-400">Stable</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full"><div className="h-full bg-indigo-500 w-[65%] rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div></div>
      </div>

      {/* Transaction Modal Mobile-Optimized */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white rounded-t-[2.5rem] w-full p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">{form.type} ENTRY</h3>
              <button onClick={() => setIsAdding(false)} className="w-8 h-8 bg-slate-100 rounded-full text-xs text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); if (prescheduleMode) onAddScheduled(form); else onAdd(form); setIsAdding(false); }} className="space-y-4">
              <input type="number" required autoFocus value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} className="w-full bg-slate-50 rounded-2xl p-4 text-3xl font-black text-slate-900 outline-none" placeholder="0" />
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setPrescheduleMode(false)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${!prescheduleMode ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Instant</button>
                <button type="button" onClick={() => setPrescheduleMode(true)} className={`py-2 rounded-lg text-[8px] font-black uppercase transition-all ${prescheduleMode ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Schedule</button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {state.accounts.map(acc => (
                  <button key={acc.id} type="button" onClick={() => setForm({ ...form, accountId: acc.id })} className={`py-2 rounded-lg text-[7px] font-black border transition-all ${form.accountId === acc.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent text-slate-400'}`}>{acc.name}</button>
                ))}
              </div>
              <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Confirm</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;