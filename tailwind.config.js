/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#152233',
        prm: {
          50: '#EEF4FA',
          100: '#D7E6F4',
          200: '#AECAE6',
          300: '#7FA9D3',
          400: '#4B84BC',
          500: '#245D95',
          600: '#1B4877',
          700: '#153A61',
          800: '#102A46',
          900: '#0B1E33',
        },
        wheat: {
          50: '#FBF7EE',
          100: '#F3E7CB',
          200: '#E6CE9B',
          300: '#D6AF63',
          400: '#C4923D',
        },
        good: '#2E8B57',
        warn: '#C4622D',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
