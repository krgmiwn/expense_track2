
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

  return (
    <div className="space-y-4 pb-6">
      <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-tighter">Automate</h3>
          <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-0.5">Recurring Directives</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          <ICONS.Plus />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {scheduled.length > 0 ? scheduled.map(s => (
          <div key={s.id} className="bg-white/5 rounded-2xl p-4 border border-white/5 relative group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
                  s.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  <ICONS.Calendar />
                </div>
                <div>
                  <p className="font-black text-white text-[11px] uppercase tracking-tight">{s.category}</p>
                  <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">{s.frequency} • {s.accountId}</p>
                </div>
              </div>
              <button onClick={() => onDelete(s.id)} className="text-white/10 hover:text-rose-500 text-[10px]"><i className="fas fa-trash"></i></button>
            </div>
            <p className="text-xl font-black text-white tracking-tighter">{currencySymbol}{s.amount.toLocaleString()}</p>
          </div>
        )) : (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-10 text-[8px] font-black uppercase tracking-widest">No Directives</div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-[320px] p-6 space-y-4">
            <h3 className="text-[10px] font-black text-white uppercase">New Directive</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setForm({...form, type: 'INCOME'})} className={`py-3 rounded-xl text-[8px] font-black uppercase border ${form.type === 'INCOME' ? 'bg-indigo-600 border-indigo-600' : 'border-white/5 text-white/30'}`}>Income</button>
              <button onClick={() => setForm({...form, type: 'EXPENSE'})} className={`py-3 rounded-xl text-[8px] font-black uppercase border ${form.type === 'EXPENSE' ? 'bg-indigo-600 border-indigo-600' : 'border-white/5 text-white/30'}`}>Expense</button>
            </div>
            <input 
              type="number" required 
              value={form.amount || ''} 
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
              className="w-full bg-black/40 rounded-xl p-4 text-2xl font-black text-white outline-none border border-white/10" 
              placeholder="0" 
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black text-white outline-none"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
            <button onClick={() => { if(form.amount > 0) onAdd(form); setIsAdding(false); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Set Directive</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduled;
