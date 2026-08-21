import React, { useState, useEffect } from "react";
import { X, UserPlus, Phone, User, AlertCircle } from "lucide-react";
import { api } from "../lib/api";
import { useDashboard } from "./DashboardContext";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { gym } = useDashboard();

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setMobile("");
      setErrorMsg("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim()) {
      setErrorMsg("Please enter member full name.");
      return;
    }
    if (mobile.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!gym) {
      setErrorMsg("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    const res = await api.addMemberManual(gym.id, fullName, mobile);

    setLoading(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient accent strip */}
        <div className="relative px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow-brand flex-shrink-0">
                <UserPlus className="w-5 h-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  Add Member Manually
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Member will be added with{' '}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                    Pending
                  </span>{' '}
                  status
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
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm rounded-xl flex items-center gap-2 font-medium animate-fade-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
                +91
              </span>
              <Phone className="w-4 h-4 text-slate-400 absolute left-12 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-[68px] pr-3 py-2.5 text-sm font-mono border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 focus:outline-none bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all [font-variant-numeric:tabular-nums]"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-brand !min-h-[44px] !min-w-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
