'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

interface ItemData {
  text: string;
  img: string;
}

const ITEMS_DATA: ItemData[] = [
  { text: "Alpha Dimension", img: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=500&q=80" },
  { text: "Vortex Valley", img: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=500&q=80" },
  { text: "Quantum Quarters", img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&q=80" },
  { text: "Nebula Nexus", img: "https://images.unsplash.com/photo-1518005052357-e9305505dc3b?w=500&q=80" },
  { text: "Cosmic Corridor", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80" },
  { text: "Void Vista", img: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&q=80" },
  { text: "Stellar Station", img: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=500&q=80" },
  { text: "Lunar Loft", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=500&q=80" },
  { text: "Solar Spire", img: "https://images.unsplash.com/photo-1518005052357-e9305505dc3b?w=500&q=80" },
  { text: "Astro Atrium", img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&q=80" },
  { text: "Galaxy Garden", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80" },
  { text: "Orbit Oasis", img: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=500&q=80" },
  { text: "Meteor Manor", img: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=500&q=80" },
  { text: "Comet Court", img: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&q=80" },
  { text: "Eclipse Estate", img: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=500&q=80" },
  { text: "Horizon Hall", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=500&q=80" },
  { text: "Nova Nexus", img: "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=500&q=80" },
  { text: "Pulsar Plaza", img: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=500&q=80" },
  { text: "Quasar Quarters", img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&q=80" },
  { text: "Rocket Range", img: "https://images.unsplash.com/photo-1518005052357-e9305505dc3b?w=500&q=80" },
  { text: "Satellite Station", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80" },
  { text: "Titan Tower", img: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&q=80" },
  { text: "Uranus Unit", img: "https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=500&q=80" },
  { text: "Venus Vista", img: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=500&q=80" }
];

// Константы
const ITEMS_COUNT = ITEMS_DATA.length;
const ANGLE_PER_PIXEL = 0.0015;
const SCROLL_SMOOTH_FACTOR = 0.12;
const SCROLL_THRESHOLD = 0.1;
const PREVIEW_HIDE_DELAY = 400;
const CENTER_X_OFFSET = -0.2; // -20% от ширины viewport
const RADIUS_MULTIPLIER = 0.508; // 50.8% от минимального размера viewport
const TOUCH_SCROLL_MULTIPLIER = 2;

// Throttle/Debounce константы
const MOUSE_MOVE_THROTTLE_MS = 16; // ~60fps
const RESIZE_DEBOUNCE_MS = 150;

// Утилиты для throttle и debounce
function throttle<T extends (...args: any[]) => void>(
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

export default function RadialCarousel() {
  const itemsLayerRef = useRef<HTMLDivElement>(null);
  const guideCircleRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  const appearMaskRef = useRef<HTMLDivElement>(null);
  
  const scrollOffsetRef = useRef(0);
  const targetScrollOffsetRef = useRef(0);
  const itemElementsRef = useRef<HTMLDivElement[]>([]);
  const scrollAnimationFrameIdRef = useRef<number | null>(null);
  const hideTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const eventListenersRef = useRef<Array<{ element: HTMLElement; event: string; handler: EventListener }>>([]);
  
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveringText, setIsHoveringText] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [maskVisible, setMaskVisible] = useState(false);
  const [previewImageSrc, setPreviewImageSrc] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Проверка на клиентскую сторону
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Обновление layout с мемоизацией вычислений
  const updateLayout = useCallback(() => {
    if (!itemsLayerRef.current || !guideCircleRef.current || typeof window === 'undefined') return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const cx = viewportWidth * CENTER_X_OFFSET;
    const cy = viewportHeight / 2;
    const R = Math.min(viewportWidth, viewportHeight) * RADIUS_MULTIPLIER;

    guideCircleRef.current.style.width = `${R * 2}px`;
    guideCircleRef.current.style.height = `${R * 2}px`;

    const currentScrollOffset = scrollOffsetRef.current;
    const twoPi = 2 * Math.PI;

    for (let i = 0; i < ITEMS_COUNT; i++) {
      const item = itemElementsRef.current[i];
      if (!item) continue;

      const baseAngle = (i / ITEMS_COUNT) * twoPi;
      const angle = baseAngle + (currentScrollOffset * ANGLE_PER_PIXEL);

      const x = cx + Math.cos(angle) * R;
      const y = cy + Math.sin(angle) * R;

      item.style.transform = `translate(${x}px, ${y}px) translateY(-50%) rotate(${angle}rad)`;
    }
  }, []);

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

  // Обработчики событий для элементов
  const handleItemMouseEnter = useCallback((imgSrc: string) => {
    if (hideTimeoutIdRef.current) {
      clearTimeout(hideTimeoutIdRef.current);
      hideTimeoutIdRef.current = null;
    }

    setIsHoveringText(true);
    setPreviewImageSrc(imgSrc);
    setPreviewVisible(true);
    setMaskVisible(false);
    
    // Force reflow для анимации маски
    if (appearMaskRef.current) {
      void appearMaskRef.current.offsetWidth;
    }
    setMaskVisible(true);
  }, []);

  const handleItemMouseLeave = useCallback(() => {
    setIsHoveringText(false);
    setMaskVisible(false);

    hideTimeoutIdRef.current = setTimeout(() => {
      setPreviewVisible(false);
      hideTimeoutIdRef.current = null;
    }, PREVIEW_HIDE_DELAY);
  }, []);

  const handleItemKeyDown = useCallback((e: KeyboardEvent, imgSrc: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemMouseEnter(imgSrc);
    }
  }, [handleItemMouseEnter]);

  const handleItemKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemMouseLeave();
    }
  }, [handleItemMouseLeave]);

  // Инициализация элементов
  useEffect(() => {
    if (!itemsLayerRef.current || !isMounted) return;

    // Очистка предыдущих listeners
    eventListenersRef.current.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    eventListenersRef.current = [];

    itemsLayerRef.current.innerHTML = '';
    itemElementsRef.current = [];
    targetScrollOffsetRef.current = scrollOffsetRef.current;

    ITEMS_DATA.forEach((data, i) => {
      const el = document.createElement('div');
      el.className = 'absolute whitespace-nowrap text-white font-medium tracking-[0.12em] uppercase cursor-pointer pointer-events-auto hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-200';
      el.style.fontSize = '48px';
      el.style.left = '0';
      el.style.top = '0';
      el.style.transformOrigin = 'left center';
      el.textContent = data.text;
      el.setAttribute('role', 'button');
      el.setAttribute('tabIndex', '0');
      el.setAttribute('aria-label', `${data.text} - нажмите для просмотра`);
      el.setAttribute('data-item-index', i.toString());

      const mouseEnterHandler = () => handleItemMouseEnter(data.img);
      const mouseLeaveHandler = () => handleItemMouseLeave();
      const keyDownHandler = (e: Event) => handleItemKeyDown(e as KeyboardEvent, data.img);
      const keyUpHandler = (e: Event) => handleItemKeyUp(e as KeyboardEvent);

      el.addEventListener('mouseenter', mouseEnterHandler);
      el.addEventListener('mouseleave', mouseLeaveHandler);
      el.addEventListener('keydown', keyDownHandler);
      el.addEventListener('keyup', keyUpHandler);

      // Сохраняем ссылки для cleanup
      eventListenersRef.current.push(
        { element: el, event: 'mouseenter', handler: mouseEnterHandler },
        { element: el, event: 'mouseleave', handler: mouseLeaveHandler },
        { element: el, event: 'keydown', handler: keyDownHandler },
        { element: el, event: 'keyup', handler: keyUpHandler }
      );

      itemsLayerRef.current!.appendChild(el);
      itemElementsRef.current.push(el);
    });

    updateLayout();

    return () => {
      // Cleanup event listeners
      eventListenersRef.current.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      eventListenersRef.current = [];

      if (scrollAnimationFrameIdRef.current !== null) {
        cancelAnimationFrame(scrollAnimationFrameIdRef.current);
        scrollAnimationFrameIdRef.current = null;
      }
      if (hideTimeoutIdRef.current) {
        clearTimeout(hideTimeoutIdRef.current);
        hideTimeoutIdRef.current = null;
      }
    };
  }, [isMounted, updateLayout, handleItemMouseEnter, handleItemMouseLeave, handleItemKeyDown, handleItemKeyUp]);

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
  }, [isMounted, startSmoothScroll, updateLayout]);

  // Отслеживание курсора с throttle
  useEffect(() => {
    if (!isMounted) return;

    const handleMouseMove = throttle((e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    }, MOUSE_MOVE_THROTTLE_MS);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMounted]);

  // Обработка ошибок загрузки изображений
  const handleImageError = useCallback(() => {
    setPreviewVisible(false);
    setMaskVisible(false);
    setIsHoveringText(false);
    setPreviewImageSrc('');
  }, []);

  const handleImageLoad = useCallback(() => {
    // ИСПРАВЛЕНИЕ: Убираем проверку isHoveringText, чтобы изображение показывалось сразу при загрузке
    if (previewImageRef.current?.complete && previewImageRef.current.naturalWidth > 0) {
      setPreviewVisible(true);
      setMaskVisible(false);
      if (appearMaskRef.current) {
        void appearMaskRef.current.offsetWidth;
      }
      setMaskVisible(true);
    }
  }, []);

  // Позиция превью с мемоизацией
  const previewStyle = useMemo(() => {
    if (!previewVisible) {
      return { display: 'none' as const };
    }
    return {
      left: `${cursorPos.x}px`,
      top: `${cursorPos.y}px`,
      display: 'block' as const,
    };
  }, [previewVisible, cursorPos.x, cursorPos.y]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen w-screen text-white select-none bg-black overflow-hidden" role="main" aria-label="Радиальная карусель портфолио">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none">
        <nav className="flex items-center gap-4 pointer-events-auto" aria-label="Хлебные крошки">
          <Link 
            href="/" 
            className="text-base font-medium tracking-tight hover:text-white/80 focus:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            aria-label="Главная страница"
          >
            Bugrov.space
          </Link>
          <span className="text-white/40" aria-hidden="true">/</span>
          <span className="text-base text-white/60" aria-current="page">Radial View</span>
        </nav>
      </header>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none">
        <nav className="flex items-center gap-6 text-base text-white/80 pointer-events-auto" aria-label="Социальные сети">
          <a href="#" className="hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors" aria-label="Подписаться">
            Subscribe
          </a>
          <a href="#" className="hover:text-white focus:text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors" aria-label="Instagram">
            Instagram
          </a>
        </nav>
        <div className="text-base text-white/80 hidden md:block" aria-live="polite">
          Scroll to explore
        </div>
      </footer>

      {/* Radial Section */}
      <section className="relative w-full h-full bg-black overflow-hidden" aria-label="Карусель проектов">
        {/* Visual Circle */}
        <div
          ref={guideCircleRef}
          className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full pointer-events-none z-0 hidden"
          aria-hidden="true"
        />

        {/* Preview Image Container */}
        <div
          ref={previewContainerRef}
          className="absolute w-[260px] h-[360px] bg-white z-10 pointer-events-none overflow-hidden"
          style={{
            ...previewStyle,
            transform: 'translate(-50%, -50%)',
          }}
          role="img"
          aria-label="Превью изображения"
        >
          {previewImageSrc && (
            <img
              ref={previewImageRef}
              src={previewImageSrc}
              alt="Preview"
              className="w-full h-full object-cover grayscale block"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
          )}
          <div
            ref={appearMaskRef}
            className="absolute inset-0 bg-black pointer-events-none z-[1]"
            style={{
              clipPath: maskVisible ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
              transition: 'clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Синхронизировано с остальными масками
            }}
            aria-hidden="true"
          />
        </div>

        {/* Items Layer */}
        <div
          ref={itemsLayerRef}
          className="absolute inset-0 z-20 pointer-events-auto"
          role="list"
          aria-label="Список проектов"
        />
      </section>
    </div>
  );
}