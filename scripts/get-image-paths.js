const fs = require('fs');
const path = require('path');

// Путь к папке с изображениями
const imagesDir = path.join(__dirname, '../public/images');

// Функция для получения путей к изображениям
function getImagePaths() {
  if (!fs.existsSync(imagesDir)) {
    return [];
  }
  
  const files = fs.readdirSync(imagesDir)
    .filter(file => /^photo-\d+\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  
  return files.map(file => `/images/${file}`);
}

// Выводим пути для использования в коде
const paths = getImagePaths();
if (paths.length > 0) {
  console.log('Найдены следующие изображения:');
  console.log(JSON.stringify(paths, null, 2));
} else {
  console.log('Изображения не найдены. Поместите файлы в public/images/');
  console.log('Имена файлов должны быть: photo-1.jpg, photo-2.jpg и т.д.');
}
