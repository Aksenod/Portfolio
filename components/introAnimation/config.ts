/**
 * Централизованная конфигурация для hero-секции
 * ⚠️ Конфигурация теперь может быть изменена через админку
 * Эти значения используются как fallback, если конфигурация из хранилища не загружена
 * 
 * ВАЖНО: Пути к изображениям должны быть относительными (начинаться с /images/)
 * Функция getStaticPath автоматически добавит basePath при необходимости
 */

export interface HeroConfig {
  image: string;
  heading: {
    line1: string;
    line2: string;
    line3: string;
  };
}

export interface IntroAnimationConfig {
  images: [string, string, string, string, string];
  heading: {
    line1: string;
    line2: string;
    line3: string;
  };
  counterText: string;
}

// Значения по умолчанию (fallback)
export const defaultHeroConfig: HeroConfig = {
  image: '/images/photo-3.webp',
  heading: {
    line1: 'PRODUCT',
    line2: 'DESIGNER&',
    line3: 'VIBECODER',
  },
} as const;

export const defaultIntroAnimationConfig: IntroAnimationConfig = {
  images: [
    '/images/photo-1.webp',
    '/images/photo-2.webp',
    defaultHeroConfig.image, // Центральное изображение - синхронизировано с heroConfig
    '/images/photo-4.webp',
    '/images/photo-5.webp',
  ],
  heading: defaultHeroConfig.heading,
  counterText: 'Loading',
} as const;

// Экспорт для обратной совместимости
export const heroConfig = defaultHeroConfig;
export const introAnimationConfig = defaultIntroAnimationConfig;

/**
 * Константы размеров центрального изображения для точного соответствия
 * между анимацией и главным экраном (пиксель в пиксель)
 */
export const HERO_IMAGE_CONFIG = {
  mobile: {
    baseWidth: 8, // vw - базовая ширина контейнера
    aspectRatio: '4/6' as const, // Соотношение сторон
    scale: 9, // Финальный масштаб после увеличения
  },
  desktop: {
    baseWidth: 8, // vw - базовая ширина контейнера
    aspectRatio: '4/6' as const, // Соотношение сторон
    scale: 3, // Финальный масштаб после увеличения
  },
} as const;

/**
 * Загружает конфигурацию анимации из хранилища (только на клиенте)
 * Если конфигурация не найдена или произошла ошибка, возвращает значения по умолчанию
 */
export async function loadAnimationConfigFromStorage(): Promise<{
  heroConfig: HeroConfig;
  introAnimationConfig: IntroAnimationConfig;
}> {
  // На сервере всегда возвращаем значения по умолчанию
  if (typeof window === 'undefined') {
    return {
      heroConfig: defaultHeroConfig,
      introAnimationConfig: defaultIntroAnimationConfig,
    };
  }

  try {
    const basePath = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_BASE_PATH || '')
      : '';
    
    const response = await fetch(`${basePath}/api/admin/animation-config`);
    
    if (!response.ok) {
      throw new Error('Failed to load animation config');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      const config = result.data;
      return {
        heroConfig: {
          image: config.heroImage || config.animationImages[2] || defaultHeroConfig.image,
          heading: config.heading || defaultHeroConfig.heading,
        },
        introAnimationConfig: {
          images: config.animationImages || defaultIntroAnimationConfig.images,
          heading: config.heading || defaultIntroAnimationConfig.heading,
          counterText: 'Loading',
        },
      };
    }
  } catch (error) {
    console.warn('Failed to load animation config from storage, using defaults:', error);
  }

  // Возвращаем значения по умолчанию при ошибке
  return {
    heroConfig: defaultHeroConfig,
    introAnimationConfig: defaultIntroAnimationConfig,
  };
}
