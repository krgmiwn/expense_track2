
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, AccountType } from '../types';
import { getFinancialAdvice, parseNeuralCommand, askAI } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd }) => {
  const [advice, setAdvice] = useState<string>('Initializing Neural Link...');
  const [isAdding, setIsAdding] = useState(false);
  const [neuralInput, setNeuralInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Oracle State
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);
  
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
  const formattedBalance = useMemo(() => `${symbol}${balance.toLocaleString()}`, [symbol, balance]);

  // Dynamic font size logic based on character length
  const balanceFontSize = useMemo(() => {
    const len = formattedBalance.length;
    if (len <= 7) return 'text-5xl';
    if (len <= 10) return 'text-4xl';
    if (len <= 13) return 'text-3xl';
    if (len <= 16) return 'text-2xl';
    return 'text-xl';
  }, [formattedBalance]);

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

  const handleOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;
    setIsOracleThinking(true);
    setOracleAnswer(null);
    const answer = await askAI(oracleQuery, state);
    setOracleAnswer(answer);
    setIsOracleThinking(false);
    setOracleQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Primary Cockpit */}
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-black text-white/30 tracking-[0.5em] uppercase">Liquidity</span>
          <span className={`${balanceFontSize} font-black text-white tracking-tighter truncate leading-none transition-all duration-300`}>
            {formattedBalance}
          </span>
        </div>
        <form onSubmit={handleNeural} className="relative flex items-center bg-black/50 rounded-2xl p-1 border border-white/5">
          <i className={`fas fa-${isProcessing ? 'circle-notch animate-spin' : 'keyboard'} absolute left-4 text-[14px] text-indigo-500`}></i>
          <input 
            type="text" placeholder="Neural Entry: 'Dinner 20 Bank'" 
            value={neuralInput} onChange={e => setNeuralInput(e.target.value)}
            className="w-full bg-transparent text-white px-12 py-4 text-sm font-bold outline-none"
          />
        </form>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-5">
        <button onClick={() => { setForm(f => ({ ...f, type: 'INCOME' })); setIsAdding(true); }} className="bg-indigo-600 text-white py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all">+ Add Fund</button>
        <button onClick={() => { setForm(f => ({ ...f, type: 'EXPENSE' })); setIsAdding(true); }} className="bg-slate-800 text-white py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all">- Costing</button>
      </div>

      {/* Activity Visual */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-6 h-52 shadow-inner">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">Pulse</h2>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
        </div>
        <ResponsiveContainer width="100%" height="70%">
          <AreaChart data={graphData}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#818cf8" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '11px' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Intro & Advice */}
      <div className="bg-indigo-600/10 rounded-[2.5rem] p-6 flex gap-5 items-center border border-indigo-500/20 shadow-xl">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40">
          <i className="fas fa-sparkles text-white text-lg"></i>
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-indigo-100/90 leading-relaxed font-semibold italic">"{advice}"</p>
        </div>
      </div>

      {/* AI ORACLE: ASK AI Section */}
      <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
        <div className="px-2">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">AI Oracle</h2>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Ask for tips or insights</p>
        </div>
        
        <form onSubmit={handleOracle} className="relative flex items-center bg-black/40 rounded-2xl p-1 border border-white/10">
          <i className={`fas fa-${isOracleThinking ? 'spinner animate-spin' : 'comment-dots'} absolute left-4 text-[14px] text-indigo-400`}></i>
          <input 
            type="text" 
            placeholder="Ask about saving, investing..." 
            value={oracleQuery} 
            onChange={e => setOracleQuery(e.target.value)}
            className="w-full bg-transparent text-white px-12 py-4 text-xs font-bold outline-none"
            disabled={isOracleThinking}
          />
          <button type="submit" disabled={isOracleThinking} className="p-3 mr-1 bg-indigo-600/20 rounded-xl hover:bg-indigo-600/40 transition-colors">
            <i className="fas fa-arrow-right text-indigo-400 text-xs"></i>
          </button>
        </form>

        {oracleAnswer && (
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-300">
             <div className="flex items-start gap-3">
               <i className="fas fa-robot text-indigo-500 text-sm mt-1"></i>
               <p className="text-[11px] text-white/80 leading-relaxed font-medium">{oracleAnswer}</p>
             </div>
             <button onClick={() => setOracleAnswer(null)} className="mt-3 text-[9px] font-black text-indigo-400 uppercase tracking-widest">Clear Answer</button>
          </div>
        )}
      </div>

      {/* Account Matrix */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
        {state.accounts.map(acc => (
          <div key={acc.id} className="flex-shrink-0 flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 shadow-sm active:bg-white/10 transition-colors">
            <span className="text-[11px] font-black text-white/40 uppercase tracking-tighter">{acc.name}</span>
            <span className="text-[13px] font-black text-white/90">{symbol}{acc.balance.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Entry System */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] w-full max-w-[340px] p-10 space-y-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
               <span className="text-[14px] font-black text-white/40 uppercase tracking-[0.4em]">{form.type}</span>
               <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/30"><i className="fas fa-times"></i></button>
            </div>
            <input 
              type="number" required autoFocus 
              value={form.amount || ''} 
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
              className="w-full bg-black/40 rounded-[2rem] p-8 text-5xl font-black text-white outline-none border border-white/10 text-center" 
              placeholder="0" 
            />
            <div className="grid grid-cols-3 gap-3">
               {state.accounts.map(a => (
                 <button key={a.id} type="button" onClick={() => setForm({...form, accountId: a.id})} className={`p-4 rounded-2xl text-[10px] font-black border transition-all ${form.accountId === a.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-black border-white/5 text-white/20'}`}>{a.name}</button>
               ))}
            </div>
            <button onClick={() => { if(form.amount > 0) onAdd(form); setIsAdding(false); }} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] text-[14px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 active:scale-95">Authorize Flow</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
