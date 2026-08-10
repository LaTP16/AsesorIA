/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        movistar: {
          blue: '#019BDE',
          darkBlue: '#0050B5',
          navy: '#0B1D3A',
          header: '#002E66',
          bg: '#F4F7FA',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        urgency: {
          high: {
            bg: '#FEE2E2',
            text: '#991B1B',
            border: '#FCA5A5',
            badge: '#DC2626',
          },
          med: {
            bg: '#FEF3C7',
            text: '#92400E',
            border: '#FDE68A',
            badge: '#D97706',
          },
          low: {
            bg: '#F3F4F6',
            text: '#374151',
            border: '#E5E7EB',
            badge: '#6B7280',
          },
        },
        acceptance: {
          green: '#10B981',
          lightGreen: '#ECFDF5',
          darkGreen: '#065F46',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
