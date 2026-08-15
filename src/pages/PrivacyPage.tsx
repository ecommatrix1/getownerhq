import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, Database, Lock, Mail, Phone, MapPin, Eye, UserCheck, Server, AlertCircle, Info } from 'lucide-react';

interface PrivacyPageProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar onNavigate={onNavigate} currentRoute="/privacy" />

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12">
          
          {/* Top Banner Header */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Last updated: August 14, 2026</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-10 text-slate-600 leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">01.</span> Introduction & Scope
              </h2>
              <p>
                At <strong>getOwnerHQ</strong> ("we," "our," or "us"), we prioritize your privacy and data security. This Privacy Policy details the exact personal information we collect, why we collect it, how it is safely stored and processed, and how you can exercise your privacy rights or contact us.
              </p>
              <p>
                This policy applies to all visitors, registered gym owners, personal trainers, and gym members using our web platform at <a href="https://getownerhq.in" className="text-blue-600 font-semibold hover:underline">getownerhq.in</a> and associated services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">02.</span> Personal Information We Collect
              </h2>
              <p>
                We collect personal information that you provide directly to us, as well as information collected automatically when using our software:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Gym Owner Information</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4">
                    <li>Full Name & Business Owner Identity</li>
                    <li>Account Email Address & Password</li>
                    <li>Gym Name, Business Phone Number & Address/City</li>
                    <li>Subscription Tier & Payment Ledger Records</li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Gym Member Information</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4">
                    <li>Member Full Name</li>
                    <li>WhatsApp Mobile Number (for renewal notifications)</li>
                    <li>Selected Gym Membership Plan & Plan Start/Expiry Dates</li>
                    <li>QR Code Check-In Registration Timestamps</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Technical Usage Data:</strong> We automatically collect IP addresses, browser types, device specifications, and cookies to ensure secure dashboard authentication and prevent unauthorized access.
                </span>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">03.</span> Why We Collect Your Information
              </h2>
              <p>
                We process your information strictly for legitimate operational purposes to provide and improve our gym management software:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li><strong>Tenant Dashboard Management:</strong> To create, authenticate, and isolate your gym's private management environment.</li>
                <li><strong>Contactless QR Self-Registration:</strong> To generate custom reception standees allowing gym members to register via smartphone in seconds.</li>
                <li><strong>Membership Expiry & Renewal Tracking:</strong> To compute membership validity, flag upcoming expirations, and maintain active member lists.</li>
                <li><strong>Automated WhatsApp Notifications:</strong> To allow gym owners to send 1-click WhatsApp payment reminders directly to members.</li>
                <li><strong>Financial Accounting & Billing:</strong> To record cash collections, generate financial invoices, and track gym revenue ledgers.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">04.</span> Data Security, Storage & Protection
              </h2>
              <p>
                We enforce enterprise-grade data security protocols to safeguard your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">TLS / SSL Encryption</h3>
                  <p className="text-xs text-slate-500">All data transmitted between your browser and our servers is encrypted using 256-bit SSL protocols.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Row-Level Security (RLS)</h3>
                  <p className="text-xs text-slate-500">Database security policies guarantee that only your authenticated gym account can access your member records.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Zero Third-Party Selling</h3>
                  <p className="text-xs text-slate-500">We NEVER sell, rent, or trade your data or member phone numbers to third-party advertisers.</p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">05.</span> Data Sharing & Disclosures
              </h2>
              <p>
                We only share personal information with third-party service providers essential for platform operations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm">
                <li><strong>Cloud Database Infrastructure:</strong> Supabase / PostgreSQL (encrypted database storage).</li>
                <li><strong>Hosting Infrastructure:</strong> Vercel Global Edge Network.</li>
                <li><strong>Legal Requirements:</strong> When required by applicable laws, court orders, or government regulations.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">06.</span> Your Privacy Rights & Data Deletion
              </h2>
              <p>
                You have the right to access, correct, export, or permanently delete your account and member data at any time. Gym owners can request full CSV exports or account termination by contacting our support team.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 font-mono text-sm">07.</span> How Users Can Contact Us
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact our privacy officer directly:
              </p>
              
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3 text-sm">
                <div className="flex items-center gap-3 font-semibold">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>Email Support: <a href="mailto:founderkraft@gmail.com" className="text-blue-300 underline hover:text-blue-200">founderkraft@gmail.com</a></span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>Phone / WhatsApp Support: <a href="tel:+918876661110" className="text-blue-300 underline hover:text-blue-200">+91 8876661110</a></span>
                </div>
                <div className="flex items-center gap-3 font-semibold">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>Official Address: getOwnerHQ Technologies, Assam, India</span>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PrivacyPage;
