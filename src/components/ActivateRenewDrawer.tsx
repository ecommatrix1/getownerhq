import React, { useState, useEffect } from "react";
import { X, CheckCircle, Calendar, Printer, MessageCircle, AlertTriangle, Sparkles, Clock, Hash } from "lucide-react";
import { Member, GymPlan, PaymentMode } from "../types";
import { api } from "../lib/api";
import { useDashboard } from "./DashboardContext";

import { parseDateOnly } from "../utils/status";

interface ActivateRenewDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receiptNumber: string, shouldPrint: boolean) => void;
}

const PAYMENT_MODES: PaymentMode[] = ['UPI', 'Cash', 'Card', 'Bank Transfer'];

const TONE_ACTIVE: Record<string, string> = {
  UPI:            'border-semantic-purple bg-semantic-purple/10 text-semantic-purple dark:text-semantic-purple-dark ring-2 ring-semantic-purple/40',
  Cash:           'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/40',
  Card:           'border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/40',
  'Bank Transfer':'border-amber-500 bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/40',
};

export const ActivateRenewDrawer: React.FC<ActivateRenewDrawerProps> = ({
  member,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { gym } = useDashboard();
  const [plans, setPlans] = useState<GymPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("UPI");
  const [txnRef, setTxnRef] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{receiptNumber: string} | null>(null);

  useEffect(() => {
    if (isOpen && member && gym) {
      setSuccessData(null);

      const todayStr = new Date().toISOString().split("T")[0];
      let initialStartStr = todayStr;
      if (member.expiry_date) {
        const memberExpiry = parseDateOnly(member.expiry_date);
        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (memberExpiry.getTime() > todayMidnight.getTime()) {
          initialStartStr = member.expiry_date;
        }
      } else if (member.start_date) {
        initialStartStr = member.start_date;
      }
      setStartDate(initialStartStr);

      const loadPlans = async () => {
        const loadedPlans = await api.getGymPlans(gym.id);
        setPlans(loadedPlans);
        const initialPlan = loadedPlans.find(p => p.id === (member.plan_id || member.current_plan_id)) || loadedPlans[0];
        if (initialPlan) {
          setSelectedPlanId(initialPlan.id);
          setAmountPaid(initialPlan.price + (member.outstanding_dues || 0));
          recalculateDefaultExpiry(initialPlan, initialStartStr);
        }
      };
      loadPlans();
    }
  }, [isOpen, member, gym]);

  const handlePlanSelect = (plan: GymPlan, startStr: string) => {
    setSelectedPlanId(plan.id);
    setAmountPaid(plan.price + (member?.outstanding_dues || 0));
    recalculateDefaultExpiry(plan, startStr);
  };

  const handleStartDateChange = (newStartStr: string) => {
    setStartDate(newStartStr);
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (plan) {
      recalculateDefaultExpiry(plan, newStartStr);
    }
  };

  const recalculateDefaultExpiry = (plan: GymPlan, startStr: string) => {
    if (!startStr) return;
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return;

    const targetMonth = start.getMonth() + plan.duration_months;
    const expiry = new Date(start);
    expiry.setMonth(targetMonth);

    if (expiry.getMonth() !== targetMonth % 12) {
      expiry.setDate(0);
    }
    setExpiryDate(expiry.toISOString().split("T")[0]);
  };

  if (!isOpen || !member) return null;

  const handleSubmit = async (shouldPrint: boolean) => {
    setErrorMsg("");

    if (!selectedPlanId) {
      setErrorMsg("Please select a membership plan.");
      return;
    }
    if (!expiryDate) {
      setErrorMsg("Please enter an expiry date.");
      return;
    }

    setLoading(true);

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    const planPrice = selectedPlan ? selectedPlan.price : 0;
    const totalPayable = planPrice + (member.outstanding_dues || 0);
    const newDues = Math.max(0, totalPayable - amountPaid);

    const res = await api.activateMemberPlan(
      member.id,
      selectedPlanId,
      startDate,
      expiryDate,
      amountPaid,
      paymentMode,
      newDues,
      txnRef.trim() || undefined
    );

    setLoading(false);
    if (res.success && res.receiptNumber) {
      onSuccess(res.receiptNumber, shouldPrint);
      setSuccessData({ receiptNumber: res.receiptNumber });
    } else {
      setErrorMsg(res.message || "Failed to activate plan");
    }
  };

  const initials = member.full_name.substring(0, 2).toUpperCase();
  const isActivate = member.status === "pending";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-up"
        onClick={loading ? undefined : onClose}
        aria-hidden
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-surface-dark shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 animate-fade-up">

        {/* Header with gradient accent strip */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-800 glass dark:glass-dark">
          <div className={`absolute top-0 left-0 right-0 h-1 ${isActivate ? 'bg-gradient-brand' : 'bg-gradient-to-r from-emerald-500 via-brand-500 to-brand-400'}`} aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="relative w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center font-extrabold text-sm text-white flex-shrink-0 shadow-glow-brand">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-surface-dark" />
              </div>
              <div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  isActivate
                    ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300'
                    : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {isActivate ? <Sparkles className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isActivate ? 'Activate Member Plan' : 'Renew Membership'}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
                  {member.full_name}
                </h2>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 [font-variant-numeric:tabular-nums]">
                  {member.mobile}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              aria-label="Close"
              className="p-2 -m-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        {successData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-5 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" aria-hidden />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2 ring-1 ring-emerald-200 dark:ring-emerald-500/30">
                Plan Status: Activated & Paid
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Plan Activated Successfully!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Receipt:{' '}
                <span className="font-mono font-bold text-slate-900 dark:text-slate-200 [font-variant-numeric:tabular-nums]">
                  {successData.receiptNumber}
                </span>
              </p>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left text-xs font-mono space-y-2 [font-variant-numeric:tabular-nums]">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Member:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{member.full_name}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{amountPaid.toLocaleString('en-IN')} · {paymentMode}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Valid Until:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{expiryDate}</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              <a
                href={`https://wa.me/91${member.mobile}?text=${encodeURIComponent(`Thanks for your payment at ${gym?.name}, ${member.full_name}! Your membership is active until ${new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. Receipt: ${successData.receiptNumber}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Send WhatsApp Receipt & Pass
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                Print Tax Receipt
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Done / Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm rounded-xl flex items-center gap-2 font-medium animate-fade-up">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Select Plan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Membership Plan
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {plans.map((p) => {
                    const isSelected = p.id === selectedPlanId;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        disabled={loading}
                        onClick={() => handlePlanSelect(p, startDate)}
                        className={`group p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ease-spring ${
                          isSelected
                            ? "border-brand-500 bg-gradient-to-br from-brand-50 to-accent-500/5 dark:from-brand-500/15 dark:to-accent-500/10 ring-2 ring-brand-500/30 shadow-sm"
                            : "border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/50 bg-white dark:bg-slate-900/40"
                        } disabled:opacity-70`}>
                        <div>
                          <div className={`font-bold text-sm ${isSelected ? 'text-brand-900 dark:text-brand-200' : 'text-slate-900 dark:text-slate-100'}`}>
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {p.duration_months} Month{p.duration_months > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-extrabold text-lg [font-variant-numeric:tabular-nums] ${isSelected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-slate-100'}`}>
                            ₹{p.price.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm font-mono px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800 transition-all [font-variant-numeric:tabular-nums] dark:[color-scheme:dark]"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3" />
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    disabled={loading}
                    className="w-full text-sm font-mono font-bold px-3 py-2.5 border-2 border-brand-300 dark:border-brand-500/40 bg-brand-50/50 dark:bg-brand-500/10 text-brand-900 dark:text-brand-200 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none disabled:bg-slate-100 transition-all [font-variant-numeric:tabular-nums] dark:[color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              {/* Dues Alert */}
              {(member.outstanding_dues || 0) > 0 && (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/15 dark:to-orange-500/10 border border-amber-200/70 dark:border-amber-500/30 p-3.5">
                  <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" aria-hidden />
                  <div className="relative flex items-center justify-between text-amber-900 dark:text-amber-200">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Outstanding Dues
                    </span>
                    <span className="font-mono font-extrabold text-base [font-variant-numeric:tabular-nums]">�{member.outstanding_dues}</span>
                  </div>
                  <p className="relative text-xs text-amber-700 dark:text-amber-300/80 mt-1.5 leading-snug">
                    Added to total. Activating this plan will clear all pending dues.
                  </p>
                </div>
              )}

              {/* 3. Payment Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Amount Collected (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-bold pointer-events-none">₹</span>
                    <input
                      type="number"
                      value={amountPaid === 0 ? '' : amountPaid}
                      placeholder="0"
                      onChange={(e) => {
                        const val = e.target.value;
                        setAmountPaid(val === '' ? 0 : Number(val));
                      }}
                      onFocus={(e) => e.target.select()}
                      disabled={loading}
                      className="w-full pl-9 pr-4 py-2.5 text-base font-mono font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none disabled:bg-slate-100 transition-all [font-variant-numeric:tabular-nums]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PAYMENT_MODES.map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        disabled={loading}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all duration-200 ease-spring ${
                          paymentMode === mode
                            ? TONE_ACTIVE[mode]
                            : 'bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        } disabled:opacity-50`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Transaction Ref / UTR / Card #
                    <span className="text-slate-400 dark:text-slate-500 font-medium normal-case ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder={paymentMode === 'UPI' ? 'e.g. UTR 42398129031' : paymentMode === 'Card' ? 'e.g. Card Last 4 (4821)' : 'Reference / Txn ID'}
                    disabled={loading}
                    className="w-full text-sm font-mono px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-slate-50/60 dark:to-slate-900/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">
                  Total Payable
                </div>
                <div className="font-mono font-extrabold text-xl text-slate-900 dark:text-slate-100 [font-variant-numeric:tabular-nums]">
                  ₹{amountPaid.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98] disabled:opacity-50 whitespace-nowrap"
                >
                  <CheckCircle className="w-4 h-4" />
                  {loading ? "Saving…" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="btn-brand !min-h-[44px] !min-w-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <Printer className="w-4 h-4" />
                  {loading ? "Processing…" : "Confirm & Print"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
