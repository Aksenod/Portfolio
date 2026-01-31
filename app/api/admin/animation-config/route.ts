import { NextResponse } from 'next/server';
import { readAnimationConfig, writeAnimationConfig } from '@/lib/api/storage';
import type { ApiResponse } from '@/lib/api/types';
import type { AnimationConfig } from '@/lib/api/storage';

/**
 * GET /api/admin/animation-config
 * Возвращает конфигурацию анимации
 */
export async function GET() {
  try {
    const config = readAnimationConfig();
    
    const response: ApiResponse<AnimationConfig | null> = {
      success: true,
      data: config,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки конфигурации анимации',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/admin/animation-config
 * Обновляет конфигурацию анимации
 */
export async function PUT(request: Request) {
  try {
    const body: Partial<AnimationConfig> = await request.json();

    // Валидация обязательных полей
    if (!body.animationImages || !Array.isArray(body.animationImages) || body.animationImages.length !== 5) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Должно быть указано ровно 5 изображений для анимации',
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!body.heading || !body.heading.line1 || !body.heading.line2 || !body.heading.line3) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Заголовок должен содержать все три строки',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Проверяем валидность путей к изображениям
    const invalidImages = body.animationImages.filter(img => !img || !img.trim());
    if (invalidImages.length > 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Все изображения должны иметь валидные пути',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Создаем полный объект конфигурации
    const config: AnimationConfig = {
      animationImages: body.animationImages as [string, string, string, string, string],
      heroImage: body.heroImage || body.animationImages[2], // Синхронизируем с центральным изображением
      heading: {
        line1: body.heading.line1,
        line2: body.heading.line2,
        line3: body.heading.line3,
      },
    };

    writeAnimationConfig(config);

    const response: ApiResponse<AnimationConfig> = {
      success: true,
      data: config,
      message: 'Конфигурация анимации успешно обновлена',
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка сохранения конфигурации анимации',
    };

    return NextResponse.json(response, { status: 500 });
  }
}