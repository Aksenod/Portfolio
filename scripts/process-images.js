const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Путь к исходным изображениям и выходной папке
const inputDir = path.join(__dirname, '../public/images/raw');
const outputDir = path.join(__dirname, '../public/images');

// Создаём выходную папку, если её нет
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Функция для обработки одного изображения
async function processImage(inputPath, outputName) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const outputPath = path.join(outputDir, `${outputName}${ext}`);
    
    let sharpInstance = sharp(inputPath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    
    // Сохраняем в исходном формате с оптимизацией
    if (ext === '.jpg' || ext === '.jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: 85, mozjpeg: true });
    } else if (ext === '.png') {
      sharpInstance = sharpInstance.png({ quality: 85, compressionLevel: 9 });
    } else if (ext === '.webp') {
      sharpInstance = sharpInstance.webp({ quality: 85 });
    }
    // Для других форматов оставляем как есть
    
    await sharpInstance.toFile(outputPath);
    
    const stats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const compressionRatio = ((1 - outputStats.size / stats.size) * 100).toFixed(1);
    
    console.log(`✓ ${outputName}${ext} создан (сжатие: ${compressionRatio}%)`);
    return { path: outputPath, name: `${outputName}${ext}` };
  } catch (error) {
    console.error(`✗ Ошибка при обработке ${inputPath}:`, error.message);
    throw error;
  }
}

// Основная функция
async function main() {
  console.log('Начинаю обработку изображений...\n');
  
  // Проверяем наличие папки с исходными изображениями
  if (!fs.existsSync(inputDir)) {
    console.error(`Папка ${inputDir} не найдена!`);
    console.log('\nИнструкция:');
    console.log('1. Создайте папку public/images/raw');
    console.log('2. Поместите туда исходные изображения (jpg, png, etc.)');
    console.log('3. Запустите скрипт снова');
    process.exit(1);
  }
  
  // Получаем список файлов
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort();
  
  if (files.length === 0) {
    console.error('Не найдено изображений в папке public/images/raw');
    process.exit(1);
  }
  
  console.log(`Найдено ${files.length} изображений\n`);
  
  // Обрабатываем каждое изображение
  const processed = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    const baseName = path.parse(file).name;
    const outputName = `photo-${i + 1}`;
    
    const result = await processImage(inputPath, outputName);
    processed.push(result);
  }
  
  console.log(`\n✅ Обработано ${processed.length} изображений`);
  console.log(`\nРезультаты сохранены в: ${outputDir}`);
  console.log('\nИспользуйте следующие пути в коде:');
  processed.forEach((result) => {
    console.log(`  /images/${result.name}`);
  });
}

main().catch(console.error);
