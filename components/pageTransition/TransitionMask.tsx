'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { PageTransitionConfig, TransitionState, TransitionDirection, TransitionType } from './types';

interface TransitionMaskProps {
  children: React.ReactNode;
  transitionState: TransitionState;
  config: PageTransitionConfig;
  onCloseComplete: () => void;
  onTransitionComplete: () => void;
}

/**
 * Компонент для анимации переходов между страницами с использованием transform
 * Белый квадрат наезжает на экран при закрытии и уезжает при открытии
 */
export default function TransitionMask({
  children,
  transitionState,
  config,
  onCloseComplete,
  onTransitionComplete,
}: TransitionMaskProps) {
  const maskRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const hasPlayedOpeningAnimationRef = useRef(false);
  
  /**
   * Получает начальное положение маски для фазы закрытия
   */
  const getClosingInitialTransform = (direction: TransitionDirection, type: TransitionType): string => {
    if (direction === 'vertical') {
      return type === 'forward' ? 'translateY(-100%)' : 'translateY(100%)';
    } else {
      return type === 'forward' ? 'translateX(-100%)' : 'translateX(100%)';
    }
  };
  
  /**
   * Получает конечное положение маски для фазы открытия
   */
  const getOpeningFinalTransform = (direction: TransitionDirection, type: TransitionType): string => {
    if (direction === 'vertical') {
      return type === 'forward' ? 'translateY(100%)' : 'translateY(-100%)';
    } else {
      return type === 'forward' ? 'translateX(100%)' : 'translateX(-100%)';
    }
  };
  
  // Сбрасываем флаг при начале закрытия, чтобы на новой странице анимация могла запуститься
  useEffect(() => {
    if (transitionState.phase === 'closing') {
      hasPlayedOpeningAnimationRef.current = false;
    }
  }, [transitionState.phase]);
  
  // Обработка фазы закрытия
  useEffect(() => {
    if (transitionState.phase !== 'closing' || !maskRef.current) {
      return;
    }
    
    // Очищаем предыдущую анимацию
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    // Определяем начальное положение маски (вне экрана)
    const initialTransform = getClosingInitialTransform(config.direction, transitionState.direction);
    
    // Устанавливаем начальное состояние: маска вне экрана, непрозрачная
    // Важно: устанавливаем zIndex: 1000 сразу, чтобы избежать моргания
    gsap.set(maskRef.current, {
      transform: initialTransform,
      backgroundColor: config.maskColor,
      opacity: 1,
      zIndex: 1000,
      willChange: 'transform',
    });
    
    // Анимация закрытия: маска наезжает на экран
    const tl = gsap.timeline();
    
    tl.to(maskRef.current, {
      transform: 'translateX(0) translateY(0)',
      duration: config.duration,
      ease: config.ease,
    });
    
    animationRef.current = tl;
    
    // После завершения закрытия вызываем callback
    tl.call(() => {
      // Убираем will-change после завершения анимации для оптимизации
      // zIndex остается 1000 для фазы открытия
      if (maskRef.current) {
        gsap.set(maskRef.current, {
          willChange: 'auto',
        });
      }
      onCloseComplete();
    });
    
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [
    transitionState.phase,
    transitionState.direction,
    config,
    onCloseComplete,
  ]);
  
  // При монтировании компонента - всегда запускаем анимацию открытия
  // (template.tsx пересоздается при каждом переходе, так что это надежно)
  // Обрабатываем как первую загрузку (idle), так и переходы (opening)
  useEffect(() => {
    if (!maskRef.current || !contentRef.current) return;
    
    // Если это переход (opening) или первая загрузка (idle без перехода)
    const shouldPlayOpening = 
      transitionState.phase === 'opening' || 
      (transitionState.phase === 'idle' && !transitionState.isTransitioning);
    
    if (!shouldPlayOpening) return;
    
    // Защита от повторного запуска - если анимация уже запущена, не запускаем снова
    if (hasPlayedOpeningAnimationRef.current) return;
    
    // Отмечаем, что анимация запущена
    hasPlayedOpeningAnimationRef.current = true;
    
    // Очищаем предыдущую анимацию
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    // Определяем направление: для opening используем из state, для idle - forward
    const direction = transitionState.phase === 'opening' 
      ? transitionState.direction 
      : 'forward';
    
    const finalTransform = getOpeningFinalTransform(config.direction, direction);
    
    // Убеждаемся, что маска видима и покрывает экран
    gsap.set(maskRef.current, {
      transform: 'translateX(0) translateY(0)',
      backgroundColor: config.maskColor,
      opacity: 1,
      zIndex: 1000,
      willChange: 'transform',
    });
    
    // Контент скрыт
    gsap.set(contentRef.current, {
      opacity: 0,
      visibility: 'hidden',
      pointerEvents: 'none',
    });
    
    // Небольшая задержка для стабильности (предотвращает моргание)
    const tl = gsap.timeline({ delay: 0.05 });
    
    // Маска уезжает
    tl.to(maskRef.current, {
      transform: finalTransform,
      duration: config.duration,
      ease: config.ease,
    });
    
    // Контент появляется синхронно
    tl.to(contentRef.current, {
      opacity: 1,
      visibility: 'visible',
      pointerEvents: 'auto',
      duration: 0.1,
      ease: 'none',
    }, 0.05);
    
    animationRef.current = tl;
    
    // После завершения
    tl.call(() => {
      if (maskRef.current) {
        gsap.set(maskRef.current, {
          zIndex: -1,
          willChange: 'auto',
        });
      }
      
      // Если это был переход (opening), вызываем callback
      if (transitionState.phase === 'opening') {
        onTransitionComplete();
      }
    });
    
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [
    transitionState.phase, 
    transitionState.direction,
    transitionState.isTransitioning,
    config,
    onTransitionComplete
  ]);
  
  return (
    <>
      {/* Маска - видима по умолчанию при загрузке */}
      <div
        ref={maskRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none"
        style={{
          backgroundColor: config.maskColor,
          transform: 'translateX(0) translateY(0)',
          opacity: 1,
          zIndex: 1000, // Видима по умолчанию
        }}
        aria-hidden="true"
      />
      
      {/* Контент - скрыт по умолчанию, появится после анимации открытия */}
      <div 
        ref={contentRef}
        className="relative w-full h-full"
        style={{
          opacity: 0, // Скрыт по умолчанию
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
    </>
  );
}
