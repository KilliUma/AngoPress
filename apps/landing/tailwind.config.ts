import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta oficial AngoPress
        brand: {
          50: '#fdf2f3',
          100: '#fde8ea',
          200: '#f9c5c9',
          300: '#f49299',
          400: '#ec555f',
          500: '#9B001B', // Vermelho Rubi
          600: '#8A0018', // Vermelho Carmim (primário)
          700: '#7A0015', // Vinho Clássico
          800: '#5C0010', // Bordeaux Profundo
          900: '#3d000b',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#D99D99', // Branco Gelo (accent)
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
