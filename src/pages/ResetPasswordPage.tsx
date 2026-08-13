import React, { useState, useEffect } from 'react';
import { Dumbbell, ArrowRight, AlertCircle, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { supabase } from '../lib/supabase';

interface ResetPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      // 1. Check existing session
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession) {
        setIsSessionValid(true);
        setVerifyingSession(false);
        return;
      }

      // 2. Extract token from URL (handles double hash like #/reset-password#access_token=...)
      const fullUrl = window.location.href;
      const accessTokenMatch = fullUrl.match(/access_token=([^&]+)/);
      const refreshTokenMatch = fullUrl.match(/refresh_token=([^&]+)/);

      if (accessTokenMatch) {
        const accessToken = accessTokenMatch[1];
        const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : '';

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (!error && data.session) {
            setIsSessionValid(true);
            setVerifyingSession(false);
            return;
          }
        } catch (e) {
          console.error('Failed to set session from token:', e);
        }
      }

      // 3. Listen for recovery state event from Supabase
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setIsSessionValid(true);
          setVerifyingSession(false);
        }
      });

      // 4. Fallback timeout after 2.5s
      const timer = setTimeout(() => {
        setVerifyingSession(false);
      }, 2500);

      return () => {
        authListener?.subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    verifySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} currentRoute="/login" />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 border border-blue-100 shadow-sm">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Enter your new password below.
            </p>
          </div>

          {verifyingSession ? (
            <div className="py-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-600">Verifying secure reset link...</p>
            </div>
          ) : !isSessionValid ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium flex items-center gap-2 text-left">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <span>Session token missing or expired. Please click the reset link in your email again or request a new one.</span>
              </div>
              <button
                onClick={() => onNavigate('/login')}
                className="w-full py-3 bg-[#2563EB] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {success ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Password Updated Successfully!
                  </div>
                  <button
                    onClick={() => onNavigate('/login')}
                    className="w-full py-3 bg-[#2563EB] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563EB] text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
