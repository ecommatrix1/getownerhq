import React, { useState } from 'react';
import { Dumbbell, ArrowRight, Menu, X, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentRoute !== '/') {
      onNavigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNav = (route: string) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  const isActive = (path: string) => currentRoute === path;

  const NavLink = ({
    children,
    onClick,
    active = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`relative text-sm font-semibold py-2 transition-colors duration-200 ${
        active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-brand transition-transform duration-300 ease-spring origin-left ${
          active ? 'scale-x-100' : 'scale-x-0'
        }`}
      />
    </button>
  );

  return (
    <header className="sticky top-0 z-50 glass dark:glass-dark border-b border-slate-200/60 dark:border-navy-600/60">
      <div className="container-page h-20 flex items-center justify-between">

        {/* Brand Logo */}
        <button
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 text-left focus:outline-none group"
          aria-label="getOwnerHQ home"
        >
          <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-gradient-brand shadow-glow-brand transition-transform duration-300 ease-spring group-hover:scale-105 group-hover:rotate-3">
            <Dumbbell className="w-5 h-5 text-white" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="font-display text-2xl font-extrabold tracking-tight leading-none">
              <span className="text-slate-900 dark:text-white">getOwner</span>
              <span className="text-gradient-brand">HQ</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1 hidden sm:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" />
              Gym Management, Reinvented
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <NavLink onClick={() => handleNav('/')} active={isActive('/')}>Home</NavLink>
          <NavLink onClick={() => scrollToSection('how-it-works')}>How It Works</NavLink>
          <NavLink onClick={() => scrollToSection('pricing')}>Pricing</NavLink>
          <NavLink onClick={() => scrollToSection('faq')}>FAQ</NavLink>
          <NavLink onClick={() => scrollToSection('contact')}>Contact</NavLink>
          <NavLink onClick={() => handleNav('/login')} active={isActive('/login')}>Login</NavLink>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-navy-800/70 border border-slate-200 dark:border-navy-600 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleNav('/login')}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            onClick={() => handleNav('/signup')}
            className="btn-brand group"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-spring group-hover:translate-x-1" />
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-navy-800/70 border border-slate-200 dark:border-navy-600 hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleNav('/signup')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-brand text-white shadow-glow-brand"
          >
            Free Trial
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-600 bg-white/80 dark:bg-navy-800/80 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-all duration-200"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/60 dark:border-navy-600/60 glass dark:glass-dark animate-fade-up">
          <div className="container-page py-6 space-y-1">
            <button
              onClick={() => handleNav('/')}
              className={`block w-full text-left py-3 px-4 rounded-xl text-base font-bold transition-all duration-200 ${
                isActive('/')
                  ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-3 px-4 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left py-3 px-4 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left py-3 px-4 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left py-3 px-4 rounded-xl text-base font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              Contact
            </button>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-navy-600/60 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleNav('/login')}
                className="py-3.5 text-center text-base font-bold border border-slate-200 dark:border-navy-600 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all duration-200"
              >
                Login
              </button>
              <button
                onClick={() => handleNav('/signup')}
                className="btn-brand text-sm"
              >
                Free Trial
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
