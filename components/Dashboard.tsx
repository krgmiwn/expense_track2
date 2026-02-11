
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
  const [advice, setAdvice] = useState<string>('Analyzing your liquidity...');
  const [isAdding, setIsAdding] = useState(false);
  const [prescheduleMode, setPrescheduleMode] = useState(false);
  
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

    if (prescheduleMode) {
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
    setPrescheduleMode(false);
  };

  const openAction = (type: 'INCOME' | 'EXPENSE', forcePreschedule: boolean = false) => {
    setForm(prev => ({ 
      ...prev, 
      type, 
      category: type === 'INCOME' ? 'Salary' : 'Food' 
    }));
    setPrescheduleMode(forcePreschedule);
    setIsAdding(true);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Premium Dashboard Header Card */}
      <div className="liquid-card-gradient rounded-[4rem] p-12 text-white shadow-[0_32px_80px_-16px_rgba(79,70,229,0.5)] relative overflow-hidden animate-in slide-in-from-top-10 duration-700">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Total Liquidity</p>
              <h2 className="text-7xl font-black tracking-tighter flex items-baseline">
                <span className="text-indigo-200 text-3xl mr-3 font-bold opacity-60">{currencySymbol}</span>
                {balance.toLocaleString()}
              </h2>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="w-16 h-16 bg-white/10 rounded-[2.2rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 shadow-2xl">
                <i className="fas fa-bolt text-indigo-200"></i>
              </div>
              <span className="bg-indigo-400/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Active</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => openAction('INCOME')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-6 rounded-[2.5rem] text-sm font-black transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-900/20 active:scale-95 group"
            >
              <i className="fas fa-plus-circle text-lg"></i> Fund Add
            </button>
            <button 
              onClick={() => openAction('EXPENSE')}
              className="bg-rose-500 hover:bg-rose-400 text-white px-8 py-6 rounded-[2.5rem] text-sm font-black transition-all flex items-center justify-center gap-4 shadow-xl shadow-rose-900/20 active:scale-95 group"
            >
              <i className="fas fa-minus-circle text-lg"></i> Fund Reduce
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
            <button 
              onClick={() => openAction('EXPENSE', true)}
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              <i className="fas fa-clock text-indigo-300"></i> Preschedule Action
            </button>
            <button 
              onClick={onNavigateToScheduled}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/60 hover:text-white"
            >
              View Queue <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute -right-20 -top-20 w-[30rem] h-[30rem] bg-white/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -left-20 -bottom-20 w-[25rem] h-[25rem] bg-indigo-400/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Account Sources */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Monetary Channels</h3>
        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
          {state.accounts.map((acc) => (
            <div 
              key={acc.id} 
              className="flex-shrink-0 w-52 bg-white rounded-[3rem] p-8 flex flex-col items-center text-center transition-all hover:shadow-2xl hover:-translate-y-2 active:scale-95 group shadow-sm border border-slate-100"
            >
              <div className={`w-16 h-16 ${acc.color} text-white rounded-[1.8rem] flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform`}>
                <i className={`fas fa-${acc.icon} text-2xl`}></i>
              </div>
              <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-[0.2em]">{acc.name}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{currencySymbol}{acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Pulse & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter">7-Day Trajectory</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span><span className="text-[9px] font-black uppercase text-slate-400">In</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span><span className="text-[9px] font-black uppercase text-slate-400">Out</span></div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyHistoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: '900'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc', radius: 12}}
                  contentStyle={{ borderRadius: '2rem', border: 'none', background: '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: '900', padding: '1.5rem' }}
                />
                <Bar dataKey="Income" fill="#6366f1" radius={[12, 12, 12, 12]} barSize={14} />
                <Bar dataKey="Expense" fill="#fb7185" radius={[12, 12, 12, 12]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white flex flex-col shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-5 mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.8rem] flex items-center justify-center shadow-indigo-500/30 shadow-2xl">
              <ICONS.Robot />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tighter">AI Advisor</h3>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Neural Analytics</p>
            </div>
          </div>
          <div className="flex-1 text-[15px] text-slate-300 leading-relaxed font-medium">
            <span className="text-indigo-400 font-black text-4xl block mb-2 leading-none">"</span>
            {advice}
          </div>
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px]"></div>
        </div>
      </div>

      {/* Main Action Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xl z-50 flex items-end md:items-center justify-center p-0 md:p-6 overflow-hidden">
          <div className="bg-white rounded-t-[4rem] md:rounded-[4rem] w-full max-w-xl p-10 md:p-12 shadow-2xl animate-in slide-in-from-bottom duration-400 border border-white/20 max-h-[95vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {prescheduleMode ? 'Preschedule' : (form.type === 'INCOME' ? 'Add Funds' : 'Reduce Funds')}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">
                  {prescheduleMode ? 'Authorized Future Flow' : 'Instant Transaction'}
                </p>
              </div>
              <button 
                onClick={() => setIsAdding(false)} 
                className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="relative group">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-4xl group-focus-within:text-indigo-600 transition-colors">{currencySymbol}</div>
                <input
                  type="number"
                  required
                  autoFocus
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border-4 border-slate-50 rounded-[2.5rem] pl-20 pr-10 py-10 text-6xl font-black text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                  placeholder="0"
                />
              </div>

              {/* Mode Toggle */}
              <div className="bg-slate-100 p-2 rounded-[2rem] flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setPrescheduleMode(false)}
                  className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${!prescheduleMode ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}
                >
                  <i className="fas fa-bolt mr-2"></i> Now
                </button>
                <button 
                  type="button" 
                  onClick={() => setPrescheduleMode(true)}
                  className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${prescheduleMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                >
                  <i className="fas fa-clock mr-2"></i> Preschedule
                </button>
              </div>

              {prescheduleMode && (
                <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] space-y-6 border border-indigo-100 animate-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 px-2">Cycle Frequency</label>
                      <select
                        value={form.frequency}
                        onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                        className="w-full bg-white rounded-2xl px-6 py-4 font-black text-xs text-slate-800 outline-none shadow-sm border border-indigo-100/50"
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="ONCE">One-time Future</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 px-2">Activation Date</label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full bg-white rounded-2xl px-6 py-4 font-black text-xs text-slate-800 outline-none shadow-sm border border-indigo-100/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Channel Selection</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {state.accounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setForm({ ...form, accountId: acc.id })}
                      className={`py-5 px-6 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border-4 ${
                        form.accountId === acc.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <i className={`fas fa-${acc.icon} text-lg`}></i>
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Classification</p>
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`flex-shrink-0 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border-4 transition-all ${
                        form.category === cat ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'
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
                className="w-full bg-slate-50 border-4 border-transparent rounded-[2rem] px-8 py-6 outline-none focus:bg-white focus:border-indigo-600 font-bold transition-all text-slate-800 placeholder:text-slate-300"
                placeholder="Transaction memo..."
              />

              <button
                type="submit"
                className="w-full py-8 rounded-[2.5rem] font-black text-white bg-indigo-600 shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] active:scale-95 transition-all uppercase tracking-[0.3em] text-sm"
              >
                {prescheduleMode ? 'Register Directive' : 'Execute Flow'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
