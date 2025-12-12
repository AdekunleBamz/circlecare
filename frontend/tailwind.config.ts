import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Sunset & Ocean Palette - Warm, caring, and flowing
        primary: {
          50: '#FFF5F5',
          100: '#FFE3E3',
          200: '#FFC9C9',
          300: '#FFA8A8',
          400: '#FF8787',
          500: '#FF6B6B',  // Main coral - warm, caring, energetic
          600: '#FA5252',
          700: '#F03E3E',
          800: '#E03131',
          900: '#C92A2A',
        },
        secondary: {
          50: '#E6FFFE',
          100: '#C1FFF9',
          200: '#9DFFF5',
          300: '#78FFF0',
          400: '#5FF4E8',
          500: '#4ECDC4',  // Main ocean blue - trustworthy, calm, flowing
          600: '#3DB8B0',
          700: '#2C9D96',
          800: '#1C7D77',
          900: '#0F5E5A',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FFF4C6',
          200: '#FFEDA0',
          300: '#FFE77A',
          400: '#FFE054',
          500: '#FFE66D',  // Main sunset orange - optimistic, welcoming
          600: '#FFD93D',
          700: '#FFC926',
          800: '#FFB300',
          900: '#E09900',
        },
        neutral: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#B3E5FC',
          300: '#81D4FA',
          400: '#4FC3F7',
          500: '#1A535C',  // Main deep navy - stable, professional
          600: '#164449',
          700: '#123537',
          800: '#0E2629',
          900: '#0A1A1C',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1A535C 0%, #4ECDC4 50%, #FF6B6B 100%)',
        'gradient-radial': 'radial-gradient(circle, #4ECDC4 0%, #1A535C 100%)',
        'gradient-flow': 'linear-gradient(45deg, #FF6B6B, #FFE66D, #4ECDC4, #1A535C)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'flow': 'flow 3s ease-in-out infinite',
        'pulse-gentle': 'pulseGentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flow: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config