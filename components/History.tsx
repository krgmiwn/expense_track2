
import React, { useState, useMemo } from 'react';
import { Transaction, CURRENCIES } from '../types';

interface HistoryProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  currency: string;
}

const History: React.FC<HistoryProps> = ({ transactions, onDelete, currency }) => {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const symbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const filtered = useMemo(() => 
    transactions.filter(t => filter === 'ALL' || t.type === filter),
  [transactions, filter]);

  return (
    <div className="space-y-2 pb-6">
      <div className="flex justify-between items-center px-1 mb-3">
        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Transaction Log</span>
        <div className="flex gap-1.5">
          {['ALL', 'INC', 'EXP'].map(f => (
            <button key={f} onClick={() => setFilter(f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE'))} className={`px-2.5 py-1 rounded-lg text-[7px] font-black transition-all ${filter === (f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE')) ? 'bg-indigo-600 text-white' : 'text-white/10'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.length > 0 ? filtered.map(t => (
          <div key={t.id} className="bg-slate-900/60 rounded-xl px-3 py-2.5 flex justify-between items-center border border-white/5 shadow-sm active:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`w-1 h-4 rounded-full shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div className="truncate">
                <p className="text-[9px] font-bold text-white/90 uppercase truncate">{t.category}</p>
                <p className="text-[7px] text-white/20 font-black tracking-widest uppercase">{t.accountId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className={`text-[11px] font-black tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-white/80'}`}>
                {t.type === 'INCOME' ? '+' : '-'}{symbol}{t.amount.toLocaleString()}
              </span>
              <button onClick={() => onDelete(t.id)} className="text-white/10 hover:text-rose-500 text-[9px] p-1"><i className="fas fa-trash"></i></button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center opacity-10 text-[8px] font-black uppercase tracking-[0.5em]">No History Found</div>
        )}
      </div>
    </div>
  );
};

export default History;
