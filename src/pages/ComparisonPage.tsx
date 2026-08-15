import React, { useEffect } from 'react';
import { 
  Check, 
  X, 
  ArrowRight, 
  LogIn, 
  Sparkles, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface ComparisonPageProps {
  slug?: string;
  onNavigate: (route: string) => void;
}

interface ComparisonData {
  title: string;
  metaDesc: string;
  heroBadge: string;
  h1: string;
  subhead: string;
  competitorName: string;
  tagline: string;
  keyVerdict: string;
  features: Array<{
    name: string;
    description: string;
    getOwnerHQ: boolean | string;
    competitor: boolean | string;
  }>;
  prosCons: {
    getOwnerHQPros: string[];
    competitorCons: string[];
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

const COMPARISONS: Record<string, ComparisonData> = {
  'gymowl-alternative': {
    title: 'GymOwl Alternative — Why Gyms Switch to getOwnerHQ',
    metaDesc: 'Looking for a modern GymOwl alternative in India? Discover why gym owners switch to getOwnerHQ for WhatsApp renewal reminders, A5 QR check-in, and 100% mobile management.',
    heroBadge: 'Top GymOwl Alternative in India',
    h1: 'The #1 GymOwl Alternative Built for Indian Gym Owners',
    subhead: 'No complex app downloads for members. Manage ex-members, WhatsApp renewals, and QR self-registration cleanly from your phone.',
    competitorName: 'GymOwl',
    tagline: 'GymOwl is traditional legacy software. getOwnerHQ is built mobile-first for 2026 Indian gym owners.',
    keyVerdict: 'getOwnerHQ offers 1-tap WhatsApp renewal messaging, instant A5 QR standee check-ins, and a 100% mobile-card interface that works without a laptop.',
    features: [
      { name: 'Automated 1-Tap WhatsApp Reminders', description: 'Send pre-filled renewal alerts directly to member WhatsApp', getOwnerHQ: true, competitor: 'Limited / Extra Cost' },
      { name: 'Printable A5 QR Code Standee', description: 'Instant self-registration poster for gym front desk', getOwnerHQ: true, competitor: false },
      { name: '100% Mobile Responsive (No Laptop Needed)', description: 'Manage 10,000+ members vertically on smartphones', getOwnerHQ: true, competitor: 'Desktop Heavy' },
      { name: 'Dues & Partial Payment Clearance', description: 'Track pending balances and auto-log Dues Clearance receipts', getOwnerHQ: true, competitor: true },
      { name: 'Pricing Transparency', description: 'Flat INR pricing with 1-Month Free Trial', getOwnerHQ: '₹499 - ₹999/mo', competitor: 'Custom Quote / Tiers' },
      { name: 'Setup Time', description: 'Time needed to onboard your gym', getOwnerHQ: '2 Minutes', competitor: 'Hours to Days' },
    ],
    prosCons: {
      getOwnerHQPros: [
        'Built 100% for smartphones — no desktop required',
        'Direct 1-tap WhatsApp renewal messaging',
        'Printable QR Standee poster included',
        '1-Month Full Free Trial with zero credit card required'
      ],
      competitorCons: [
        'Requires desktop/laptop for full feature access',
        'Complex setup procedure for staff',
        'Member app download barrier',
        'Higher monthly pricing tiers'
      ]
    },
    faqs: [
      {
        question: 'Why is getOwnerHQ better than GymOwl for small gyms in India?',
        answer: 'getOwnerHQ is built mobile-first. In India, over 60% of gym owners run their business entirely from their phone. getOwnerHQ allows you to check expiries, track dues, and send WhatsApp reminders in 1 tap without needing a laptop.'
      },
      {
        question: 'Can I import my existing member database from GymOwl?',
        answer: 'Yes! You can upload your existing member list or add members manually in seconds during your 1-month free trial.'
      },
      {
        question: 'Do my gym members need to download an app?',
        answer: 'No. Gym members simply scan your front-desk QR standee using their phone camera to self-register. Zero app downloads required.'
      }
    ]
  },

  'getownerhq-vs-gymmaster': {
    title: 'getOwnerHQ vs GymMaster — Gym Management Software India',
    metaDesc: 'Compare getOwnerHQ vs GymMaster for gym management software in India. See feature, pricing (INR vs USD), and WhatsApp integration comparisons.',
    heroBadge: 'Comparison: getOwnerHQ vs GymMaster',
    h1: 'getOwnerHQ vs GymMaster: Which Software is Best for Indian Gyms?',
    subhead: 'GymMaster is a global enterprise tool priced in USD. getOwnerHQ is built specifically for Indian gym owners with native WhatsApp integration and flat INR pricing.',
    competitorName: 'GymMaster',
    tagline: 'GymMaster costs $50+/month (₹4,000+) with global features. getOwnerHQ starts at ₹499/month built for Indian fitness centers.',
    keyVerdict: 'If you run an Indian gym and want affordable pricing, native WhatsApp messaging, and mobile-first usability, getOwnerHQ is the clear choice.',
    features: [
      { name: 'Pricing Currency', description: 'Local billing currency', getOwnerHQ: 'INR (₹)', competitor: 'USD ($)' },
      { name: 'Starting Price', description: 'Monthly entry fee', getOwnerHQ: '₹499 / month', competitor: '$50+ (~₹4,150 / mo)' },
      { name: 'WhatsApp Billing Automation', description: 'Direct WhatsApp integration for renewals', getOwnerHQ: true, competitor: 'Requires 3rd-Party SMS' },
      { name: 'QR Code Front Desk Standee', description: 'Instant member self-registration standee', getOwnerHQ: true, competitor: 'Complex Hardware' },
      { name: 'Ease of Use on Mobile Phone', description: 'Designed for smartphone screens', getOwnerHQ: '10 / 10', competitor: '6 / 10 (Desktop-first)' },
      { name: 'Free Trial', description: 'Trial period available', getOwnerHQ: '1 Month Free', competitor: 'Demo Required' },
    ],
    prosCons: {
      getOwnerHQPros: [
        'Affordable flat INR pricing (save up to 80% per month)',
        'Native WhatsApp messaging for Indian gym owners',
        'Mobile-card interface built for single-handed phone use',
        'A5 QR standee self-registration without hardware cost'
      ],
      competitorCons: [
        'Expensive USD pricing subject to exchange rate shifts',
        'Overly complex features not needed by typical Indian gyms',
        'Requires expensive gate/turnstile hardware for full value',
        'No native WhatsApp integration out of the box'
      ]
    },
    faqs: [
      {
        question: 'Is getOwnerHQ much cheaper than GymMaster?',
        answer: 'Yes! GymMaster starts at $50/month (over ₹4,000/month), whereas getOwnerHQ starts at just ₹499/month with a 1-month free trial.'
      },
      {
        question: 'Does getOwnerHQ support WhatsApp renewal reminders?',
        answer: 'Yes! getOwnerHQ includes 1-tap WhatsApp renewal alerts out of the box, allowing you to remind expiring members in seconds.'
      }
    ]
  },

  'getownerhq-vs-wodify': {
    title: 'getOwnerHQ vs Wodify — Gym Software Comparison',
    metaDesc: 'Compare getOwnerHQ vs Wodify for gym membership management. Discover why getOwnerHQ is the top affordable choice for Indian gyms.',
    heroBadge: 'Comparison: getOwnerHQ vs Wodify',
    h1: 'getOwnerHQ vs Wodify: Comparison for Gym Owners',
    subhead: 'Wodify is designed for expensive US CrossFit boxes. getOwnerHQ is built for commercial Indian gyms, fitness clubs, and personal training studios.',
    competitorName: 'Wodify',
    tagline: 'Wodify is complex and expensive. getOwnerHQ is simple, affordable, and WhatsApp-native.',
    keyVerdict: 'getOwnerHQ provides maximum value for Indian gym owners who want fast member tracking, dues clearance, and WhatsApp reminders without Wodify\'s heavy software fees.',
    features: [
      { name: 'Target Market', description: 'Primary audience', getOwnerHQ: 'Indian Gyms & Fitness Clubs', competitor: 'US CrossFit Boxes' },
      { name: 'Monthly Cost', description: 'Starting plan pricing', getOwnerHQ: '₹499 / month', competitor: '$149+ (~₹12,400 / mo)' },
      { name: 'WhatsApp Reminders', description: '1-tap WhatsApp notification system', getOwnerHQ: true, competitor: false },
      { name: 'QR Self-Registration', description: 'Printable front desk standee poster', getOwnerHQ: true, competitor: 'App Login Only' },
      { name: 'Learning Curve', description: 'Time needed for staff to learn', getOwnerHQ: '5 Minutes', competitor: 'Steep' },
    ],
    prosCons: {
      getOwnerHQPros: [
        'Built for Indian market demands and UPI / Cash workflows',
        'Extremely low cost compared to Wodify ($149/mo)',
        'Zero member app barrier — scan QR to join',
        'Mobile dashboard tailored for fast daily check-ins'
      ],
      competitorCons: [
        'Extremely expensive for Indian gym budgets',
        'Over-engineered for basic gym renewal and check-in needs',
        'No WhatsApp integration for Indian communications',
        'Requires members to install heavy smartphone app'
      ]
    },
    faqs: [
      {
        question: 'Why choose getOwnerHQ over Wodify in India?',
        answer: 'Wodify costs over ₹12,000 per month ($149+). getOwnerHQ costs ₹499/month, includes native WhatsApp messaging, and is built specifically for Indian gym owners.'
      }
    ]
  }
};

export const ComparisonPage: React.FC<ComparisonPageProps> = ({ slug = 'overview', onNavigate }) => {
  const cleanSlug = slug.replace('/compare/', '').replace('compare/', '');
  const isOverview = !cleanSlug || cleanSlug === 'overview' || !COMPARISONS[cleanSlug];
  const data = COMPARISONS[cleanSlug] || COMPARISONS['gymowl-alternative'];

  useEffect(() => {
    // Dynamic Schema Injection
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'dynamic-comparison-schema';

    if (isOverview) {
      schemaScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'getOwnerHQ Gym Software Comparisons',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'GymOwl Alternative', 'url': 'https://getownerhq.in/compare/gymowl-alternative' },
          { '@type': 'ListItem', 'position': 2, 'name': 'getOwnerHQ vs GymMaster', 'url': 'https://getownerhq.in/compare/getownerhq-vs-gymmaster' },
          { '@type': 'ListItem', 'position': 3, 'name': 'getOwnerHQ vs Wodify', 'url': 'https://getownerhq.in/compare/getownerhq-vs-wodify' }
        ]
      });
    } else {
      schemaScript.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            'name': data.title,
            'description': data.metaDesc,
            'url': `https://getownerhq.in/compare/${cleanSlug}`
          },
          {
            '@type': 'FAQPage',
            'mainEntity': data.faqs.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          }
        ]
      });
    }

    const existing = document.getElementById('dynamic-comparison-schema');
    if (existing) existing.remove();
    document.head.appendChild(schemaScript);

    return () => {
      const el = document.getElementById('dynamic-comparison-schema');
      if (el) el.remove();
    };
  }, [cleanSlug, isOverview, data]);

  if (isOverview) {
    return (
      <div className="min-h-screen bg-[#1D283A] text-white font-sans selection:bg-[#4353FF] selection:text-white">
        <Navbar onNavigate={onNavigate} currentRoute="/compare" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>SaaS Comparison Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Compare getOwnerHQ vs Top Gym Software
            </h1>
            <p className="text-base sm:text-lg text-slate-300">
              See why gym owners across India are switching to getOwnerHQ for WhatsApp reminders, QR self-registration, and mobile-native management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Alternative Guide</span>
                <h2 className="text-2xl font-bold text-white mt-2 mb-4">GymOwl Alternative</h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Discover why Indian gym owners choose getOwnerHQ over GymOwl for 1-tap WhatsApp renewal messaging and phone-first mobile cards.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/compare/gymowl-alternative')}
                className="w-full py-3 bg-[#4353FF] hover:bg-[#3543E0] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <span>Read Comparison</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Head-to-Head</span>
                <h2 className="text-2xl font-bold text-white mt-2 mb-4">getOwnerHQ vs GymMaster</h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Save up to 80% on monthly software costs. Compare flat INR pricing vs expensive USD global fees.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/compare/getownerhq-vs-gymmaster')}
                className="w-full py-3 bg-[#4353FF] hover:bg-[#3543E0] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <span>Read Comparison</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Head-to-Head</span>
                <h2 className="text-2xl font-bold text-white mt-2 mb-4">getOwnerHQ vs Wodify</h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Wodify costs $149+/mo for US CrossFit boxes. getOwnerHQ starts at ₹499/mo tailored for Indian fitness centers.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/compare/getownerhq-vs-wodify')}
                className="w-full py-3 bg-[#4353FF] hover:bg-[#3543E0] text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <span>Read Comparison</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1D283A] text-white font-sans selection:bg-[#4353FF] selection:text-white">
      <Navbar onNavigate={onNavigate} currentRoute={`/compare/${cleanSlug}`} />

      {/* HERO SECTION */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>{data.heroBadge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          {data.h1}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {data.subhead}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('/signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#4353FF] hover:bg-[#3543E0] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            <span>Start 1-Month Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('/login')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-sm px-8 py-4 rounded-xl transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Owner Login</span>
          </button>
        </div>
      </section>

      {/* VERDICT SUMMARY BANNER */}
      <section className="py-8 px-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-900/40 via-slate-800/60 to-blue-900/40 border border-blue-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xl">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">The Bottom Line Verdict</span>
          <p className="text-lg sm:text-xl text-white font-semibold leading-relaxed">
            "{data.keyVerdict}"
          </p>
        </div>
      </section>

      {/* COMPARISON MATRIX TABLE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Side-by-Side Feature Matrix</h2>
          <p className="text-sm text-slate-300 mt-2">Compare getOwnerHQ directly against {data.competitorName}.</p>
        </div>

        <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase text-slate-300">
                <th className="py-4 px-6">Feature / Metric</th>
                <th className="py-4 px-6 text-blue-400 bg-blue-500/10 border-x border-blue-500/20">getOwnerHQ</th>
                <th className="py-4 px-6 text-slate-400">{data.competitorName}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {data.features.map((feat, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{feat.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{feat.description}</div>
                  </td>
                  <td className="py-4 px-6 bg-blue-500/10 border-x border-blue-500/20 font-bold text-blue-300">
                    {typeof feat.getOwnerHQ === 'boolean' ? (
                      feat.getOwnerHQ ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="w-5 h-5" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <X className="w-5 h-5" />
                          <span>No</span>
                        </div>
                      )
                    ) : (
                      feat.getOwnerHQ
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {typeof feat.competitor === 'boolean' ? (
                      feat.competitor ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="w-5 h-5" />
                          <span>Yes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-400">
                          <X className="w-5 h-5" />
                          <span>No</span>
                        </div>
                      )
                    ) : (
                      feat.competitor
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PROS & CONS */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Why Choose getOwnerHQ */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
              <Check className="w-6 h-6" />
              <h3>Why Choose getOwnerHQ</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-200">
              {data.prosCons.getOwnerHQPros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drawbacks of Competitor */}
          <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
              <X className="w-6 h-6" />
              <h3>Drawbacks of {data.competitorName}</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {data.prosCons.competitorCons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <X className="w-4 h-4 text-rose-400 mt-1 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {data.faqs.map((faq, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-2">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-slate-800 to-[#121B2B] p-10 sm:p-14 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to experience the #1 gym software in India?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join gym owners who eliminated churn and automated WhatsApp billing renewals.
          </p>
          <div>
            <button
              onClick={() => onNavigate('/signup')}
              className="inline-flex items-center gap-2 bg-[#4353FF] hover:bg-[#3543E0] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-xl transition-all"
            >
              <span>Start Your 1-Month Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
export default ComparisonPage;
