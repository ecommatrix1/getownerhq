/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          800: '#102a43',
          900: '#1E3A5F', // Primary Header
        },
        amber: {
          500: '#E8A33D', // Accent CTA
          600: '#d18c28',
        },
        surface: '#FAFAF8',
        ink: '#1C1F26',
        status: {
          active: '#2E9E5B',
          expiring: '#E8A33D',
          expired: '#D93025',
          pending: '#6B7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
