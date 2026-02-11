
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
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-2xl border border-white/5">
        <h3 className="text-[9px] font-black text-white/30 uppercase tracking-widest px-2">Recent Flow</h3>
        <div className="flex gap-1">
          {['ALL', 'INC', 'EXP'].map(f => (
            <button key={f} onClick={() => setFilter(f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE'))} className={`px-3 py-1 rounded-lg text-[7px] font-black transition-all ${filter === (f === 'ALL' ? 'ALL' : (f === 'INC' ? 'INCOME' : 'EXPENSE')) ? 'bg-indigo-600 text-white' : 'text-white/20'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length > 0 ? filtered.map(t => (
          <div key={t.id} className="bg-slate-900 border border-white/5 rounded-2xl p-3 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-6 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              <div>
                <p className="text-[9px] font-black text-white/90 uppercase">{t.category}</p>
                <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">{new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {t.accountId}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-white/80'}`}>{t.type === 'INCOME' ? '+' : '-'}{symbol}{t.amount.toLocaleString()}</span>
              <button onClick={() => onDelete(t.id)} className="text-white/10 hover:text-rose-500 text-[8px]"><i className="fas fa-trash-alt"></i></button>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center opacity-10 text-[8px] font-black uppercase tracking-[0.5em]">No Records</div>
        )}
      </div>
    </div>
  );
};

export default History;