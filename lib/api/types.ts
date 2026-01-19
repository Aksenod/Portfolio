/**
 * Типы для API кейсов портфолио
 */

/**
 * Блок скриншотов в кейсе
 */
export interface ScreenshotBlock {
  title: string;
  images: string[];
}

/**
 * Сущность кейса (проекта портфолио)
 */
export interface Case {
  // Идентификация
  id: string;
  slug: string;

  // Основная информация
  title: string;
  year: number;
  techStack: string[];

  // Изображения
  previewImage: string;
  heroImage: string;
  caseType?: string;

  // Блоки скриншотов
  screenshotBlocks: ScreenshotBlock[];

  // Метаданные
  createdAt?: string;
  updatedAt?: string;
  published: boolean;
}

/**
 * Обертка для всех API ответов
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
