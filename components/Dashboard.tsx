
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, AccountType } from '../types';
import { getFinancialAdvice, parseNeuralCommand } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd }) => {
  const [advice, setAdvice] = useState<string>('Syncing...');
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

  const graphData = useMemo(() => {
    const days = 7;
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTotal = state.transactions
        .filter(t => t.date.split('T')[0] === dateStr)
        .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
      data.push({ name: d.toLocaleDateString(undefined, { weekday: 'short' }), value: dayTotal });
    }
    return data;
  }, [state.transactions]);

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
    <div className="space-y-3 pb-4">
      {/* Command Center */}
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl">
        <div className="flex justify-between items-baseline">
          <span className="text-[8px] font-black text-white/30 tracking-[0.3em] uppercase">Liquidity</span>
          <span className="text-2xl font-black text-white tracking-tighter">{symbol}{balance.toLocaleString()}</span>
        </div>
        <form onSubmit={handleNeural} className="relative flex items-center bg-black/40 rounded-xl p-1">
          <i className={`fas fa-${isProcessing ? 'circle-notch animate-spin' : 'brain'} absolute left-3 text-[9px] text-indigo-500`}></i>
          <input 
            type="text" placeholder="Neural: 'Food 50 Bank'" 
            value={neuralInput} onChange={e => setNeuralInput(e.target.value)}
            className="w-full bg-transparent text-white px-8 py-2 text-[10px] font-bold outline-none"
          />
        </form>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setForm(f => ({ ...f, type: 'INCOME' })); setIsAdding(true); }} className="bg-indigo-600 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform">+ Inflow</button>
        <button onClick={() => { setForm(f => ({ ...f, type: 'EXPENSE' })); setIsAdding(true); }} className="bg-slate-800 text-white/60 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform">- Outflow</button>
      </div>

      {/* Activity Graph */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 h-32">
        <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Activity Pulse</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '8px' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ display: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Account Strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {state.accounts.map(acc => (
          <div key={acc.id} className="flex-shrink-0 flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-3 py-1.5 shadow-sm">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">{acc.name}</span>
            <span className="text-[9px] font-bold text-white/90">{symbol}{acc.balance.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* AI Mini */}
      <div className="bg-slate-900/40 rounded-2xl p-3 flex gap-3 items-center border border-white/5">
        <i className="fas fa-robot text-[9px] text-indigo-500"></i>
        <p className="text-[9px] text-white/50 leading-tight italic">"{advice}"</p>
      </div>

      {/* Entry Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-[280px] p-6 space-y-5 shadow-2xl scale-110">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{form.type}</span>
               <button onClick={() => setIsAdding(false)} className="text-white/20"><i className="fas fa-times text-[12px]"></i></button>
            </div>
            <input 
              type="number" required autoFocus 
              value={form.amount || ''} 
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
              className="w-full bg-black/40 rounded-xl p-4 text-3xl font-black text-white outline-none border border-white/10" 
              placeholder="0" 
            />
            <div className="grid grid-cols-3 gap-1.5">
               {state.accounts.map(a => (
                 <button key={a.id} type="button" onClick={() => setForm({...form, accountId: a.id})} className={`p-2 rounded-lg text-[7px] font-black border transition-all ${form.accountId === a.id ? 'bg-indigo-600 border-indigo-600' : 'bg-black border-white/5 text-white/30'}`}>{a.name}</button>
               ))}
            </div>
            <button onClick={() => { if(form.amount > 0) onAdd(form); setIsAdding(false); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/30">Confirm Entry</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
