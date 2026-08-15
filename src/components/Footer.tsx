import React from 'react';
import { Dumbbell, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="contact" className="bg-[#101827] text-[#B8C2D6] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#5B6CFF] to-[#8A7DFF] flex items-center justify-center text-white font-bold">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="font-sans text-xl font-bold text-[#F8FAFC]">
                getOwner<span className="text-[#5B6CFF]">HQ</span>
              </span>
            </div>
            <p className="text-sm text-[#B8C2D6] leading-relaxed">
              Simple, powerful QR self-registration and gym management platform built specifically for modern fitness businesses.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate('/')} className="hover:text-[#5B6CFF] transition-colors text-left">Home</button></li>
              <li><button onClick={() => onNavigate('/about')} className="hover:text-[#5B6CFF] transition-colors text-left">About Us</button></li>
              <li><button onClick={() => onNavigate('/signup')} className="hover:text-[#5B6CFF] transition-colors text-left">Create Account</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-4">Comparisons</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate('/compare/gymowl-alternative')} className="hover:text-[#5B6CFF] transition-colors text-left">GymOwl Alternative</button></li>
              <li><button onClick={() => onNavigate('/compare/getownerhq-vs-gymmaster')} className="hover:text-[#5B6CFF] transition-colors text-left">vs GymMaster</button></li>
              <li><button onClick={() => onNavigate('/compare/getownerhq-vs-wodify')} className="hover:text-[#5B6CFF] transition-colors text-left">vs Wodify</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => onNavigate('/privacy')} className="hover:text-[#5B6CFF] transition-colors text-left">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('/terms')} className="hover:text-[#5B6CFF] transition-colors text-left">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('/refund')} className="hover:text-[#5B6CFF] transition-colors text-left">Refund Policy</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#F8FAFC] uppercase tracking-wider mb-4">Contact & Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="tel:+918876661110" className="hover:text-[#5B6CFF] transition-colors block">Phone / WhatsApp: +91 8876661110</a></li>
              <li><a href="mailto:founderkraft@gmail.com" className="hover:text-[#5B6CFF] transition-colors block">Email: founderkraft@gmail.com</a></li>
              <li className="text-slate-400 block text-xs">Address: Assam, India</li>
              <li><button onClick={() => onNavigate('/terms')} className="hover:text-[#5B6CFF] transition-colors text-left">Support & Help</button></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center text-xs text-[#B8C2D6] gap-4">
          <p>© {new Date().getFullYear()} getOwnerHQ. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for Gym Owners <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
