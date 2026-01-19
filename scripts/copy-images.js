const fs = require('fs');
const path = require('path');

// Путь к исходным изображениям и выходной папке
const inputDir = path.join(__dirname, '../public/images/raw');
const outputDir = path.join(__dirname, '../public/images');

// Создаём выходную папку, если её нет
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Основная функция
function main() {
  console.log('Копирую изображения...\n');
  
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
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .sort();
  
  if (files.length === 0) {
    console.error('Не найдено изображений в папке public/images/raw');
    process.exit(1);
  }
  
  console.log(`Найдено ${files.length} изображений\n`);
  
  // Копируем каждое изображение
  const copied = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(inputDir, file);
    const ext = path.extname(file);
    const outputName = `photo-${i + 1}${ext}`;
    const outputPath = path.join(outputDir, outputName);
    
    fs.copyFileSync(inputPath, outputPath);
    copied.push(outputName);
    console.log(`✓ ${outputName} скопирован`);
  }
  
  console.log(`\n✅ Скопировано ${copied.length} изображений`);
  console.log(`\nРезультаты сохранены в: ${outputDir}`);
  console.log('\nИспользуйте следующие пути в коде:');
  copied.forEach((name) => {
    console.log(`  /images/${name}`);
  });
}

main();
