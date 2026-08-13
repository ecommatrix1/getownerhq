import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldAlert, Info, Database, Mail } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} currentRoute="/privacy" />

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 md:p-12">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Last updated: August 13, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">01.</span> Introduction
              </h2>
              <p>
                At getOwnerHQ, we respect the privacy of our users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information and the information of your gym members when you use our gym management platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">02.</span> Information We Collect
              </h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on getOwnerHQ. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>**Gym Owner Info:** Name, email address, password, gym name, and city location.</li>
                <li>**Gym Member Info:** Names, phone numbers, self-registration dates, and membership status submitted via QR self-registration.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">03.</span> How We Use Your Information
              </h2>
              <p>
                We use the information we collect solely to operate and improve getOwnerHQ, including:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Creating and securing your gym's tenant dashboard.</li>
                <li>Generating customized member registration QR codes.</li>
                <li>Tracking and displaying membership renewal status.</li>
                <li>Enabling manual WhatsApp renewal notifications.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">04.</span> Data Security & Storage
              </h2>
              <p>
                Your data is stored securely using cloud database infrastructure (Supabase/PostgreSQL) with row-level security policies. While we take every measure to protect your data, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">05.</span> Contact Us
              </h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-4 space-y-2 text-sm font-medium text-slate-700">
                <p><span className="text-slate-400">Email:</span> founderkraft@gmail.com</p>
                <p><span className="text-slate-400">Address:</span> Assam, India</p>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
