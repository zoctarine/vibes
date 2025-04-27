/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          400: '#00CFFF',
          500: '#00B8FF', 
          600: '#0090FF',
          700: '#0070FF'
        },
        purple: {
          400: '#BD00FF',
          500: '#A800FF',
          600: '#9100FF', 
          700: '#7700FF',
          900: '#3A0070'
        }
      },
      animation: {
        'bounce': 'bounce 2s infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};