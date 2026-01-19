'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

interface Frame1ExperimentProps {
  images: string[]; // 5 изображений в порядке [-2, -1, 0, +1, +2]
}

export default function Frame1Experiment({ images }: Frame1ExperimentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current || imageContainerRefs.current.length !== 5) return;

    const container = containerRef.current;
    const imageContainers = imageContainerRefs.current;
    const imageElements = imageRefs.current;

    // Ждём загрузки всех изображений
    const checkImagesLoaded = () => {
      return imageElements.every((img) => img?.complete);
    };

    // Кастомный easing: cubic-bezier(0.25, 0.46, 0.45, 1)
    const customEase = CustomEase.create('customEase', 'M0,0 C0.25,0.46 0.45,1 1,1');

    // Mobile multiplier
    const mobileMultiplier = isMobile ? 0.8 : 1;

    // Начальные значения - равномерное распределение
    const SIDE_PADDING = 80; // px - отступ от краев экрана
    const CONTAINER_WIDTH = 8; // vw - ширина контейнера
    const SCALE_START = 0.9;
    const SCALE_MID = 1.2; // Увеличение на 20% при схождении
    // Расстояние между центрами: увеличиваем пропорционально scale, чтобы сохранить gap
    // D_END = исходное расстояние + (ширина * (scale - 1))
    const D_END = (10 + (CONTAINER_WIDTH * (SCALE_MID - 1))) * mobileMultiplier; // vw - сохраняем gap при увеличении

    // Инициализация состояния
    const initState = () => {
      // Контейнер: fixed, z-index 1000, pointer-events: none
      gsap.set(container, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 1000,
        pointerEvents: 'none',
      });

      // Контейнеры изображений: начальные позиции и scale
      imageContainers.forEach((container, index) => {
        if (!container) {
          console.warn(`Контейнер изображения ${index} не найден`);
          return;
        }
        // Вычисляем позиции в пикселях для равномерного распределения
        // Распределяем центры изображений равномерно с одинаковыми промежутками между ними
        const viewportWidth = window.innerWidth;
        const containerWidthPx = (viewportWidth * CONTAINER_WIDTH) / 100;
        
        // Вычисляем доступную ширину за вычетом боковых отступов и ширины всех изображений
        const totalImagesWidth = containerWidthPx * 5; // Ширина всех 5 изображений
        const availableWidthForGaps = viewportWidth - (SIDE_PADDING * 2) - totalImagesWidth;
        const gap = availableWidthForGaps / 4; // 4 промежутка между 5 изображениями
        
        // Позиция left для каждого контейнера (от левого края экрана)
        // Каждое изображение: SIDE_PADDING + (индекс * (ширина + gap))
        const leftPx = SIDE_PADDING + (index * (containerWidthPx + gap));
        
        // Переводим в vw для единообразия с анимацией
        const leftVw = (leftPx / viewportWidth) * 100;
        // Центрируем относительно центра экрана для x трансформации
        const centerOffset = 50; // центр экрана в vw
        const xOffset = leftVw - centerOffset + (CONTAINER_WIDTH / 2);
        
        gsap.set(container, {
          x: `${xOffset}vw`,
          y: 150, // Начальная позиция снизу (будет анимироваться вверх)
          scale: SCALE_START,
          transformOrigin: 'center center',
          opacity: 0, // Начальная прозрачность (будет анимироваться к 1)
        });
      });

      // Изображения: убеждаемся, что они видимы
      imageElements.forEach((img, index) => {
        if (!img) {
          console.warn(`Изображение ${index} не найдено`);
          return;
        }
        img.style.opacity = '1';
        img.style.visibility = 'visible';
      });
    };

    // Создание timeline
    const tl = gsap.timeline();

    // Инициализация
    initState();

    // Ждём загрузки изображений или запускаем через небольшую задержку
    const startAnimation = () => {
      // Фиксируем начальное состояние на 500ms
      tl.to({}, { duration: 0.5 }); // Пустая анимация для фиксации начального состояния
      
      // Сцена 1: Появление снизу вверх с прозрачности
      // Каждая картинка анимируется одинаково, но начало следующей сдвинуто на 0.1s
      const APPEAR_DURATION = 0.5;
      const STAGGER = 0.1;
      const sceneStart = 0.5;

      imageContainers.forEach((container, index) => {
        if (!container) return;

        const startPosition = sceneStart + index * STAGGER;

        tl.to(container, {
          y: 0, // Поднимаются снизу до финальной позиции
          opacity: 1, // Появляются из прозрачности
          duration: APPEAR_DURATION,
          ease: 'power2.out', // Более мягкое появление вместо резкого expo.out
        }, startPosition);
      });

      // Сцена 2: Схождение к центру
      // Все изображения начинают схождение одновременно после завершения всех появлений
      // Используем относительные позиции: первое после последнего появления, остальные одновременно с первым
      imageContainers.forEach((container, index) => {
        if (!container) return;
        const i = index - 2;
        const xEnd = i * D_END;
        
        // Первое изображение: после завершения последнего появления (">")
        // Остальные: одновременно с первым ("<")
        const position = index === 0 ? ">" : "<";
        
        tl.to(container, {
          x: `${xEnd}vw`,
          scale: SCALE_MID,
          duration: 2,
          ease: customEase, // Используем единый customEase для согласованности
        }, position); // Относительная позиция вместо абсолютной задержки
      });
    };

    // Проверяем загрузку изображений
    if (checkImagesLoaded()) {
      console.log('Все изображения загружены, запускаем анимацию');
      startAnimation();
    } else {
      console.log('Ожидаем загрузки изображений...');
      // Ждём загрузки всех изображений
      const imageLoadPromises = imageElements.map((img, idx) => {
        if (!img || img.complete) {
          console.log(`Изображение ${idx} уже загружено`);
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          img.onload = () => {
            console.log(`Изображение ${idx} загружено`);
            resolve();
          };
          img.onerror = () => {
            console.error(`Ошибка загрузки изображения ${idx}`);
            resolve(); // Продолжаем даже при ошибке
          };
          // Таймаут на случай, если изображение не загрузится
          setTimeout(() => {
            console.warn(`Таймаут загрузки изображения ${idx}`);
            resolve();
          }, 10000);
        });
      });

      Promise.all(imageLoadPromises).then(() => {
        console.log('Все промисы изображений завершены, запускаем анимацию');
        startAnimation();
      });
    }

    return () => {
      tl.kill();
    };
  }, [isMobile, images]);

  return (
    <div ref={containerRef} className="frame1-experiment-container bg-base">
      {/* Изображения */}
      <div className="frame1-experiment-images-wrapper absolute inset-0 flex items-center justify-center pointer-events-none z-40">
        {images.map((src, index) => (
          <div
            key={index}
            ref={(el) => {
              imageContainerRefs.current[index] = el;
            }}
            className="frame1-experiment-image-container absolute"
            style={{
              width: '8vw',
              height: '16vh',
            }}
          >
            <img
              ref={(el) => {
                imageRefs.current[index] = el;
              }}
              src={src}
              alt={`Slide ${index - 2}`}
              className="frame1-experiment-image w-full h-full object-cover"
              onError={(e) => {
                console.error(`Ошибка загрузки изображения ${index}:`, src);
                const target = e.target as HTMLImageElement;
                target.style.border = '2px solid red';
                target.style.backgroundColor = '#333';
              }}
              onLoad={() => {
                console.log(`Изображение ${index} загружено:`, src);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
