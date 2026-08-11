/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F17',
          surface: '#141C2E',
          card: '#1B253B',
          border: '#2A3654',
          gold: '#F59E0B',
          amber: '#D97706',
          cyan: '#06B6D4',
          emerald: '#10B981',
          accent: '#6366F1'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
