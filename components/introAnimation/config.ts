/**
 * Централизованная конфигурация для hero-секции
 * ⚠️ ИЗМЕНЯЙТЕ ТОЛЬКО ЗДЕСЬ - изменения применятся и в анимации, и на главной странице
 * 
 * ВАЖНО: Пути к изображениям должны быть относительными (начинаться с /images/)
 * Функция getStaticPath автоматически добавит basePath при необходимости
 */
export const heroConfig = {
  // Центральное изображение для hero-секции (будет использоваться в анимации как images[2])
  image: '/images/photo-3.webp',
  // Заголовок для hero-секции
  heading: {
    line1: 'PRODUCT',
    line2: 'DESIGNER&',
    line3: 'VIBECODER',
  },
} as const;

/**
 * Конфигурация для интро-анимации
 * Центральное изображение (images[2]) автоматически берется из heroConfig.image
 */
export const introAnimationConfig = {
  images: [
    '/images/photo-1.webp',
    '/images/photo-2.webp',
    heroConfig.image, // Центральное изображение - синхронизировано с heroConfig
    '/images/photo-4.webp',
    '/images/photo-5.webp',
  ],
  heading: heroConfig.heading, // Заголовок синхронизирован с heroConfig
  counterText: 'Loading',
} as const;
