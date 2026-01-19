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
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  
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
    gsap.set(maskRef.current, {
      transform: initialTransform,
      backgroundColor: config.maskColor,
      opacity: 1,
      zIndex: -1,
      willChange: 'transform',
    });
    
    // Анимация закрытия: маска наезжает на экран
    const tl = gsap.timeline();
    
    tl.to(maskRef.current, {
      transform: 'translateX(0) translateY(0)',
      zIndex: 1000,
      duration: config.duration,
      ease: config.ease,
    });
    
    animationRef.current = tl;
    
    // После завершения закрытия вызываем callback
    tl.call(() => {
      // Убираем will-change после завершения анимации для оптимизации
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
  
  // Обработка фазы открытия
  useEffect(() => {
    if (transitionState.phase !== 'opening' || !maskRef.current) {
      return;
    }
    
    // Очищаем предыдущую анимацию
    if (animationRef.current) {
      animationRef.current.kill();
    }
    
    // Маска уже должна покрывать весь экран после фазы закрытия
    // Определяем конечное положение (вне экрана)
    const finalTransform = getOpeningFinalTransform(config.direction, transitionState.direction);
    
    // Устанавливаем начальное состояние: маска покрывает весь экран
    gsap.set(maskRef.current, {
      transform: 'translateX(0) translateY(0)',
      backgroundColor: config.maskColor,
      opacity: 1,
      zIndex: 1000,
      willChange: 'transform',
    });
    
    // Анимация открытия: маска уезжает за пределы экрана
    const tl = gsap.timeline();
    
    tl.to(maskRef.current, {
      transform: finalTransform,
      duration: config.duration,
      ease: config.ease,
    });
    
    animationRef.current = tl;
    
    // После завершения открытия скрываем маску и завершаем переход
    tl.call(() => {
      if (maskRef.current) {
        gsap.set(maskRef.current, {
          zIndex: -1,
        });
      }
      onTransitionComplete();
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
    onTransitionComplete,
  ]);
  
  // Сброс маски когда переход не активен
  useEffect(() => {
    if (!transitionState.isTransitioning && maskRef.current) {
      gsap.set(maskRef.current, {
        transform: 'translateX(0) translateY(0)',
        opacity: 1,
        zIndex: -1,
      });
    }
  }, [transitionState.isTransitioning]);
  
  return (
    <>
      {/* Маска для эффекта перехода */}
      <div
        ref={maskRef}
        className="fixed inset-0 w-screen h-screen pointer-events-none"
        style={{
          backgroundColor: config.maskColor,
          transform: 'translateX(0) translateY(0)',
          opacity: 1,
          zIndex: -1,
        }}
        aria-hidden="true"
      />
      
      {/* Контент страницы */}
      <div className="relative w-full h-full">
        {children}
      </div>
    </>
  );
}
