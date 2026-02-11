
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, ScheduledTransaction, CURRENCIES, CATEGORIES, AccountType, Frequency } from '../types';
import { ICONS } from '../constants';
import { getFinancialAdvice } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onAddScheduled: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd, onAddScheduled, onNavigateToScheduled }) => {
  const [advice, setAdvice] = useState<string>('Analyzing your daily financial patterns...');
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

    return {
      balance: totalBalance,
      todayIncome: tInc,
      todayExpenses: tExp
    };
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
    <div className="space-y-6">
      {/* Top Main Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="opacity-70 text-[10px] font-black uppercase tracking-[0.2em]">Total Capital Balance</p>
              <h2 className="text-5xl font-black mb-8 tracking-tighter">
                <span className="text-indigo-300 mr-1">{currencySymbol}</span>
                {balance.toLocaleString()}
              </h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <ICONS.Wallet />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button 
              onClick={() => openAction('INCOME')}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <i className="fas fa-plus-circle text-lg"></i> Fund Add
            </button>
            <button 
              onClick={() => openAction('EXPENSE')}
              className="bg-indigo-500/30 hover:bg-indigo-500/40 text-white px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border border-white/10 active:scale-95"
            >
              <i className="fas fa-minus-circle text-lg"></i> Fund Reduce
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => openAction('INCOME', true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-100 px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-emerald-400/20 active:scale-95"
            >
              <i className="fas fa-calendar-plus text-sm"></i> Preschedule Add
            </button>
            <button 
              onClick={() => openAction('EXPENSE', true)}
              className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-100 px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border border-rose-400/20 active:scale-95"
            >
              <i className="fas fa-calendar-minus text-sm"></i> Preschedule Reduce
            </button>
          </div>

          <button 
            onClick={onNavigateToScheduled}
            className="w-full bg-slate-900/40 hover:bg-slate-900/60 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <ICONS.Calendar /> Manage Scheduled Transactions
          </button>
        </div>
        
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Capital Sources Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Capital Sources</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
          {state.accounts.map((acc) => (
            <div 
              key={acc.id} 
              className="flex-shrink-0 w-40 bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center transition-transform active:scale-95"
            >
              <div className={`w-12 h-12 ${acc.color} text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-${acc.color.split('-')[1]}-100`}>
                <i className={`fas fa-${acc.icon} text-xl`}></i>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{acc.name}</p>
              <p className="font-bold text-slate-800">{currencySymbol}{acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <ICONS.TrendingUp />
            <p className="text-xs font-black uppercase tracking-widest">Today's Inflow</p>
          </div>
          <h2 className="text-3xl font-black text-slate-800">{currencySymbol}{todayIncome.toLocaleString()}</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <ICONS.TrendingDown />
            <p className="text-xs font-black uppercase tracking-widest">Today's Outflow</p>
          </div>
          <h2 className="text-3xl font-black text-slate-800">{currencySymbol}{todayExpenses.toLocaleString()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-6">Financial Pulse</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="Income" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Expense" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <ICONS.Robot />
            </div>
            <div>
              <h3 className="font-bold">AI Advisor</h3>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">Gemini Insight Engine</p>
            </div>
          </div>
          <div className="flex-1 text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-4 py-1">
            "{advice}"
          </div>
        </div>
      </div>

      {/* Quick Action Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">
                  {isRecurring ? 'Schedule' : (form.type === 'INCOME' ? 'Add Fund' : 'Reduce Fund')}
                </h3>
                {isRecurring && <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">Recurring {form.type.toLowerCase()}</p>}
              </div>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 p-2"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">{currencySymbol}</div>
                <input
                  type="number"
                  required
                  autoFocus
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-5 text-3xl font-black text-slate-800 outline-none focus:border-indigo-500 transition-all"
                  placeholder="0.00"
                />
              </div>

              {/* Recurring Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRecurring ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <i className="fas fa-redo"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">Make Recurring</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Automate this inflow</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isRecurring ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isRecurring ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Frequency</label>
                    <select
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="ONCE">Once</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Capital Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {state.accounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setForm({ ...form, accountId: acc.id })}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-3 ${
                        form.accountId === acc.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <i className={`fas fa-${acc.icon}`}></i>
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border-2 transition-all ${
                        form.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
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
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-4 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                placeholder="Write a short note..."
              />

              <button
                type="submit"
                className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${
                  form.type === 'INCOME' ? 'bg-emerald-500 shadow-emerald-100' : 'bg-indigo-600 shadow-indigo-100'
                }`}
              >
                {isRecurring ? 'Confirm Schedule' : `Confirm ${form.type === 'INCOME' ? 'Inflow' : 'Outflow'}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
