'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { getStaticPath } from '@/lib/utils/paths';
import { HERO_IMAGE_CONFIG } from './config';

// Регистрируем плагин CustomEase один раз
if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase);
}

interface IntroLandingProps {
  images: readonly string[] | string[]; // 5 изображений в порядке [-2, -1, 0, +1, +2]
  heading: {
    line1: string;
    line2: string;
    line3: string;
  };
  counterText?: string;
  shouldPlay?: boolean; // Проп для управления показом анимации (управляется провайдером)
  onAnimationComplete?: () => void; // Callback при завершении анимации
}

export default function IntroLanding({ images, heading, counterText = 'Loading', shouldPlay = true, onAnimationComplete }: IntroLandingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const imageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const headingLine1Ref = useRef<HTMLDivElement>(null);
  const headingLine2Ref = useRef<HTMLDivElement>(null);
  const headingLine3Ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /**
   * Устанавливает финальное состояние без анимации
   */
  const setFinalState = useCallback(() => {
    const imageCount = isMobile ? 3 : 5;
    if (!containerRef.current || imageContainerRefs.current.length !== imageCount) return;

    const container = containerRef.current;
    const overlay = overlayRef.current;
    const imageContainers = imageContainerRefs.current;
    const images = imageRefs.current;
    const headingLine1 = headingLine1Ref.current;
    const headingLine2 = headingLine2Ref.current;
    const headingLine3 = headingLine3Ref.current;

    const mobileMultiplier = isMobile ? 0.8 : 1;
    // Используем константы размеров из конфига
    const imageConfig = isMobile ? HERO_IMAGE_CONFIG.mobile : HERO_IMAGE_CONFIG.desktop;
    const CONTAINER_WIDTH = imageConfig.baseWidth;
    const SCALE_MID = 1.2;
    const SCALE_CENTER_FINAL = imageConfig.scale; // Финальный масштаб из конфига
    const D_END = (10 + (CONTAINER_WIDTH * (SCALE_MID - 1))) * mobileMultiplier;

    // Устанавливаем контейнер в финальное состояние - полностью скрываем, чтобы не перекрывать header
    gsap.set(container, {
      position: 'fixed',
      opacity: 0,
      visibility: 'hidden',
      zIndex: -1,
      pointerEvents: 'none',
      display: 'none',
    });
    
    // Также скрываем внешний контейнер провайдера, если он существует
    const providerContainer = document.getElementById('intro-animation-container');
    if (providerContainer) {
      gsap.set(providerContainer, {
        opacity: 0,
        visibility: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
      });
    }

    // Скрываем overlay
    if (overlay) {
      gsap.set(overlay, { y: '-100%' });
    }

    // Скрываем counter
    if (counterRef.current) {
      gsap.set(counterRef.current, { opacity: 0 });
    }
    setCounter(100);

    // Устанавливаем изображения в финальные позиции
    imageContainers.forEach((container, index) => {
      if (!container) return;
      // На мобилке: индексы 0, 1, 2 соответствуют позициям -1, 0, +1 (из исходного массива это индексы 1, 2, 3)
      // На десктопе: индексы 0, 1, 2, 3, 4 соответствуют позициям -2, -1, 0, +1, +2
      const i = isMobile ? index - 1 : index - 2;
      const xEnd = i * D_END;
      const centerIndex = isMobile ? 1 : 2;
      const isCenter = index === centerIndex;
      
      gsap.set(container, {
        x: `${xEnd}vw`,
        y: 0,
        scale: isCenter ? SCALE_CENTER_FINAL : SCALE_MID,
        transformOrigin: 'center center',
        opacity: 1,
      });
      // Устанавливаем маски для боковых изображений (они должны быть полностью видны)
      if (index !== centerIndex) {
        container.style.clipPath = 'inset(0% 0% 0% 0%)';
        (container.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
      }
    });

    // Устанавливаем изображения видимыми
    images.forEach((img) => {
      if (!img) return;
      img.style.opacity = '1';
      img.style.visibility = 'visible';
    });

    // Устанавливаем заголовки видимыми
    if (headingLine1) {
      headingLine1.style.clipPath = 'inset(0% 0% 0% 0%)';
      (headingLine1.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
    }
    if (headingLine2) {
      headingLine2.style.clipPath = 'inset(0% 0% 0% 0%)';
      (headingLine2.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
    }
    if (headingLine3) {
      headingLine3.style.clipPath = 'inset(0% 0% 0% 0%)';
      (headingLine3.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
    }
  }, [isMobile]);

  useEffect(() => {
    // Если shouldPlay === false, сразу скрываем overlay и устанавливаем финальное состояние
    if (!shouldPlay) {
      // Сразу скрываем overlay, чтобы не было черного экрана
      if (overlayRef.current) {
        gsap.set(overlayRef.current, { y: '-100%', opacity: 0 });
      }
      
      const imageCount = isMobile ? 3 : 5;
      if (!containerRef.current || imageContainerRefs.current.length !== imageCount) {
        // Если контейнеры еще не готовы, ждем немного и пробуем снова
        const timer = setTimeout(() => {
          if (containerRef.current && imageContainerRefs.current.length === imageCount) {
            setFinalState();
          }
        }, 100);
        return () => clearTimeout(timer);
      }
      
      const images = imageRefs.current;
      const checkImagesLoaded = () => {
        return images.every((img) => {
          if (!img) return false;
          // Проверяем, что изображение загружено (complete) и имеет размеры
          return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
        });
      };

      if (checkImagesLoaded()) {
        setFinalState();
      } else {
        const imageLoadPromises = images.map((img) => {
          if (!img) {
            return Promise.resolve();
          }
          
          // Если изображение уже загружено (из кэша), проверяем размеры
          if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            return Promise.resolve();
          }
          
          return new Promise<void>((resolve) => {
            const handleLoad = () => {
              // Проверяем, что изображение действительно загружено
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                resolve();
              } else {
                // Если размеры не определены, все равно продолжаем
                resolve();
              }
            };
            
            const handleError = () => {
              // Продолжаем даже при ошибке
              resolve();
            };
            
            // Если изображение уже загружено, но событие уже произошло
            if (img.complete) {
              handleLoad();
              return;
            }
            
            img.addEventListener('load', handleLoad, { once: true });
            img.addEventListener('error', handleError, { once: true });
            
            setTimeout(() => {
              img.removeEventListener('load', handleLoad);
              img.removeEventListener('error', handleError);
              resolve();
            }, 10000);
          });
        });
        Promise.all(imageLoadPromises).then(() => {
          setFinalState();
        });
      }
      return;
    }

    // Анимация должна проигрываться
    const imageCount = isMobile ? 3 : 5;
    if (!containerRef.current || imageContainerRefs.current.length !== imageCount) return;

    const container = containerRef.current;
    const overlay = overlayRef.current;
    const imageContainers = imageContainerRefs.current;
    const images = imageRefs.current;
    const headingLine1 = headingLine1Ref.current;
    const headingLine2 = headingLine2Ref.current;
    const headingLine3 = headingLine3Ref.current;

    // Единый easing для всех анимаций: cubic-bezier(0.25, 0.46, 0.45, 1)
    // Преобразован в SVG path для CustomEase: M0,0 C0.25,0.46 0.45,1 1,1
    const customEase = CustomEase.create('customEase', 'M0,0 C0.25,0.46 0.45,1 1,1');

    // Mobile multiplier
    const mobileMultiplier = isMobile ? 0.8 : 1;

    // Используем константы размеров из конфига
    const imageConfig = isMobile ? HERO_IMAGE_CONFIG.mobile : HERO_IMAGE_CONFIG.desktop;

    // Начальные значения - равномерное распределение
    // На мобилке: 3 изображения, на десктопе: 5 изображений
    const SIDE_PADDING = 80; // px - отступ от краев экрана
    const CONTAINER_WIDTH = imageConfig.baseWidth; // vw - ширина контейнера из конфига
    const SCALE_START = 0.9;
    const SCALE_MID = 1.2; // Увеличение на 20% при схождении
    const SCALE_CENTER_FINAL = imageConfig.scale; // Финальный масштаб из конфига
    // Расстояние между центрами: увеличиваем пропорционально scale, чтобы сохранить gap
    // D_END = исходное расстояние + (ширина * (scale - 1))
    const D_END = (10 + (CONTAINER_WIDTH * (SCALE_MID - 1))) * mobileMultiplier; // vw - сохраняем gap при увеличении

    // Инициализация состояния
    const initState = () => {
      // Контейнер: fixed, z-index 10010 (выше чем Header z-[10001]), pointer-events: none
      gsap.set(container, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 10010,
        pointerEvents: 'none',
      });

      // Overlay: полная непрозрачность
      if (overlay) {
        gsap.set(overlay, {
          opacity: 1,
          y: 0,
        });
      }

      // Counter: видимый с самого начала
      if (counterRef.current) {
        gsap.set(counterRef.current, {
          opacity: 1,
        });
      }

      // Контейнеры изображений: начальные позиции и scale
      // Равномерное распределение по всей ширине экрана с отступами 80px по бокам
      // Для боковых контейнеров устанавливаем clipPath для маски
      const centerIndex = isMobile ? 1 : 2; // Центральный индекс в массиве контейнеров
      imageContainers.forEach((container, index) => {
        if (!container) return;
        
        // Вычисляем позиции в пикселях для равномерного распределения
        // Распределяем центры изображений равномерно с одинаковыми промежутками между ними
        const viewportWidth = window.innerWidth;
        const containerWidthPx = (viewportWidth * CONTAINER_WIDTH) / 100;
        
        // Вычисляем доступную ширину за вычетом боковых отступов и ширины всех изображений
        const totalImagesWidth = containerWidthPx * imageCount; // Ширина всех изображений
        const availableWidthForGaps = viewportWidth - (SIDE_PADDING * 2) - totalImagesWidth;
        const gap = imageCount > 1 ? availableWidthForGaps / (imageCount - 1) : 0; // Промежутки между изображениями
        
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

        // Для боковых контейнеров устанавливаем начальную маску через clipPath
        // Центральный контейнер НИКОГДА не маскируется
        if (index !== centerIndex) {
          // Начальное состояние: полностью видимо
          container.style.clipPath = 'inset(0% 0% 0% 0%)';
          (container.style as any).webkitClipPath = 'inset(0% 0% 0% 0%)';
        }
      });

      // Изображения: убеждаемся, что они видимы
      images.forEach((img) => {
        if (!img) return;
        img.style.opacity = '1';
        img.style.visibility = 'visible';
      });

      // Заголовок: скрыт через маску сверху вниз
      // Используем inset для раскрытия сверху вниз
      // Начальное состояние: текст полностью скрыт сверху (top = 100%)
      if (headingLine1) {
        gsap.set(headingLine1, {
          y: 0,
        });
        // Начальная маска: скрыто сверху (top = 100%)
        headingLine1.style.clipPath = 'inset(100% 0% 0% 0%)';
        (headingLine1.style as any).webkitClipPath = 'inset(100% 0% 0% 0%)';
      }
      if (headingLine2) {
        gsap.set(headingLine2, {
          y: 0,
        });
        headingLine2.style.clipPath = 'inset(100% 0% 0% 0%)';
        (headingLine2.style as any).webkitClipPath = 'inset(100% 0% 0% 0%)';
      }
      if (headingLine3) {
        gsap.set(headingLine3, {
          y: 0,
        });
        headingLine3.style.clipPath = 'inset(100% 0% 0% 0%)';
        (headingLine3.style as any).webkitClipPath = 'inset(100% 0% 0% 0%)';
      }
    };

    // Обновление counter синхронно с timeline
    const updateCounter = (progress: number) => {
      setCounter(Math.round(progress));
    };

    // Создание timeline
    const tl = gsap.timeline({
      paused: true, // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: создаем timeline в приостановленном состоянии
      onStart: () => {
        // Timeline начался
      },
      onUpdate: () => {
        // Обновляем counter синхронно с прогрессом timeline
        const progress = (tl.progress() * 100);
        updateCounter(progress);
      },
      onComplete: () => {
        // После завершения: полностью скрываем контейнер, чтобы он не перекрывал header
        // Используем setTimeout, чтобы анимация успела завершиться
        setTimeout(() => {
          if (container) {
            gsap.set(container, {
              position: 'fixed',
              opacity: 0,
              visibility: 'hidden',
              zIndex: -1,
              pointerEvents: 'none',
              display: 'none',
            });
          }
          // Также скрываем внешний контейнер провайдера, если он существует
          const providerContainer = document.getElementById('intro-animation-container');
          if (providerContainer) {
            gsap.set(providerContainer, {
              opacity: 0,
              visibility: 'hidden',
              zIndex: -1,
              pointerEvents: 'none',
            });
          }
          // Вызываем callback о завершении анимации
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 100);
        setCounter(100);
      },
    });

    // Инициализация
    initState();

    // Ждём загрузки изображений или запускаем через небольшую задержку
    const startAnimation = () => {
      // Центральный индекс в массиве контейнеров
      const centerIndex = isMobile ? 1 : 2;
      
      // Фиксируем начальное состояние на 500ms
      tl.to({}, { duration: 0.5 }); // Пустая анимация для фиксации начального состояния
      
      // Сцена 1: Появление снизу вверх с прозрачности
      // Все картинки поднимаются одновременно, но запуск каждой следующей сдвинут на 0.1s
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
        // На мобилке: индексы 0, 1, 2 соответствуют позициям -1, 0, +1
        // На десктопе: индексы 0, 1, 2, 3, 4 соответствуют позициям -2, -1, 0, +1, +2
        const i = isMobile ? index - 1 : index - 2;
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

      // Сцена 3: Маски для боковых контейнеров
      // На мобилке: маски для индексов 0 и 2 (позиции -1 и +1)
      // На десктопе: маски для индексов 0, 1, 3, 4 (позиции -2, -1, +1, +2)
      // Маска исчезает снизу вверх через clipPath: inset(top right bottom left)
      // bottom увеличивается от 0% до 100%
      // Используем относительные позиции: начинаем после завершения схождения
      imageContainers.forEach((container, index) => {
        if (!container || index === centerIndex) return; // Пропускаем центральный
        
        // Анимируем через объект с функцией для динамического обновления clipPath
        const maskProgress = { value: 0 };
        
        // Определяем позицию относительно завершения схождения
        // На мобилке: только 2 боковых изображения (индексы 0 и 2)
        // На десктопе: 4 боковых изображения (индексы 0, 1, 3, 4)
        let position: string;
        if (isMobile) {
          // На мобилке: первое (index 0) с задержкой, второе (index 2) одновременно
          if (index === 0) {
            position = ">0.08";
          } else {
            position = "<0.08";
          }
        } else {
          // На десктопе: первая (index 0) и последняя (index 4) с задержкой, остальные одновременно
          if (index === 0) {
            position = ">0.08";
          } else if (index === 4) {
            position = "<0.08";
          } else {
            position = "<0.08";
          }
        }
        
        tl.to(maskProgress, {
          value: 100,
          duration: 1,
          ease: 'power2.out', // Более плавное раскрытие маски вместо резкого expo.out
          onUpdate: () => {
            if (container) {
              container.style.clipPath = `inset(0% 0% ${maskProgress.value}% 0%)`;
              (container.style as any).webkitClipPath = `inset(0% 0% ${maskProgress.value}% 0%)`;
            }
          },
        }, position); // Относительная позиция вместо абсолютной задержки
      });

      // Сцена 4: Увеличение центрального контейнера
      // Начинается после завершения последней маски
      const centerContainer = imageContainers[centerIndex];
      if (centerContainer) {
        tl.to(centerContainer, {
          scale: SCALE_CENTER_FINAL,
          duration: 0.5,
          ease: customEase,
        }, ">"); // После завершения последней маски
      }

      // Сцена 5: Overlay уезжает вверх
      // Начинается после завершения увеличения центрального контейнера
      if (overlay) {
        tl.to(overlay, {
          y: '-100%',
          duration: 0.5,
          ease: customEase,
        }, ">"); // После завершения увеличения центра
      }

      // Сцена 6: Заголовок появляется через маску сверху вниз
      // Маска раскрывается сверху вниз: top уменьшается от 100% до 0%
      // Все три строки появляются одновременно, но с задержкой 200мс между каждой
      if (headingLine1) {
        const maskTop1 = { value: 100 };
        // Первая строка: после завершения overlay
        tl.to(maskTop1, {
          value: 0,
          duration: 0.8,
          ease: customEase,
          onUpdate: () => {
            if (headingLine1) {
              // Маска сверху вниз: top уменьшается от 100% до 0%
              headingLine1.style.clipPath = `inset(${maskTop1.value}% 0% 0% 0%)`;
              (headingLine1.style as any).webkitClipPath = `inset(${maskTop1.value}% 0% 0% 0%)`;
            }
          },
        }, ">"); // После завершения overlay
      }
      if (headingLine2) {
        const maskTop2 = { value: 100 };
        // Вторая строка: одновременно с первой строкой, но с задержкой 0.2s
        tl.to(maskTop2, {
          value: 0,
          duration: 0.8,
          ease: customEase,
          onUpdate: () => {
            if (headingLine2) {
              headingLine2.style.clipPath = `inset(${maskTop2.value}% 0% 0% 0%)`;
              (headingLine2.style as any).webkitClipPath = `inset(${maskTop2.value}% 0% 0% 0%)`;
            }
          },
        }, "<0.2"); // С задержкой 0.2s после начала первой строки
      }
      if (headingLine3) {
        const maskTop3 = { value: 100 };
        // Третья строка: одновременно с первой строкой, но с задержкой 0.4s (0.2s после второй)
        tl.to(maskTop3, {
          value: 0,
          duration: 0.8,
          ease: customEase,
          onUpdate: () => {
            if (headingLine3) {
              headingLine3.style.clipPath = `inset(${maskTop3.value}% 0% 0% 0%)`;
              (headingLine3.style as any).webkitClipPath = `inset(${maskTop3.value}% 0% 0% 0%)`;
            }
          },
        }, "<0.4"); // С задержкой 0.4s после начала первой строки (0.2s после второй)
      }

      // Сцена 7: Counter исчезает
      // Начинается после завершения последней строки заголовка
      if (counterRef.current) {
        tl.to(counterRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: customEase,
        }, ">"); // После завершения последней строки заголовка
      }
      
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Запускаем timeline только после добавления всех анимаций
      tl.play(); // Запускаем timeline после добавления всех анимаций
    };

    // Ждём загрузки всех изображений
    const checkImagesLoaded = () => {
      return imageRefs.current.every((img) => {
        if (!img) return false;
        // Проверяем, что изображение загружено (complete) и имеет размеры
        // Это важно для изображений из кэша браузера
        return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
      });
    };

    // Проверяем загрузку изображений
    if (checkImagesLoaded()) {
      // Если все изображения уже загружены (например, из кэша), запускаем анимацию сразу
      // Но добавляем небольшую задержку для плавности
      setTimeout(() => {
        startAnimation();
      }, 100);
    } else {
      // Ждём загрузки всех изображений
      const imageLoadPromises = imageRefs.current.map((img) => {
        if (!img) {
          return Promise.resolve();
        }
        
        // Если изображение уже загружено (из кэша), проверяем размеры
        if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
          return Promise.resolve();
        }
        
        // Если изображение еще не загружено, ждем события load или error
        return new Promise<void>((resolve) => {
          const handleLoad = () => {
            // Проверяем, что изображение действительно загружено
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
              resolve();
            } else {
              // Если размеры не определены, все равно продолжаем (возможно, это SVG или другой формат)
              resolve();
            }
          };
          
          const handleError = () => {
            // Продолжаем даже при ошибке, чтобы анимация не зависла
            resolve();
          };
          
          // Если изображение уже загружено, но событие уже произошло
          if (img.complete) {
            handleLoad();
            return;
          }
          
          img.addEventListener('load', handleLoad, { once: true });
          img.addEventListener('error', handleError, { once: true });
          
          // Таймаут на случай, если изображение не загрузится
          setTimeout(() => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve();
          }, 10000);
        });
      });

      Promise.all(imageLoadPromises).then(() => {
        // Небольшая задержка для плавности после загрузки всех изображений
        setTimeout(() => {
          startAnimation();
        }, 100);
      });
    }

    return () => {
      tl.kill();
    };
  }, [isMobile, heading, images, setFinalState, shouldPlay]);

  return (
    <div ref={containerRef} className="intro-landing-container bg-black pointer-events-none">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="intro-landing-overlay absolute inset-0 bg-black z-20"
      />

      {/* Counter в нижнем правом углу - отдельно от overlay */}
      <div ref={counterRef} className="intro-landing-counter absolute bottom-0 right-0 text-white text-6xl font-medium p-6 z-30">
        {counter}%
      </div>

      {/* Изображения */}
      <div className="intro-landing-images-wrapper absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {/* На мобилке показываем только 3 центральных изображения (индексы 1, 2, 3 из исходного массива) */}
        {/* На десктопе показываем все 5 изображений */}
        {(isMobile ? images.slice(1, 4) : images).map((src, displayIndex) => {
          // На мобилке: displayIndex 0, 1, 2 соответствует исходным индексам 1, 2, 3
          // На десктопе: displayIndex совпадает с исходным индексом
          const originalIndex = isMobile ? displayIndex + 1 : displayIndex;
          const refIndex = displayIndex; // Индекс в массиве refs
          
          return (
            <div
              key={originalIndex}
              ref={(el) => {
                imageContainerRefs.current[refIndex] = el;
              }}
              className="intro-landing-image-container absolute"
              style={{
                width: `${isMobile ? HERO_IMAGE_CONFIG.mobile.baseWidth : HERO_IMAGE_CONFIG.desktop.baseWidth}vw`,
                aspectRatio: isMobile ? HERO_IMAGE_CONFIG.mobile.aspectRatio : HERO_IMAGE_CONFIG.desktop.aspectRatio,
              }}
            >
              <img
                ref={(el) => {
                  imageRefs.current[refIndex] = el;
                }}
                src={src.startsWith('/') ? getStaticPath(src) : src}
                alt={`Slide ${originalIndex - 2}`}
                className="intro-landing-image w-full h-full object-cover"
                onError={(e) => {
                  console.error(`Ошибка загрузки изображения ${originalIndex}:`, src);
                  const target = e.target as HTMLImageElement;
                  target.style.border = '2px solid red';
                  target.style.backgroundColor = '#333';
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Заголовок */}
      <div className="intro-landing-heading-wrapper absolute inset-x-0 bottom-0 flex flex-col items-center pb-[164px] md:pb-[10vh] z-40 pointer-events-none">
        <div
          ref={headingLine1Ref}
          className="intro-landing-heading-line-1 text-white text-5xl md:text-8xl font-bold uppercase tracking-tight mb-2"
        >
          {heading.line1}
        </div>
        <div
          ref={headingLine2Ref}
          className="intro-landing-heading-line-2 text-white text-5xl md:text-8xl font-bold uppercase tracking-tight mb-2"
        >
          {heading.line2}
        </div>
        <div
          ref={headingLine3Ref}
          className="intro-landing-heading-line-3 text-white text-5xl md:text-8xl font-bold uppercase tracking-tight"
        >
          {heading.line3}
        </div>
      </div>
    </div>
  );
}
