/**
 * Тестовый скрипт для проверки API загрузки изображений
 * Проверяет, что API корректно конвертирует изображения в WebP
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');

async function testUploadAPI() {
  console.log('🧪 Тестирование API загрузки изображений...\n');

  try {
    // Создаем тестовое PNG изображение
    const testImagePath = path.join(__dirname, '../test-upload.png');
    
    const testImageBuffer = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    })
      .png()
      .toBuffer();

    await fs.writeFile(testImagePath, testImageBuffer);
    console.log('✅ Создано тестовое PNG изображение');

    const originalStats = await fs.stat(testImagePath);
    console.log(`📊 Размер оригинального PNG: ${(originalStats.size / 1024).toFixed(2)} KB\n`);

    // Определяем basePath
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/Portfolio';
    const port = process.env.PORT || 3000;
    const url = `http://localhost:${port}${basePath}/api/admin/upload`;

    console.log(`📤 Отправка запроса на: ${url}`);

    // Используем form-data библиотеку с правильными заголовками
    const fileBuffer = await fs.readFile(testImagePath);
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    // Получаем заголовки из form-data
    const headers = formData.getHeaders();
    
    // Отправляем POST запрос через fetch
    const fetchResponse = await fetch(url, {
      method: 'POST',
      body: formData,
      // Не устанавливаем Content-Type вручную - form-data сделает это автоматически
      headers: {
        ...headers,
      }
    });

    const response = {
      status: fetchResponse.status,
      body: await fetchResponse.json()
    };

    console.log(`📥 Статус ответа: ${response.status}`);
    console.log(`📥 Тело ответа:`, JSON.stringify(response.body, null, 2));

    if (response.status === 200 && response.body.success) {
      const imageUrl = response.body.data.url;
      console.log(`\n✅ Изображение успешно загружено: ${imageUrl}`);

      // Проверяем, что файл действительно WebP
      const filePath = path.join(__dirname, '..', 'public', imageUrl);
      console.log(`\n🔍 Проверка файла: ${filePath}`);

      try {
        const fileStats = await fs.stat(filePath);
        console.log(`📊 Размер загруженного файла: ${(fileStats.size / 1024).toFixed(2)} KB`);

        const metadata = await sharp(filePath).metadata();
        console.log(`📐 Формат: ${metadata.format}`);
        console.log(`📐 Размеры: ${metadata.width}x${metadata.height}`);

        if (metadata.format === 'webp') {
          console.log('\n✅ Тест пройден! API корректно конвертирует изображения в WebP.');
          
          // Вычисляем сжатие
          const compressionRatio = ((1 - fileStats.size / originalStats.size) * 100).toFixed(1);
          console.log(`📉 Сжатие: ${compressionRatio}%`);
          
          // Очистка
          console.log('\n🧹 Очистка тестовых файлов...');
          await fs.unlink(testImagePath).catch(() => {});
          await fs.unlink(filePath).catch(() => {});
          console.log('✅ Очистка завершена');
        } else {
          console.log(`\n❌ Ошибка: файл не в формате WebP (формат: ${metadata.format})`);
          process.exit(1);
        }
      } catch (fileError) {
        console.error(`\n❌ Ошибка при проверке файла: ${fileError.message}`);
        process.exit(1);
      }
    } else {
      console.log(`\n❌ Ошибка API: ${response.body.error || 'Unknown error'}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    process.exit(1);
  }
}

// Проверяем, что сервер запущен
const port = process.env.PORT || 3000;

console.log('⏳ Ожидание запуска сервера...\n');

// Ждем, пока сервер станет доступен
let attempts = 0;
const maxAttempts = 10;

async function waitForServer() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/Portfolio';
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`http://localhost:${port}${basePath}`);
      if (response.ok || response.status === 404) {
        return; // Сервер отвечает, даже если страница не найдена
      }
    } catch (error) {
      // Сервер еще не готов
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Server is not responding');
}

waitForServer()
  .then(() => {
    console.log('✅ Сервер доступен\n');
    return testUploadAPI();
  })
  .catch((error) => {
    console.error(`❌ ${error.message}`);
    console.log('\n💡 Убедитесь, что dev сервер запущен: npm run dev');
    process.exit(1);
  });
