module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      mono: ['Overpass Mono', 'monospace']
    },
    extend: {
      colors: {
        pink: '#d562f2',
        midpink: '#c651e3'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
