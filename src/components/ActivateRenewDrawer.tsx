import React, { useState, useEffect } from "react";
import { X, CheckCircle, Calendar, Camera, Printer } from "lucide-react";
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

      // Determine initial start date:
      // 1. If member has future expiry_date, use that (for active renewals).
      // 2. Else if member has registered start_date (e.g. from QR signup), use that.
      // 3. Otherwise default to today.
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
    
    // Calendar month arithmetic
    const targetMonth = start.getMonth() + plan.duration_months;
    const expiry = new Date(start);
    expiry.setMonth(targetMonth);
    
    // Handle month-end clipping (e.g. Jan 31 + 1 month -> Feb 28/29)
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">
              {member.status === "pending"
                ? "Activate Member Plan"
                : "Renew Membership"}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {member.full_name}
            </h2>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Mobile: {member.mobile}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        {successData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-5 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-50 shadow-sm animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2 border border-emerald-200">
                Plan Status: Activated & Paid
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Plan Activated Successfully!</h3>
              <p className="text-sm text-slate-500 font-medium">Receipt #: <span className="font-mono font-bold text-slate-900">{successData.receiptNumber}</span></p>
            </div>
            
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Member:</span>
                <span className="font-bold text-slate-900">{member.full_name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600">₹{amountPaid} ({paymentMode})</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Valid Until:</span>
                <span className="font-bold text-slate-900">{expiryDate}</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              <a 
                href={`https://wa.me/91${member.mobile}?text=${encodeURIComponent(`Thanks for your payment at ${gym?.name}, ${member.full_name}! Your membership is active until ${new Date(expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. Receipt: ${successData.receiptNumber}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-extrabold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 text-sm"
              >
                Send WhatsApp Receipt & Pass
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" /> Print Tax Receipt
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors text-sm"
              >
                Done / Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              {/* 1. Select Plan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        } disabled:opacity-70`}>
                        <div>
                          <div
                            className={`font-bold text-sm ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                            {p.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Duration: {p.duration_months} Month
                            {p.duration_months > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-mono font-bold text-lg ${isSelected ? "text-blue-700" : "text-slate-900"}`}>
                            ₹{p.price}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dates Calculation */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      disabled={loading}
                      style={{ colorScheme: 'light' }}
                      className="w-full text-xs font-mono p-2 border border-slate-300 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                    Expiry Date <span className="text-slate-400 font-normal lowercase">(Editable)</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      disabled={loading}
                      style={{ colorScheme: 'light' }}
                      className="w-full text-xs font-mono p-2 border border-blue-300 bg-blue-50 text-blue-900 font-bold rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dues Alert if any */}
              {(member.outstanding_dues || 0) > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-between text-amber-900">
                    <span className="text-sm font-bold">Outstanding Dues</span>
                    <span className="font-mono font-bold">₹{member.outstanding_dues}</span>
                  </div>
                  <div className="text-xs text-amber-700 mt-1">This amount has been added to the total collected. Activating this plan will clear all pending dues.</div>
                </div>
              )}

              {/* 3. Payment Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Total Amount Collected (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      disabled={loading}
                      className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold border border-slate-300 bg-white text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      ["UPI", "Cash", "Card", "Bank Transfer"] as PaymentMode[]
                    ).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        disabled={loading}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                          paymentMode === mode
                            ? "bg-[#2563EB] text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        } disabled:opacity-50`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Transaction Ref / UTR / Card # <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={txnRef}
                    onChange={(e) => setTxnRef(e.target.value)}
                    placeholder={paymentMode === 'UPI' ? 'e.g. UTR 42398129031' : paymentMode === 'Card' ? 'e.g. Card Last 4 (4821)' : 'Reference / Txn ID'}
                    disabled={loading}
                    className="w-full text-xs font-mono p-2.5 border border-slate-200 bg-slate-50 text-slate-900 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="hidden sm:block">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Total Payable
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  ₹{amountPaid}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap">
                  <CheckCircle className="w-4 h-4" />
                  {loading ? "Saving..." : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap">
                  <Printer className="w-4 h-4" />
                  {loading ? "Processing..." : "Confirm & Print"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
