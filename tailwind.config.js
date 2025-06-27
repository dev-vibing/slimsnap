const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        'primary': '#0A2540',
        'primary-focus': '#0d3259',
        'secondary': '#425466',
        'accent': '#635BFF',
        'accent-focus': '#4942eb',
        'light': '#F6F9FC',
      }
    },
  },
  plugins: [],
};
