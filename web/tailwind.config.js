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
        dark: {
          950: '#07080c',
          900: '#0b0d14',
          850: '#10131d',
          800: '#161a29',
          700: '#23293e',
          600: '#343c5a',
        },
        brand: {
          primary: '#8b5cf6',   // Electric violet
          secondary: '#ec4899', // Hot pink
          accent: '#06b6d4',    // Cyber cyan
          green: '#10b981',     // Emerald neon
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
