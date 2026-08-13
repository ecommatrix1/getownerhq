import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HelpCircle, RefreshCw, Mail } from 'lucide-react';

interface RefundPageProps {
  onNavigate: (route: string) => void;
}

export const RefundPage: React.FC<RefundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} currentRoute="/refund" />

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 md:p-12">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refund Policy</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Last updated: August 13, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">01.</span> Trial Period
              </h2>
              <p>
                getOwnerHQ offers a **1-month free trial** for all new gym registrations. No credit card is required to sign up. If you cancel your account during the trial period, you will not be charged.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">02.</span> Subscription Refunds
              </h2>
              <p>
                We want you to be completely satisfied with getOwnerHQ. If you purchase a monthly or annual subscription and decide the platform is not a fit for your gym, you are eligible for a **100% full refund within 14 days** of your initial transaction.
              </p>
              <p>
                After the 14-day window, subscriptions are non-refundable. Your service will remain active until the end of your current paid billing period, and no further charges will apply once you cancel.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">03.</span> Requesting a Refund
              </h2>
              <p>
                To request a refund within the 14-day window, please send an email from your owner account email address to:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-2 text-sm font-medium text-slate-700">
                <p><span className="text-slate-400">Email:</span> founderkraft@gmail.com</p>
                <p><span className="text-slate-400">Support Location:</span> Assam, India</p>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Refunds are processed within 5-10 business days and returned to your original payment method.
              </p>
            </section>

          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
