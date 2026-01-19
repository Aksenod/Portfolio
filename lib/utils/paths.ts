/**
 * Утилиты для работы с путями с учетом basePath
 */

/**
 * Получить basePath из переменной окружения или использовать дефолтный
 * Безопасно работает как на сервере, так и на клиенте
 */
function getBasePath(): string {
  // Используем переменную окружения, установленную в next.config.ts
  // На клиенте process.env.NEXT_PUBLIC_* доступен, на сервере тоже
  if (typeof window !== 'undefined') {
    // На клиенте можем также проверить window.location.pathname
    return process.env.NEXT_PUBLIC_BASE_PATH || '/Portfolio';
  }
  // На сервере используем только переменную окружения
  return process.env.NEXT_PUBLIC_BASE_PATH || '/Portfolio';
}

/**
 * Получить путь к статическому файлу с учетом basePath
 * @param path - путь относительно public (например, '/images/photo.jpg')
 * @returns путь с basePath
 */
export function getStaticPath(path: string): string {
  const basePath = getBasePath();
  
  // Убираем начальный слэш если он есть, чтобы избежать двойных слэшей
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${cleanPath}`;
}

/**
 * Экспортируем basePath для использования в других местах
 */
export { getBasePath };
