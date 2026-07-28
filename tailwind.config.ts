import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '320px',
      sm: '425px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
      '2xl': '2550px',
    },
    extend: {},
  },
}

export default config
