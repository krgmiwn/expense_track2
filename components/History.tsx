
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
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1 mb-2">
        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Nano Flow</span>
        <div className="flex gap-1">
          {['ALL', 'INC', 'EXP'].map(f => (
            <button key={f} onClick={() => setFilter(f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE'))} className={`px-2 py-0.5 rounded text-[6px] font-black transition-all ${filter === (f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE')) ? 'bg-indigo-600 text-white' : 'text-white/10'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        {filtered.length > 0 ? filtered.map(t => (
          <div key={t.id} className="bg-slate-900/50 rounded-lg px-2 py-1.5 flex justify-between items-center border border-white/5">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`w-0.5 h-3 rounded-full shrink-0 ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div className="truncate">
                <p className="text-[8px] font-bold text-white/90 uppercase truncate">{t.category}</p>
                <p className="text-[6px] text-white/20 font-black">{t.accountId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-[9px] font-black tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-white/70'}`}>
                {t.type === 'INCOME' ? '+' : '-'}{symbol}{t.amount}
              </span>
              <button onClick={() => onDelete(t.id)} className="text-white/5 text-[7px]"><i className="fas fa-trash"></i></button>
            </div>
          </div>
        )) : (
          <div className="py-10 text-center opacity-10 text-[7px] font-black uppercase tracking-widest">Flow Empty</div>
        )}
      </div>
    </div>
  );
};

export default History;