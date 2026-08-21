/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── BRAND: dark orange primary (#E87916) — 80/15/5 rule ───
      colors: {
        brand: {
          50:  '#FFF5EC',
          100: '#FFE7D2',
          200: '#FFD1A5',
          300: '#FFB473',
          400: '#FF6B1A',
          500: '#FF5500',  // Electric Brand Orange primary
          600: '#E64D00',  // hover/active
          700: '#CC4400',  // pressed
          800: '#A13600',
          900: '#7A2900',
          950: '#4A1900',
        },
        accent: {
          400: '#FF6B1A',
          500: '#FF5500',
          600: '#E64D00',
        },
        // neutral onyx/charcoal dark-mode hierarchy — 0 AI blue
        navy: {
          50:  '#F4F4F5',
          100: '#E4E4E7',
          200: '#D4D4D8',
          400: '#71717A',
          500: '#52525B',  // text muted
          600: '#3F3F46',  // strong border
          700: '#27272A',  // border
          800: '#18181B',  // elevated
          900: '#121215',  // card
          950: '#0F0F12',  // section
          975: '#0A0A0C',  // page canvas
        },
        amber: {
          50:  '#FFFBEB',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        // light & pitch black surface definitions
        surface: {
          DEFAULT: '#FFFFFF',  // pure crisp light bg
          section: '#FAFAF8',  // section bg light
          card:    '#FFFFFF',  // card bg light
          dark:    '#0A0A0C',  // pitch obsidian canvas
          'section-dark': '#0F0F12',
          'card-dark':    '#121215',
          'elevated-dark':'#18181B',
        },
        ink: {
          DEFAULT: '#1C1F26',  // primary text light
          muted:   '#475569',  // secondary text
          dim:     '#94A3B8',  // tertiary text
          'inverse': '#F4F6F8', // primary text dark
          'inverse-muted': '#A0AEC0',
        },
        // semantic status — light + dark pairs
        status: {
          active:        '#22A06B',  // green light
          'active-dark': '#2FC27D',
          expiring:      '#EAB308',  // yellow light
          'expiring-dark':'#F2C94C',
          expired:       '#DC4C4C',  // red light — limited use
          'expired-dark':'#EF6262',
          pending:       '#94A3B8',
        },
        // semantic colors used for tone pills (members/renewals/attendance/revenue)
        semantic: {
          blue:    '#3B82F6',
          'blue-dark':   '#4A90FF',
          green:   '#22A06B',
          'green-dark':  '#2FC27D',
          yellow:  '#EAB308',
          'yellow-dark': '#F2C94C',
          red:     '#DC4C4C',
          'red-dark':    '#EF6262',
          purple:  '#8B5CF6',
          'purple-dark': '#9B7BFF',
        },
      },

      fontFamily: {
        sans:    ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Inter', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        // per spec — H1 hero scale
        'hero':  ['4rem',    { lineHeight: '1.0', letterSpacing: '-0.045em', fontWeight: '600' }],     // 64
        'hero-sm':['3.5rem', { lineHeight: '1.02', letterSpacing: '-0.04em',  fontWeight: '600' }],   // 56
      },

      borderRadius: {
        '4xl': '1.25rem',  // 20px — spec target
        '5xl': '1.5rem',   // 24px — generous cards
      },

      boxShadow: {
        // restrained glows — 5% brand rule
        'glow-brand':     '0 8px 30px -8px rgba(232,121,22,0.18)',
        'glow-brand-lg':  '0 16px 48px -12px rgba(232,121,22,0.28)',
        'inner-line':     'inset 0 1px 0 0 rgba(255,255,255,0.06)',
        'card-hover':     '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
        // soft elevations (light + dark)
        'soft-light':     '0 8px 30px rgba(17,24,39,0.04)',
        'soft-dark':      '0 20px 60px rgba(0,0,0,0.22)',
      },

      backgroundImage: {
        // primary orange gradient — slight angle, no extreme purple stop
        'gradient-brand':  'linear-gradient(135deg, #E87916 0%, #F29640 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(232,121,22,0.12) 0%, rgba(242,150,64,0.12) 100%)',
        // mesh uses warm orange tints, very low opacity (5% rule)
        'gradient-mesh': 'radial-gradient(at 20% 20%, rgba(232,121,22,0.10) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(242,150,64,0.10) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(201,96,14,0.08) 0px, transparent 50%)',
        // dark mesh variant for night sections
        'gradient-mesh-dark': 'radial-gradient(at 20% 20%, rgba(232,121,22,0.06) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(242,150,64,0.05) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(0,0,0,0.30) 0px, transparent 50%)',
      },

      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-pulse': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
      },

      animation: {
        'fade-up':    'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':    'shimmer 2s linear infinite',
        'gradient-pulse': 'gradient-pulse 6s ease infinite',
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}