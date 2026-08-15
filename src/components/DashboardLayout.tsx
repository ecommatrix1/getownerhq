import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  QrCode, 
  LogOut, 
  ExternalLink,
  Sparkles,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';
import { api } from '../lib/api';
import { useDashboard } from './DashboardContext';
import { useTheme } from './ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenStandee: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  onOpenStandee,
}) => {
  const { gym: safeGym, isReadOnly, loading } = useDashboard();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && !safeGym) {
      onNavigate('/login');
    }
  }, [loading, safeGym, onNavigate]);

  if (loading || !safeGym) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Users },
    { label: 'Members', path: '/dashboard/members', icon: Users },
    { label: 'Plans', path: '/dashboard/plans', icon: CreditCard },
    { label: 'Payments', path: '/dashboard/payments', icon: CreditCard },
    { label: 'WhatsApp', path: '/dashboard/whatsapp', icon: MessageSquare },
    { label: 'Settings', path: '/dashboard/settings', icon: Settings },
    { label: 'Billing', path: '/dashboard/billing', icon: ShieldAlert },
  ];

  const isRouteActive = (itemPath: string) => {
    const clean = currentPath.toLowerCase();
    if (clean === itemPath.toLowerCase()) return true;
    if (itemPath === '/dashboard/payments') {
      return ['/payments', '/payment', '/pmnt', '/dashboard/payment', '/dashboard/pmnt'].includes(clean);
    }
    if (itemPath === '/dashboard/plans') return clean === '/plans' || clean === '/dashboard/plans';
    if (itemPath === '/dashboard/whatsapp') return clean === '/whatsapp';
    if (itemPath === '/dashboard/settings') return clean === '/settings';
    if (itemPath === '/dashboard/billing') return clean === '/billing';
    return false;
  };

  const daysRemainingInTrial = () => {
    if (safeGym.subscription_status !== 'trial') return 0;
    const ends = new Date(safeGym.trial_ends_at).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((ends - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleLogout = async () => {
    await api.signOutOwner();
    onNavigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Trial / Read-Only Banners */}
      {isReadOnly ? (
        <div className="bg-red-600 text-white px-4 py-3 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md z-40 relative">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>
              Your free trial has ended. Activate your subscription to continue managing your gym. (Read-Only Mode)
            </span>
          </div>
          <button 
            onClick={() => onNavigate('/dashboard/billing')}
            className="whitespace-nowrap px-4 py-1.5 bg-white text-red-600 rounded-full font-extrabold text-[10px] uppercase tracking-wider hover:bg-red-50 transition-colors shadow-sm"
          >
            Upgrade Now
          </button>
        </div>
      ) : safeGym.subscription_status === 'trial' && !isReadOnly ? (
        <div className="bg-blue-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>
              1-Month Free Trial Active ({daysRemainingInTrial()} days left). Unlimited QR registrations & member tracking!
            </span>
          </div>
        </div>
      ) : null}

      {/* Top Navbar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200 shadow-sm dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Current Gym Display */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {safeGym.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                  {safeGym.name}
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-mono uppercase">
                    {safeGym.subscription_status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                  /{safeGym.slug} • {safeGym.city}
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Print QR Standee Trigger */}
            <button
              onClick={onOpenStandee}
              className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Print A5 QR Standee</span>
            </button>

            {/* Public QR Page Direct Link */}
            <a
              href={`#/r/${safeGym.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`/r/${safeGym.slug}`);
              }}
              className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl transition-colors"
            >
              /r/{safeGym.slug}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6 pb-24 lg:pb-6">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm sticky top-24 transition-colors duration-200">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-2">
              Gym Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      onNavigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Standee Card */}
            <div className="mt-6 bg-[#1C1F26] dark:bg-slate-800 border border-[#2A2E39] dark:border-slate-700 p-5 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
                <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Member QR Pass
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-3 leading-tight font-medium">
                Print your front-desk standee to accept self-signups without staff intervention.
              </p>
              <button
                onClick={onOpenStandee}
                className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-center"
              >
                View Poster
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-4">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`flex flex-col items-center justify-center w-full py-2.5 gap-1 transition-colors ${
                active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'fill-blue-100' : ''}`} />
              <span className={`text-[9px] font-bold tracking-wide ${active ? 'text-blue-700' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
