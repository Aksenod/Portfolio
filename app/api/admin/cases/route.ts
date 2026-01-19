import { NextResponse } from 'next/server';
import { readAllCases, writeCase, slugExists } from '@/lib/api/storage';
import type { ApiResponse, Case } from '@/lib/api/types';

/**
 * GET /api/admin/cases
 * Возвращает все кейсы (включая неопубликованные) для админки
 */
export async function GET() {
  try {
    const cases = readAllCases();
    
    // Сортируем по году (новые первыми)
    const sortedCases = cases.sort((a, b) => b.year - a.year);
    
    const response: ApiResponse<Case[]> = {
      success: true,
      data: sortedCases,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки кейсов',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/admin/cases
 * Создает новый кейс
 */
export async function POST(request: Request) {
  try {
    const body: Partial<Case> = await request.json();

    // Валидация обязательных полей
    if (!body.title || !body.slug || !body.year || !body.techStack || body.techStack.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Заполните все обязательные поля',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Проверка на существующий slug
    if (slugExists(body.slug)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Кейс с таким slug уже существует',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Создаем полный объект кейса
    const now = new Date().toISOString();
    const newCase: Case = {
      id: body.id || `case-${Date.now()}`,
      slug: body.slug,
      title: body.title,
      year: body.year,
      techStack: body.techStack,
      previewImage: body.previewImage || '',
      heroImage: body.heroImage || '',
      caseType: body.caseType,
      screenshotBlocks: body.screenshotBlocks || [],
      published: body.published ?? false,
      createdAt: now,
      updatedAt: now,
    };

    writeCase(newCase);

    const response: ApiResponse<Case> = {
      success: true,
      data: newCase,
      message: 'Кейс успешно создан',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка создания кейса',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
