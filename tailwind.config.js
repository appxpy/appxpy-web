/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'mm': '425px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    },
    fontFamily: {
      primary: "'ABC Diatype', sans-serif",
      variable: "'ABC Diatype Plus Variable', sans-serif"
    },
    extend: {},
  },
  plugins: [],
}

