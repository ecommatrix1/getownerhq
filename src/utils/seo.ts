export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonical?: string | false;
}

const SITE = 'https://www.getownerhq.in';

const PAGE_SEO: Record<string, SeoConfig> = {
  '/': {
    title: 'getOwnerHQ — Easiest Management for Gyms, Studios & Academies',
    description: 'The easiest management software for gyms, fitness studios, MMA clubs & academies. Features QR check-in, member tracking, automated WhatsApp payment reminders, and free trial.',
    keywords: 'easiest gym management software, fitness studio software, academy management software, mma studio software, qr check-in software, gym billing software, gym attendance app',
    ogTitle: 'getOwnerHQ — Easiest Management for Gyms, Studios & Academies',
    ogDescription: 'The easiest management software for gyms, fitness studios, MMA clubs & academies. Contactless QR check-in, automated WhatsApp reminders, and financial tracking.',
    ogImage: `${SITE}/og-image.svg`,
    twitterTitle: 'getOwnerHQ — Easiest Management for Gyms, Studios & Academies',
    twitterDescription: 'The easiest management software for gyms, fitness studios, MMA clubs & academies. Contactless QR check-in, automated WhatsApp reminders, and financial tracking.',
  },
  '/signup': {
    title: 'Start Your Free Trial — getOwnerHQ Gym Management Software',
    description: 'Start your 1-month free trial of getOwnerHQ gym management software. No credit card required. Set up QR check-in, WhatsApp reminders, and member tracking in 2 minutes.',
    keywords: 'gym software free trial, gym management software signup, gym membership system free',
    ogTitle: 'Start Free Trial — getOwnerHQ Gym Management',
    ogDescription: 'Start your 1-month free trial of getOwnerHQ. No credit card required.',
    ogImage: `${SITE}/og-image.svg`,
  },
  '/login': {
    title: 'Gym Owner Login — getOwnerHQ Dashboard',
    description: 'Login to your getOwnerHQ gym management dashboard. Manage members, track renewals, and send WhatsApp reminders from your phone.',
    keywords: 'gym management login, gym owner dashboard, getownerhq login',
    ogTitle: 'Gym Owner Login — getOwnerHQ',
    ogDescription: 'Login to your getOwnerHQ gym management dashboard.',
  },
  '/about': {
    title: 'About getOwnerHQ — Our Mission & Team',
    description: 'Learn about getOwnerHQ, India\'s leading gym management software built by FounderKraft in Assam. We help gym owners automate member tracking and renewals.',
    keywords: 'about getownerhq, founderkraft, gym software india, assam startup',
    ogTitle: 'About getOwnerHQ',
    ogDescription: 'India\'s leading gym management software built by FounderKraft.',
    ogImage: `${SITE}/og-image.svg`,
  },
  '/terms': {
    title: 'Terms of Service — getOwnerHQ',
    description: 'Read the terms of service for using getOwnerHQ gym management software platform.',
    ogTitle: 'Terms of Service — getOwnerHQ',
  },
  '/privacy': {
    title: 'Privacy Policy — getOwnerHQ',
    description: 'Read the privacy policy for getOwnerHQ. Learn how we protect your gym and member data with enterprise-grade security.',
    ogTitle: 'Privacy Policy — getOwnerHQ',
  },
  '/refund': {
    title: 'Refund Policy — getOwnerHQ',
    description: 'Read the refund policy for getOwnerHQ gym management software subscriptions.',
    ogTitle: 'Refund Policy — getOwnerHQ',
  },
  '/compare': {
    title: 'Compare getOwnerHQ vs Top Gym Software — SaaS Comparison Hub',
    description: 'Compare getOwnerHQ against GymOwl, GymMaster, and Wodify. See feature, pricing (INR vs USD), and WhatsApp integration comparisons.',
    keywords: 'gym software comparison, getownerhq vs gymowl, getownerhq vs gymmaster, getownerhq vs wodify',
    ogTitle: 'Compare getOwnerHQ vs Top Gym Software',
    ogDescription: 'Compare getOwnerHQ against GymOwl, GymMaster, and Wodify.',
    ogImage: `${SITE}/og-image.svg`,
  },
  '/compare/gymowl-alternative': {
    title: 'GymOwl Alternative — Why Gyms Switch to getOwnerHQ',
    description: 'Looking for a modern GymOwl alternative in India? Discover why gym owners switch to getOwnerHQ for WhatsApp renewal reminders, A5 QR check-in, and 100% mobile management.',
    keywords: 'gymowl alternative, gymowl vs getownerhq, gymowl replacement india',
    ogTitle: 'GymOwl Alternative — getOwnerHQ',
    ogDescription: 'Why gym owners in India switch from GymOwl to getOwnerHQ.',
    ogImage: `${SITE}/og-image.svg`,
  },
  '/compare/getownerhq-vs-gymmaster': {
    title: 'getOwnerHQ vs GymMaster — Gym Management Software India',
    description: 'Compare getOwnerHQ vs GymMaster for gym management software in India. See feature, pricing (INR vs USD), and WhatsApp integration comparisons.',
    keywords: 'getownerhq vs gymmaster, gymmaster alternative india, gym software comparison',
    ogTitle: 'getOwnerHQ vs GymMaster — Feature & Pricing Comparison',
    ogDescription: 'Compare getOwnerHQ vs GymMaster. See why Indian gyms prefer getOwnerHQ.',
    ogImage: `${SITE}/og-image.svg`,
  },
  '/compare/getownerhq-vs-wodify': {
    title: 'getOwnerHQ vs Wodify — Gym Software Comparison',
    description: 'Compare getOwnerHQ vs Wodify for gym membership management. Discover why getOwnerHQ is the top affordable choice for Indian gyms.',
    keywords: 'getownerhq vs wodify, wodify alternative india, gym software comparison',
    ogTitle: 'getOwnerHQ vs Wodify — Feature & Pricing Comparison',
    ogDescription: 'Compare getOwnerHQ vs Wodify. Why Indian gyms prefer getOwnerHQ.',
    ogImage: `${SITE}/og-image.svg`,
  },
  '/dashboard': {
    title: 'Dashboard — getOwnerHQ Gym Management',
    description: 'Your gym management dashboard. Track members, renewals, payments, and attendance in real-time.',
    canonical: false, // dashboard pages shouldn't be indexed
  },
  '/dashboard/payments': {
    title: 'Payments Ledger — getOwnerHQ',
    description: 'Track all gym payments, collections, and financial history.',
    canonical: false,
  },
  '/dashboard/plans': {
    title: 'Membership Plans — getOwnerHQ',
    description: 'Manage your gym membership plans, pricing, and durations.',
    canonical: false,
  },
  '/dashboard/settings': {
    title: 'Settings — getOwnerHQ',
    description: 'Manage your gym profile, settings, and preferences.',
    canonical: false,
  },
  '/dashboard/billing': {
    title: 'Billing & Subscription — getOwnerHQ',
    description: 'Manage your getOwnerHQ subscription and billing details.',
    canonical: false,
  },
  '/dashboard/whatsapp': {
    title: 'WhatsApp Templates — getOwnerHQ',
    description: 'Create and manage WhatsApp message templates for member communication.',
    canonical: false,
  },
  '/reset-password': {
    title: 'Reset Password — getOwnerHQ',
    description: 'Reset your getOwnerHQ gym owner account password. Secure password recovery for dashboard access.',
    ogTitle: 'Reset Password — getOwnerHQ',
    ogDescription: 'Reset your getOwnerHQ gym owner account password.',
    canonical: false,
  },
  '/r/': {
    title: 'Gym Member Registration — getOwnerHQ',
    description: 'Join your gym via QR code. Quick self-registration for gym members.',
    canonical: false,
  },
};

