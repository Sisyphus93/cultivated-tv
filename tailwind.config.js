/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // The Cabinet palette: aged paper and ink. Low-chroma by design.
        // No true white, no true black, no blue.
        ink: '#1A1612',        // Deep walnut, near-black. Primary type.
        paper: '#F2EBDD',      // Aged cream. Default background.
        paper2: '#E8DFC9',     // Slightly darker cream, layered surfaces.
        cloth: '#C9B79C',      // Linen / cloth cover tone.
        rust: '#B5482A',       // Oxide red — the single accent of warmth.
        rustdeep: '#9C3A20',   // Oxide red darkened to clear AA at caption sizes.
        moss: '#4A5240',       // Aged green — secondary accent.
        gold: '#B8893E',       // Antique gold — seals and ornament only.
        golddeep: '#8A6428',   // Gold darkened to clear AA against paper.
        rule: '#2A221B',       // Hairline rule colour.
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        caps: '0.18em',
        hair: '-0.02em',
        tighter2: '-0.035em',
      },
      transitionTimingFunction: {
        // One curve for the whole journal. Never bounce, never overshoot.
        cabinet: 'cubic-bezier(0.2, 0.7, 0.1, 1)',
      },
      maxWidth: {
        shell: '1440px',
        measure: '68ch',
      },
      animation: {
        'fade-in': 'fadeIn 300ms cubic-bezier(0.2, 0.7, 0.1, 1) forwards',
        // Page-load rise: 12px over 600ms, like turning a page.
        rise: 'rise 600ms cubic-bezier(0.2, 0.7, 0.1, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Fade completes at 300ms; the 12px rise continues to 600ms.
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
