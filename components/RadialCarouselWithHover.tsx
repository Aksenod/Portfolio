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

export default function RadialCarouselWithHover() {
  const itemsLayerRef = useRef<HTMLDivElement>(null);
  const guideCircleRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);
  
  const scrollOffsetRef = useRef(0);
  const targetScrollOffsetRef = useRef(0);
  const itemElementsRef = useRef<HTMLDivElement[]>([]);
  const scrollAnimationFrameIdRef = useRef<number | null>(null);
  const eventListenersRef = useRef<Array<{ element: HTMLElement; event: string; handler: EventListener }>>([]);
  
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const maxDiff = 1000;
    const normalizedProgress = Math.min(Math.abs(diff) / maxDiff, 1);
    const easedProgress = easeOutCubic(normalizedProgress);
    const easedFactor = SCROLL_SMOOTH_FACTOR * (0.5 + easedProgress * 0.5);
    
    scrollOffsetRef.current += diff * easedFactor;
    updateLayout();

    scrollAnimationFrameIdRef.current = requestAnimationFrame(updateSmoothScroll);
  }, [updateLayout]);

  const startSmoothScroll = useCallback(() => {
    if (scrollAnimationFrameIdRef.current === null) {
      scrollAnimationFrameIdRef.current = requestAnimationFrame(updateSmoothScroll);
    }
  }, [updateSmoothScroll]);

  // Функция для показа превью картинки
  const showPreview = useCallback((index: number) => {
    if (!previewContainerRef.current || !previewImageRef.current) return;

    const itemData = ITEMS_DATA[index];
    const item = itemElementsRef.current[index];
    
    if (!item || !itemData) return;

    // Очищаем предыдущий таймаут
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }

    // Устанавливаем изображение
    previewImageRef.current.src = itemData.img;
    previewImageRef.current.alt = itemData.text;

    // Позиционируем контейнер превью
    const rect = item.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Позиционируем превью справа от центра экрана
    const previewX = viewportWidth * 0.6; // 60% от ширины экрана
    const previewY = viewportHeight / 2;

    previewContainerRef.current.style.left = `${previewX}px`;
    previewContainerRef.current.style.top = `${previewY}px`;

    // Показываем превью с анимацией
    setIsPreviewVisible(true);
    setHoveredItemIndex(index);
  }, []);

  // Функция для скрытия превью картинки
  const hidePreview = useCallback(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }

    previewTimeoutRef.current = setTimeout(() => {
      setIsPreviewVisible(false);
      setHoveredItemIndex(null);
    }, PREVIEW_HIDE_DELAY);
  }, []);

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
      el.className = 'absolute whitespace-nowrap text-foreground font-medium tracking-[0.12em] uppercase cursor-pointer pointer-events-auto hover:text-foreground/80 focus:text-foreground/80 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors duration-200';
      el.style.fontSize = '48px';
      el.style.left = '0';
      el.style.top = '0';
      el.style.transformOrigin = 'left center';
      el.textContent = data.text;
      el.setAttribute('role', 'button');
      el.setAttribute('tabIndex', '0');
      el.setAttribute('aria-label', `${data.text} - нажмите для просмотра`);
      el.setAttribute('data-item-index', i.toString());

      const mouseEnterHandler = () => {
        showPreview(i);
      };

      const mouseLeaveHandler = () => {
        hidePreview();
      };

      const keyDownHandler = (e: Event) => {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          showPreview(i);
        }
      };

      const keyUpHandler = (e: Event) => {
        const keyboardEvent = e as KeyboardEvent;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          hidePreview();
        }
      };

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

      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [isMounted, updateLayout, showPreview, hidePreview]);

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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="h-screen w-screen text-foreground select-none bg-base overflow-hidden" role="main" aria-label="Радиальная карусель портфолио">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none">
        <nav className="flex items-center gap-4 pointer-events-auto" aria-label="Хлебные крошки">
          <Link 
            href="/" 
            className="text-base font-medium tracking-tight hover:text-foreground/80 focus:text-foreground/80 focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors"
            aria-label="Главная страница"
          >
            Bugrov.space
          </Link>
          <span className="text-foreground/40" aria-hidden="true">/</span>
          <span className="text-base text-foreground/60" aria-current="page">Radial View</span>
        </nav>
      </header>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none">
        <nav className="flex items-center gap-6 text-base text-foreground/80 pointer-events-auto" aria-label="Социальные сети">
          <a href="#" className="hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors" aria-label="Подписаться">
            Subscribe
          </a>
          <a href="#" className="hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring/50 transition-colors" aria-label="Instagram">
            Instagram
          </a>
        </nav>
        <div className="text-base text-foreground/80 hidden md:block" aria-live="polite">
          Scroll to explore
        </div>
      </footer>

      {/* Radial Section */}
      <section className="relative w-full h-full bg-base overflow-hidden" aria-label="Карусель проектов">
        {/* Visual Circle */}
        <div
          ref={guideCircleRef}
          className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full pointer-events-none z-0 hidden"
          aria-hidden="true"
        />

        {/* Items Layer */}
        <div 
          ref={itemsLayerRef} 
          className="absolute inset-0 z-20 pointer-events-none"
          role="list"
          aria-label="Список проектов"
        />

        {/* Preview Container */}
        <div
          ref={previewContainerRef}
          className={`fixed z-30 transition-all duration-300 ease-out ${
            isPreviewVisible 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
          style={{
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
          }}
          aria-hidden={!isPreviewVisible}
        >
          {/* Preview Image */}
          <img
            ref={previewImageRef}
            className="w-full h-full object-cover rounded-lg shadow-2xl"
            alt=""
            style={{
              filter: 'brightness(1.1) contrast(1.05)',
              transition: 'all 0.3s ease-out',
            }}
          />
          
          {/* Overlay gradient */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-base/60 via-transparent to-transparent rounded-lg"
            style={{
              transition: 'opacity 0.3s ease-out',
              opacity: isPreviewVisible ? 1 : 0,
            }}
          />
          
          {/* Caption */}
          {hoveredItemIndex !== null && (
            <div 
              className="absolute bottom-4 left-4 right-4 text-foreground text-lg font-medium"
              style={{
                transform: isPreviewVisible ? 'translateY(0)' : 'translateY(10px)',
                opacity: isPreviewVisible ? 1 : 0,
                transition: 'all 0.3s ease-out 0.1s',
              }}
            >
              {ITEMS_DATA[hoveredItemIndex].text}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}