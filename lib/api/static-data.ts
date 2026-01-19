import { readAllCases, readCase } from './storage';
import type { Case } from './types';

/**
 * Утилиты для загрузки данных на этапе сборки (для статического экспорта)
 */

/**
 * Получить все опубликованные кейсы (для статического экспорта)
 */
export function getAllPublishedCases(): Case[] {
  const allCases = readAllCases();
  const publishedCases = allCases.filter((caseItem) => caseItem.published);
  return publishedCases.sort((a, b) => b.year - a.year);
}

/**
 * Получить один кейс по slug (для статического экспорта)
 */
export function getCaseBySlug(slug: string): Case | null {
  const caseData = readCase(slug);
  if (!caseData || !caseData.published) {
    return null;
  }
  return caseData;
}
