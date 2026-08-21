import React, { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell, ShieldCheck, CheckCircle2, Phone, User, AlertCircle,
  ArrowRight, RefreshCw, MapPin, Loader2, Sparkles, Zap, Lock,
} from 'lucide-react';
import { api } from '../lib/api';
import { Gym } from '../types';

interface PublicRegistrationPageProps {
  slug: string;
  onNavigate: (route: string) => void;
}

/** Tiny CSS-free confetti — 30 absolute-positioned dots, fades after 2.4s. */
const ConfettiBurst: React.FC = () => {
  const dots = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        rotate: Math.random() * 360,
        color: ['#E87916', '#22A06B', '#3B82F6', '#EAB308', '#8B5CF6'][i % 5],
        size: 6 + Math.random() * 6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute top-1/2 -translate-y-1/2 block animate-confetti"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            background: d.color,
            borderRadius: 2,
            transform: `rotate(${d.rotate}deg)`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export const PublicRegistrationPage: React.FC<PublicRegistrationPageProps> = ({ slug, onNavigate }) => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loadingGym, setLoadingGym] = useState(true);

  const [step, setStep] = useState<1 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [joinDate, setJoinDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchGym = async () => {
    setLoadingGym(true);
    setLoadError('');
    const res = await api.getGymBySlug(slug);
    setGym(res.gym);
    setLoadError(res.error || '');
    setLoadingGym(false);
  };

  useEffect(() => { fetchGym(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [slug]);

  // ─── Loading skeleton ─────────────────────────────────────────────
  if (loadingGym) {
    return (
      <div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60" aria-hidden />
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
            <Loader2 className="relative w-10 h-10 text-brand-600 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 animate-pulse">Loading your gym…</p>
        </div>
      </div>
    );
  }

  // ─── Not found / error screen ─────────────────────────────────────
  if (!gym) {
    return (
      <div className="min-h-screen bg-surface dark:bg-surface-dark flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60" aria-hidden />
        <div className="relative max-w-md w-full bg-white dark:bg-surface-card-dark border border-slate-200/70 dark:border-navy-600 rounded-2xl shadow-card-hover p-8 text-center animate-fade-up">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-rose-500/15 blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-100 dark:border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-rose-500" strokeWidth={2.2} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
            We can't find that gym
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {loadError || 'The registration link you used is invalid or expired.'}
          </p>
          <div className="space-y-2">
            <button onClick={fetchGym} className="btn-brand w-full">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button onClick={() => onNavigate('/')} className="btn-ghost w-full">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Submission handler ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!cleanName) { setErrorMsg('Please enter your full name.'); return; }
    if (cleanMobile.length < 10) { setErrorMsg('Please enter a valid 10-digit mobile phone number.'); return; }

    setLoading(true);
    const res = await api.registerMemberPublic(gym.id, cleanName, cleanMobile, joinDate);
    setLoading(false);

    if (!res.success) { setErrorMsg(res.message); return; }
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setFullName('');
    setMobile('');
    setErrorMsg('');
  };

  const steps = ['Your Details', 'Pass Ready'];
  const currentStepIndex = step === 1 ? 0 : 1;

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" aria-hidden />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" aria-hidden />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" aria-hidden />

      {/* ─── Branded header ───────────────────────────────────────── */}
      <header className="relative px-5 sm:px-6 pt-8 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-brand blur-md opacity-50" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand">
                <Dumbbell className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                <span className="text-slate-900 dark:text-white">{gym.name}</span>
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span className="truncate">{gym.city || 'Self Registration Desk'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Open
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main card ────────────────────────────────────────────── */}
      <main className="relative flex-1 px-5 sm:px-6 pb-8">
        <div className="max-w-lg mx-auto">

          {/* Progress indicator */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              {steps.map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-500 ${
                      i < currentStepIndex
                        ? 'bg-brand-600 text-white scale-100'
                        : i === currentStepIndex
                        ? 'bg-gradient-brand text-white shadow-glow-brand scale-110'
                        : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                    }`}
                  >
                    {i < currentStepIndex ? '✓' : i + 1}
                  </span>
                  <span
                    className={`hidden sm:inline transition-colors duration-300 ${
                      i <= currentStepIndex ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-slate-200/70 dark:bg-navy-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-brand rounded-full transition-all duration-700 ease-spring"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
          </div>

          {/* Error banner */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 text-sm font-medium rounded-2xl flex items-start gap-3 animate-fade-up"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* ─── STEP 1: Form ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="relative bg-white/80 dark:bg-surface-card-dark/80 backdrop-blur-xl border border-white/60 dark:border-navy-600 rounded-2xl shadow-card-hover p-6 sm:p-8 animate-fade-up">
              {/* Trust strip */}
              <div className="flex items-center gap-2 mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-brand-500" />
                Encrypted · 30 seconds · No app needed
              </div>

              <div className="mb-6">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  Get your{' '}
                  <span className="text-gradient-brand">gym pass</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Fill in your details below. Reception will activate your pass when you arrive.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.1em] mb-2">
                    <span>Full Name</span>
                    <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal">as on ID</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="e.g. Rohan Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 text-sm font-medium border border-slate-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-900/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all placeholder:text-slate-400"
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.1em] mb-2">
                    <span>Mobile Number</span>
                    <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal">WhatsApp enabled</span>
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />+91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="98765 43210"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-[5.5rem] pr-4 py-3.5 text-sm font-mono font-semibold border border-slate-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-900/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all placeholder:text-slate-400 tracking-wider"
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Join date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.1em] mb-2">
                    When did you join?
                  </label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="w-full px-4 py-3.5 text-sm font-medium border border-slate-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-900/50 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Don't remember? Leave today's date — reception can update it later.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brand w-full mt-2 group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    <>
                      Generate My Pass
                      <ArrowRight className="w-5 h-5 transition-transform duration-200 ease-spring group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Micro reassurance row */}
              <div className="mt-5 pt-5 border-t border-slate-200/60 dark:border-navy-600 grid grid-cols-3 gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> 30 seconds
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" /> No app
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Success ───────────────────────────────────── */}
          {step === 3 && (
            <div className="relative bg-white/90 dark:bg-surface-card-dark/90 backdrop-blur-xl border border-white/60 dark:border-navy-600 rounded-2xl shadow-card-hover p-6 sm:p-8 text-center overflow-hidden animate-fade-up">
              <ConfettiBurst />

              <div className="relative">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                    <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase tracking-[0.14em] rounded-full mb-4 border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Awaiting Activation
                </span>

                <h2 className="font-display text-3xl font-extrabold tracking-tight mb-2">
                  You're{' '}
                  <span className="text-gradient-brand">registered!</span>
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed max-w-xs mx-auto">
                  Please see the front desk to pick your membership plan and activate your pass.
                </p>

                <div className="bg-slate-50 dark:bg-navy-900/50 p-5 rounded-2xl border border-slate-200/70 dark:border-navy-600 text-left text-xs space-y-2.5 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Member Name</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate ml-2">{fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Mobile</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">+91 {mobile}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Gym</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate ml-2">{gym.name}</span>
                  </div>
                </div>

                <button onClick={reset} className="btn-ghost w-full">
                  Register Another Person
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Footer ────────────────────────────────────────────────── */}
      <footer className="relative px-5 sm:px-6 py-5 text-center">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-1.5 mb-1.5 text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-[0.14em]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Verified Secure Self Registration
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Powered by <span className="font-display font-bold text-slate-600 dark:text-slate-300">getOwnerHQ</span>
          </p>
        </div>
      </footer>

      {/* Confetti keyframe — inline because it depends on JS-side durations */}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-50%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(280px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
