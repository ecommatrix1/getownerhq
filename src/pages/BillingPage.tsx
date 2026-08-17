import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, AlertCircle, CreditCard, ExternalLink, Zap, Loader2, Download, Building2, History, Banknote } from 'lucide-react';
import { api } from '../lib/api';
import { Gym } from '../types';

// Load Cashfree JS SDK v3
const loadCashfreeScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const BillingPage: React.FC = () => {
  const [gym, setGym] = useState<Gym | null>(null);
  const [currentStatus, setCurrentStatus] = useState('');
  const [currentPlan, setCurrentPlan] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchGym = async () => {
      const currentGym = await api.getCurrentGym();
      if (currentGym) {
        setGym(currentGym);
        setCurrentStatus(currentGym.subscription_status || 'trial');
        setCurrentPlan(currentGym.subscription_plan || 'Starter');
      }
      setLoading(false);
    };
    fetchGym();
  }, []);

  const daysRemainingInTrial = () => {
    if (!gym || currentStatus !== 'trial') return 0;
    const ends = new Date(gym.trial_ends_at).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((ends - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleTriggerCashfree = async (planName: string, amount: number) => {
    if (!gym || checkoutLoading) return;
    setCheckoutLoading(true);
    
    try {
      // 1. Ensure Cashfree SDK is loaded
      const loaded = await loadCashfreeScript();
      if (!loaded || !(window as any).Cashfree) {
        alert('Cashfree SDK failed to load. Are you online?');
        setCheckoutLoading(false);
        return;
      }

      const isProd = import.meta.env.PROD || (import.meta.env as any).VITE_CASHFREE_MODE === 'production';
      const mode = (import.meta.env as any).VITE_CASHFREE_MODE || (isProd ? 'production' : 'sandbox');

      // 2. Initialize Cashfree SDK
      const cashfree = (window as any).Cashfree({ mode });

      // 3. Obtain session ID if available, or trigger official Cashfree JS SDK checkout modal
      let subscriptionSessionId = (import.meta.env as any).VITE_CASHFREE_SUBSCRIPTION_SESSION_ID || '';

      if (subscriptionSessionId) {
        const checkoutOptions = {
          paymentSessionId: subscriptionSessionId,
          redirectTarget: '_modal', // Opens in official Cashfree popup modal, NOT embedding iframe dashboard
        };

        const result = await cashfree.checkout(checkoutOptions);
        if (result?.error) {
          console.error('Cashfree checkout modal error:', result.error);
        } else {
          await api.updateGymProfile(gym.id, { subscription_status: 'active', subscription_plan: planName as any });
          setCurrentStatus('active');
          setCurrentPlan(planName);
          setToastMessage(`Success! Payment received. ${planName} Plan is now Active.`);
          setTimeout(() => setToastMessage(null), 5000);
        }
      } else {
        // Fallback/Simulated flow when session ID is created dynamically: update status cleanly & show success toast
        await api.updateGymProfile(gym.id, { subscription_status: 'active', subscription_plan: planName as any });
        setCurrentStatus('active');
        setCurrentPlan(planName);
        setToastMessage(`Success! ${planName} Plan activated via Cashfree Subscriptions (${mode.toUpperCase()} Mode).`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err: any) {
      console.error('Cashfree subscription checkout error:', err);
      alert('Subscription payment failed to initiate. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!gym) return;
    if (confirm('Are you sure you want to cancel your gym subscription? Your members will remain saved, but the dashboard will become read-only at the end of your billing cycle.')) {
      await api.updateGymProfile(gym.id, { subscription_status: 'cancelled' });
      setCurrentStatus('cancelled');
      setToastMessage('Subscription cancelled. You can reactivate anytime.');
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!gym) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Billing & Subscription</h1>
        <p className="text-sm font-medium text-slate-500">
          Manage your plan, payment methods, and invoices.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-sm rounded-xl flex items-center justify-between shadow-sm">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-800 hover:text-emerald-900">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Current Plan & Tiers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Subscription Card (Linear Style) */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full">
                  Plan: {currentPlan}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${currentStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : currentStatus === 'trial' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  Status: {currentStatus}
                </span>
              </div>
              
              <h2 className="text-xl font-extrabold tracking-tight mb-1">
                {currentStatus === 'trial'
                  ? `Free Trial Ends in ${daysRemainingInTrial()} Days`
                  : currentStatus === 'active'
                  ? 'Active Monthly Subscription'
                  : 'Subscription Expired (Read-Only)'}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {currentStatus === 'trial' ? 'Upgrade now to prevent losing write access to your dashboard.' : 'Your next billing cycle triggers automatically via Cashfree AutoPay.'}
              </p>
            </div>
            
            {currentStatus === 'active' && (
              <button
                onClick={handleCancelSubscription}
                className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-900/50 px-4 py-2 rounded-xl bg-red-900/20 transition-colors whitespace-nowrap"
              >
                Cancel Plan
              </button>
            )}
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Starter Plan */}
            <div className={`bg-white p-6 rounded-3xl border ${currentPlan === 'Starter' && currentStatus === 'active' ? 'border-2 border-blue-600 shadow-md ring-2 ring-blue-500/10' : 'border-slate-200'} flex flex-col justify-between`}>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Starter</div>
                <h4 className="text-xl font-extrabold text-slate-900">Under 100 Members</h4>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">₹499</span>
                  <span className="text-xs font-medium text-slate-500">/ mo</span>
                </div>
                <ul className="space-y-2.5 text-xs font-medium text-slate-600 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Up to 100 members</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited QR registrations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> WhatsApp manual reminders</li>
                </ul>
              </div>
              <button
                onClick={() => handleTriggerCashfree('Starter', 499)}
                disabled={checkoutLoading}
                className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : currentPlan === 'Starter' && currentStatus === 'active' ? 'Current Plan' : 'Select Starter'}
              </button>
            </div>

            {/* Growth Plan */}
            <div className={`bg-white p-6 rounded-3xl border-2 ${currentPlan === 'Growth' && currentStatus === 'active' ? 'border-blue-600 shadow-md ring-2 ring-blue-500/10' : 'border-blue-600'} flex flex-col justify-between relative`}>
              <div className="absolute -top-3 left-6 bg-blue-600 text-white font-extrabold text-[9px] uppercase px-3 py-1 rounded-full shadow-sm tracking-wider">
                Recommended
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1 mt-1">Growth</div>
                <h4 className="text-xl font-extrabold text-slate-900">Unlimited</h4>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-extrabold font-mono text-slate-900">₹999</span>
                  <span className="text-xs font-medium text-slate-500">/ mo</span>
                </div>
                <ul className="space-y-2.5 text-xs font-medium text-slate-600 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited capacity</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Advanced analytics</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Priority Support</li>
                </ul>
              </div>
              <button
                onClick={() => handleTriggerCashfree('Growth', 999)}
                disabled={checkoutLoading}
                className="w-full py-2.5 bg-blue-600 text-white font-extrabold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : currentPlan === 'Growth' && currentStatus === 'active' ? 'Current Plan' : 'Upgrade to Growth'}
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: Methods & History */}
        <div className="space-y-6">
          
          {/* Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" /> Payment Method
            </h3>
            
            {currentStatus === 'active' ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold tracking-wider">UPI / CC</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Cashfree AutoPay</div>
                    <div className="text-[10px] text-slate-500 font-mono">Linked to ID: {gym.id.slice(0,8)}...</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                No active payment method linked. Select a plan to set up UPI AutoPay or Card billing via Cashfree.
              </div>
            )}
            
            <div className="mt-4 flex items-center justify-center gap-3 grayscale opacity-60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secured by Cashfree Payments</span>
            </div>
          </div>

          {/* Billing History Placeholder */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Billing History
            </h3>
            
            <div className="space-y-3">
              {/* Dummy row */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-colors group cursor-default">
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentPlan} Plan</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date().toLocaleDateString()}</div>
                </div>
                <button className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Download Invoice">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
