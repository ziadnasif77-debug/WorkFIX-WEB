import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--c-primary)',
        'primary-dark': 'var(--c-primary-dark)',
        'primary-light': 'var(--c-primary-light)',
        success: 'var(--c-success)',
        warning: 'var(--c-warning)',
        danger: 'var(--c-danger)',
        info: 'var(--c-info)',
        bg: 'var(--c-bg)',
        'bg-secondary': 'var(--c-bg-secondary)',
        surface: 'var(--c-surface)',
        border: 'var(--c-border)',
        'text-primary': 'var(--c-text)',
        'text-secondary': 'var(--c-text-secondary)',
        'text-tertiary': 'var(--c-text-tertiary)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
      },
    },
  },
  plugins: [],
};
export default config;
