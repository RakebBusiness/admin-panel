/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#FF6D1F',
          dark:    '#E05C00',
          light:   '#FF8C42',
          pale:    '#FFF3EE',
        },
        sidebar: {
          DEFAULT: '#1A1A1A',
          hover:   '#252525',
          border:  '#2E2E2E',
          muted:   '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:        '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.06)',
        brand:       '0 4px 14px 0 rgba(255,109,31,0.35)',
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
