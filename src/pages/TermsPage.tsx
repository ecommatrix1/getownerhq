import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FileText, ShieldAlert, Scale, HelpCircle } from 'lucide-react';

interface TermsPageProps {
  onNavigate: (route: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} currentRoute="/terms" />

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 md:p-12">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Last updated: August 13, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">01.</span> Agreement to Terms
              </h2>
              <p>
                Welcome to getOwnerHQ. These Terms & Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you" or "Gym Owner"), and getOwnerHQ ("we," "us," or "our"), concerning your access to and use of the getOwnerHQ website and application.
              </p>
              <p>
                By registering for a trial or purchasing a subscription to getOwnerHQ, you agree that you have read, understood, and agree to be bound by all of these Terms & Conditions. If you do not agree, you must immediately cease using the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">02.</span> Description of Service
              </h2>
              <p>
                getOwnerHQ is a multi-tenant gym management Software-as-a-Service (SaaS) platform that allows gym owners to manage member self-registrations via QR code, track payment renewals, and configure manual WhatsApp reminders.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">03.</span> Account Registration & Responsibilities
              </h2>
              <p>
                To utilize getOwnerHQ, you must create an account. You agree to provide true, accurate, and current information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
              </p>
              <p>
                You represent that you operate a legitimate gym business and will use this service in compliance with all local laws and regulations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">04.</span> Subscription Billing & Cancellation
              </h2>
              <p>
                Our services are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis (monthly or annually) depending on the subscription plan you select.
              </p>
              <p>
                You may cancel your subscription at any time through your dashboard billing portal. Your account will remain active until the end of your current paid billing cycle.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">05.</span> Contact Information
              </h2>
              <p>
                For any questions or concerns regarding these Terms, please contact us at:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-2 text-sm font-medium text-slate-700">
                <p><span className="text-slate-400">Phone / WhatsApp:</span> <a href="tel:+918876661110" className="text-blue-600 hover:underline">+91 8876661110</a></p>
                <p><span className="text-slate-400">Email:</span> founderkraft@gmail.com</p>
                <p><span className="text-slate-400">Location:</span> Assam, India</p>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
