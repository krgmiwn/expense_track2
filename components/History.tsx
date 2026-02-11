
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
    <div className="liquid-glass rounded-[3rem] p-8 shadow-2xl border border-white/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Transaction Ledger</h3>
          <div className="flex bg-white/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            {(['ALL', 'INCOME', 'EXPENSE'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"></i>
          <input 
            type="text"
            placeholder="Search flow or memo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white/40 backdrop-blur-xl border border-white/30 rounded-[1.5rem] text-sm font-bold outline-none focus:bg-white/60 focus:border-indigo-300 transition-all shadow-inner placeholder:text-slate-400 text-slate-800"
          />
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="px-4 pb-2">Timestamp</th>
              <th className="px-4 pb-2">Source</th>
              <th className="px-4 pb-2">Classification</th>
              <th className="px-4 pb-2">Magnitude</th>
              <th className="px-4 pb-2 text-right">Control</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map((t) => (
              <tr key={t.id} className="group transition-all hover:scale-[1.01]">
                <td className="py-5 px-4 first:rounded-l-[1.5rem] bg-white/20 backdrop-blur-sm border-y border-l border-white/20 text-xs font-bold text-slate-500">
                  {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                </td>
                <td className="py-5 px-4 bg-white/20 backdrop-blur-sm border-y border-white/20">
                  <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/30">{t.accountId}</span>
                </td>
                <td className="py-5 px-4 bg-white/20 backdrop-blur-sm border-y border-white/20">
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-black uppercase tracking-wider ${
                      t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      {t.category}
                    </span>
                    {t.note && <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px] font-medium opacity-70">{t.note}</span>}
                  </div>
                </td>
                <td className="py-5 px-4 bg-white/20 backdrop-blur-sm border-y border-white/20">
                  <span className={`text-sm font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-5 px-4 last:rounded-r-[1.5rem] bg-white/20 backdrop-blur-sm border-y border-r border-white/20 text-right">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="w-10 h-10 flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all active:scale-90"
                  >
                    <ICONS.Trash />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6 text-3xl">
                      <i className="fas fa-box-open"></i>
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Empty Ledger</p>
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
