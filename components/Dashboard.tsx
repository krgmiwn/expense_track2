
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, AccountType } from '../types';
import { getFinancialAdvice, parseNeuralCommand } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd }) => {
  const [advice, setAdvice] = useState<string>('System ready.');
  const [isAdding, setIsAdding] = useState(false);
  const [neuralInput, setNeuralInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [form, setForm] = useState({
    amount: 0, category: 'Other', type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    accountId: 'BANK' as AccountType, date: new Date().toISOString(), note: ''
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
    <div className="space-y-2">
      {/* Nano Command Center */}
      <div className="bg-slate-900 border border-white/5 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <span className="text-[7px] font-black text-white/30 tracking-[0.3em] uppercase">Liquidity</span>
          <span className="text-xl font-black text-white tracking-tighter">{symbol}{balance.toLocaleString()}</span>
        </div>
        <form onSubmit={handleNeural} className="relative flex items-center bg-black/40 rounded-lg p-0.5">
          <i className={`fas fa-${isProcessing ? 'circle-notch animate-spin' : 'brain'} absolute left-2 text-[8px] text-indigo-500`}></i>
          <input 
            type="text" placeholder="Neural: 'Food 10 Bank'" 
            value={neuralInput} onChange={e => setNeuralInput(e.target.value)}
            className="w-full bg-transparent text-white px-6 py-1.5 text-[9px] font-bold outline-none"
          />
        </form>
      </div>

      {/* Micro Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { setForm(f => ({ ...f, type: 'INCOME' })); setIsAdding(true); }} className="bg-indigo-600 text-white py-2 rounded-lg text-[8px] font-black uppercase tracking-widest">+ Fund</button>
        <button onClick={() => { setForm(f => ({ ...f, type: 'EXPENSE' })); setIsAdding(true); }} className="bg-slate-800 text-white/60 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest">- Reduce</button>
      </div>

      {/* Horizontal Nano Scroll */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {state.accounts.map(acc => (
          <div key={acc.id} className="flex-shrink-0 flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-full px-2 py-1">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-tighter">{acc.name}</span>
            <span className="text-[8px] font-bold text-white/80">{symbol}{acc.balance.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* AI Pulse Mini */}
      <div className="bg-slate-900/40 rounded-xl p-2 flex gap-2 items-center border border-white/5">
        <i className="fas fa-robot text-[7px] text-indigo-500"></i>
        <p className="text-[8px] text-white/40 leading-tight truncate">"{advice}"</p>
      </div>

      {/* Trajectory */}
      <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
         <span className="text-[7px] font-black text-white/20 uppercase w-12">Trend</span>
         <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[70%]" /></div>
      </div>

      {/* Mini Entry Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-[240px] p-4 space-y-4">
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{form.type}</span>
               <button onClick={() => setIsAdding(false)} className="text-white/20"><i className="fas fa-times text-[10px]"></i></button>
            </div>
            <input 
              type="number" required autoFocus 
              value={form.amount || ''} 
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
              className="w-full bg-black/40 rounded-lg p-3 text-xl font-black text-white outline-none border border-white/5" 
              placeholder="0" 
            />
            <div className="grid grid-cols-3 gap-1">
               {state.accounts.map(a => (
                 <button key={a.id} type="button" onClick={() => setForm({...form, accountId: a.id})} className={`p-1.5 rounded-md text-[6px] font-black border ${form.accountId === a.id ? 'bg-indigo-600 border-indigo-600' : 'bg-black border-white/5 text-white/20'}`}>{a.name}</button>
               ))}
            </div>
            <button onClick={() => { onAdd(form); setIsAdding(false); }} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase">Post</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;