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
import { ErrorBoundary } from './components/ErrorBoundary';

// Helper to auto-retry lazy loaded chunks if deployment chunk hash changed
function lazyWithRetry<P = {}>(
  componentImport: () => Promise<any>,
  exportName?: string
): React.LazyExoticComponent<React.ComponentType<P>> {
  return React.lazy(async () => {
    try {
      const module = await componentImport();
      const comp = exportName && module[exportName] ? module[exportName] : module.default || module;
      return { default: comp };
    } catch (error) {
      console.error('Lazy chunk load failed:', error);
      const pageHasBeenRefreshed = sessionStorage.getItem('page_refreshed_on_chunk_err');
      if (!pageHasBeenRefreshed) {
        sessionStorage.setItem('page_refreshed_on_chunk_err', 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

// Lazy load authenticated dashboard components with retry logic
const DashboardOverview = lazyWithRetry<{ onNavigate: (path: string) => void }>(() => import('./pages/DashboardOverview'), 'DashboardOverview');
const PaymentsLedger = lazyWithRetry(() => import('./pages/PaymentsLedger'), 'PaymentsLedger');
const WhatsAppTemplatesPage = lazyWithRetry(() => import('./pages/WhatsAppTemplates'), 'WhatsAppTemplatesPage');
const SettingsPage = lazyWithRetry<{ onOpenStandee: () => void }>(() => import('./pages/SettingsPage'), 'SettingsPage');
const BillingPage = lazyWithRetry(() => import('./pages/BillingPage'), 'BillingPage');

// Fallback loader
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
);

export function App() {
  const resolveCurrentRoute = () => {
    let raw = '';
    const hash = window.location.hash;
    if (hash) {
      raw = hash.replace(/^#+/, '');
    } else {
      raw = window.location.pathname;
    }
    if (!raw || raw === '/') return '/';
    const clean = '/' + raw.replace(/^\/+/, '').replace(/\/+$/, '');
    return clean;
  };

  const [currentPath, setCurrentPath] = useState<string>(resolveCurrentRoute);

  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(resolveCurrentRoute());
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    // Dynamically update Canonical URL per route
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    const cleanPath = currentPath === '/' ? '' : currentPath;
    const fullCanonicalUrl = `https://getownerhq.in${cleanPath}`;
    canonicalLink.href = fullCanonicalUrl;

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = fullCanonicalUrl;

    const twitterUrl = document.querySelector<HTMLMetaElement>('meta[property="twitter:url"]');
    if (twitterUrl) twitterUrl.content = fullCanonicalUrl;
  }, [currentPath]);

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
    return <MarketingPage onNavigate={navigate} />;
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
  const cleanPath = currentPath.toLowerCase();
  let dashboardContent = <DashboardOverview onNavigate={navigate} />;

  if (
    cleanPath === '/dashboard/payments' ||
    cleanPath === '/payments' ||
    cleanPath === '/payment' ||
    cleanPath === '/pmnt' ||
    cleanPath === '/dashboard/pmnt' ||
    cleanPath === '/dashboard/payment' ||
    cleanPath.includes('payment') ||
    cleanPath.includes('pmnt')
  ) {
    dashboardContent = <PaymentsLedger />;
  } else if (cleanPath === '/dashboard/whatsapp' || cleanPath === '/whatsapp') {
    dashboardContent = <WhatsAppTemplatesPage />;
  } else if (cleanPath === '/dashboard/settings' || cleanPath === '/settings') {
    dashboardContent = <SettingsPage onOpenStandee={() => setIsStandeeModalOpen(true)} />;
  } else if (cleanPath === '/dashboard/billing' || cleanPath === '/billing') {
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
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {dashboardContent}
            </Suspense>
          </ErrorBoundary>
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
