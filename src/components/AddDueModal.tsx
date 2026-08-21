import React, { useState, useEffect } from 'react';
import { X, CreditCard, User } from 'lucide-react';
import { Member } from '../types';
import { api } from '../lib/api';

interface AddDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member | null;
}

export const AddDueModal: React.FC<AddDueModalProps> = ({ isOpen, onClose, onSuccess, member }) => {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setAmount(0);
  }, [isOpen]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await api.addManualDue(member.id, amount);

    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      alert(res.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — gradient accent strip + icon */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Add Manual Due
                </h2>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  {member.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 -m-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Add a manual charge (e.g. supplements, damage) to{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{member.full_name}</span>'s account.
          </p>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">₹</span>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 text-base font-mono font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-accent-500/40 focus:border-accent-400 focus:outline-none transition-all [font-variant-numeric:tabular-nums]"
                required
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 min-h-[48px] bg-gradient-brand text-white rounded-xl font-bold text-sm shadow-glow-brand hover:shadow-glow-brand-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ease-spring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Add Due
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
