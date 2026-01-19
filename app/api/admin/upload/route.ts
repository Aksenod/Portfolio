import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type { ApiResponse } from '@/lib/api/types';

/**
 * POST /api/admin/upload
 * Загружает файл изображения на сервер
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Файл не предоставлен',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Размер файла превышает 10MB',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Создаем имя файла из оригинального имени
    const ext = path.extname(file.name);
    const baseName = path.basename(file.name, ext);
    const cleanName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Если после очистки имя стало пустым, генерируем уникальное имя
    const finalName = cleanName || `image-${Date.now()}`;
    const fileName = `${finalName}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images');

    // Создаем папку, если её нет
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Сохраняем файл
    const filePath = path.join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Возвращаем URL файла БЕЗ basePath
    // Компонент ImageUpload добавит basePath через getStaticPath при отображении
    // Это позволяет правильно работать и с basePath, и без него
    const url = `/images/${fileName}`;

    const response: ApiResponse<{ url: string }> = {
      success: true,
      data: { url },
      message: 'Файл успешно загружен',
    };

    console.log('File uploaded successfully:', { fileName, url, filePath });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error uploading file:', error);
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка загрузки файла',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
