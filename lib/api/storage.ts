import fs from 'fs';
import path from 'path';
import type { Case } from './types';

/**
 * Утилиты для работы с файловой системой
 */

/**
 * Получить путь к папке data/cases
 */
export function getCasesDir(): string {
  return path.join(process.cwd(), 'data', 'cases');
}

/**
 * Получить путь к файлу кейса
 */
export function getCaseFilePath(slug: string): string {
  const casesDir = getCasesDir();
  // Создаем папку если её нет
  if (!fs.existsSync(casesDir)) {
    fs.mkdirSync(casesDir, { recursive: true });
  }
  return path.join(casesDir, `${slug}.json`);
}

/**
 * Читает один кейс из файла
 */
export function readCase(slug: string): Case | null {
  try {
    const filePath = getCaseFilePath(slug);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as Case;
  } catch (error) {
    console.error(`Error reading case ${slug}:`, error);
    return null;
  }
}

/**
 * Читает все кейсы из папки
 */
export function readAllCases(): Case[] {
  try {
    const casesDir = getCasesDir();
    if (!fs.existsSync(casesDir)) {
      return [];
    }

    const files = fs.readdirSync(casesDir);
    const cases: Case[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(casesDir, file);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const caseData = JSON.parse(fileContent) as Case;
          cases.push(caseData);
        } catch (error) {
          console.error(`Error reading case file ${file}:`, error);
          // Продолжаем обработку других файлов
        }
      }
    }

    return cases;
  } catch (error) {
    console.error('Error reading all cases:', error);
    return [];
  }
}

/**
 * Сохраняет кейс в файл
 */
export function writeCase(caseData: Case): void {
  const filePath = getCaseFilePath(caseData.slug);
  const jsonContent = JSON.stringify(caseData, null, 2);
  fs.writeFileSync(filePath, jsonContent, 'utf-8');
}

/**
 * Удаляет файл кейса
 */
export function deleteCase(slug: string): boolean {
  try {
    const filePath = getCaseFilePath(slug);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting case ${slug}:`, error);
    return false;
  }
}

/**
 * Проверяет существование slug
 */
export function slugExists(slug: string): boolean {
  const filePath = getCaseFilePath(slug);
  return fs.existsSync(filePath);
}

/**
 * Находит кейс по ID или slug
 */
export function findCaseByIdOrSlug(idOrSlug: string): Case | null {
  // Сначала пытаемся найти по slug (так как файлы названы по slug)
  const caseBySlug = readCase(idOrSlug);
  if (caseBySlug) {
    return caseBySlug;
  }

  // Если не нашли по slug, ищем по ID среди всех кейсов
  try {
    const allCases = readAllCases();
    const foundCase = allCases.find((c) => c.id === idOrSlug);
    return foundCase || null;
  } catch (error) {
    console.error(`Error finding case by id or slug ${idOrSlug}:`, error);
    return null;
  }
}
