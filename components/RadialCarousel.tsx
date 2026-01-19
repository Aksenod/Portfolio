'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Case } from '@/lib/api/types';
import { getStaticPath } from '@/lib/utils/paths';

interface ItemData {
  text: string;
  img: string;
  slug: string;
}

// Константы
const ANGLE_PER_PIXEL = 0.0015;
const SCROLL_SMOOTH_FACTOR = 0.12;
const SCROLL_THRESHOLD = 0.1;
const CENTER_X_OFFSET_DESKTOP = -0.2; // -20% от ширины viewport (десктоп)
const CENTER_X_OFFSET_MOBILE = -0.35; // -35% от ширины viewport (мобильные, смещено влево)
const RADIUS_MULTIPLIER = 0.508; // 50.8% от минимального размера viewport
const TOUCH_SCROLL_MULTIPLIER = 2;

// Throttle/Debounce константы
const MOUSE_MOVE_THROTTLE_MS = 16; // ~60fps
const RESIZE_DEBOUNCE_MS = 150;
const IMAGE_FOLLOW_SMOOTHNESS = 0.08; // Коэффициент плавности следования (0-1, чем меньше - тем плавнее и больше отставание)

// Функция определения мобильного устройства
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

// Утилиты для throttle и debounce
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

interface RadialCarouselProps {
  initialCases?: Case[];
}

