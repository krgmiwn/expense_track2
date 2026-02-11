
import React, { useState, useMemo } from 'react';
import { Transaction, CURRENCIES, ThemeType } from '../types';

interface HistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: string;
  theme: ThemeType;
}

const History: React.FC<HistoryProps> = ({ transactions, onDelete, currency, theme }) => {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const isDark = theme === 'dark';

  const filtered = useMemo(() => 
    transactions.filter(t => filter === 'ALL' || t.type === filter),
  [transactions, filter]);

  const cardBg = isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const headingColor = isDark ? 'text-white' : 'text-slate-900';
  const subHeadingColor = isDark ? 'text-white/30' : 'text-slate-400';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <span className={`text-sm font-black uppercase tracking-widest ${subHeadingColor}`}>Master Ledger</span>
        <div className="flex gap-2">
          {['ALL', 'INC', 'EXP'].map(f => (
            <button key={f} onClick={() => setFilter(f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE'))} className={`px-3 py-1.5 rounded-xl text-[8px] font-black transition-all ${filter === (f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE')) ? 'bg-indigo-600 text-white shadow-lg' : (isDark ? 'text-white/10 hover:text-white/30' : 'text-slate-300 hover:text-slate-500')}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map(t => (
          <div key={t.id} className={`${cardBg} border rounded-3xl px-5 py-4 flex justify-between items-center transition-all active:scale-[0.98]`}>
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`w-1.5 h-6 rounded-full shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}></div>
              <div className="truncate">
                <p className={`text-[11px] font-black uppercase truncate tracking-tight ${headingColor}`}>{t.category}</p>
                <p className={`text-[8px] font-black tracking-widest uppercase ${subHeadingColor}`}>{t.accountId}</p>
              </div>
            </div>
            <div className="flex items-center gap-5 shrink-0">
              <span className={`text-base font-black tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-400' : (isDark ? 'text-white/80' : 'text-slate-700')}`}>
                {t.type === 'INCOME' ? '+' : '-'}{symbol}{t.amount.toLocaleString()}
              </span>
              <button onClick={() => onDelete(t.id)} className={`${isDark ? 'text-white/10 hover:text-rose-500' : 'text-slate-200 hover:text-rose-500'} text-xs p-2 transition-colors`}><i className="fas fa-trash"></i></button>
            </div>
          </div>
        )) : (
          <div className={`py-24 text-center opacity-10 text-[10px] font-black uppercase tracking-[0.6em] ${isDark ? 'text-white' : 'text-slate-900'}`}>Zero Flow Recorded</div>
        )}
      </div>
    </div>
  );
};

export default History;
