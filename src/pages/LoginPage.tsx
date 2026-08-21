import React, { useState, useEffect } from 'react';
import { Dumbbell, ArrowRight, AlertCircle, Mail, Lock, Sun, Moon, Check } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTheme } from '../components/ThemeContext';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

const REMEMBER_KEY = 'ownerhq_remember_email';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem(REMEMBER_KEY) || ''; } catch { return ''; }
  });
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => {
    try { return !!localStorage.getItem(REMEMBER_KEY); } catch { return false; }
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Persist the remembered email whenever it changes
  useEffect(() => {
    try {
      if (remember && email.trim()) localStorage.setItem(REMEMBER_KEY, email.trim());
      if (!remember) localStorage.removeItem(REMEMBER_KEY);
    } catch { /* private mode — ignore */ }
  }, [remember, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.signInOwner(cleanEmail, password);
      if (!res.success) throw new Error(res.message);

      setLoading(false);
      onNavigate('/dashboard');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid login credentials.');
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address above first to reset password.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin + '/#/reset-password',
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setResetSent(true);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col font-sans transition-colors duration-300">
      <Navbar onNavigate={onNavigate} currentRoute="/login" />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background mesh — matches the marketing hero */}
        <div className="absolute inset-0 bg-mesh opacity-50 dark:opacity-70 pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/10 dark:bg-brand-500/15 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative max-w-md w-full bg-white/90 dark:bg-surface-card-dark/90 backdrop-blur-xl rounded-2xl border border-slate-200/70 dark:border-navy-600 shadow-soft-light dark:shadow-soft-dark p-8 animate-fade-up">

          {/* Theme toggle (top-right of card) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3 border border-brand-200/60 dark:border-brand-500/30 shadow-sm">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gym Owner Login</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Access your member renewal dashboard
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl font-medium">
              Password reset link sent to <strong>{email}</strong>! Please check your inbox.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Owner Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="owner@yourgym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:outline-none transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:outline-none transition-all"
                  required
                  autoComplete={remember ? 'current-password' : 'current-password'}
                />
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <button
                type="button"
                role="checkbox"
                aria-checked={remember}
                onClick={() => setRemember(!remember)}
                className={`relative w-5 h-5 rounded-md border transition-all flex items-center justify-center flex-shrink-0 ${
                  remember
                    ? 'bg-gradient-brand border-transparent shadow-glow-brand'
                    : 'bg-white dark:bg-navy-800 border-slate-300 dark:border-navy-500 group-hover:border-brand-400'
                }`}
              >
                {remember && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Remember me
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full mt-2 disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            Don't have a gym account yet?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
            >
              Start 1-Month Free Trial
            </button>
          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
