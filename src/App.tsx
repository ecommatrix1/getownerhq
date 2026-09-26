import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getSeoForPath, applySeo } from './utils/seo';
import { MarketingPage } from './pages/MarketingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { PublicRegistrationPage } from './pages/PublicRegistrationPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { RefundPage } from './pages/RefundPage';
import { AboutPage } from './pages/AboutPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardProvider } from './components/DashboardContext';
import { ThemeProvider } from './components/ThemeContext';
import { PrintableStandeeModal } from './components/PrintableStandeeModal';
import { ErrorBoundary } from './components/ErrorBoundary';

import { DashboardOverview } from './pages/DashboardOverview';
import { PaymentsLedger } from './pages/PaymentsLedger';
import { WhatsAppTemplatesPage } from './pages/WhatsAppTemplates';
import { SettingsPage } from './pages/SettingsPage';
import { PlansPage } from './pages/PlansPage';
import { BillingPage } from './pages/BillingPage';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export function App() {
  const resolveCurrentRoute = () => {
    let raw = '';
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    // Check if hash represents a section anchor or route
    if (hash && (hash === '#how-it-works' || hash === '#pricing' || hash === '#faq' || hash === '#contact')) {
      raw = '/';
    } else if (hash && hash.startsWith('#/')) {
      const hashRoute = hash.replace(/^#+/, '');
      if (
        hashRoute === '/how-it-works' ||
        hashRoute === '/pricing' ||
        hashRoute === '/faq' ||
        hashRoute === '/contact'
      ) {
        raw = '/';
      } else {
        raw = hashRoute;
      }
    } else {
      raw = pathname;
    }

    let clean = '/' + raw.replace(/^\/+/, '').replace(/\/+$/, '');
    // Strip any query string from route matching
    const qIdx = clean.indexOf('?');
    if (qIdx !== -1) {
      clean = clean.substring(0, qIdx);
    }
    return clean || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(resolveCurrentRoute);

  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(resolveCurrentRoute());
      const rawHash = window.location.hash.replace(/^#+/, '');
      if (rawHash && (rawHash === 'how-it-works' || rawHash === 'pricing' || rawHash === 'faq' || rawHash === 'contact')) {
        setTimeout(() => {
          const el = document.getElementById(rawHash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    const seoConfig = getSeoForPath(currentPath);
    applySeo(seoConfig, currentPath);
  }, [currentPath]);

  const navigate = (path: string) => {
    // 1. In-page marketing section anchors
    if (
      path.startsWith('/#') ||
      path.startsWith('#') ||
      path === '/how-it-works' ||
      path === '/pricing' ||
      path === '/faq' ||
      path === '/contact'
    ) {
      const sectionId = path.replace(/^\/?#?/, '');
      const targetHash = sectionId ? `#${sectionId}` : '';

      if (window.location.pathname !== '/' || window.location.hash.startsWith('#/')) {
        window.history.pushState(null, '', '/' + targetHash);
      } else {
        window.history.pushState(null, '', targetHash || '/');
      }
      setCurrentPath('/');

      setTimeout(() => {
        if (sectionId) {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }, 60);
      return;
    }

    // 2. Full page routing with pushState
    window.history.pushState(null, '', path);
    setCurrentPath(resolveCurrentRoute());
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Route 1: QR Member Self Registration (/r/[slug])
  const renderRoute = () => {
    // Route 1: QR Member Self Registration (/r/[slug])
    if (currentPath.startsWith('/r/')) {
      const rawSlug = currentPath.replace(/^\/r\//i, '');
      const slug = decodeURIComponent(rawSlug || '').trim().replace(/\/+$/, '') || 'powerhouse-gym';
      return <PublicRegistrationPage slug={slug} onNavigate={navigate} />;
    }

    // Route 2: Public Marketing Homepage & Sections
    if (
      currentPath === '/' ||
      currentPath === '' ||
      currentPath === '/how-it-works' ||
      currentPath === '/pricing' ||
      currentPath === '/faq' ||
      currentPath === '/contact'
    ) {
      const section = (currentPath === '/' || currentPath === '') ? undefined : currentPath.replace(/^\//, '');
      return <MarketingPage onNavigate={navigate} targetSection={section} />;
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

    // Client fallback if an /api/ endpoint (such as Meta OAuth redirect) was caught by client navigation
    if (window.location.pathname.startsWith('/api/')) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (const reg of registrations) {
            reg.unregister();
          }
          window.location.reload();
        });
      } else {
        window.location.reload();
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md mx-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900">Connecting WhatsApp Cloud API...</h2>
            <p className="text-sm text-gray-500 mt-2">Completing Meta verification. Handing over to serverless function...</p>
          </div>
        </div>
      );
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

    // SEO & GEO Comparison Routes (/compare/*)
    if (currentPath.startsWith('/compare')) {
      return <ComparisonPage slug={currentPath} onNavigate={navigate} />;
    }

    // Route 6: Authenticated Owner Dashboard Pages
    const cleanPath = currentPath.toLowerCase();
    let dashboardContent = <DashboardOverview currentPath={currentPath} onNavigate={navigate} />;

    if (
      cleanPath === '/dashboard' ||
      cleanPath === '/dashboard/' ||
      cleanPath === '/app' ||
      cleanPath === '/dashboard/members' ||
      cleanPath === '/dashboard/members/' ||
      cleanPath === '/members' ||
      cleanPath === '/members/'
    ) {
      dashboardContent = <DashboardOverview currentPath={currentPath} onNavigate={navigate} />;
    } else if (
      cleanPath === '/dashboard/payments' ||
      cleanPath === '/payments' ||
      cleanPath === '/payment' ||
      cleanPath === '/pmnt' ||
      cleanPath === '/dashboard/pmnt' ||
      cleanPath === '/dashboard/payment' ||
      (cleanPath.includes('payment') && !cleanPath.includes('plan')) ||
      cleanPath.includes('pmnt')
    ) {
      dashboardContent = <PaymentsLedger />;
    } else if (cleanPath === '/dashboard/plans' || cleanPath === '/plans') {
      dashboardContent = <PlansPage />;
    } else if (cleanPath === '/dashboard/whatsapp' || cleanPath === '/whatsapp') {
      dashboardContent = <WhatsAppTemplatesPage />;
    } else if (cleanPath === '/dashboard/settings' || cleanPath === '/settings') {
      dashboardContent = <SettingsPage onOpenStandee={() => setIsStandeeModalOpen(true)} />;
    } else if (cleanPath === '/dashboard/billing' || cleanPath === '/billing') {
      dashboardContent = <BillingPage />;
    } else if (cleanPath.startsWith('/dashboard')) {
      // Safe fallback for any unspecified dashboard routes
      dashboardContent = <DashboardOverview currentPath={currentPath} onNavigate={navigate} />;
    } else {
      // 404 - Unknown route
      return <NotFoundPage onNavigate={navigate} />;
    }

    return (
      <DashboardProvider>
        <DashboardLayout
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenStandee={() => setIsStandeeModalOpen(true)}
        >
          <ErrorBoundary>
            {dashboardContent}
          </ErrorBoundary>
        </DashboardLayout>
      </DashboardProvider>
    );
  };

  return (
    <ThemeProvider>
      {renderRoute()}

      {/* Printable A5 Standee Modal */}
      <PrintableStandeeModal
        isOpen={isStandeeModalOpen}
        onClose={() => setIsStandeeModalOpen(false)}
      />
    </ThemeProvider>
  );
}

export default App;
