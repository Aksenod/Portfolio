import { NextResponse } from 'next/server';
import { readCase, writeCase, deleteCase, findCaseByIdOrSlug, readAllCases } from '@/lib/api/storage';
import type { ApiResponse, Case } from '@/lib/api/types';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/cases/[id]
 * Возвращает один кейс по ID или slug
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Ищем кейс по ID или slug
    const caseData = findCaseByIdOrSlug(id);
    
    if (!caseData) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Кейс не найден',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Case> = {
      success: true,
      data: caseData,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки кейса',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/admin/cases/[id]
 * Обновляет существующий кейс
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: Partial<Case> = await request.json();

    // Находим существующий кейс по ID или slug
    const existingCase = findCaseByIdOrSlug(id);
    
    if (!existingCase) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Кейс не найден',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Валидация обязательных полей
    if (!body.title || !body.year || !body.techStack || body.techStack.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Заполните все обязательные поля',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Автоматическая генерация slug, если не указан
    let finalSlug = body.slug?.trim() || existingCase.slug || '';
    if (!finalSlug && body.title) {
      const allCases = readAllCases();
      const existingSlugs = allCases.filter(c => c.id !== existingCase.id).map(c => c.slug);
      finalSlug = generateUniqueSlug(body.title, existingSlugs);
    }

    if (!finalSlug) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Не удалось сгенерировать slug. Укажите slug вручную.',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Если slug изменился, проверяем, не занят ли новый slug
    if (finalSlug !== existingCase.slug && readCase(finalSlug)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Кейс с таким slug уже существует',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Обновляем кейс
    const updatedCase: Case = {
      ...existingCase,
      ...body,
      id: existingCase.id, // Сохраняем оригинальный ID
      slug: finalSlug, // Используем сгенерированный или указанный slug
      updatedAt: new Date().toISOString(),
    };

    writeCase(updatedCase);

    const response: ApiResponse<Case> = {
      success: true,
      data: updatedCase,
      message: 'Кейс успешно обновлен',
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка обновления кейса',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/admin/cases/[id]
 * Удаляет кейс
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Находим кейс по ID или slug, чтобы получить slug для удаления
    const caseData = findCaseByIdOrSlug(id);
    
    if (!caseData) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Кейс не найден',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Удаляем по slug (так как файлы названы по slug)
    const deleted = deleteCase(caseData.slug);
    
    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Ошибка удаления файла кейса',
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Кейс успешно удален',
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка удаления кейса',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
