import { NextResponse } from 'next/server';
import { getAllPublishedCases } from '@/lib/api/static-data';
import type { ApiResponse } from '@/lib/api/types';

/**
 * GET /api/cases
 * Возвращает все опубликованные кейсы
 */
export async function GET() {
  try {
    const cases = getAllPublishedCases();
    
    const response: ApiResponse<typeof cases> = {
      success: true,
      data: cases,
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
