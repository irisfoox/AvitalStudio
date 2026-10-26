/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: '#C9836A',
          light: '#D9A8A0',
          dark: '#A5624D',
        },
        cream: {
          DEFAULT: '#FDF6EE',
          dark: '#F0E4D7',
        },
        espresso: {
          DEFAULT: '#3B2A25',
        },
        taupe: {
          DEFAULT: '#7A6259',
        },
        sage: {
          DEFAULT: '#A8B89A',
        },
        peach: {
          DEFAULT: '#EAD9D0',
        },
        success: {
          DEFAULT: '#7AA58A',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        script: ['Great Vibes', 'cursive'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'ken-burns': 'kenBurns 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
}
