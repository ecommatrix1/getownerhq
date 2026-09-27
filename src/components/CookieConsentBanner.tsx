import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, ChevronRight, Sliders, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'getownerhq_cookie_consent_v1';

export interface CookiePreferences {
  status: 'accepted_all' | 'essential_only' | 'customized';
  date: string;
  essential: true;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentBannerProps {
  onNavigate: (route: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Custom toggles
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay so initial page render is smooth and doesn't jerk layout
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // In private browsing or localStorage blocked, fail gracefully
      setIsVisible(false);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save cookie consent to localStorage', e);
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      status: 'accepted_all',
      date: new Date().toISOString(),
      essential: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleEssentialOnly = () => {
    saveConsent({
      status: 'essential_only',
      date: new Date().toISOString(),
      essential: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      status: 'customized',
      date: new Date().toISOString(),
      essential: true,
      analytics: analyticsConsent,
      marketing: marketingConsent,
    });
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      role="dialog"
      aria-modal="false"
      className="fixed bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 md:left-auto md:right-6 md:max-w-xl z-[9999] animate-fade-up transition-all duration-300"
    >
      <div className="bg-slate-900/95 dark:bg-navy-950/95 backdrop-blur-xl border border-white/15 dark:border-navy-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-200">
        
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow-brand shrink-0">
              <Cookie className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-sm sm:text-base leading-snug">
                Your Privacy & Cookie Choices
              </h3>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Compliant with Indian DPDP & Google EU Consent
              </p>
            </div>
          </div>

          <button
            onClick={handleEssentialOnly}
            aria-label="Dismiss banner"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          We use essential cookies to keep you signed in securely and operate your gym dashboard. With your consent, we and advertising partners (including Google AdSense) also use cookies to analyze traffic and display relevant offers.
        </p>

        {/* Expandable Preferences Drawer */}
        {showPreferences && (
          <div className="mb-4 pt-3 border-t border-white/10 space-y-3 text-xs animate-fade-up">
            {/* Essential */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-bold text-white block">Strictly Necessary Cookies</span>
                <span className="text-slate-400 text-[11px]">Required for authentication, security tokens, and billing operations.</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 shrink-0 ml-2">
                Always Active
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-bold text-white block">Analytics & Performance</span>
                <span className="text-slate-400 text-[11px]">Helps us monitor app speed, feature usage, and uptime.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {/* Advertising */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="font-bold text-white block">Personalized Advertising (AdSense)</span>
                <span className="text-slate-400 text-[11px]">Allows Google and third-party partners to show relevant ads.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-2"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              {showPreferences ? 'Hide Options' : 'Customize'}
            </button>

            <button
              onClick={() => {
                setIsVisible(false);
                onNavigate('/privacy');
              }}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline py-1.5 px-2 font-medium"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {showPreferences ? (
              <button
                onClick={handleSaveCustom}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md active:scale-95"
              >
                Save Preferences
              </button>
            ) : (
              <>
                <button
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all active:scale-95"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-gradient-brand hover:brightness-110 shadow-glow-brand rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};
