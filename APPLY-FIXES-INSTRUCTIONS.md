# Инструкция по применению исправлений для RadialCarousel

## Проблема
Hover-эффекты в компоненте `RadialCarousel` работают некорректно - изображение появляется на секунду **когда вы убираете курсор** с элемента, а не когда наводите.

## Причины проблемы
1. **Неправильные `pointer-events`** - родительский контейнер `itemsLayer` имеет `pointer-events: none`
2. **Проблема в логике `handleImageLoad`** - изображение показывается только если `isHoveringText` true

## Исправления

### 1. Изменение pointer-events (строка 457)
**Вместо:**
```tsx
className="absolute inset-0 z-20 pointer-events-none"
```

**Должно быть:**
```tsx
className="absolute inset-0 z-20 pointer-events-auto"
```

### 2. Исправление логики handleImageLoad (строки 353-362)
**Вместо:**
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

**Должно быть:**
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

## Как применить исправления

1. Откройте файл `components/RadialCarousel.tsx`
2. Найдите строку 457 и измените `pointer-events-none` на `pointer-events-auto`
3. Найдите функцию `handleImageLoad` (примерно строки 353-362) и уберите проверку `isHoveringText`
4. Сохраните файл

## Проверка
После применения исправлений:
- При наведении на текст - появляется превью изображения
- При убирании курсора - превью исчезает плавно
- Нет "мигания" изображения при убирании курсора

## Альтернатива
Если редактирование оригинального файла невозможно, можно заменить его содержимым из файла `RadialCarousel-APPLY-FIXES.tsx`