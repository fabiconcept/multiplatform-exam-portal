/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary - Golden Yellow (from landing page reference)
        primary: {
          50: '#FFF9E6',
          100: '#FFF0B3',
          200: '#FFE680',
          300: '#FFD94D',
          400: '#FFCC1A',
          500: '#F5C518',
          600: '#D4A80F',
          700: '#A3820B',
          800: '#725B08',
          900: '#413404',
        },
        // Accent - Coral Orange (from dashboard reference)
        accent: {
          50: '#FFF3ED',
          100: '#FFE4D4',
          200: '#FFC9A8',
          300: '#FFAD7D',
          400: '#FF9251',
          500: '#FF6B35',
          600: '#E5521C',
          700: '#B33F15',
          800: '#802D0F',
          900: '#4D1B09',
        },
        // Background - Light Blue (from dashboard reference)
        background: {
          50: '#F5F9FC',
          100: '#E8F0FE',
          200: '#D1E1FD',
          300: '#B9D2FC',
          400: '#A2C3FB',
          500: '#8AB4FA',
          600: '#6B9AF7',
          700: '#4C80F3',
          800: '#2D67EF',
          900: '#0E4DEB',
        },
        // Neutral - Dark Brown/Charcoal
        neutral: {
          50: '#FAF8F6',
          100: '#F0ECE8',
          200: '#E1D9D0',
          300: '#D2C6B8',
          400: '#C3B3A0',
          500: '#B4A088',
          600: '#8C7A62',
          700: '#645646',
          800: '#3C332B',
          900: '#2A241E',
        },
        // Success
        success: {
          50: '#E6F9EE',
          100: '#CCF3DD',
          200: '#99E7BB',
          300: '#66DB99',
          400: '#33CF77',
          500: '#00C355',
          600: '#00A344',
          700: '#008333',
          800: '#006322',
          900: '#004311',
        },
        // Warning
        warning: {
          50: '#FFF8E6',
          100: '#FFF1CC',
          200: '#FFE399',
          300: '#FFD566',
          400: '#FFC733',
          500: '#FFB900',
          600: '#CC9400',
          700: '#996F00',
          800: '#664A00',
          900: '#332500',
        },
        // Error
        error: {
          50: '#FFEBEB',
          100: '#FFD6D6',
          200: '#FFADAD',
          300: '#FF8585',
          400: '#FF5C5C',
          500: '#FF3333',
          600: '#E52D2D',
          700: '#B32323',
          800: '#801919',
          900: '#4D0F0F',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 40px rgba(245, 197, 24, 0.3)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
