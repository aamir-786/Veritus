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
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
          navy: '#0F172A',
          primary: '#1E3A8A',
          blue: '#2563EB',
          gold: '#D97706',
          amber: '#F59E0B',
          cyan: '#0284C7',
          emerald: '#059669',
          rose: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
