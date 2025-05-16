/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui', 'Source Code Pro'],
      },
      colors: {
        dropShadow: '#30303D',
        gradientBlue: 'linear-gradient(114deg, #265DF5 0%, #5DC9F0 100%)',
      },
      screens: {
        xxs: '320px',
        xs: '375px',
        xm: '425px',
        xm2: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },

    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}