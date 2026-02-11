
import React, { useState } from 'react';
import { ScheduledTransaction, CURRENCIES, CATEGORIES, Frequency, AccountType } from '../types';
import { ICONS } from '../constants';

interface ScheduledProps {
  scheduled: ScheduledTransaction[];
  onAdd: (stx: Omit<ScheduledTransaction, 'id'>) => void;
  onDelete: (id: string) => void;
  currency: string;
}

const Scheduled: React.FC<ScheduledProps> = ({ scheduled, onAdd, onDelete, currency }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Omit<ScheduledTransaction, 'id'>>({
    amount: 0,
    category: 'Other',
    type: 'EXPENSE',
    accountId: 'BANK',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    note: ''
  });

  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.amount <= 0) return;
    onAdd(form);
    setIsAdding(false);
    setForm({ 
      amount: 0, 
      category: 'Other', 
      type: 'EXPENSE', 
      accountId: 'BANK',
      frequency: 'MONTHLY', 
      startDate: new Date().toISOString().split('T')[0], 
      note: '' 
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex justify-between items-center liquid-glass p-8 rounded-[3rem] shadow-2xl border border-white/40">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Automated Flow</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Smart Recurring Logic</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center gap-3 active:scale-95"
        >
          <ICONS.Plus /> New Directive
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scheduled.length > 0 ? scheduled.map(s => (
          <div key={s.id} className="liquid-glass rounded-[2.5rem] p-8 shadow-xl border border-white/30 hover:shadow-2xl hover:-translate-y-2 transition-all relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
            
            <button
              onClick={() => onDelete(s.id)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
            >
              <ICONS.Trash />
            </button>
            
            <div className="flex items-center gap-5 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                s.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'
              }`}>
                <ICONS.Calendar />
              </div>
              <div>
                <p className="font-black text-slate-800 text-lg tracking-tight">{s.category}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{s.frequency}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.accountId}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Magnitude</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{currencySymbol}{s.amount.toLocaleString()}</p>
              </div>
              
              {s.note && (
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                  <p className="text-xs text-slate-500 font-medium italic">"{s.note}"</p>
                </div>
              )}
              
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Starts</span>
                <span className="text-xs font-black text-slate-800">{new Date(s.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 liquid-glass rounded-[3rem] border-dashed border-2 border-white/30 flex flex-col items-center justify-center text-slate-400">
            <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center text-3xl mb-6 shadow-xl"><ICONS.Calendar /></div>
            <p className="text-lg font-black tracking-tight text-slate-600">No active directives</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-50">Create your first automated flow</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white/90 backdrop-blur-3xl rounded-t-[3.5rem] md:rounded-[3.5rem] w-full max-w-lg p-10 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/40 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">New Directive</h3>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'INCOME' })}
                  className={`py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${
                    form.type === 'INCOME' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  Inflow
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                  className={`py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${
                    form.type === 'EXPENSE' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  Outflow
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Magnitude</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">{currencySymbol}</span>
                    <input
                      type="number"
                      required
                      value={form.amount || ''}
                      onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                      className="w-full bg-slate-100 border-2 border-transparent rounded-2xl pl-10 pr-5 py-4 font-black outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Cycle</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl px-5 py-4 font-black outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner text-sm"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ONCE">Once</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Source / Target</label>
                <div className="grid grid-cols-2 gap-3">
                  {['BANK', 'BKASH', 'NAGAD', 'ROCKET', 'CARD'].map(acc => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => setForm({ ...form, accountId: acc as AccountType })}
                      className={`py-4 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 border-2 ${
                        form.accountId === acc ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100'
                      }`}
                    >
                      <i className={`fas fa-${acc === 'BANK' ? 'university' : acc === 'CARD' ? 'credit-card' : 'wallet'}`}></i>
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Classification</label>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        form.category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Activation Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-100 border-2 border-transparent rounded-2xl px-6 py-4 font-black outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">Memo</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full bg-slate-100 border-2 border-transparent rounded-2xl px-6 py-5 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="Automated payment description..."
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-95"
                >
                  Set Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduled;
