/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito_400Regular'],
      },
      colors: {
        'pink-primary': '#F06292',
        'pink-dark': '#E91E63',
        'pink-light': '#FCE4EC',
        'pink-soft': '#FDEEF5',
        teal: '#26C6DA',
        'teal-dark': '#00ACC1',
        bg: '#F2F2F7',
        card: '#FFFFFF',
        text: '#1C1C1E',
        muted: '#8E8E93',
        'dark-bg': '#121214',
        'dark-card': '#1E1E22',
        'dark-card-hover': '#2A2A30',
        'dark-text': '#F3F4F6',
        'dark-muted': '#9CA3AF',
        'dark-border': '#374151',
      },
    },
  },
  plugins: [],
};
