
import React, { useState, useMemo } from 'react';
import { Transaction, CURRENCIES } from '../types';
import { ICONS } from '../constants';

interface HistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: string;
}

const History: React.FC<HistoryProps> = ({ transactions, onDelete, currency }) => {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [search, setSearch] = useState('');
  
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filter === 'ALL' || t.type === filter;
      const matchesSearch = 
        t.category.toLowerCase().includes(search.toLowerCase()) || 
        t.note.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filter, search]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text"
            placeholder="Search category or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium outline-none focus:border-indigo-200 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-100">
              <th className="pb-4 font-bold">Date</th>
              <th className="pb-4 font-bold">Account</th>
              <th className="pb-4 font-bold">Category</th>
              <th className="pb-4 font-bold">Amount</th>
              <th className="pb-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map((t) => (
              <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 text-sm text-slate-500">
                  {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400">{t.accountId}</span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex flex-col">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase w-fit ${
                      t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {t.category}
                    </span>
                    {t.note && <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">{t.note}</span>}
                  </div>
                </td>
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
                  <div className="flex flex-col items-center">
                    <i className="fas fa-folder-open text-3xl opacity-20 mb-3"></i>
                    <p className="font-bold">No matches found</p>
                    <p className="text-xs">Try adjusting your filters or search term</p>
                  </div>
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
