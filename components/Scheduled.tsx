
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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-indigo-600/5 p-6 rounded-[2.5rem] border border-indigo-500/10 shadow-2xl">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Automate</h3>
          <p className="text-indigo-400/40 text-[9px] font-black uppercase tracking-widest mt-1">Smart Directives</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white w-14 h-14 rounded-2xl shadow-xl shadow-indigo-600/40 active:scale-95 transition-all flex items-center justify-center text-xl"
        >
          <ICONS.Plus />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scheduled.length > 0 ? scheduled.map(s => (
          <div key={s.id} className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/5 relative group shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                  s.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  <ICONS.Calendar />
                </div>
                <div>
                  <p className="font-black text-white text-sm uppercase tracking-tight">{s.category}</p>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.frequency} • {s.accountId}</p>
                </div>
              </div>
              <button onClick={() => onDelete(s.id)} className="text-white/10 hover:text-rose-500 text-sm p-2"><i className="fas fa-trash"></i></button>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter">{currencySymbol}{s.amount.toLocaleString()}</p>
          </div>
        )) : (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-10 text-[10px] font-black uppercase tracking-[0.4em]">No Active Cycles</div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-[3rem] w-full max-w-[340px] p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">New Directive</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setForm({...form, type: 'INCOME'})} className={`py-4 rounded-2xl text-[10px] font-black uppercase border ${form.type === 'INCOME' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/5 text-white/30'}`}>Income</button>
              <button onClick={() => setForm({...form, type: 'EXPENSE'})} className={`py-4 rounded-2xl text-[10px] font-black uppercase border ${form.type === 'EXPENSE' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/5 text-white/30'}`}>Expense</button>
            </div>
            <input 
              type="number" required 
              value={form.amount || ''} 
              onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} 
              className="w-full bg-black/40 rounded-2xl p-5 text-3xl font-black text-white outline-none border border-white/10 text-center" 
              placeholder="0" 
            />
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-black text-white outline-none appearance-none"
            >
              <option value="DAILY">DAILY CYCLE</option>
              <option value="WEEKLY">WEEKLY CYCLE</option>
              <option value="MONTHLY">MONTHLY CYCLE</option>
            </select>
            <button onClick={() => { if(form.amount > 0) onAdd(form); setIsAdding(false); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl">Deploy Logic</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduled;
