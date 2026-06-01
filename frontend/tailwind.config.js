/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skeuo: {
          bg: 'var(--bg-color)',
          light: 'var(--bg-light)',
          dark: 'var(--bg-dark)',
          accent: 'var(--accent-blue)',
        }
      },
      boxShadow: {
        'skeuo-flat': '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        'skeuo-flat-hover': '8px 8px 16px rgba(0, 0, 0, 0.45), -8px -8px 16px rgba(255, 255, 255, 0.06)',
        'skeuo-pressed': 'inset 3px 3px 6px rgba(0, 0, 0, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.05)',
        'skeuo-pressed-deep': 'inset 5px 5px 10px rgba(0, 0, 0, 0.5), inset -5px -5px 10px rgba(255, 255, 255, 0.05)',
        'skeuo-glow': '0 0 15px rgba(59, 130, 246, 0.3), 6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
