import React, { useState, useEffect, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { MarketingPage } from './pages/MarketingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PublicRegistrationPage } from './pages/PublicRegistrationPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RefundPage } from './pages/RefundPage';
import { AboutPage } from './pages/AboutPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardProvider } from './components/DashboardContext';
import { ThemeProvider } from './components/ThemeContext';
import { PrintableStandeeModal } from './components/PrintableStandeeModal';

// Lazy load authenticated dashboard components for bundle optimization
const DashboardOverview = React.lazy(() => import('./pages/DashboardOverview').then(module => ({ default: module.DashboardOverview })));
const PaymentsLedger = React.lazy(() => import('./pages/PaymentsLedger').then(module => ({ default: module.PaymentsLedger })));
const WhatsAppTemplatesPage = React.lazy(() => import('./pages/WhatsAppTemplates').then(module => ({ default: module.WhatsAppTemplatesPage })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const BillingPage = React.lazy(() => import('./pages/BillingPage').then(module => ({ default: module.BillingPage })));

// Fallback loader
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
);

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || '/';
  });

  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPath(hash || '/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route 1: QR Member Self Registration (/r/[slug])
  if (currentPath.startsWith('/r/')) {
    const slug = currentPath.replace('/r/', '') || 'powerhouse-gym';
    return <PublicRegistrationPage slug={slug} onNavigate={navigate} />;
  }

  // Route 2: Public Marketing Homepage
  if (currentPath === '/') {
    return (
      <>
        <MarketingPage onNavigate={navigate} />
        <button
          onClick={() => {
            throw new Error("Sentry Test Error from getOwnerHQ!");
          }}
          className="fixed bottom-5 right-5 z-[9999] bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
        >
          🚨 Test Sentry Error
        </button>
      </>
    );
  }

  // Route 3: Owner Sign Up
  if (currentPath === '/signup') {
    return <SignUpPage onNavigate={navigate} />;
  }

  // Route 4: Owner Login
  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  // Route 5: Reset Password Flow
  if (currentPath === '/reset-password' || currentPath.includes('type=recovery')) {
    return <ResetPasswordPage onNavigate={navigate} />;
  }

  // Legal & Policy Routes
  if (currentPath === '/about') {
    return <AboutPage onNavigate={navigate} />;
  }
  if (currentPath === '/terms') {
    return <TermsPage onNavigate={navigate} />;
  }
  if (currentPath === '/privacy') {
    return <PrivacyPage onNavigate={navigate} />;
  }
  if (currentPath === '/refund') {
    return <RefundPage onNavigate={navigate} />;
  }

  // Route 6: Authenticated Owner Dashboard Pages
  let dashboardContent = <DashboardOverview onNavigate={navigate} />;

  if (currentPath === '/dashboard/payments') {
    dashboardContent = <PaymentsLedger />;
  } else if (currentPath === '/dashboard/whatsapp') {
    dashboardContent = <WhatsAppTemplatesPage />;
  } else if (currentPath === '/dashboard/settings') {
    dashboardContent = <SettingsPage onOpenStandee={() => setIsStandeeModalOpen(true)} />;
  } else if (currentPath === '/dashboard/billing') {
    dashboardContent = <BillingPage />;
  }

  return (
    <ThemeProvider>
      <DashboardProvider>
        <DashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenStandee={() => setIsStandeeModalOpen(true)}
        >
          <Suspense fallback={<PageLoader />}>
            {dashboardContent}
          </Suspense>
        </DashboardLayout>
      </DashboardProvider>

      {/* Printable A5 Standee Modal */}
      <PrintableStandeeModal
        isOpen={isStandeeModalOpen}
        onClose={() => setIsStandeeModalOpen(false)}
      />
    </ThemeProvider>
  );
}

export default App;
