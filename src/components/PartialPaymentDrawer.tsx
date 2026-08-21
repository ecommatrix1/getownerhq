import React, { useState } from 'react';
import { X, CreditCard, Banknote, Landmark, Smartphone, CheckCircle2, Wallet } from 'lucide-react';
import { Member } from '../types';
import { api } from '../lib/api';

interface PartialPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess: () => void;
}

const PAYMENT_MODES = [
  { mode: 'UPI',            icon: Smartphone, tone: 'purple'  },
  { mode: 'Cash',           icon: Banknote,   tone: 'success' },
  { mode: 'Card',           icon: CreditCard, tone: 'brand'   },
  { mode: 'Bank Transfer',  icon: Landmark,   tone: 'warning' },
] as const;

const TONE_ACTIVE: Record<string, string> = {
  purple:  'border-semantic-purple bg-semantic-purple/10 text-semantic-purple dark:text-semantic-purple-dark ring-2 ring-semantic-purple/40',
  success: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/40',
  brand:   'border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/40',
  warning: 'border-amber-500 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/40',
};

const TONE_ICON: Record<string, string> = {
  purple:  'bg-semantic-purple/10 text-semantic-purple dark:text-semantic-purple-dark',
  success: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  brand:   'bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400',
  warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

export const PartialPaymentDrawer: React.FC<PartialPaymentDrawerProps> = ({
  isOpen,
  onClose,
  member,
  onSuccess
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer'>('UPI');
  const [txnRef, setTxnRef] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [receiptNo, setReceiptNo] = useState('');

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    setLoading(true);
    const res = await api.recordPartialPayment(member.id, Number(amount), paymentMode, txnRef.trim() || undefined);
    setLoading(false);

    if (res.success) {
      setReceiptNo(res.receipt_number || '');
      setSuccessMode(true);
    } else {
      alert(res.message);
    }
  };

  const handleClose = () => {
    setSuccessMode(false);
    setAmount('');
    setPaymentMode('UPI');
    setTxnRef('');
    if (successMode) {
      onSuccess();
    }
    onClose();
  };

  const initials = member.full_name.substring(0, 2).toUpperCase();
  const fullAmount = member.outstanding_dues || 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-up"
        onClick={handleClose}
        aria-hidden
      />

      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-surface-dark shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-fade-up">

        {/* Header with gradient accent strip */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-800 glass dark:glass-dark">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0 shadow-glow-brand">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Pay Outstanding Dues
                </h2>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 [font-variant-numeric:tabular-nums]">
                  {member.mobile}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="p-2 -m-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {successMode ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" aria-hidden />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Payment Recorded!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  Receipt:{' '}
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-200 [font-variant-numeric:tabular-nums]">
                    {receiptNo}
                  </span>
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full btn-brand text-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Outstanding badge */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-500/15 dark:to-orange-500/10 border border-rose-200/70 dark:border-rose-500/30 p-5">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" aria-hidden />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-[0.12em] mb-1">
                      Total Outstanding
                    </div>
                    <div className="font-mono font-extrabold text-3xl text-rose-600 dark:text-rose-400 leading-none [font-variant-numeric:tabular-nums]">
                      ₹{fullAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Wallet className="w-6 h-6" strokeWidth={2.25} />
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Amount Received Today
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 dark:text-slate-400 pointer-events-none">₹</span>
                  <input
                    type="number"
                    value={amount === 0 ? '' : amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmount(val === '' ? 0 : Number(val));
                    }}
                    onFocus={(e) => e.target.select()}
                    max={fullAmount}
                    className="w-full pl-9 pr-4 py-3 text-lg font-bold font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none text-slate-900 dark:text-white transition-all [font-variant-numeric:tabular-nums]"
                    placeholder="0"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAmount(fullAmount)}
                  className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  Pay Full · ₹{fullAmount.toLocaleString('en-IN')}
                </button>
              </div>

              {/* Payment mode */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_MODES.map(({ mode, icon: Icon, tone }) => {
                    const isActive = paymentMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode as any)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all duration-200 ease-spring ${
                          isActive
                            ? TONE_ACTIVE[tone]
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" /> {mode}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Txn Ref / UTR / Card #
                    <span className="text-slate-400 dark:text-slate-500 font-medium normal-case ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder={paymentMode === 'UPI' ? 'e.g. UTR 42398129031' : 'Reference / Txn ID'}
                    className="w-full px-4 py-2.5 text-sm font-mono border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !amount || amount <= 0}
                className="w-full btn-brand disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-glow-brand"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Record Payment
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
