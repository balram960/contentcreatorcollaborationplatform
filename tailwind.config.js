/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          300: '#b0bac9',
          400: '#8593a8',
          500: '#677591',
          600: '#525d78',
          700: '#434c62',
          800: '#3a4153',
          900: '#1e2230',
          950: '#0f1320',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56, 189, 248, 0.15), 0 8px 40px -8px rgba(56, 189, 248, 0.25)',
        card: '0 1px 2px rgba(15, 19, 32, 0.08), 0 12px 32px -12px rgba(15, 19, 32, 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pop': 'pop 0.25s ease-out both',
        'shimmer': 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};
