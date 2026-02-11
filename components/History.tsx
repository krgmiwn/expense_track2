
import React, { useState } from 'react';
import { Transaction, CURRENCIES } from '../types';
import { ICONS } from '../constants';

interface HistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: string;
}

const History: React.FC<HistoryProps> = ({ transactions, onDelete, currency }) => {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const filtered = transactions.filter(t => filter === 'ALL' || t.type === filter);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold text-slate-800">Transaction History</h3>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
              <th className="pb-4 font-bold">Date</th>
              <th className="pb-4 font-bold">Category</th>
              <th className="pb-4 font-bold">Note</th>
              <th className="pb-4 font-bold">Amount</th>
              <th className="pb-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 text-sm text-slate-500">
                  {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.category}
                  </span>
                </td>
                <td className="py-4 text-sm text-slate-600 max-w-xs truncate">{t.note || '-'}</td>
                <td className={`py-4 font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                </td>
                <td className="py-4">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <ICONS.Trash />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
