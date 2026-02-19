import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        board: {
          light: 'var(--board-light)',
          dark: 'var(--board-dark)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      keyframes: {
        'board-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%': { transform: 'translateX(-4px)' },
          '20%': { transform: 'translateX(4px)' },
          '30%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(3px)' },
          '50%': { transform: 'translateX(-3px)' },
          '60%': { transform: 'translateX(2px)' },
          '70%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(1px)' },
          '90%': { transform: 'translateX(-1px)' },
        },
        'check-flash': {
          '0%': { opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'board-shake': 'board-shake 800ms ease-out',
        'check-flash': 'check-flash 800ms ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
