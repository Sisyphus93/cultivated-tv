/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        // Editorial light palette
        paper: '#F6F4F0',
        surface: '#FFFFFF',
        ink: '#171614',
        'ink-soft': '#46433C',
        muted: '#8B867A',
        faint: '#A9A49A',
        line: '#E5E1D9',
        'line-strong': '#CFC9BE',
        gold: '#D99A00',
        positive: '#2F7D53',
        negative: '#B4453A',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,22,20,0.05), 0 18px 40px -24px rgba(23,22,20,0.38)',
        poster: '0 2px 4px rgba(23,22,20,0.06), 0 26px 50px -30px rgba(23,22,20,0.45)',
        pop: '0 24px 60px -20px rgba(23,22,20,0.28)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
