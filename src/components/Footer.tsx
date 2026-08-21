import React from 'react';
import { Dumbbell, Heart, Phone, Mail, MapPin, ArrowUpRight, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const year = new Date().getFullYear();

  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'How It Works', route: '/#how-it-works' },
        { label: 'Pricing',     route: '/#pricing' },
        { label: 'About Us',    route: '/about' },
        { label: 'Create Account', route: '/signup' },
      ],
    },
    {
      title: 'Compare',
      links: [
        { label: 'vs GymOwl',   route: '/compare/gymowl-alternative' },
        { label: 'vs GymMaster',route: '/compare/getownerhq-vs-gymmaster' },
        { label: 'vs Wodify',   route: '/compare/getownerhq-vs-wodify' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', route: '/privacy' },
        { label: 'Terms of Service', route: '/terms' },
        { label: 'Refund Policy', route: '/refund' },
      ],
    },
  ];

  return (
    <footer id="contact" className="relative overflow-hidden bg-navy-975 dark:bg-navy-975 text-slate-300">
      {/* Decorative mesh gradient — premium feel */}
      <div className="absolute inset-0 opacity-60 bg-mesh pointer-events-none" aria-hidden />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/60 to-transparent" aria-hidden />

      <div className="relative container-page py-20">

        {/* Top: brand block + newsletter-style CTA + columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">

          {/* Brand */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-brand shadow-glow-brand">
                <Dumbbell className="w-5 h-5 text-white" strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-navy-975 animate-pulse" />
              </div>
              <div>
                <div className="font-display text-2xl font-extrabold leading-none">
                  <span className="text-white">getOwner</span>
                  <span className="text-gradient-brand">HQ</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-400" />
                  Gym Management, Reinvented
                </div>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-400 max-w-md">
              India's most loved QR-based gym management platform. Replace paper registers
              with contactless check-ins, automated renewals, and 1-click WhatsApp reminders.
            </p>

            {/* Trust chip row */}
            <div className="flex flex-wrap gap-2">
              <span className="badge !bg-white/5 !text-slate-200 border border-white/10">
                🇮🇳 Made in India
              </span>
              <span className="badge !bg-white/5 !text-slate-200 border border-white/10">
                🔒 RLS-secured
              </span>
              <span className="badge !bg-white/5 !text-slate-200 border border-white/10">
                � 1-month free trial
              </span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="lg:col-span-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-[0.14em] mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onNavigate(link.route)}
                      className="group inline-flex items-center gap-1 text-slate-400 hover:text-brand-400 transition-colors duration-200 text-left"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact card */}
          <div className="lg:col-span-1 space-y-3 text-sm">
            <h4 className="text-xs font-bold text-white uppercase tracking-[0.14em] mb-5">
              Contact
            </h4>
            <a
              href="tel:+918876661110"
              className="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> +91 8876661110
            </a>
            <a
              href="mailto:founderkraft@gmail.com"
              className="flex items-center gap-2 text-slate-400 hover:text-brand-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> founderkraft@gmail.com
            </a>
            <p className="flex items-center gap-2 text-slate-500 text-xs">
              <MapPin className="w-3.5 h-3.5" /> Assam, India
            </p>
          </div>
        </div>

        {/* CTA strip */}
        <div className="relative rounded-2xl bg-gradient-brand-soft border border-white/10 p-6 sm:p-8 mb-12 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" aria-hidden />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Ready to grow your gym?
              </h3>
              <p className="text-slate-400 mt-1 text-sm">
                Start your 1-month free trial — no credit card needed.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/signup')}
              className="btn-brand shrink-0"
            >
              Start Free Trial
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {year} getOwnerHQ. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built for Gym Owners <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
