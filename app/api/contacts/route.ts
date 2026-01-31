import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/lib/api/types';

export interface ContactFormData {
  name: string;
  company: string;
  projectType: string;
  websiteType: string;
  deadline: string;
  budget: string;
  canCall: boolean;
  additionalInfo: string;
  privacyAgreement: boolean;
}

/**
 * POST /api/contacts
 * Обрабатывает форму контактов
 */
export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    // Валидация обязательных полей
    if (!body.name || !body.privacyAgreement) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Заполните все обязательные поля',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Здесь можно добавить отправку email, сохранение в базу данных и т.д.
    // Пока просто логируем данные
    console.log('Contact form submission:', body);

    // В реальном приложении здесь была бы отправка email или сохранение в БД
    // Пример:
    // await sendEmail({
    //   to: 'Dan.bugrov@yandex.ru',
    //   subject: 'Новая заявка на проект',
    //   body: formatContactEmail(body),
    // });

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: `contact-${Date.now()}` },
      message: 'Заявка успешно отправлена',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка отправки заявки',
    };

    return NextResponse.json(response, { status: 500 });
  }
}