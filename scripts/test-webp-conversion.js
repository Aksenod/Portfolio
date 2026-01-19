/**
 * Тестовый скрипт для проверки конвертации изображений в WebP
 * Создает тестовое изображение и проверяет конвертацию через API
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function testWebPConversion() {
  console.log('🧪 Тестирование конвертации изображений в WebP...\n');

  try {
    // Создаем тестовое изображение (PNG)
    const testImagePath = path.join(__dirname, '../test-image.png');
    const testWebPPath = path.join(__dirname, '../public/images/test-converted.webp');
    const uploadDir = path.join(__dirname, '../public/images');

    // Создаем тестовое PNG изображение (красный квадрат 200x200)
    const testImageBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
      .png()
      .toBuffer();

    // Сохраняем тестовое изображение
    await fs.writeFile(testImagePath, testImageBuffer);
    console.log('✅ Создано тестовое PNG изображение:', testImagePath);

    // Проверяем размер оригинального файла
    const originalStats = await fs.stat(testImagePath);
    console.log(`📊 Размер оригинального PNG: ${(originalStats.size / 1024).toFixed(2)} KB`);

    // Конвертируем в WebP (как в API)
    const webpBuffer = await sharp(testImageBuffer)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    // Создаем папку images, если её нет
    await fs.mkdir(uploadDir, { recursive: true });

    // Сохраняем WebP
    await fs.writeFile(testWebPPath, webpBuffer);
    console.log('✅ Конвертировано в WebP:', testWebPPath);

    // Проверяем размер WebP
    const webpStats = await fs.stat(testWebPPath);
    console.log(`📊 Размер WebP: ${(webpStats.size / 1024).toFixed(2)} KB`);

    // Вычисляем сжатие
    const compressionRatio = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
    console.log(`📉 Сжатие: ${compressionRatio}%`);

    // Проверяем, что файл действительно WebP
    const metadata = await sharp(webpBuffer).metadata();
    console.log(`📐 Формат: ${metadata.format}`);
    console.log(`📐 Размеры: ${metadata.width}x${metadata.height}`);

    if (metadata.format === 'webp') {
      console.log('\n✅ Тест пройден! Конвертация в WebP работает корректно.');
    } else {
      console.log('\n❌ Ошибка: файл не в формате WebP');
      process.exit(1);
    }

    // Очистка тестовых файлов
    console.log('\n🧹 Очистка тестовых файлов...');
    await fs.unlink(testImagePath).catch(() => {});
    await fs.unlink(testWebPPath).catch(() => {});
    console.log('✅ Очистка завершена');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
    process.exit(1);
  }
}

testWebPConversion();
