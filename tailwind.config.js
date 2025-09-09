/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#011850',
          light: '#334975',
          dark: '#000c2b',
        },
        secondary: {
          DEFAULT: '#05D9D9',
          light: '#5de7e7',
          dark: '#00a8a8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Söhne', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'chat': '12px', // Radio similar a ChatGPT
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}