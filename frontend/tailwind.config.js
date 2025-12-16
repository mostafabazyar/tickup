/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
        cursive: ['Lalezar', 'cursive'],
        'tanha': ['Tanha', 'cursive'],
        'mikhak': ['Mikhak', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#2563EB',
        'brand-secondary': '#F9FAFB',
        'brand-text': '#1F2937',
        'brand-subtext': '#6B7280',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
            '0%': { transform: 'translateX(-100%)', opacity: '0.5' },
            '100%': { transform: 'translateX(0)', opacity: '1' },
        },
         'check-bounce': {
            '0%': { transform: 'scale(0.5)', opacity: '0.5' },
            '60%': { transform: 'scale(1.2)', opacity: '1' },
            '100%': { transform: 'scale(1)' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up-left': {
          '0%': { transform: 'translate(-50px, 50px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'check-bounce': 'check-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-right': 'slide-right 0.3s ease-out forwards',
        'slide-up-left': 'slide-up-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.15s ease-out forwards',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
