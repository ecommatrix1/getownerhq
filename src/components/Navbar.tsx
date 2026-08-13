import React, { useState } from 'react';
import { Hexagon, Dumbbell, ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header className="sticky top-0 z-50 bg-[#162032]/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <button 
          onClick={() => handleNav('/')} 
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            <Hexagon className="w-10 h-10 text-white fill-white/10 stroke-[1.5]" />
            <Dumbbell className="w-5 h-5 text-white absolute" />
          </div>
          <div>
            <div className="font-sans text-xl font-extrabold tracking-tight text-white leading-none">
              getOwnerHQ
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-wide mt-1">
              Gym Management Made Simple
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <button
            onClick={() => handleNav('/')}
            className={`text-sm font-semibold relative py-1 transition-colors ${
              currentRoute === '/' ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
            {currentRoute === '/' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            How It Works
          </button>

          <button
            onClick={() => scrollToSection('pricing')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Pricing
          </button>

          <button
            onClick={() => scrollToSection('faq')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            FAQ
          </button>

          <button
            onClick={() => scrollToSection('contact')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Contact
          </button>

          <button
            onClick={() => handleNav('/login')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Login
          </button>

          <button
            onClick={() => handleNav('/signup')}
            className="flex items-center gap-2 text-sm font-bold bg-[#4353FF] hover:bg-[#3543E0] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>
        </nav>

        {/* Mobile Action Controls */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => handleNav('/login')}
            className="px-3 py-1.5 text-xs font-bold bg-white/10 border border-slate-700 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#162032] px-4 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNav('/')}
            className={`block w-full text-left py-2 text-base font-bold transition-colors ${
              currentRoute === '/' ? 'text-blue-400' : 'text-slate-200 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="block w-full text-left py-2 text-base font-bold text-slate-200 hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="block w-full text-left py-2 text-base font-bold text-slate-200 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left py-2 text-base font-bold text-slate-200 hover:text-white transition-colors"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="block w-full text-left py-2 text-base font-bold text-slate-200 hover:text-white transition-colors"
          >
            Contact
          </button>
          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3">
            <button
              onClick={() => handleNav('/login')}
              className="w-full py-3 text-center text-base font-bold border border-slate-700 rounded-xl text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleNav('/signup')}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-base font-bold bg-[#4353FF] hover:bg-[#3543E0] text-white rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
