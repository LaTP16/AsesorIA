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
          navy: '#002E66',
          deepNavy: '#001D42',
        },
      },
    },
  },
  plugins: [],
};