export default function RadialCarousel({ initialCases }: RadialCarouselProps = {}) {
  const router = useRouter();
  const itemsLayerRef = useRef<HTMLDivElement>(null);
  const guideCircleRef = useRef<HTMLDivElement>(null);
  const imagesLayerRef = useRef<HTMLDivElement>(null);
  
  const scrollOffsetRef = useRef(0);
  const targetScrollOffsetRef = useRef(0);
  const itemElementsRef = useRef<HTMLDivElement[]>([]);
  const imageElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrollAnimationFrameIdRef = useRef<number | null>(null);
  const eventListenersRef = useRef<Array<{ element: HTMLElement; event: string; handler: EventListener }>>([]);
  const currentHoveredIndexRef = useRef<number | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const imageTargetPositionRef = useRef({ x: 0, y: 0 });
  const imageCurrentPositionRef = useRef({ x: 0, y: 0 });
  const imageAnimationFrameRef = useRef<number | null>(null);
  
  // Refs для центрального изображения (мобильные устройства)
  const centerImageRef = useRef<HTMLDivElement>(null);
  const centerItemIndexRef = useRef<number | null>(null);
  const isMobileRef = useRef(false);
  
  const [isMounted, setIsMounted] = useState(false);
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [originalItemsCount, setOriginalItemsCount] = useState(0);

  // Загрузка данных: используем initialCases если есть, иначе загружаем из API (для dev режима)
  useEffect(() => {
    if (initialCases && initialCases.length > 0) {
      // Используем переданные данные
      const items: ItemData[] = initialCases.map((caseItem: Case) => ({
        text: caseItem.title,
        img: caseItem.previewImage,
        slug: caseItem.slug,
      }));
      // Дублируем кейсы 3 раза для плотного расположения и бесконечного цикла
      const DUPLICATION_COUNT = 3;
      const duplicatedItems: ItemData[] = [];
      for (let i = 0; i < DUPLICATION_COUNT; i++) {
        duplicatedItems.push(...items);
      }
      setOriginalItemsCount(items.length);
      setItemsData(duplicatedItems);
    } else {
      // Fallback: загрузка из API (для dev режима)
      const loadCases = async () => {
        try {
          const response = await fetch('/api/cases');
          const result = await response.json();
          if (result.success && result.data) {
            const cases = result.data.slice(0, 5);
            const items: ItemData[] = cases.map((caseItem: Case) => ({
              text: caseItem.title,
              img: caseItem.previewImage,
              slug: caseItem.slug,
            }));
            // Дублируем кейсы 3 раза для плотного расположения и бесконечного цикла
            const DUPLICATION_COUNT = 3;
            const duplicatedItems: ItemData[] = [];
            for (let i = 0; i < DUPLICATION_COUNT; i++) {
              duplicatedItems.push(...items);
            }
            setOriginalItemsCount(items.length);
            setItemsData(duplicatedItems);
          }
        } catch (error) {
          console.error('Error loading cases:', error);
        }
      };
      loadCases();
    }
  }, [initialCases]);

  // Проверка на клиентскую сторону
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Функция обновления центрального изображения (только для мобильных)
  const updateCenterImage = useCallback(() => {
    const ITEMS_COUNT = itemsData.length;
    const ITEMS_DATA = itemsData;
    if (!centerImageRef.current || !isMobileDevice() || typeof window === 'undefined' || originalItemsCount === 0) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const horizontalCenter = viewportWidth / 2;
    
    // Используем смещение для мобильных
    const cx = viewportWidth * CENTER_X_OFFSET_MOBILE;
    const cy = viewportHeight / 2;
    const R = Math.min(viewportWidth, viewportHeight) * RADIUS_MULTIPLIER;
    
    const currentScrollOffset = scrollOffsetRef.current;
    const twoPi = 2 * Math.PI;

    // Находим элемент, ближайший к горизонтальному центру
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < ITEMS_COUNT; i++) {
      const baseAngle = (i / ITEMS_COUNT) * twoPi;
      const angle = baseAngle + (currentScrollOffset * ANGLE_PER_PIXEL);
      const x = cx + Math.cos(angle) * R;
      
      // Вычисляем расстояние от центра экрана по горизонтали
      const distance = Math.abs(x - horizontalCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    // Получаем оригинальный индекс для доступа к данным
    const originalIndex = closestIndex % originalItemsCount;

    // Позиционируем центральное изображение в центре экрана
    const centerImage = centerImageRef.current;
    if (centerImage) {
      const imageWidth = Math.min(280, viewportWidth * 0.75); // Адаптивная ширина
      const imageHeight = imageWidth * 1.5; // Формат 4:6 (высота = 1.5 * ширина)
      
      centerImage.style.width = `${imageWidth}px`;
      centerImage.style.height = `${imageHeight}px`;
    }

    // Если центральный элемент изменился, плавно переключаем изображение
    if (centerItemIndexRef.current !== closestIndex) {
      const centerImage = centerImageRef.current;
      const centerImg = centerImage?.querySelector('img') as HTMLImageElement;
      
      if (centerImg && ITEMS_DATA[originalIndex]) {
        // Плавное переключение через opacity
        if (centerImage) {
          centerImage.style.opacity = '0';
          
          setTimeout(() => {
            if (centerImg && ITEMS_DATA[originalIndex] && centerImage) {
              centerImg.src = ITEMS_DATA[originalIndex].img.startsWith('/') ? getStaticPath(ITEMS_DATA[originalIndex].img) : ITEMS_DATA[originalIndex].img;
              centerImg.alt = ITEMS_DATA[originalIndex].text;
              centerImage.style.opacity = '1';
            }
          }, 150); // Половина времени анимации для плавности
        }
      }
      
      centerItemIndexRef.current = closestIndex;
    }
  }, [itemsData, originalItemsCount]);

  // Обновление layout с мемоизацией вычислений
  const updateLayout = useCallback(() => {
    const ITEMS_COUNT = itemsData.length;
    const ITEMS_DATA = itemsData;
    if (!itemsLayerRef.current || !guideCircleRef.current || typeof window === 'undefined' || originalItemsCount === 0) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = isMobileDevice();

    // Используем разное смещение для мобильных и десктопа
    const centerXOffset = isMobile ? CENTER_X_OFFSET_MOBILE : CENTER_X_OFFSET_DESKTOP;
    const cx = viewportWidth * centerXOffset;
    const cy = viewportHeight / 2;
    const R = Math.min(viewportWidth, viewportHeight) * RADIUS_MULTIPLIER;

    guideCircleRef.current.style.width = `${R * 2}px`;
    guideCircleRef.current.style.height = `${R * 2}px`;

    const currentScrollOffset = scrollOffsetRef.current;
    const twoPi = 2 * Math.PI;
    
    // Определяем центральный элемент для выделения жирным шрифтом (только на мобильных)
    const horizontalCenter = viewportWidth / 2;
    let centerIndex: number | null = null;
    
    if (isMobile) {
      let closestDistance = Infinity;
      for (let i = 0; i < ITEMS_COUNT; i++) {
        const baseAngle = (i / ITEMS_COUNT) * twoPi;
        const angle = baseAngle + (currentScrollOffset * ANGLE_PER_PIXEL);
        const x = cx + Math.cos(angle) * R;
        const distance = Math.abs(x - horizontalCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          centerIndex = i;
        }
      }
    }

    for (let i = 0; i < ITEMS_COUNT; i++) {
      const item = itemElementsRef.current[i];
      const image = imageElementsRef.current[i];
      if (!item) continue;

      const baseAngle = (i / ITEMS_COUNT) * twoPi;
      const angle = baseAngle + (currentScrollOffset * ANGLE_PER_PIXEL);

      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;

      item.style.transform = `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}rad)`;
      
      // На мобильных устройствах центральный элемент делаем белым без прозрачности
      if (isMobile) {
        if (i === centerIndex) {
          item.style.setProperty('color', '#FFFFFF', 'important'); // Белый без прозрачности
        } else {
          item.style.setProperty('color', 'rgba(255, 255, 255, 0.6)', 'important'); // 60% прозрачности
        }
      } else {
        // На десктопе сбрасываем color, чтобы работал класс text-foreground/60
        item.style.removeProperty('color');
      }
      
      // Позиционируем изображение под текстом (только если оно не в hover состоянии)
      // Дополнительно проверяем, что изображение не в fixed состоянии
      if (image && currentHoveredIndexRef.current !== i) {
        // Проверяем, что изображение действительно в absolute состоянии (не fixed)
        const isFixed = image.style.position === 'fixed';
        if (!isFixed) {
          image.style.transform = `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}rad)`;
        }
      }
    }

    // Обновляем центральное изображение для мобильных устройств
    if (isMobileDevice()) {
      updateCenterImage();
    }
  }, [updateCenterImage, originalItemsCount]);

  // Плавный скролл с easing
  // Easing функция для более естественного движения (cubic ease-out)
  // Применяется к фактору интерполяции для более плавного замедления
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const updateSmoothScroll = useCallback(() => {
    const diff = targetScrollOffsetRef.current - scrollOffsetRef.current;

    if (Math.abs(diff) < SCROLL_THRESHOLD) {
      scrollOffsetRef.current = targetScrollOffsetRef.current;
      updateLayout();
      if (scrollAnimationFrameIdRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameIdRef.current);
        scrollAnimationFrameIdRef.current = null;
      }
      return;
    }

    // Применяем easing: чем ближе к цели, тем медленнее движение
    // Используем нормализованный прогресс для применения easing
    const maxDiff = 1000; // Максимальное ожидаемое расстояние для нормализации
    const normalizedProgress = Math.min(Math.abs(diff) / maxDiff, 1);
    const easedProgress = easeOutCubic(normalizedProgress);
    // Применяем eased progress к фактору интерполяции
    const easedFactor = SCROLL_SMOOTH_FACTOR * (0.5 + easedProgress * 0.5); // От 0.5x до 1x фактора
    
    scrollOffsetRef.current += diff * easedFactor;
    updateLayout();

    scrollAnimationFrameIdRef.current = requestAnimationFrame(updateSmoothScroll);
  }, [updateLayout]);

  const startSmoothScroll = useCallback(() => {
    if (scrollAnimationFrameIdRef.current === null) {
      scrollAnimationFrameIdRef.current = requestAnimationFrame(updateSmoothScroll);
    }
  }, [updateSmoothScroll]);

  // Плавное следование изображения за курсором
  const updateImageFollow = useCallback(() => {
    if (currentHoveredIndexRef.current === null) {
      if (imageAnimationFrameRef.current !== null) {
        cancelAnimationFrame(imageAnimationFrameRef.current);
        imageAnimationFrameRef.current = null;
      }
      return;
    }

    const imageIndex = currentHoveredIndexRef.current;
    const image = imageElementsRef.current[imageIndex];
    
    if (!image) {
      if (imageAnimationFrameRef.current !== null) {
        cancelAnimationFrame(imageAnimationFrameRef.current);
        imageAnimationFrameRef.current = null;
      }
      return;
    }

    // Проверяем, что изображение действительно в fixed состоянии
    // Если нет - останавливаем анимацию (изображение вернулось к absolute)
    if (image.style.position !== 'fixed') {
      if (imageAnimationFrameRef.current !== null) {
        cancelAnimationFrame(imageAnimationFrameRef.current);
        imageAnimationFrameRef.current = null;
      }
      return;
    }

    const target = imageTargetPositionRef.current;
    const current = imageCurrentPositionRef.current;

    // Линейная интерполяция (lerp) для плавного движения
    const dx = target.x - current.x;
    const dy = target.y - current.y;

    // Если расстояние очень маленькое, останавливаем анимацию
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
      imageCurrentPositionRef.current = { ...target };
      image.style.left = `${target.x}px`;
      image.style.top = `${target.y}px`;
      if (imageAnimationFrameRef.current !== null) {
        cancelAnimationFrame(imageAnimationFrameRef.current);
        imageAnimationFrameRef.current = null;
      }
      return;
    }

    // Применяем интерполяцию
    imageCurrentPositionRef.current = {
      x: current.x + dx * IMAGE_FOLLOW_SMOOTHNESS,
      y: current.y + dy * IMAGE_FOLLOW_SMOOTHNESS
    };

    image.style.left = `${imageCurrentPositionRef.current.x}px`;
    image.style.top = `${imageCurrentPositionRef.current.y}px`;

    imageAnimationFrameRef.current = requestAnimationFrame(updateImageFollow);
  }, []);

  const startImageFollowAnimation = useCallback(() => {
    if (imageAnimationFrameRef.current === null) {
      imageAnimationFrameRef.current = requestAnimationFrame(updateImageFollow);
    }
  }, [updateImageFollow]);

  // Инициализация элементов
  useEffect(() => {
    if (!itemsLayerRef.current || !isMounted || itemsData.length === 0) return;

    // Очистка предыдущих listeners - безопасно
    eventListenersRef.current.forEach(({ element, event, handler }) => {
      if (element && element.parentNode) {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          // Игнорируем ошибки, если элемент уже удален
        }
      }
    });
    eventListenersRef.current = [];

    // Безопасная очистка изображений перед очисткой itemsLayer
    if (imagesLayerRef.current) {
      try {
        let child: ChildNode | null;
        while ((child = imagesLayerRef.current.firstChild) !== null) {
          if (child.parentNode === imagesLayerRef.current) {
            imagesLayerRef.current.removeChild(child);
          } else {
            break;
          }
        }
      } catch (error) {
        // Если произошла ошибка, используем innerHTML
        imagesLayerRef.current.innerHTML = '';
      }
    }

    // Очистка itemsLayer
    if (itemsLayerRef.current) {
      itemsLayerRef.current.innerHTML = '';
    }
    imageElementsRef.current = [];
    itemElementsRef.current = [];
    targetScrollOffsetRef.current = scrollOffsetRef.current;

    const ITEMS_DATA = itemsData;
    const ITEMS_COUNT = itemsData.length;
    
    ITEMS_DATA.forEach((data, i) => {
      // Получаем оригинальный индекс для доступа к данным
      const originalIndex = originalItemsCount > 0 ? i % originalItemsCount : i;
      const originalData = ITEMS_DATA[originalIndex];
      
      // Создаем текстовый элемент
      const el = document.createElement('div');
      el.className = 'absolute whitespace-nowrap text-foreground/60 font-medium tracking-[0.12em] uppercase cursor-pointer pointer-events-auto hover:text-foreground transition-colors duration-200 radial-item';
      // Адаптивный размер шрифта: меньше на мобильных
      el.style.fontSize = typeof window !== 'undefined' && window.innerWidth < 768 ? '32px' : '48px';
      // Применяем шрифт Craftwork Grotesk через CSS переменную
      el.style.fontFamily = 'var(--font-craftwork), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      el.style.left = '0';
      el.style.top = '0';
      el.style.transformOrigin = 'left center';
      // Убираем outline и box-shadow при клике/фокусе
      el.style.outline = 'none';
      el.style.boxShadow = 'none';
      el.textContent = originalData.text;
      el.setAttribute('role', 'button');
      el.setAttribute('tabIndex', '0');
      el.setAttribute('aria-label', `${originalData.text} - нажмите для просмотра`);
      el.setAttribute('data-item-index', i.toString());
      
      // Обработчик для навигации и предотвращения outline при клике
      const clickHandler = (e: Event) => {
        e.preventDefault();
        // Навигация на страницу кейса используя оригинальный индекс
        // Кодируем slug для правильной обработки пробелов и спецсимволов
        if (originalData?.slug) {
          const encodedSlug = encodeURIComponent(originalData.slug);
          router.push(`/case/${encodedSlug}`);
        }
        // Убираем focus после клика, чтобы не было белой рамки
        if (document.activeElement === el) {
          (el as HTMLElement).blur();
        }
      };
      
      const mousedownHandler = (e: Event) => {
        // Предотвращаем focus при клике мышью
        if (e instanceof MouseEvent) {
          e.preventDefault();
        }
      };
      
      const focusHandler = () => {
        // Гарантированно убираем outline и box-shadow при фокусе
        el.style.outline = 'none';
        el.style.boxShadow = 'none';
      };

      // Создаем контейнер для изображения с вертикальной маской (только для десктопа)
      // На мобильных используем центральное изображение вместо hover-изображений
      let imageContainer: HTMLDivElement | null = null;
      if (!isMobileDevice()) {
        imageContainer = document.createElement('div');
        imageContainer.className = 'radial-image-container';
        imageContainer.style.position = 'absolute';
        imageContainer.style.left = '0';
        imageContainer.style.top = '0';
        imageContainer.style.transformOrigin = 'left center';
        imageContainer.style.width = '400px';
        imageContainer.style.height = '300px';
        imageContainer.style.overflow = 'hidden';
        imageContainer.style.opacity = '0';
        imageContainer.style.pointerEvents = 'none';
        // Вертикальная маска снизу вверх через clipPath (как на главной странице)
        imageContainer.style.clipPath = 'inset(0% 0% 100% 0%)';
        (imageContainer.style as any).webkitClipPath = 'inset(0% 0% 100% 0%)';
        imageContainer.style.transition = 'opacity 0.3s ease-in-out, clip-path 0.5s ease-in-out, -webkit-clip-path 0.5s ease-in-out';

        // Создаем изображение используя оригинальные данные
        const img = document.createElement('img');
        // Используем getStaticPath для правильных путей с basePath
        img.src = originalData.img.startsWith('/') ? getStaticPath(originalData.img) : originalData.img;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        imageContainer.appendChild(img);
        imageElementsRef.current.push(imageContainer);

        // Добавляем контейнер изображения в отдельный слой
        if (imagesLayerRef.current) {
          imagesLayerRef.current.appendChild(imageContainer);
        }
      } else {
        // На мобильных не создаем hover-изображения
        imageElementsRef.current.push(null);
      }

      // Добавляем обработчики событий
      const mouseEnterHandler = (e: Event) => {
        // Hover работает только на десктопе
        if (isMobileDevice() || !imageContainer) return;
        
        const mouseEvent = e instanceof MouseEvent ? e : null;
        currentHoveredIndexRef.current = i;
        
        // Полностью отвязываем от радиальной позиции: сбрасываем все transform стили
        imageContainer.style.transform = 'none';
        imageContainer.style.transformOrigin = 'center center';
        
        // Переключаем на fixed позиционирование для следования за курсором
        imageContainer.style.position = 'fixed';
        // Добавляем z-index для fixed изображений
        imageContainer.style.zIndex = '1000';
        
        // Устанавливаем начальную позицию так, чтобы центр изображения был под курсором
        // Изображение 400x300, поэтому смещаем на половину размера
        const offsetX = -200; // -width/2
        const offsetY = -150; // -height/2
        let initialX = 0;
        let initialY = 0;
        
        if (mouseEvent) {
          initialX = mouseEvent.clientX + offsetX;
          initialY = mouseEvent.clientY + offsetY;
        } else {
          // Используем последнюю известную позицию курсора, если она есть
          const hasValidPosition = mousePositionRef.current.x > 0 || mousePositionRef.current.y > 0;
          if (hasValidPosition) {
            initialX = mousePositionRef.current.x + offsetX;
            initialY = mousePositionRef.current.y + offsetY;
          } else {
            // Если позиции нет, используем центр экрана
            initialX = window.innerWidth / 2 + offsetX;
            initialY = window.innerHeight / 2 + offsetY;
          }
        }
        
        // Устанавливаем текущую и целевую позицию одинаково для плавного старта
        imageCurrentPositionRef.current = { x: initialX, y: initialY };
        imageTargetPositionRef.current = { x: initialX, y: initialY };
        imageContainer.style.left = `${initialX}px`;
        imageContainer.style.top = `${initialY}px`;
        
        // Визуальное появление
        imageContainer.style.opacity = '1';
        imageContainer.style.clipPath = 'inset(0% 0% 0% 0%)';
        (imageContainer.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
      };

      const mouseMoveHandler = (e: Event) => {
        // Hover работает только на десктопе
        if (isMobileDevice() || !imageContainer) return;
        
        // Защита от race condition: проверяем, что это все еще тот же элемент
        if (currentHoveredIndexRef.current === i && e instanceof MouseEvent) {
          // Центр изображения под курсором (400x300)
          const offsetX = -200; // -width/2
          const offsetY = -150; // -height/2
          // Устанавливаем целевую позицию (картинка будет плавно к ней двигаться)
          imageTargetPositionRef.current = {
            x: e.clientX + offsetX,
            y: e.clientY + offsetY
          };
          // Обновляем позицию курсора для резервного использования
          mousePositionRef.current = { x: e.clientX, y: e.clientY };
          // Запускаем плавную анимацию следования
          startImageFollowAnimation();
        }
      };

      const mouseLeaveHandler = () => {
        // Hover работает только на десктопе
        if (isMobileDevice() || !imageContainer) return;
        
        // Защита от race condition: проверяем, что это все еще тот же элемент
        if (currentHoveredIndexRef.current === i) {
          currentHoveredIndexRef.current = null;
          
          // Останавливаем анимацию следования
          if (imageAnimationFrameRef.current !== null) {
            cancelAnimationFrame(imageAnimationFrameRef.current);
            imageAnimationFrameRef.current = null;
          }
          
          // Визуальное исчезновение
          imageContainer.style.opacity = '0';
          imageContainer.style.clipPath = 'inset(0% 0% 100% 0%)';
          (imageContainer.style as any).webkitClipPath = 'inset(0% 0% 100% 0%)';
          
          // Задержка возврата к absolute позиции до завершения анимации исчезновения (0.5s)
          // Это предотвращает визуальный скачок - изображение исчезает на месте, затем возвращается
          setTimeout(() => {
            // Проверяем, что элемент все еще не в hover состоянии (защита от race condition)
            if (currentHoveredIndexRef.current !== i && imageContainer) {
              // Полностью сбрасываем fixed стили перед возвратом к absolute
              imageContainer.style.position = 'absolute';
              imageContainer.style.transformOrigin = 'left center';
              imageContainer.style.zIndex = '';
              imageContainer.style.left = '0';
              imageContainer.style.top = '0';
              imageContainer.style.transform = '';
              // Обновляем позицию через layout (изображение вернется к радиальной позиции)
              updateLayout();
            }
          }, 500); // Время анимации clipPath из transition
        }
      };

      const keyDownHandler = (e: Event) => {
        // Hover работает только на десктопе
        if (isMobileDevice() || !imageContainer) return;
        
        if (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' ')) {
          currentHoveredIndexRef.current = i;
          imageContainer.style.opacity = '1';
          imageContainer.style.clipPath = 'inset(0% 0% 0% 0%)';
          (imageContainer.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
          // Для keyboard используем последнюю известную позицию курсора или центр экрана
          // Центр изображения под курсором (400x300)
          const offsetX = -200; // -width/2
          const offsetY = -150; // -height/2
          const hasValidPosition = mousePositionRef.current.x > 0 || mousePositionRef.current.y > 0;
          const x = hasValidPosition ? mousePositionRef.current.x : window.innerWidth / 2;
          const y = hasValidPosition ? mousePositionRef.current.y : window.innerHeight / 2;
          imageContainer.style.position = 'fixed';
          imageContainer.style.transformOrigin = 'center center';
          imageContainer.style.zIndex = '1000';
          const targetX = x + offsetX;
          const targetY = y + offsetY;
          // Устанавливаем текущую и целевую позицию одинаково для плавного старта
          imageCurrentPositionRef.current = { x: targetX, y: targetY };
          imageTargetPositionRef.current = { x: targetX, y: targetY };
          imageContainer.style.left = `${targetX}px`;
          imageContainer.style.top = `${targetY}px`;
          imageContainer.style.transform = 'none';
        }
      };

      const keyUpHandler = (e: Event) => {
        // Hover работает только на десктопе
        if (isMobileDevice() || !imageContainer) return;
        
        if (e instanceof KeyboardEvent && (e.key === 'Enter' || e.key === ' ')) {
          if (currentHoveredIndexRef.current === i) {
            currentHoveredIndexRef.current = null;
            imageContainer.style.opacity = '0';
            imageContainer.style.clipPath = 'inset(0% 0% 100% 0%)';
            (imageContainer.style as any).webkitClipPath = 'inset(0% 0% 100% 0%)';
            
            // Навигация на страницу кейса при нажатии Enter используя оригинальный индекс
            // Кодируем slug для правильной обработки пробелов и спецсимволов
            if (e.key === 'Enter' && originalData?.slug) {
              const encodedSlug = encodeURIComponent(originalData.slug);
              router.push(`/case/${encodedSlug}`);
            }
            
            // Задержка возврата к absolute позиции до завершения анимации
            setTimeout(() => {
              if (currentHoveredIndexRef.current !== i) {
                imageContainer.style.position = 'absolute';
                imageContainer.style.transformOrigin = 'left center';
                imageContainer.style.zIndex = '';
                imageContainer.style.left = '0';
                imageContainer.style.top = '0';
                imageContainer.style.transform = '';
                updateLayout();
              }
            }, 500);
          }
        }
      };

      el.addEventListener('mouseenter', mouseEnterHandler);
      el.addEventListener('mousemove', mouseMoveHandler);
      el.addEventListener('mouseleave', mouseLeaveHandler);
      el.addEventListener('click', clickHandler);
      el.addEventListener('mousedown', mousedownHandler);
      el.addEventListener('focus', focusHandler);
      el.addEventListener('keydown', keyDownHandler);
      el.addEventListener('keyup', keyUpHandler);

      // Сохраняем ссылки для cleanup
      eventListenersRef.current.push(
        { element: el, event: 'mouseenter', handler: mouseEnterHandler },
        { element: el, event: 'mousemove', handler: mouseMoveHandler },
        { element: el, event: 'mouseleave', handler: mouseLeaveHandler },
        { element: el, event: 'click', handler: clickHandler },
        { element: el, event: 'mousedown', handler: mousedownHandler },
        { element: el, event: 'focus', handler: focusHandler },
        { element: el, event: 'keydown', handler: keyDownHandler },
        { element: el, event: 'keyup', handler: keyUpHandler }
      );

      itemsLayerRef.current!.appendChild(el);
      itemElementsRef.current.push(el);
    });

    // Инициализация центрального изображения для мобильных устройств
    if (isMobileDevice() && centerImageRef.current && ITEMS_DATA.length > 0) {
      const centerImage = centerImageRef.current;
      const centerImg = centerImage.querySelector('img') as HTMLImageElement;
      if (centerImg && ITEMS_DATA[0]) {
        centerImg.src = ITEMS_DATA[0].img.startsWith('/') ? getStaticPath(ITEMS_DATA[0].img) : ITEMS_DATA[0].img;
        centerImg.alt = ITEMS_DATA[0].text;
        centerItemIndexRef.current = 0;
      }
    }

    // Обновляем isMobileRef
    isMobileRef.current = isMobileDevice();

    updateLayout();

    return () => {
      // Cleanup event listeners - проверяем, что элемент еще существует
      eventListenersRef.current.forEach(({ element, event, handler }) => {
        // Проверяем, что элемент все еще в DOM перед удалением listener
        if (element && element.parentNode) {
          try {
            element.removeEventListener(event, handler);
          } catch (error) {
            // Игнорируем ошибки, если элемент уже удален
            console.warn('Error removing event listener:', error);
          }
        }
      });
      eventListenersRef.current = [];

      // Очищаем изображения безопасно
      if (imagesLayerRef.current) {
        try {
          // Используем безопасный способ очистки
          let child: ChildNode | null;
          while ((child = imagesLayerRef.current.firstChild) !== null) {
            if (child.parentNode) {
              imagesLayerRef.current.removeChild(child);
            } else {
              break;
            }
          }
        } catch (error) {
          // Если произошла ошибка, просто очищаем через innerHTML
          imagesLayerRef.current.innerHTML = '';
        }
      }
      imageElementsRef.current = [];

      if (scrollAnimationFrameIdRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameIdRef.current);
        scrollAnimationFrameIdRef.current = null;
      }

      // Останавливаем анимацию следования изображения
      if (imageAnimationFrameRef.current !== null) {
        cancelAnimationFrame(imageAnimationFrameRef.current);
        imageAnimationFrameRef.current = null;
      }
    };
  }, [isMounted, updateLayout, startImageFollowAnimation, itemsData, router, originalItemsCount]);

  // Обработка скролла с оптимизацией
  useEffect(() => {
    if (!isMounted) return;

    const handleWheel = (e: WheelEvent) => {
      targetScrollOffsetRef.current += e.deltaY;
      startSmoothScroll();
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const currentY = e.touches[0].clientY;
        const deltaY = touchStartY - currentY;
        touchStartY = currentY;
        targetScrollOffsetRef.current += deltaY * TOUCH_SCROLL_MULTIPLIER;
        startSmoothScroll();
      }
    };

    const debouncedResize = debounce(() => {
      // Обновляем isMobileRef при изменении размера окна
      const wasMobile = isMobileRef.current;
      isMobileRef.current = isMobileDevice();
      
      // Если переключились между мобильным и десктопом, инициализируем центральное изображение
      if (centerImageRef.current && isMobileRef.current && !wasMobile && itemsData.length > 0) {
        // Переключились на мобильный режим - инициализируем центральное изображение
        const centerImg = centerImageRef.current.querySelector('img') as HTMLImageElement;
        if (centerImg && centerItemIndexRef.current === null && itemsData[0]) {
          centerImg.src = itemsData[0].img.startsWith('/') ? getStaticPath(itemsData[0].img) : itemsData[0].img;
          centerImg.alt = itemsData[0].text;
          centerItemIndexRef.current = 0;
        }
      }
      
      // updateLayout уже вызывает updateCenterImage для мобильных устройств
      updateLayout();
    }, RESIZE_DEBOUNCE_MS);

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', debouncedResize, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', debouncedResize);
    };
  }, [isMounted, startSmoothScroll, updateLayout, itemsData]);

  // Обновление позиции курсора для резервного использования (только обновление ref)
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = throttle((e: unknown) => {
      if (e instanceof MouseEvent) {
        mousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    }, MOUSE_MOVE_THROTTLE_MS);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen w-screen text-foreground select-none bg-base overflow-hidden font-sans" role="main" aria-label="Радиальная карусель портфолио">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none">
        <nav className="flex items-center gap-4 pointer-events-auto" aria-label="Хлебные крошки">
          <Link 
            href="/" 
            className="text-base font-medium tracking-tight hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
            aria-label="Главная страница"
          >
            Bugrov.space
          </Link>
        </nav>
      </header>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none">
        <nav className="flex items-center gap-6 text-base text-foreground/80 pointer-events-auto" aria-label="Социальные сети">
        </nav>
        <div className="text-base text-foreground/80 hidden md:block" aria-live="polite">
          Scroll to explore
        </div>
      </footer>

      {/* Images Layer - перемещен выше, чтобы не зависеть от скролла радиальной секции */}
      <div 
        ref={imagesLayerRef} 
        className="fixed inset-0 z-10 pointer-events-none"
        aria-label="Контейнер изображений"
      />

      {/* Radial Section */}
      <section className="relative w-full h-full bg-base overflow-hidden" aria-label="Карусель проектов">
        {/* Visual Circle */}
        <div
          ref={guideCircleRef}
          className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full pointer-events-none z-0 hidden"
          aria-hidden="true"
        />

        {/* Центральное изображение - только для мобильных устройств */}
        <div
          ref={centerImageRef}
          className="fixed z-[15] pointer-events-none transition-opacity duration-300 ease-in-out md:hidden"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            aspectRatio: '4/6',
            opacity: 1,
          }}
          aria-hidden="true"
        >
          <img
            className="w-full h-full object-cover"
            alt=""
            style={{
              filter: 'brightness(1.1) contrast(1.05)',
            }}
          />
        </div>

        {/* Items Layer */}
        <div 
          ref={itemsLayerRef} 
          className="absolute inset-0 z-20 pointer-events-none"
          role="list"
          aria-label="Список проектов"
        />
      </section>
    </div>
  );
}