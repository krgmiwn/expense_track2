
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Transaction, CURRENCIES, CATEGORIES } from '../types';
import { ICONS } from '../constants';
import { getFinancialAdvice } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  state: AppState;
  onAdd: (tx: Omit<Transaction, 'id'>) => void;
  onNavigateToScheduled: () => void;
}

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
  }, [state.transactions.length]); // Only refetch if count changes

  const currencySymbol = CURRENCIES.find(c => c.code === state.profile.currency)?.symbol || '$';

  const { balance, todayIncome, todayExpenses, totalIncome, totalExpenses } = useMemo(() => {
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
    onAdd(form);
    setIsAdding(false);
    setForm({ amount: 0, category: 'Other', type: 'EXPENSE', date: new Date().toISOString(), note: '' });
  };

  const openAddFund = () => {
    setForm({ ...form, type: 'INCOME', category: 'Salary' });
    setIsAdding(true);
  };

  const openReduceFund = () => {
    setForm({ ...form, type: 'EXPENSE', category: 'Food' });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Main Wallet Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="opacity-70 text-[10px] font-black uppercase tracking-[0.2em]">Net Capital Balance</p>
              <h2 className="text-5xl font-black mb-8 tracking-tighter">
                <span className="text-indigo-300 mr-1">{currencySymbol}</span>
                {balance.toLocaleString()}
              </h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <ICONS.Wallet />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={openAddFund}
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <i className="fas fa-plus-circle text-lg"></i> Fund Add
            </button>
            <button 
              onClick={openReduceFund}
              className="bg-indigo-500/30 hover:bg-indigo-500/40 text-white px-6 py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 border border-white/10 active:scale-95"
            >
              <i className="fas fa-minus-circle text-lg"></i> Fund Reduce
            </button>
          </div>

          <button 
            onClick={onNavigateToScheduled}
            className="w-full bg-slate-900/40 hover:bg-slate-900/60 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <ICONS.Calendar /> Manage Scheduled Transactions
          </button>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <ICONS.TrendingUp />
            <p className="text-xs font-black uppercase tracking-widest">Today's Inflow</p>
          </div>
          <h2 className="text-3xl font-black text-slate-800">{currencySymbol}{todayIncome.toLocaleString()}</h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">LIFETIME: {currencySymbol}{totalIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <ICONS.TrendingDown />
            <p className="text-xs font-black uppercase tracking-widest">Today's Outflow</p>
          </div>
          <h2 className="text-3xl font-black text-slate-800">{currencySymbol}{todayExpenses.toLocaleString()}</h2>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">LIFETIME: {currencySymbol}{totalExpenses.toLocaleString()}</p>
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
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">{form.type === 'INCOME' ? 'Add Fund' : 'Reduce Fund'}</h3>
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

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Select Category</label>
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
                Confirm Transaction
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
