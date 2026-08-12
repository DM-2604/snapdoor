/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F8A5F',
          dark: '#0A6B48',
          subtle: '#E6F5EF',
        },
        danger: '#EF4444',
        warning: '#F59E0B',
        success: {
          DEFAULT: '#10B981',
          subtle: '#D1FAE5',
        },
      },
    },
  },
  plugins: [],
};
