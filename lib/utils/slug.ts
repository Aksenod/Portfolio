/**
 * Утилиты для генерации slug из текста
 */

/**
 * Транслитерация кириллицы в латиницу
 */
const transliterationMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
  'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
  'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
  'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
};

/**
 * Генерирует slug из текста
 * @param text - исходный текст
 * @returns slug в формате lowercase с дефисами
 */
export function generateSlug(text: string): string {
  if (!text) {
    return '';
  }

  let slug = text.trim();

  // Транслитерация кириллицы
  slug = slug.split('').map(char => {
    return transliterationMap[char] || char;
  }).join('');

  // Приводим к lowercase
  slug = slug.toLowerCase();

  // Заменяем пробелы и специальные символы на дефисы
  slug = slug.replace(/[^\w\s-]/g, ''); // Удаляем все кроме букв, цифр, пробелов и дефисов
  slug = slug.replace(/[\s_]+/g, '-'); // Заменяем пробелы и подчеркивания на дефисы
  slug = slug.replace(/-+/g, '-'); // Убираем множественные дефисы
  slug = slug.replace(/^-+|-+$/g, ''); // Убираем дефисы в начале и конце

  return slug;
}

/**
 * Генерирует уникальный slug, проверяя существующие
 * @param text - исходный текст
 * @param existingSlugs - массив существующих slug'ов
 * @returns уникальный slug
 */
export function generateUniqueSlug(text: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(text);
  
  if (!baseSlug) {
    return '';
  }

  // Если базовый slug не занят, возвращаем его
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Ищем уникальный slug, добавляя суффикс
  let counter = 2;
  let uniqueSlug = `${baseSlug}-${counter}`;
  
  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}
