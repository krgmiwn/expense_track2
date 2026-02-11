
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, AccountType, Frequency } from '../types';
import { getFinancialAdvice, parseNeuralCommand, askAI, checkNeuralStatus } from '../services/geminiService';
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
  const [neuralStatus, setNeuralStatus] = useState<'stable' | 'busy'>('stable');
  
  const isDark = state.profile.theme === 'dark';
  
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

  const aiNickname = state.profile.chatbotNickname || "Oracle";

  // Polling for Neural Server Load
  useEffect(() => {
    const updateStatus = async () => {
      const status = await checkNeuralStatus();
      setNeuralStatus(status);
    };

    updateStatus(); // Initial check
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const cardBg = isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subHeadingColor = isDark ? 'text-white/30' : 'text-slate-400';
  const inputBg = isDark ? 'bg-black/50' : 'bg-slate-100';

  return (
    <div className="space-y-6">
      {/* Hello Greeting Section */}
      <div className="px-1 -mb-4 flex items-center justify-between">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Greetings</p>
          <h2 className={`text-xl font-black tracking-tight ${headingColor}`}>Hello, {state.profile.name.split(' ')[0]}</h2>
        </div>
        {state.profile.picture && (
          <img src={state.profile.picture} alt="Profile" className={`w-10 h-10 rounded-full border shadow-lg ${isDark ? 'border-white/10' : 'border-slate-200'}`} />
        )}
      </div>

      {/* Primary Cockpit */}
      <div className={`${cardBg} border rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden transition-all`}>
        <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[100px] ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`}></div>
        <div className="flex flex-col gap-2">
          <span className={`text-[12px] font-black tracking-[0.5em] uppercase ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Liquidity</span>
          <span className={`${balanceFontSize} font-black tracking-tighter truncate leading-none transition-all duration-300 ${headingColor}`}>
            {formattedBalance}
          </span>
        </div>
        <form onSubmit={handleNeural} className={`relative flex items-center ${inputBg} rounded-2xl p-1 border transition-all duration-500 ${isProcessing ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]' : (isDark ? 'border-white/5' : 'border-slate-200')}`}>
          <i className={`fas fa-${isProcessing ? 'circle-notch animate-spin' : 'keyboard'} absolute left-4 text-[14px] text-indigo-500`}></i>
          <input 
            type="text" placeholder={`Neural Entry: 'Dinner 20 Bank'`} 
            value={neuralInput} onChange={e => setNeuralInput(e.target.value)}
            className={`w-full bg-transparent px-12 py-4 text-sm font-bold outline-none ${isDark ? 'text-white placeholder-slate-700' : 'text-slate-900 placeholder-slate-300'}`}
          />
        </form>
      </div>

      {/* Account Matrix */}
      <div className="px-1">
        <div className="flex justify-between items-center mb-4 ml-1">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.4em] ${subHeadingColor}`}>Vault Allocation</h2>
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Tap to Edit Balance</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {state.accounts.map(acc => (
            <div 
              key={acc.id} 
              onClick={() => editingAccountId !== acc.id && startEditing(acc.id, acc.balance)}
              className={`${cardBg} border ${editingAccountId === acc.id ? 'border-indigo-500 shadow-indigo-500/20' : (isDark ? 'border-white/5' : 'border-slate-200')} rounded-3xl p-5 flex flex-col gap-3 shadow-lg active:scale-95 transition-all cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${acc.color || 'bg-white/5'} text-white shadow-lg`}>
                  {getAccountIcon(acc.id)}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-slate-300'}`}>{acc.id}</span>
              </div>
              <div className="mt-1">
                <p className={`text-[10px] font-bold uppercase tracking-tighter mb-0.5 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{acc.name}</p>
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
                      className={`w-full bg-transparent text-xl font-black outline-none ${headingColor}`}
                    />
                  </div>
                ) : (
                  <p className={`text-xl font-black tracking-tighter ${headingColor}`}>{symbol}{acc.balance.toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-5">
        <button onClick={() => { setForm(f => ({ ...f, type: 'INCOME' })); setIsAdding(true); }} className="bg-indigo-600 text-white py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all hover:bg-indigo-500">+ Add Fund</button>
        <button onClick={() => { setForm(f => ({ ...f, type: 'EXPENSE' })); setIsAdding(true); }} className={`${isDark ? 'bg-slate-800' : 'bg-slate-200 text-slate-700'} py-5 rounded-3xl text-[12px] font-black uppercase tracking-widest active:scale-95 transition-all`}>- Costing</button>
      </div>

      {/* Activity Visual */}
      <div className={`${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'} border rounded-[2.5rem] p-6 h-52 shadow-inner transition-all`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-sm font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Pulse</h2>
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
              contentStyle={{ backgroundColor: isDark ? '#020617' : '#fff', border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0', borderRadius: '16px', fontSize: '11px' }}
              itemStyle={{ color: isDark ? '#fff' : '#0f172a', fontWeight: 'bold' }}
              labelStyle={{ display: 'none' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Intro & Advice */}
      <div className={`${isDark ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} rounded-[2.5rem] p-6 flex gap-5 items-center border shadow-xl overflow-hidden relative`}>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/40 relative z-10">
          <i className="fas fa-sparkles text-white text-lg animate-shimmer-sparkle"></i>
        </div>
        <div className="flex-1 relative z-10">
          <p className={`text-[12px] leading-relaxed font-semibold italic ${isDark ? 'text-indigo-100/90' : 'text-indigo-800'}`}>"{advice}"</p>
        </div>
      </div>

      {/* AI ORACLE: ASK AI Section */}
      <div className={`${cardBg} border rounded-[2.5rem] p-6 space-y-4 shadow-xl relative overflow-hidden transition-all`}>
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-500/10'}`}></div>
        <div className="px-2 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-2">
            <div>
              <h2 className={`text-sm font-black uppercase tracking-[0.3em] ${headingColor}`}>{aiNickname}</h2>
              <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${subHeadingColor}`}>Direct Neural Inquiry</p>
            </div>
            {/* Server Load Indicator Dot */}
            <div 
              className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-500 ${neuralStatus === 'stable' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`}
              title={neuralStatus === 'stable' ? 'Neural Link Stable' : 'Neural Link Busy'}
            ></div>
          </div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]"></div>
        </div>
        
        <form onSubmit={handleOracle} className={`relative flex items-center ${inputBg} rounded-2xl p-1 border transition-all duration-300 ${isOracleThinking ? 'border-indigo-500/50' : (isDark ? 'border-white/10' : 'border-slate-200')}`}>
          <i className={`fas fa-${isOracleThinking ? 'spinner animate-spin' : 'comment-dots'} absolute left-4 text-[14px] text-indigo-400`}></i>
          <input 
            type="text" 
            placeholder={`Query ${aiNickname}...`} 
            value={oracleQuery} 
            onChange={e => setOracleQuery(e.target.value)}
            className={`w-full bg-transparent px-12 py-4 text-xs font-bold outline-none ${isDark ? 'text-white placeholder-slate-700' : 'text-slate-900 placeholder-slate-300'}`}
            disabled={isOracleThinking}
          />
          <button type="submit" disabled={isOracleThinking} className="p-3 mr-1 bg-indigo-600/20 rounded-xl hover:bg-indigo-600/40 transition-colors">
            <i className="fas fa-arrow-right text-indigo-400 text-xs"></i>
          </button>
        </form>

        {oracleAnswer && (
          <div className={`${isDark ? 'bg-indigo-900/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'} border rounded-2xl p-5 animate-in slide-in-from-top-2 duration-300`}>
             <div className="flex items-start gap-3">
               <i className="fas fa-robot text-indigo-500 text-sm mt-1 shrink-0"></i>
               <p className={`text-[11px] leading-relaxed font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>{oracleAnswer}</p>
             </div>
             <button onClick={() => setOracleAnswer(null)} className="mt-3 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Dismiss</button>
          </div>
        )}
      </div>

      {/* Unified Entry System with Prescheduling */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-6 backdrop-blur-xl transition-all duration-300">
          <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} border border-white/10 rounded-[3.5rem] w-full max-w-[360px] p-10 space-y-6 shadow-[0_0_80px_rgba(79,70,229,0.2)] animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex justify-between items-center">
               <div className="flex flex-col">
                 <span className={`text-[12px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{form.type}</span>
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Manual Authorization</span>
               </div>
               <button onClick={() => { setIsAdding(false); setIsPrescheduling(false); }} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-white/5 text-white/30 hover:bg-white/10' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><i className="fas fa-times"></i></button>
            </div>

            <div className="space-y-4">
              <input 
                type="number" required autoFocus 
                value={form.amount || ''} 
                onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
                className={`w-full ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'} rounded-[2rem] p-8 text-5xl font-black outline-none border text-center shadow-inner`} 
                placeholder="0" 
              />

              <div className={`flex items-center justify-between p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Preschedule flow</span>
                <button 
                  onClick={() => setIsPrescheduling(!isPrescheduling)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isPrescheduling ? 'bg-indigo-600' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isPrescheduling ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {isPrescheduling && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={`text-[8px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Frequency</label>
                      <select 
                        value={form.frequency}
                        onChange={e => setForm({...form, frequency: e.target.value as Frequency})}
                        className={`w-full ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'} border rounded-xl p-3 text-[10px] font-black outline-none`}
                      >
                        <option value="DAILY">DAILY</option>
                        <option value="WEEKLY">WEEKLY</option>
                        <option value="MONTHLY">MONTHLY</option>
                        <option value="ONCE">ONCE</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={`text-[8px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Start Date</label>
                      <input 
                        type="date"
                        value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        className={`w-full ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'} border rounded-xl p-3 text-[10px] font-black outline-none`}
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
                    className={`py-3 rounded-xl text-[9px] font-black border transition-all ${form.accountId === a.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : (isDark ? 'bg-black border-white/5 text-white/30' : 'bg-slate-100 border-slate-200 text-slate-400')}`}
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
