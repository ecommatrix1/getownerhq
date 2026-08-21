import React from 'react';
import {
  User,
  ArrowRight,
  Play,
  LogIn,
  CheckCircle2,
  Clock,
  Smartphone,
  Bell,
  Users,
  RefreshCw,
  CreditCard,
  BarChart2,
  Settings,
  QrCode,
  MessageSquare,
  Calendar,
  IndianRupee,
  ChevronDown,
  Check,
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Sun,
  Moon,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTheme } from '../components/ThemeContext';

interface MarketingPageProps {
  onNavigate: (route: string) => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-ink dark:bg-surface-dark dark:text-ink-inverse transition-colors duration-300 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar onNavigate={onNavigate} currentRoute="/" />

      {/* Hero Section — orange + navy/charcoal, multi-color semantic typography */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark opacity-60 dark:opacity-70 pointer-events-none transition-opacity" aria-hidden />

        {/* Theme toggle (top-right of hero, matches hero style) */}
        <div className="relative flex justify-end mb-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/70 dark:bg-navy-800/70 border border-slate-200 dark:border-navy-600 backdrop-blur hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
          </button>
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-6 space-y-6">

            {/* Small Badge: World's Easiest Management Platform */}
            <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-navy-600 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md">
              <User className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
              <span>World's Easiest Management for Gyms, Studios & Academies</span>
            </div>

            {/* H1 hero — spec scale: 64px / 600 / tight tracking */}
            <h1 className="text-hero-sm sm:text-hero font-display text-slate-900 dark:text-white tracking-tight leading-[1.0]">
              Your Gym.<br />
              <span className="text-gradient-brand">Under Control.</span>
            </h1>

            {/* Multi-color semantic subhead */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-lg">
              QR check-in, expiry tracking, and 1-tap renewals for{' '}
              <span className="font-semibold text-brand-600 dark:text-brand-400">members</span>,{' '}
              <span className="font-semibold text-semantic-green">renewals</span>,{' '}
              <span className="font-semibold text-semantic-blue">attendance</span>, and{' '}
              <span className="font-semibold text-semantic-yellow">revenue</span>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/signup')}
                className="btn-brand group"
              >
                <span>Start 1-Month Free Trial</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-spring group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('/login')}
                className="btn-ghost"
              >
                <LogIn className="w-4 h-4" />
                <span>Owner Login</span>
              </button>
            </div>

            {/* 3 Guarantees Below Buttons */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                </div>
                <span>No credit card required</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-semantic-green" />
                </div>
                <span>Setup in 2 minutes</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <Smartphone className="w-3.5 h-3.5 text-semantic-blue" />
                </div>
                <span>Works on any device</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: DASHBOARD MOCKUP CARD */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-slate-200 shadow-soft-dark rounded-2xl overflow-hidden text-slate-900 flex flex-col md:flex-row min-h-[480px]">

              {/* Mockup Left Sidebar */}
              <div className="w-full md:w-44 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-3.5 space-y-5 flex-shrink-0">
                <div className="font-extrabold text-slate-900 text-sm tracking-tight px-2">
                  getOwnerHQ
                </div>

                <nav className="space-y-1 text-xs font-semibold">
                  <div className="bg-brand-50 text-brand-700 p-2 rounded-xl flex items-center gap-2 font-bold">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  <div className="p-2 text-slate-600 flex items-center gap-2 hover:bg-slate-100 rounded-xl">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>Members</span>
                  </div>
                  <div className="p-2 text-slate-600 flex items-center gap-2 hover:bg-slate-100 rounded-xl">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span>Renewals</span>
                  </div>
                  <div className="p-2 text-slate-600 flex items-center gap-2 hover:bg-slate-100 rounded-xl">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <span>Reminders</span>
                  </div>
                  <div className="p-2 text-slate-600 flex items-center gap-2 hover:bg-slate-100 rounded-xl">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Payments</span>
                  </div>
                  <div className="p-2 text-slate-600 flex items-center gap-2 hover:bg-slate-100 rounded-xl">
                    <BarChart2 className="w-4 h-4 text-slate-500" />
                    <span>Reports</span>
                  </div>
                  <div className="p-2 text-slate-600 flex items-center gap-2 hover:bg-slate-100 rounded-xl">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Settings</span>
                  </div>
                </nav>
              </div>

              {/* Mockup Main Panel */}
              <div className="flex-1 p-4 bg-white space-y-4 overflow-x-auto">

                {/* Top Header inside Mockup */}
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">Dashboard</h3>
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-slate-500" />
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-sm">
                      <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold">PG</span>
                      <span>Powerhouse Gym</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* 4 Metric Cards Row — Design 1 Multi-Color Semantic Accent */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                      <span>Active Members</span>
                      <Users className="w-3 h-3 text-semantic-blue" />
                    </div>
                    <div className="text-lg font-black text-slate-900">428</div>
                    <div className="text-[9px] text-semantic-blue font-bold flex items-center gap-0.5">↑ 12 this month</div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] font-bold text-brand-600 mb-1">
                      <span>Expiring Soon</span>
                      <Calendar className="w-3 h-3 text-brand-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900">17</div>
                    <div className="text-[9px] text-brand-600 font-bold">Within 7 days</div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 mb-1">
                      <span>Overdue</span>
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900">14</div>
                    <div className="text-[9px] text-rose-600 font-bold">Over 7 days</div>
                  </div>

                  <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-600 mb-1">
                      <span>Revenue This Month</span>
                      <IndianRupee className="w-3 h-3 text-emerald-500" />
                    </div>
                    <div className="text-lg font-black text-slate-900">₹82,400</div>
                    <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">↑ 18% vs last month</div>
                  </div>

                </div>

                {/* Recent Members Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm space-y-2.5">
                  <div className="text-xs font-extrabold text-slate-800">Recent Members</div>

                  <div className="space-y-1.5 text-xs">

                    {/* Row 1 */}
                    <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-2">
                        <img className="w-6 h-6 rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Rahul" />
                        <div>
                          <div className="font-bold text-slate-900 text-[11px]">Rahul Sharma</div>
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-slate-500 text-[10px]">98765 43210</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-50 text-brand-700">
                        Expiring in 2 days
                      </span>
                      <div className="font-mono text-slate-500 text-[10px]">08 Aug 2026</div>
                    </div>

                    {/* Row 2 */}
                    <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-2">
                        <img className="w-6 h-6 rounded-full object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="Amit" />
                        <div>
                          <div className="font-bold text-slate-900 text-[11px]">Amit Patel</div>
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-slate-500 text-[10px]">91234 56789</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
                        Active
                      </span>
                      <div className="font-mono text-slate-500 text-[10px]">15 Aug 2026</div>
                    </div>

                    {/* Row 3 */}
                    <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-2">
                        <img className="w-6 h-6 rounded-full object-cover" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=80&q=80" alt="Vikram" />
                        <div>
                          <div className="font-bold text-slate-900 text-[11px]">Vikram Singh</div>
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-slate-500 text-[10px]">99887 76655</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700">
                        Pending
                      </span>
                      <div className="font-mono text-slate-400 text-[10px]">—</div>
                    </div>

                    {/* Row 4 */}
                    <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-2">
                        <img className="w-6 h-6 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Suresh" />
                        <div>
                          <div className="font-bold text-slate-900 text-[11px]">Suresh Kumar</div>
                        </div>
                      </div>
                      <div className="hidden sm:block font-mono text-slate-500 text-[10px]">90909 12345</div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700">
                        Expired
                      </span>
                      <div className="font-mono text-slate-500 text-[10px]">01 Aug 2026</div>
                    </div>

                  </div>

                  <div className="pt-1.5 text-center">
                    <button className="px-3 py-1 border border-slate-300 rounded-lg text-slate-700 font-bold text-[11px] hover:bg-slate-50 shadow-sm transition-colors">
                      View All Members
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS — 5 steps, semantic color emphasis */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-navy-600 mt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-medium text-sm md:text-base">
            Go from zero to fully automated in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* Step 1 */}
          <div className="bg-white dark:bg-[#121215] border-2 border-slate-300 dark:border-zinc-800 p-6 rounded-2xl shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
              1
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 tracking-tight">Create Your Gym</h4>
            <p className="text-sm text-slate-800 dark:text-slate-300 font-medium leading-relaxed">Sign up, set your gym name, and configure your basic membership plans instantly.</p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-[#121215] border-2 border-slate-300 dark:border-zinc-800 p-6 rounded-2xl shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
              2
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 tracking-tight">Print QR Code</h4>
            <p className="text-sm text-slate-800 dark:text-slate-300 font-medium leading-relaxed">Download and print your unique A5 standee. Place it directly at your front reception desk.</p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-[#121215] border-2 border-slate-300 dark:border-zinc-800 p-6 rounded-2xl shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
              3
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 tracking-tight">Members Join</h4>
            <p className="text-sm text-slate-800 dark:text-slate-300 font-medium leading-relaxed">Members scan the QR code to self-register in 10 seconds. No paperwork needed.</p>
          </div>

          {/* Step 4 */}
          <div className="bg-white dark:bg-[#121215] border-2 border-slate-300 dark:border-zinc-800 p-6 rounded-2xl shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
              4
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 tracking-tight">Manage & Collect</h4>
            <p className="text-sm text-slate-800 dark:text-slate-300 font-medium leading-relaxed">Track expiries, send 1-click WhatsApp reminders, and log your payments easily.</p>
          </div>

          {/* Step 5 */}
          <div className="bg-white dark:bg-[#121215] border-2 border-slate-300 dark:border-zinc-800 p-6 rounded-2xl shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-11 h-11 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center mb-4 shadow-sm">
              5
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2 tracking-tight">AutoPay Plans</h4>
            <p className="text-sm text-slate-800 dark:text-slate-300 font-medium leading-relaxed">Continue growing your gym with our SaaS AutoPay after your 1-month free trial ends.</p>
          </div>

        </div>
      </section>

      {/* WHY GYM OWNERS LOVE GETOWNERHQ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-navy-600">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Gym Owners Love GetOwnerHQ
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-medium text-sm md:text-base">
            Built strictly for modern gym owners who value speed and simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">No Paperwork</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Ditch the notebooks and physical registers. Everything is purely digital and instantly searchable.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-semantic-blue/15 dark:text-semantic-blue flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">QR-Based Registration</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Save reception time. Users simply scan the QR standee to send their details straight to your dashboard.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-semantic-green dark:bg-semantic-green/15 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Fast Member Search</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Our advanced caching instantly filters through 10,000+ members in milliseconds without loading screens.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-semantic-yellow dark:bg-semantic-yellow/15 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Membership Tracking</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Automatically calculate expiries, pending renewals, and lost members directly on your homepage.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-semantic-purple dark:bg-semantic-purple/15 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Mobile Friendly</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Designed first for your smartphone. An intuitive bottom navigation bar gives you full control on the go.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-6 rounded-2xl flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Secure Cloud Backup</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Your data is secured in real-time. If you lose your phone, your gym data is safely stored in our servers.</p>
            </div>
          </div>

        </div>
      </section>

      {/* TRUSTED BY GYM OWNERS SECTION */}
      <section className="py-12 px-4 text-center">
        <p className="text-slate-500 dark:text-slate-300 text-sm font-semibold mb-4">
          Trusted by gym owners across India
        </p>

        <div className="inline-flex items-center justify-center -space-x-2">
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Owner" />
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Owner" />
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80" alt="Owner" />
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Owner" />
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="Owner" />
          <img className="w-10 h-10 rounded-full border-2 border-white dark:border-surface-dark object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80" alt="Owner" />

          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 border-2 border-white dark:border-surface-dark text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
            +50
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Simple Flat Pricing</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Start your 1-month free trial today. No credit card required.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Starter Plan */}
          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 p-8 rounded-2xl shadow-soft-light dark:shadow-soft-dark flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Starter Gym</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Under 100 Members</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">₹499</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> Up to 100 active members</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> QR code self-registration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> 1-Click WhatsApp reminders</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> Printable A5 Standee poster</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('/signup')}
              className="btn-ghost w-full"
            >
              Start 1-Month Free Trial
            </button>
          </div>

          {/* Growth Plan — orange highlight */}
          <div className="bg-white dark:bg-navy-900/60 border-2 border-brand-500 p-8 rounded-2xl shadow-soft-light dark:shadow-soft-dark flex flex-col justify-between relative">
            <div className="absolute top-4 right-4 bg-gradient-brand text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-glow-brand">
              Most Popular
            </div>
            <div>
              <div className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">Growth Gym</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">100+ Members</h3>
              <div className="flex items-baseline gap-1 my-4">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">₹999</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300 mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> Unlimited members capacity</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> QR code self-registration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> Custom WhatsApp templates</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-semantic-green" /> Payment ledger & CSV export</li>
              </ul>
            </div>
            <button
              onClick={() => onNavigate('/signup')}
              className="btn-brand w-full"
            >
              Start 1-Month Free Trial
            </button>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Everything you need to know about the product and billing.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Do I need to download an app?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">No. getOwnerHQ is a web-app. You can access it directly from your phone browser without taking up any storage space.</p>
          </div>
          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Is my gym data secure?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Yes. We use enterprise-grade Row Level Security. Only you can access your gym data, and it is backed up automatically in the cloud.</p>
          </div>
          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Can I cancel my free trial?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Absolutely. There are no lock-in contracts and we don't even ask for your credit card to start the trial.</p>
          </div>
          <div className="bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-600 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">How do members scan the QR code?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">They just open their smartphone camera (iPhone or Android) and point it at your QR standee. It takes them directly to your gym's registration form.</p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SECTION — theme-aware, orange CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="relative bg-white dark:bg-surface-elevated-dark p-12 sm:p-16 rounded-2xl border border-slate-200 dark:border-navy-600 shadow-soft-light dark:shadow-soft-dark space-y-6 overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-30 dark:bg-mesh-dark dark:opacity-50 pointer-events-none" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Ready to stop losing renewals?
            </h2>
            <div className="pt-4">
              <button
                onClick={() => onNavigate('/signup')}
                className="btn-brand group text-base"
              >
                <span>Start Your 1-Month Free Trial</span>
                <ChevronRight className="w-5 h-5 transition-transform duration-200 ease-spring group-hover:translate-x-1" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
              No Credit Card Required • Cancel Anytime
            </p>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
