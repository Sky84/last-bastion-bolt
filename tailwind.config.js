/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1a1a1a',
          700: '#2a2a2a',
          600: '#3a3a3a',
          500: '#4a4a4a',
          400: '#5a5a5a',
          300: '#6a6a6a',
          200: '#7a7a7a',
          100: '#8a8a8a',
        }
      }
    },
  },
  plugins: [],
};