/**
 * Get SEO config for a given path, with fallback to defaults.
 */
export function getSeoForPath(path: string): SeoConfig {
  const cleanPath = path === '/' ? '/' : path.replace(/\/+$/, '');

  // Try exact match first
  if (PAGE_SEO[cleanPath]) return PAGE_SEO[cleanPath];

  // Try prefix match for dynamic routes
  for (const [key, config] of Object.entries(PAGE_SEO)) {
    if (cleanPath.startsWith(key) && key !== '/') return config;
  }

  // Default fallback
  return {
    title: 'getOwnerHQ — Easiest Management for Gyms, Studios & Academies',
    description: 'The easiest management software for gyms, fitness studios, MMA clubs & academies.',
    ogImage: `${SITE}/og-image.svg`,
  };
}

/**
 * Apply SEO config to the document head.
 */
export function applySeo(config: SeoConfig, currentPath: string): void {
  // Title
  document.title = config.title;

  // Meta description
  setMeta('description', config.description);
  if (config.keywords) setMeta('keywords', config.keywords);

  // Canonical URL
  const canonical = config.canonical === false
    ? null
    : config.canonical || `${SITE}${currentPath === '/' ? '' : currentPath}`;
  if (canonical) {
    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonical;
  }

  // Open Graph
  const ogUrl = `${SITE}${currentPath === '/' ? '' : currentPath}`;
  setMetaProperty('og:title', config.ogTitle || config.title);
  setMetaProperty('og:description', config.ogDescription || config.description);
  setMetaProperty('og:url', ogUrl);
  if (config.ogImage) setMetaProperty('og:image', config.ogImage);

  // Twitter
  setMetaProperty('twitter:title', config.twitterTitle || config.ogTitle || config.title);
  setMetaProperty('twitter:description', config.twitterDescription || config.ogDescription || config.description);
  setMetaProperty('twitter:card', 'summary_large_image');
}

function setMeta(name: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaProperty(property: string, content: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}
