import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F9FAFB',
        primary: '#4F46E5',
        secondary: '#A5B4FC',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config 