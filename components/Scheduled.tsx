
import React, { useState } from 'react';
import { ScheduledTransaction, CURRENCIES, CATEGORIES, Frequency } from '../types';
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
    setForm({ amount: 0, category: 'Other', type: 'EXPENSE', frequency: 'MONTHLY', startDate: new Date().toISOString().split('T')[0], note: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Recurring Payments</h3>
          <p className="text-slate-500 text-sm">Automate your regular income and expenses</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <ICONS.Plus /> New Scheduled
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scheduled.length > 0 ? scheduled.map(s => (
          <div key={s.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative group">
            <button
              onClick={() => onDelete(s.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
            >
              <ICONS.Trash />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                s.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <ICONS.Calendar />
              </div>
              <div>
                <p className="font-bold text-slate-800">{s.category}</p>
                <p className="text-xs text-indigo-500 font-bold uppercase">{s.frequency}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-800">{currencySymbol}{s.amount.toLocaleString()}</p>
              <p className="text-sm text-slate-500 italic">"{s.note || 'No note'}"</p>
              <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-50">Starts: {new Date(s.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <div className="text-4xl mb-4 opacity-20"><ICONS.Calendar /></div>
            <p>No scheduled transactions yet.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Schedule Transaction</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'INCOME' })}
                  className={`py-3 rounded-2xl font-bold transition-all ${
                    form.type === 'INCOME' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  Fund Add
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'EXPENSE' })}
                  className={`py-3 rounded-2xl font-bold transition-all ${
                    form.type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  Fund Reduce
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    value={form.amount || ''}
                    onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ONCE">Once</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                >
                  {(form.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none"
                  placeholder="Subscription name, etc."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg"
                >
                  Schedule
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
