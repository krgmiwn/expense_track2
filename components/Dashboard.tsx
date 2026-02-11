
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, CATEGORIES, AccountType, Frequency } from '../types';
import { ICONS } from '../constants';
import { getFinancialAdvice } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd, onAddScheduled, onNavigateToScheduled }) => {
  const [advice, setAdvice] = useState<string>('Analyzing your liquidity...');
  const [isAdding, setIsAdding] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  
  const [form, setForm] = useState({
    amount: 0,
    category: 'Other',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    accountId: 'BANK' as AccountType,
    date: new Date().toISOString(),
    frequency: 'MONTHLY' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  useEffect(() => {
    const fetchAdvice = async () => {
      const result = await getFinancialAdvice(state);
      setAdvice(result);
    };
    fetchAdvice();
  }, [state.transactions.length]);

  const currencySymbol = CURRENCIES.find(c => c.code === state.profile.currency)?.symbol || '$';

  const { balance, todayIncome, todayExpenses } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let tInc = 0, tExp = 0;
    
    state.transactions.forEach(t => {
      const isToday = t.date.split('T')[0] === today;
      if (isToday) {
        if (t.type === 'INCOME') tInc += t.amount;
        else tExp += t.amount;
      }
    });

    const totalBalance = state.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return { balance: totalBalance, todayIncome: tInc, todayExpenses: tExp };
  }, [state.transactions, state.accounts]);

  const dailyHistoryData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTxs = state.transactions.filter(t => t.date.split('T')[0] === date);
      const inc = dayTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
      const exp = dayTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
      return {
        name: new Date(date).toLocaleDateString([], { weekday: 'short' }),
        Income: inc,
        Expense: exp,
      };
    });
  }, [state.transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;

    if (isRecurring) {
      onAddScheduled({
        amount: form.amount,
        category: form.category,
        type: form.type,
        accountId: form.accountId,
        frequency: form.frequency,
        startDate: form.startDate,
        note: form.note
      });
    } else {
      onAdd({
        amount: form.amount,
        category: form.category,
        type: form.type,
        accountId: form.accountId,
        date: form.date,
        note: form.note
      });
    }
    
    setIsAdding(false);
    setIsRecurring(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ 
      amount: 0, 
      category: 'Other', 
      type: 'EXPENSE', 
      accountId: 'BANK', 
      date: new Date().toISOString(), 
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      note: '' 
    });
  };

  const openAction = (type: 'INCOME' | 'EXPENSE', recurring: boolean = false) => {
    setForm(prev => ({ 
      ...prev, 
      type, 
      category: type === 'INCOME' ? 'Salary' : 'Food' 
    }));
    setIsRecurring(recurring);
    setIsAdding(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Main Glass Wallet */}
      <div className="liquid-card-gradient rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-700">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.3em] mb-1">Available Capital</p>
              <h2 className="text-6xl font-black tracking-tighter flex items-baseline">
                <span className="text-indigo-200 text-3xl mr-2 font-bold">{currencySymbol}</span>
                {balance.toLocaleString()}
              </h2>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 shadow-xl">
              <i className="fas fa-fingerprint text-2xl"></i>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5 mb-6">
            <button 
              onClick={() => openAction('INCOME')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-5 rounded-3xl text-sm font-black transition-all flex items-center justify-center gap-3 backdrop-blur-md border border-white/10 active:scale-95 group"
            >
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                <i className="fas fa-plus"></i>
              </div>
              Fund Add
            </button>
            <button 
              onClick={() => openAction('EXPENSE')}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-5 rounded-3xl text-sm font-black transition-all flex items-center justify-center gap-3 backdrop-blur-md border border-white/10 active:scale-95 group"
            >
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                <i className="fas fa-minus"></i>
              </div>
              Fund Reduce
            </button>
          </div>

          <div className="grid grid-cols-2 gap-5 mb-8">
            <button 
              onClick={() => openAction('INCOME', true)}
              className="bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-50 px-6 py-4 rounded-3xl text-xs font-black transition-all flex items-center justify-center gap-3 border border-emerald-400/20 active:scale-95"
            >
              <i className="fas fa-bolt-auto text-emerald-300"></i> Auto Inflow
            </button>
            <button 
              onClick={() => openAction('EXPENSE', true)}
              className="bg-rose-400/20 hover:bg-rose-400/30 text-rose-50 px-6 py-4 rounded-3xl text-xs font-black transition-all flex items-center justify-center gap-3 border border-rose-400/20 active:scale-95"
            >
              <i className="fas fa-clock text-rose-300"></i> Auto Outflow
            </button>
          </div>

          <button 
            onClick={onNavigateToScheduled}
            className="w-full bg-black/20 hover:bg-black/40 py-4 rounded-2xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 border border-white/5"
          >
            <i className="fas fa-layer-group"></i> Manage Automated Flow
          </button>
        </div>
        
        {/* Animated Orbs for Liquid Crystal effect */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-300/20 rounded-full blur-[80px]"></div>
      </div>

      {/* Capital Sources */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white/50 px-2">Liquid Accounts</h3>
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-2 px-2">
          {state.accounts.map((acc) => (
            <div 
              key={acc.id} 
              className="flex-shrink-0 w-48 liquid-glass rounded-[2.5rem] p-6 flex flex-col items-center text-center transition-all hover:-translate-y-2 active:scale-95 group"
            >
              <div className={`w-16 h-16 ${acc.color} text-white rounded-[1.5rem] flex items-center justify-center mb-4 shadow-2xl group-hover:rotate-6 transition-transform`}>
                <i className={`fas fa-${acc.icon} text-2xl`}></i>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">{acc.name}</p>
              <p className="text-xl font-black text-slate-800">{currencySymbol}{acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="liquid-glass rounded-[2.5rem] p-8 border-emerald-500/10">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center"><i className="fas fa-arrow-up text-xs"></i></div>
            <p className="text-[11px] font-black uppercase tracking-widest">Today's Inflow</p>
          </div>
          <h2 className="text-4xl font-black text-slate-800">{currencySymbol}{todayIncome.toLocaleString()}</h2>
        </div>

        <div className="liquid-glass rounded-[2.5rem] p-8 border-rose-500/10">
          <div className="flex items-center gap-3 text-rose-500 mb-2">
            <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center"><i className="fas fa-arrow-down text-xs"></i></div>
            <p className="text-[11px] font-black uppercase tracking-widest">Today's Outflow</p>
          </div>
          <h2 className="text-4xl font-black text-slate-800">{currencySymbol}{todayExpenses.toLocaleString()}</h2>
        </div>
      </div>

      {/* Chart & AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 liquid-glass rounded-[3rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Market Pulse</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.4)', radius: 10}}
                  contentStyle={{ borderRadius: '24px', border: 'none', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.8)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', fontWeight: '900' }}
                />
                <Bar dataKey="Income" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={12} />
                <Bar dataKey="Expense" fill="#fb7185" radius={[8, 8, 8, 8]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 text-white flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-500/20 shadow-2xl animate-pulse">
              <ICONS.Robot />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">AI Oracle</h3>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Liquid Insight</p>
            </div>
          </div>
          <div className="flex-1 text-sm text-slate-300 leading-relaxed font-medium">
            <span className="text-indigo-400 font-black text-2xl leading-none">"</span>
            {advice}
            <span className="text-indigo-400 font-black text-2xl leading-none">"</span>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
        </div>
      </div>

      {/* Modal Overhaul */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white/90 backdrop-blur-3xl rounded-t-[3.5rem] md:rounded-[3.5rem] w-full max-w-lg p-10 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/40 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {isRecurring ? 'Automate Flow' : (form.type === 'INCOME' ? 'Injection' : 'Extraction')}
                </h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-3xl group-focus-within:text-indigo-500 transition-colors">{currencySymbol}</div>
                <input
                  type="number"
                  required
                  autoFocus
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-100/50 border-2 border-transparent rounded-[2rem] pl-16 pr-8 py-8 text-5xl font-black text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => openAction('INCOME', isRecurring)}
                  className={`py-5 rounded-[1.5rem] font-black tracking-widest text-xs uppercase transition-all ${form.type === 'INCOME' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}
                >
                  Inflow
                </button>
                <button 
                  type="button" 
                  onClick={() => openAction('EXPENSE', isRecurring)}
                  className={`py-5 rounded-[1.5rem] font-black tracking-widest text-xs uppercase transition-all ${form.type === 'EXPENSE' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}
                >
                  Outflow
                </button>
              </div>

              {isRecurring && (
                <div className="p-6 bg-slate-100/50 rounded-[2rem] space-y-4 border border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                      className="w-full bg-white rounded-2xl px-5 py-4 font-black text-xs text-slate-800 outline-none"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-white rounded-2xl px-5 py-4 font-black text-xs text-slate-800 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Account Target</p>
                <div className="grid grid-cols-2 gap-3">
                  {state.accounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setForm({ ...form, accountId: acc.id })}
                      className={`py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border-2 ${
                        form.accountId === acc.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100'
                      }`}
                    >
                      <i className={`fas fa-${acc.icon}`}></i>
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Classification</p>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        form.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl px-6 py-5 outline-none focus:bg-white focus:border-indigo-500 font-bold transition-all"
                placeholder="Transaction memo..."
              />

              <button
                type="submit"
                className="w-full py-6 rounded-[2rem] font-black text-white bg-indigo-600 shadow-2xl shadow-indigo-200 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm"
              >
                Validate Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
