import type { Config } from 'tailwindcss';

// Цвета импортируются из отдельного файла для удобства изменения
// Если импорт не работает, цвета определены ниже напрямую
let colors: Record<string, any>;
try {
  const colorsModule = require('./theme/colors');
  colors = colorsModule.tailwindColors || colorsModule.default || {};
} catch {
  // Fallback: определяем цвета прямо здесь, если импорт не работает
  // Эти значения должны соответствовать theme/colors.ts
  colors = {
    base: '#000000',
    'base-secondary': '#0A0A0A',
    foreground: '#FFFFFF',
    accent: {
      DEFAULT: '#0066FF',
      hover: '#0052CC',
      focus: '#3385FF',
    },
    'border-base': '#FFFFFF',
    'focus-ring': '#FFFFFF',
    disabled: '#FFFFFF',
  };
}

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Craftwork Grotesk', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'craftwork': ['Craftwork Grotesk', 'sans-serif'],
      },
      colors: colors,
    },
  },
  plugins: [],
};

export default config;
