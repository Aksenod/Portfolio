import { NextResponse } from 'next/server';
import type { ApiResponse } from './types';

/**
 * Утилиты для формирования API ответов
 */

/**
 * Создает успешный ответ API
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Создает ответ с ошибкой API
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

/**
 * Обработка ошибок
 */
export function handleError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof Error) {
    return errorResponse(error.message, 500);
  }
  return errorResponse('Unknown error occurred', 500);
}
