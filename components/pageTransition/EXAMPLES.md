# Примеры конфигураций переходов

Файл с готовыми конфигурациями для быстрых экспериментов. Копируйте нужную конфигурацию в `app/layout.tsx` в переменную `transitionConfig`.

## 1. Быстрый вертикальный wipe (по умолчанию)

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical',
  duration: 0.8,
  ease: 'power2.inOut',
  maskColor: '#000000',
};
```

## 2. Медленный горизонтальный wipe

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'horizontal',
  duration: 1.2,
  ease: 'expo.inOut',
  maskColor: '#000000',
};
```

## 3. Быстрый диагональный wipe

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'diagonal',
  duration: 0.6,
  ease: 'power3.out',
  maskColor: '#000000',
};
```

## 4. Плавный вертикальный с белой маской

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical',
  duration: 1.0,
  ease: 'sine.inOut',
  maskColor: '#ffffff',
};
```

## 5. Резкий горизонтальный переход

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'horizontal',
  duration: 0.5,
  ease: 'power4.out',
  maskColor: '#000000',
};
```

## 6. Эластичный вертикальный переход

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical',
  duration: 1.0,
  ease: 'elastic.out(1, 0.5)',
  maskColor: '#000000',
};
```

## 7. Плавный диагональный с полупрозрачной маской

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'diagonal',
  duration: 1.2,
  ease: 'expo.inOut',
  maskColor: 'rgba(0, 0, 0, 0.95)',
};
```

## 8. Очень быстрый вертикальный

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical',
  duration: 0.4,
  ease: 'power2.out',
  maskColor: '#000000',
};
```

## Настройка easing функций

GSAP поддерживает множество easing функций:

- `'power1.inOut'`, `'power2.inOut'`, `'power3.inOut'`, `'power4.inOut'`
- `'expo.inOut'`, `'expo.in'`, `'expo.out'`
- `'sine.inOut'`, `'sine.in'`, `'sine.out'`
- `'circ.inOut'`, `'circ.in'`, `'circ.out'`
- `'back.inOut(1.7)'` - с параметром overshoot
- `'elastic.out(1, 0.5)'` - с параметрами amplitude и period
- `'bounce.out'`

## Настройка цветов

- `'#000000'` - чёрный (по умолчанию)
- `'#ffffff'` - белый
- `'#ff0000'` - красный
- `'rgba(0, 0, 0, 0.95)'` - полупрозрачный чёрный
- Любой другой hex или rgba цвет
