'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { TransitionState, TransitionType, TransitionPhase } from './types';

interface UsePageTransitionOptions {
  onTransitionStart?: (toPath: string, direction: TransitionType) => void;
  onTransitionComplete?: (toPath: string) => void;
  onCloseComplete?: () => void;
}

/**
 * Хук для управления переходами между страницами
 */
export function usePageTransition(options?: UsePageTransitionOptions) {
  const pathname = usePathname();
  const router = useRouter();
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    phase: 'idle',
    direction: 'forward',
    toPath: null,
  });
  
  const previousPathnameRef = useRef<string | null>(null);
  const targetPathRef = useRef<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Отслеживаем изменение pathname для перехода к фазе открытия
  useEffect(() => {
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname;
      return;
    }
    
    // Если путь изменился и мы ждём перехода
    if (previousPathnameRef.current !== pathname) {
      setTransitionState((prev) => {
        // Если мы в фазе закрытия и путь изменился, значит новая страница загрузилась
        // Переходим к фазе открытия
        if (prev.isTransitioning && prev.phase === 'closing') {
          return {
            ...prev,
            phase: 'opening',
          };
        }
        return prev;
      });
      
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);
  
  /**
   * Инициирует переход на новую страницу
   */
  const navigate = useCallback(
    (to: string, direction: TransitionType = 'forward') => {
      // Предотвращаем множественные переходы
      setTransitionState((prevState) => {
        if (prevState.isTransitioning) {
          return prevState; // Уже в процессе перехода
        }
        
        // Сохраняем целевой путь
        targetPathRef.current = to;
        
        // Устанавливаем фазу закрытия
        const newState: TransitionState = {
          isTransitioning: true,
          phase: 'closing',
          direction,
          toPath: to,
        };
        
        // Вызываем callback начала перехода
        options?.onTransitionStart?.(to, direction);
        
        return newState;
      });
    },
    [options]
  );
  
  /**
   * Вызывается после завершения анимации закрытия
   * Выполняет навигацию на новую страницу
   */
  const handleCloseComplete = useCallback(() => {
    const toPath = targetPathRef.current;
    
    if (!toPath) {
      return;
    }
    
    // Вызываем callback завершения закрытия
    options?.onCloseComplete?.();
    
    // Выполняем навигацию (переход к новой странице происходит здесь)
    // После изменения pathname useEffect автоматически переключит фазу на 'opening'
    router.push(toPath);
  }, [router, options]);
  
  /**
   * Завершает переход (вызывается после завершения анимации открытия)
   */
  const completeTransition = useCallback(() => {
    const toPath = transitionState.toPath;
    
    setTransitionState({
      isTransitioning: false,
      phase: 'idle',
      direction: 'forward',
      toPath: null,
    });
    
    // Очищаем ссылки
    targetPathRef.current = null;
    
    if (toPath) {
      options?.onTransitionComplete?.(toPath);
    }
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [transitionState.toPath, options]);
  
  /**
   * Определяет направление перехода на основе порядка маршрутов
   */
  const determineDirection = useCallback((from: string, to: string): TransitionType => {
    const routes = ['/', '/portfolio', '/frame1'];
    const fromIndex = routes.indexOf(from);
    const toIndex = routes.indexOf(to);
    
    if (fromIndex === -1 || toIndex === -1) {
      return 'forward'; // По умолчанию
    }
    
    return toIndex > fromIndex ? 'forward' : 'backward';
  }, []);
  
  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    transitionState,
    navigate,
    handleCloseComplete,
    completeTransition,
    determineDirection,
    pathname,
  };
}
