# Финальная инструкция по замене RadialCarousel

## ВАЖНО: Нужно заменить файл вручную!

Файл `components/RadialCarousel.tsx` не может быть изменен автоматически из-за его размера. Нужно вручную заменить его содержимое.

## Как заменить файл:

### Способ 1: Полная замена (рекомендуется)
1. Откройте файл `components/RadialCarousel.tsx`
2. Выделите ВЕСЬ его содержимое и удалите
3. Скопируйте содержимое из файла `RadialCarousel-FINAL-FIX.tsx`
4. Вставьте в `components/RadialCarousel.tsx`
5. Сохраните файл

### Способ 2: Пошаговое редактирование
Если не хотите заменять весь файл, внесите эти изменения:

#### Изменение 1: pointer-events (строка 457)
**Найдите строку:**
```tsx
className="absolute inset-0 z-20 pointer-events-none"
```

**Замените на:**
```tsx
className="absolute inset-0 z-20 pointer-events-auto"
```

#### Изменение 2: handleImageLoad (строки 353-362)
**Найдите функцию:**
```tsx
const handleImageLoad = useCallback(() => {
  if (isHoveringText && previewImageRef.current?.complete && previewImageRef.current.naturalWidth > 0) {
    setPreviewVisible(true);
    setMaskVisible(false);
    if (appearMaskRef.current) {
      void appearMaskRef.current.offsetWidth;
    }
    setMaskVisible(true);
  }
}, [isHoveringText]);
```

**Замените на:**
```tsx
const handleImageLoad = useCallback(() => {
  // Убираем проверку isHoveringText, чтобы изображение показывалось сразу при загрузке
  if (previewImageRef.current?.complete && previewImageRef.current.naturalWidth > 0) {
    setPreviewVisible(true);
    setMaskVisible(false);
    if (appearMaskRef.current) {
      void appearMaskRef.current.offsetWidth;
    }
    setMaskVisible(true);
  }
}, []);
```

## Проверка
После замены:
1. Перезапустите dev-сервер (`npm run dev` или `yarn dev`)
2. Зайдите на страницу `/portfolio`
3. Проверьте hover-эффекты:
   - При наведении на текст - должно появляться превью изображения
   - При убирании курсора - превью должно исчезать плавно
   - НЕ должно быть "мигания" изображения при убирании курсора

## Файлы для использования:
- `RadialCarousel-FINAL-FIX.tsx` - полный исправленный файл для замены
- `FINAL-REPLACE-INSTRUCTIONS.md` - эта инструкция