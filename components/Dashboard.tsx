
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, AccountType, Frequency } from '../types';
import { getFinancialAdvice, parseNeuralCommand, askAI } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
  onUpdateAccountBalance: (accountId: AccountType, newBalance: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd, onAddScheduled, onUpdateAccountBalance }) => {
  const [advice, setAdvice] = useState<string>('Initializing Neural Link...');
  const [isAdding, setIsAdding] = useState(false);
  const [neuralInput, setNeuralInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Account Editing State
  const [editingAccountId, setEditingAccountId] = useState<AccountType | null>(null);
  const [tempBalance, setTempBalance] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Oracle State
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleAnswer, setOracleAnswer] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);
  
  // New: Scheduling Toggle State
  const [isPrescheduling, setIsPrescheduling] = useState(false);
  
  const [form, setForm] = useState({
    amount: 0, 
    category: 'Other', 
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    accountId: 'BANK' as AccountType, 
    date: new Date().toISOString().split('T')[0], 
    note: '',
    frequency: 'MONTHLY' as Frequency
  });

  useEffect(() => {
    const fetch = async () => setAdvice(await getFinancialAdvice(state));
    fetch();
  }, [state.transactions.length]);

  const symbol = CURRENCIES.find(c => c.code === state.profile.currency)?.symbol || '$';
  const balance = useMemo(() => state.accounts.reduce((s, a) => s + a.balance, 0), [state.accounts]);
  const formattedBalance = useMemo(() => `${symbol}${balance.toLocaleString()}`, [symbol, balance]);

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

  const startEditing = (accId: AccountType, currentVal: number) => {
    setEditingAccountId(accId);
    setTempBalance(currentVal.toString());
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const saveBalance = () => {
    if (editingAccountId && tempBalance !== '') {
      onUpdateAccountBalance(editingAccountId, parseFloat(tempBalance));
    }
    setEditingAccountId(null);
  };

  const handleSubmitEntry = () => {
    if (form.amount <= 0) return;

    if (isPrescheduling) {
      onAddScheduled({
        amount: form.amount,
        category: form.category,
        type: form.type,
        accountId: form.accountId,
        frequency: form.frequency,
        startDate: form.date,
        note: form.note || `Scheduled ${form.type.toLowerCase()}`
      });
    } else {
      onAdd({
        amount: form.amount,
        category: form.category,
        type: form.type,
        accountId: form.accountId,
        date: new Date(form.date).toISOString(),
        note: form.note
      });
    }
    setIsAdding(false);
    setIsPrescheduling(false);
  };

  const getAccountIcon = (id: string) => {
    switch (id) {
      case 'BANK': return <i className="fas fa-university"></i>;
      case 'BKASH': return <i className="fas fa-mobile-alt"></i>;
      case 'NAGAD': return <i className="fas fa-coins"></i>;
      case 'ROCKET': return <i className="fas fa-rocket"></i>;
      case 'CARD': return <i className="fas fa-credit-card"></i>;
      default: return <i className="fas fa-wallet"></i>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hello Greeting Section */}
      <div className="px-1 -mb-4 flex items-center justify-between">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Greetings</p>
          <h2 className="text-xl font-black text-white tracking-tight">Hello, {state.profile.name.split(' ')[0]}</h2>
        </div>
        {state.profile.picture && (
          <img src={state.profile.picture} alt="Profile" className="w-10 h-10 rounded-full border border-white/10 shadow-lg" />
        )}
      </div>

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
            className="w-full bg-transparent text-white px-12 py-4 text-sm font-bold outline-none placeholder-slate-700"
          />
        </form>
      </div>

      {/* Account Matrix */}
      <div className="px-1">
        <div className="flex justify-between items-center mb-4 ml-1">
          <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Vault Allocation</h2>
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Tap to Edit Balance</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {state.accounts.map(acc => (
            <div 
              key={acc.id} 
              onClick={() => editingAccountId !== acc.id && startEditing(acc.id, acc.balance)}
              className={`bg-slate-900 border ${editingAccountId === acc.id ? 'border-indigo-500 shadow-indigo-500/20' : 'border-white/5'} rounded-3xl p-5 flex flex-col gap-3 shadow-lg active:scale-95 transition-all cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${acc.color || 'bg-white/5'} text-white shadow-lg`}>
                  {getAccountIcon(acc.id)}
                </div>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{acc.id}</span>
              </div>
              <div className="mt-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">{acc.name}</p>
                {editingAccountId === acc.id ? (
                  <div className="flex items-center gap-1 border-b border-indigo-500">
                    <span className="text-xl font-black text-indigo-400">{symbol}</span>
                    <input 
                      ref={editInputRef}
                      type="number"
                      value={tempBalance}
                      onChange={(e) => setTempBalance(e.target.value)}
                      onBlur={saveBalance}
                      onKeyDown={(e) => e.key === 'Enter' && saveBalance()}
                      className="w-full bg-transparent text-xl font-black text-white outline-none"
                    />
                  </div>
                ) : (
                  <p className="text-xl font-black text-white tracking-tighter">{symbol}{acc.balance.toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
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
      <div className="bg-indigo-600/10 rounded-[2.5rem] p-6 flex gap-5 items-center border border-indigo-500/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40 relative z-10">
          <i className="fas fa-sparkles text-white text-lg animate-shimmer-sparkle"></i>
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-[12px] text-indigo-100/90 leading-relaxed font-semibold italic">"{advice}"</p>
        </div>
      </div>

      {/* AI ORACLE: ASK AI Section */}
      <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 space-y-4 shadow-xl">
        <div className="px-2">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">AI Oracle</h2>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Direct Neural Inquiry</p>
        </div>
        
        <form onSubmit={handleOracle} className="relative flex items-center bg-black/40 rounded-2xl p-1 border border-white/10">
          <i className={`fas fa-${isOracleThinking ? 'spinner animate-spin' : 'comment-dots'} absolute left-4 text-[14px] text-indigo-400`}></i>
          <input 
            type="text" 
            placeholder="Ask about saving, investing..." 
            value={oracleQuery} 
            onChange={e => setOracleQuery(e.target.value)}
            className="w-full bg-transparent text-white px-12 py-4 text-xs font-bold outline-none placeholder-slate-700"
            disabled={isOracleThinking}
          />
          <button type="submit" disabled={isOracleThinking} className="p-3 mr-1 bg-indigo-600/20 rounded-xl hover:bg-indigo-600/40 transition-colors">
            <i className="fas fa-arrow-right text-indigo-400 text-xs"></i>
          </button>
        </form>

        {oracleAnswer && (
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-2xl p-5 animate-in slide-in-from-top-2 duration-300">
             <div className="flex items-start gap-3">
               <i className="fas fa-robot text-indigo-500 text-sm mt-1 shrink-0"></i>
               <p className="text-[11px] text-white/80 leading-relaxed font-medium">{oracleAnswer}</p>
             </div>
             <button onClick={() => setOracleAnswer(null)} className="mt-3 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Dismiss</button>
          </div>
        )}
      </div>

      {/* Unified Entry System with Prescheduling */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-6 backdrop-blur-xl transition-all duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] w-full max-w-[360px] p-10 space-y-6 shadow-[0_0_80px_rgba(79,70,229,0.2)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
               <div className="flex flex-col">
                 <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.4em]">{form.type}</span>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Manual Authorization</span>
               </div>
               <button onClick={() => { setIsAdding(false); setIsPrescheduling(false); }} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/30 hover:bg-white/10 transition-colors"><i className="fas fa-times"></i></button>
            </div>

            <div className="space-y-4">
              <input 
                type="number" required autoFocus 
                value={form.amount || ''} 
                onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
                className="w-full bg-black/40 rounded-[2rem] p-8 text-5xl font-black text-white outline-none border border-white/10 text-center shadow-inner" 
                placeholder="0" 
              />

              <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Preschedule flow</span>
                <button 
                  onClick={() => setIsPrescheduling(!isPrescheduling)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPrescheduling ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPrescheduling ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {isPrescheduling && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Frequency</label>
                      <select 
                        value={form.frequency}
                        onChange={e => setForm({...form, frequency: e.target.value as Frequency})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none"
                      >
                        <option value="DAILY">DAILY</option>
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="ONCE">ONCE</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Start Date</label>
                      <input 
                        type="date"
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                 {state.accounts.map(a => (
                   <button 
                    key={a.id} type="button" 
                    onClick={() => setForm({...form, accountId: a.id})} 
                    className={`py-3 rounded-xl text-[9px] font-black border transition-all ${form.accountId === a.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-black border-white/5 text-white/30'}`}
                   >
                    {a.name}
                   </button>
                 ))}
              </div>
            </div>

            <button 
              onClick={handleSubmitEntry} 
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] text-[14px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/40 active:scale-95 transition-all hover:bg-indigo-500"
            >
              {isPrescheduling ? 'Deploy Directive' : 'Authorize Flow'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
