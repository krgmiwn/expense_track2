
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, CURRENCIES, CATEGORIES } from '../types';
import { ICONS } from '../constants';
import { getFinancialAdvice } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC<DashboardProps> = ({ state, onAdd, onNavigateToScheduled }) => {
  const [advice, setAdvice] = useState<string>('Analyzing your daily financial patterns...');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    amount: 0,
    category: 'Other',
    type: 'EXPENSE',
    date: new Date().toISOString(),
    note: ''
  });

  useEffect(() => {
    const fetchAdvice = async () => {
      const result = await getFinancialAdvice(state);
      setAdvice(result);
    };
    fetchAdvice();
  }, [state.transactions]);

  const currencySymbol = CURRENCIES.find(c => c.code === state.profile.currency)?.symbol || '$';

  // Calculations
  const { totalIncome, totalExpenses, balance, todayIncome, todayExpenses } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let inc = 0, exp = 0, tInc = 0, tExp = 0;
    
    state.transactions.forEach(t => {
      const isToday = t.date.split('T')[0] === today;
      if (t.type === 'INCOME') {
        inc += t.amount;
        if (isToday) tInc += t.amount;
      } else {
        exp += t.amount;
        if (isToday) tExp += t.amount;
      }
    });

    return {
      totalIncome: inc,
      totalExpenses: exp,
      balance: inc - exp,
      todayIncome: tInc,
      todayExpenses: tExp
    };
  }, [state.transactions]);

  // Chart Data - Daily Breakdown for Last 7 Days
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
        Net: inc - exp
      };
    });
  }, [state.transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;
    onAdd(form);
    setIsAdding(false);
    setForm({ amount: 0, category: 'Other', type: 'EXPENSE', date: new Date().toISOString(), note: '' });
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <p className="opacity-70 text-sm font-bold uppercase tracking-widest mb-1">Available Funds</p>
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight">{currencySymbol}{balance.toLocaleString()}</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => { setForm({ ...form, type: 'INCOME' }); setIsAdding(true); }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
              >
                <ICONS.Plus /> Add Earning
              </button>
              <button 
                onClick={onNavigateToScheduled}
                className="bg-indigo-400/30 hover:bg-indigo-400/50 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-white/20"
              >
                <ICONS.Calendar /> Pre-schedule
              </button>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 text-white/10 text-9xl transform -rotate-12">
            <ICONS.Wallet />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ICONS.TrendingUp />
              <p className="text-xs font-bold uppercase tracking-widest">Today's Income</p>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{currencySymbol}{todayIncome.toLocaleString()}</h2>
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t pt-2">
            Total: {currencySymbol}{totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <ICONS.TrendingDown />
              <p className="text-xs font-bold uppercase tracking-widest">Today's Expense</p>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{currencySymbol}{todayExpenses.toLocaleString()}</h2>
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t pt-2">
            Total: {currencySymbol}{totalExpenses.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Daily Pulse</h3>
              <p className="text-xs text-slate-400">Last 7 days performance</p>
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> Income</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-400 rounded-full"></span> Expense</div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="Income" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#fb7185" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Financial Health */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col shadow-xl shadow-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <ICONS.Robot />
            </div>
            <div>
              <h3 className="font-bold">Daily Advisor</h3>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Powered by Gemini 2.0</p>
            </div>
          </div>
          <div className="flex-1 text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-4 py-1">
            "{advice}"
          </div>
          <div className="mt-6">
            <button 
              onClick={onNavigateToScheduled}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition-all uppercase tracking-widest"
            >
              Manage Recurring Funds
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Log Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Log</h3>
          <p className="text-sm text-slate-500 mb-6">Common daily transactions for {state.profile.name}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Commute', amount: 5, cat: 'Transport', type: 'EXPENSE' },
              { label: 'Coffee', amount: 4, cat: 'Food', type: 'EXPENSE' },
              { label: 'Lunch', amount: 15, cat: 'Food', type: 'EXPENSE' },
              { label: 'Daily Bonus', amount: 50, cat: 'Freelance', type: 'INCOME' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => onAdd({
                  amount: item.amount,
                  category: item.cat,
                  type: item.type as any,
                  date: new Date().toISOString(),
                  note: `Quick Log: ${item.label}`
                })}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-2xl transition-all group"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{item.cat}</p>
                </div>
                <p className={`font-bold ${item.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-500'} group-hover:scale-110 transition-transform`}>
                  {currencySymbol}{item.amount}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Transactions */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Timeline</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {state.transactions
              .filter(t => t.date.split('T')[0] === new Date().toISOString().split('T')[0])
              .length > 0 ? (
              state.transactions
                .filter(t => t.date.split('T')[0] === new Date().toISOString().split('T')[0])
                .map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-slate-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                      }`}>
                        {t.type === 'INCOME' ? <ICONS.TrendingUp /> : <ICONS.TrendingDown />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{t.category}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                    </p>
                  </div>
                ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm">No transactions logged today.</p>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="mt-2 text-indigo-600 font-bold text-sm hover:underline"
                >
                  Start tracking now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal (shared) */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">New Entry</h3>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'INCOME' })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    form.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                    form.type === 'EXPENSE' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Expense
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">{currencySymbol}</div>
                <input
                  type="number"
                  required
                  autoFocus
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-4 text-2xl font-black text-slate-800 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-200"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                        form.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="What was this for?"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
                  form.type === 'INCOME' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 shadow-indigo-200'
                }`}
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
