/**
 * Цветовая схема проекта
 * Источник: https://positivdigital.aura.build/
 * 
 * Для обновления цветов:
 * 1. Откройте https://positivdigital.aura.build/ в браузере
 * 2. Используйте DevTools (F12) → Elements → выберите элемент → Styles → computed colors
 * 3. Или используйте Color Picker (пипетку) в DevTools
 * 4. Замените значения ниже на реальные цвета с сайта
 * 
 * ВАЖНО: Используйте HEX-формат (#RRGGBB) для поддержки синтаксиса прозрачности Tailwind (например, text-foreground/80)
 */

export const tailwindColors = {
  // Основные цвета фона
  // Использование: bg-base, bg-base-secondary
  base: '#000000', // Основной фон страницы (заменить на реальный цвет с сайта)
  'base-secondary': '#0A0A0A', // Альтернативный фон для секций (заменить при необходимости)

  // Основные цвета текста
  // Использование: text-foreground, text-foreground/80, text-foreground/60, text-foreground/40
  foreground: '#FFFFFF', // Основной цвет текста (заменить на реальный цвет с сайта)
  // Примечание: прозрачность задается через синтаксис Tailwind: text-foreground/80

  // Акцентные цвета (если используются на сайте)
  // Использование: bg-accent, text-accent, border-accent, accent-hover, accent-focus
  accent: {
    DEFAULT: '#0066FF', // Основной акцентный цвет (заменить на реальный цвет с сайта)
    hover: '#0052CC', // Для hover состояний
    focus: '#3385FF', // Для focus состояний
  },

  // Цвета для границ
  // Использование: border-border-base, border-border-base-hover
  'border-base': '#FFFFFF', // Основной цвет границы (для прозрачности используйте border-border-base/10)
  // Примечание: прозрачность задается через синтаксис Tailwind: border-border-base/10, border-border-base/20

  // Цвета для состояний
  // Использование: ring-focus-ring, text-disabled
  'focus-ring': '#FFFFFF', // Цвет для focus ring (для прозрачности используйте ring-focus-ring/50)
  disabled: '#FFFFFF', // Цвет для disabled элементов (для прозрачности используйте text-disabled/30)
  // Примечание: прозрачность задается через синтаксис Tailwind: ring-focus-ring/50, text-disabled/30
};
