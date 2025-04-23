/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Grid configuration for Anime.js dots
      gridTemplateRows: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
      },
      
      // Color extensions matching your design
      colors: {
        purple: {
          900: 'rgba(76, 29, 149, 1)',
          800: 'rgba(91, 33, 182, 1)',
          700: 'rgba(109, 40, 217, 1)',
          600: 'rgba(124, 58, 237, 1)',
          500: 'rgba(139, 92, 246, 1)',
          400: 'rgba(167, 139, 250, 1)',
          300: 'rgba(196, 181, 253, 1)',
          200: 'rgba(221, 214, 254, 1)',
          100: 'rgba(237, 233, 254, 1)',
          50: 'rgba(245, 243, 255, 1)',
        },
      },
      
      // Background opacity for dot animations
      backgroundOpacity: {
        '20': '0.2',
        '40': '0.4',
        '50': '0.5',
      },
      
      // Animation extensions
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      
      // Keyframes for custom animations
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        }
      }
    },
  },
  plugins: [
    // Plugin for background clip (used in your text gradient)
    function({ addUtilities }) {
      addUtilities({
        '.bg-clip-text': {
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
        },
      })
    },
    
    // Plugin for smooth transitions
    require('tailwindcss-animate','tailwind-scrollbar'),
  ],
}