# Page Transition System

Модульная система переходов между страницами с wipe-эффектами для Next.js App Router.

## Структура

```
components/pageTransition/
├── types.ts              # TypeScript типы
├── animations.ts         # GSAP анимации (основной файл для экспериментов)
├── usePageTransition.ts  # Хук для управления переходами
├── PageTransition.tsx    # Компонент перехода
├── TransitionLink.tsx    # Обёртка над Next.js Link
├── TransitionProvider.tsx # Провайдер контекста
├── index.ts              # Экспорты
└── README.md             # Документация
```

## Использование

### Базовая настройка

1. **Конфигурация переходов** находится в `app/template.tsx`:

```typescript
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical',  // Направление wipe
  duration: 0.8,          // Длительность в секундах
  ease: 'power2.inOut',   // GSAP easing
  maskColor: '#000000',   // Цвет маски
};
```

2. **Использование TransitionLink** вместо обычного Link:

```tsx
import { TransitionLink, useTransitionContext } from '@/components/pageTransition';

export default function MyPage() {
  const { navigate } = useTransitionContext();
  
  return (
    <TransitionLink href="/portfolio" onNavigate={navigate}>
      Portfolio
    </TransitionLink>
  );
}
```

## Эксперименты

### Изменение направления

В `app/template.tsx` измените `direction`:

- `'horizontal'` - wipe слева направо/справа налево
- `'vertical'` - wipe сверху вниз/снизу вверх
- `'diagonal'` - wipe по диагонали

### Изменение длительности

Измените `duration` (в секундах):
- Быстро: `0.4` - `0.6`
- Средне: `0.8` - `1.0`
- Медленно: `1.2` - `1.5`

### Изменение easing

Доступные GSAP easing функции:
- `'power1.inOut'`, `'power2.inOut'`, `'power3.inOut'`, `'power4.inOut'`
- `'expo.inOut'`, `'expo.in'`, `'expo.out'`
- `'sine.inOut'`, `'sine.in'`, `'sine.out'`
- `'circ.inOut'`, `'back.inOut'`, `'elastic.out'`, `'bounce.out'`

### Изменение цвета маски

Измените `maskColor` на любой цвет:
- `'#000000'` - чёрный (по умолчанию)
- `'#ffffff'` - белый
- `'rgba(0, 0, 0, 0.95)'` - полупрозрачный чёрный

### Расширенные эксперименты

Для более сложных анимаций редактируйте файл `animations.ts`:

1. **Создание кастомного wipe** - измените функции `getInitialClipPath` и `getFinalClipPath`
2. **Добавление дополнительных эффектов** - добавьте новые параметры в `createWipeAnimation`
3. **Анимация контента** - измените `createContentFadeIn` для других эффектов появления

## API

### PageTransitionConfig

```typescript
interface PageTransitionConfig {
  direction: 'horizontal' | 'vertical' | 'diagonal';
  duration: number;
  ease: string;
  maskColor: string;
}
```

### useTransitionContext

Возвращает:
- `navigate(to: string, direction?: WipeType)` - начать переход
- `transitionState` - текущее состояние перехода
- `completeTransition()` - завершить переход
- `determineDirection(from: string, to: string)` - определить направление
- `pathname` - текущий путь
- `config` - текущая конфигурация

### TransitionLink

Пропсы:
- `href` - путь (как у обычного Link)
- `onNavigate` - функция для навигации (из useTransitionContext)
- Все остальные пропсы от Next.js Link

## Примеры конфигураций

### Быстрый горизонтальный переход

```typescript
{
  direction: 'horizontal',
  duration: 0.5,
  ease: 'power2.out',
  maskColor: '#000000',
}
```

### Медленный диагональный переход

```typescript
{
  direction: 'diagonal',
  duration: 1.2,
  ease: 'expo.inOut',
  maskColor: '#ffffff',
}
```

### Плавный вертикальный переход

```typescript
{
  direction: 'vertical',
  duration: 1.0,
  ease: 'sine.inOut',
  maskColor: 'rgba(0, 0, 0, 0.95)',
}
```
