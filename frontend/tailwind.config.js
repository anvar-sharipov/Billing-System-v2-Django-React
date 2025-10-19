/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Важно! Включаем режим через класс
  theme: {
    extend: {},
  },
  plugins: [],
}