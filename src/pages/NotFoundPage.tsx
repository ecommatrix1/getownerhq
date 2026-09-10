import React from 'react';
import { Dumbbell, ArrowRight, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col font-sans">
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-60 dark:opacity-70 pointer-events-none" aria-hidden />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative max-w-md w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow-brand">
                <Dumbbell className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                404
              </h1>
              <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                Page Not Found
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="btn-brand group"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="btn-ghost"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-spring group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
