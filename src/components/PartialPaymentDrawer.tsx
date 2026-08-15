import React, { useState } from 'react';
import { X, CreditCard, Banknote, Landmark, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { Member } from '../types';
import { api } from '../lib/api';

interface PartialPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSuccess: () => void;
}

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
    // Since we'll need to add record_partial_payment to api.ts, we use supabase directly or update api.ts.
    // Assuming api.recordPartialPayment is implemented.
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
    if (successMode) {
      onSuccess();
    }
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform flex flex-col border-l border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <CreditCard className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Pay Outstanding Dues</h2>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{member.full_name} • {member.mobile}</div>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {successMode ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center border-4 border-emerald-50 dark:border-emerald-900">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Payment Recorded!</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Receipt: <span className="font-mono text-slate-900 dark:text-slate-200">{receiptNo}</span></p>
              
              <button
                onClick={handleClose}
                className="mt-6 w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1">Total Outstanding</div>
                  <div className="text-2xl font-extrabold text-red-600 dark:text-red-400">₹{member.outstanding_dues}</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-200">Amount Received Today</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    max={member.outstanding_dues || 0}
                    className="w-full pl-8 pr-4 py-3 text-lg font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setAmount(member.outstanding_dues || 0)} className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">Pay Full (₹{member.outstanding_dues})</button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-900 dark:text-slate-200">Payment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { mode: 'UPI', icon: Smartphone },
                    { mode: 'Cash', icon: Banknote },
                    { mode: 'Card', icon: CreditCard },
                    { mode: 'Bank Transfer', icon: Landmark }
                  ].map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode as any)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${
                        paymentMode === mode 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-slate-900' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {mode}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Txn Ref / UTR / Card # <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder={paymentMode === 'UPI' ? 'e.g. UTR 42398129031' : 'Reference / Txn ID'}
                    className="w-full p-2.5 text-xs font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !amount || amount <= 0}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-extrabold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Record Payment
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};
