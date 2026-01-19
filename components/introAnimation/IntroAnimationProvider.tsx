'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import IntroLanding from './IntroLanding';
import { introAnimationConfig } from './config';
import { getBasePath } from '@/lib/utils/paths';

interface IntroAnimationContextType {
  isAnimating: boolean;
  animationComplete: boolean;
}

const IntroAnimationContext = createContext<IntroAnimationContextType>({
  isAnimating: false,
  animationComplete: false,
});

export const useIntroAnimation = () => useContext(IntroAnimationContext);

/**
 * Определяет тип навигации страницы
 */
const getNavigationType = (): 'reload' | 'navigate' | 'back_forward' | 'prerender' => {
  if (typeof window === 'undefined') return 'navigate';
  const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return navEntry?.type || 'navigate';
};

/**
 * Определяет, должна ли показываться анимация
 * Анимация показывается при первом визите на главную страницу в сессии или при перезагрузке главной страницы (F5/Cmd+R)
 */
const shouldShowAnimation = (): boolean => {
  if (typeof window === 'undefined') return false;

  const navType = getNavigationType();
  const pathname = window.location.pathname;
  const basePath = getBasePath();
  // Проверяем главную страницу с учетом basePath (может быть '/' или '/Portfolio/')
  // Нормализуем pathname: убираем trailing slash для сравнения (кроме корня)
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  const normalizedBasePath = basePath === '/' ? '/' : basePath.replace(/\/$/, '');
  // Проверяем несколько вариантов: корень, basePath, basePath с trailing slash
  const isHomePage = normalizedPathname === '/' || 
                     normalizedPathname === normalizedBasePath || 
                     pathname === `${basePath}/` ||
                     pathname === basePath;
  const referrer = document.referrer;
  const currentHost = window.location.host;
  const referrerUrl = referrer ? new URL(referrer) : null;
  const isInternalNavigation = referrerUrl && referrerUrl.host === currentHost;
  const hasSeenSite = sessionStorage.getItem('intro-animation-shown') === 'true';

  // Если это перезагрузка страницы (F5, Cmd+R, Ctrl+Shift+R) - показываем анимацию только на главной странице
  if (navType === 'reload') {
    return isHomePage;
  }

  // Анимация показывается только на главной странице
  // Если это не главная страница - не показывать анимацию
  if (!isHomePage) {
    return false;
  }

  // Если это навигация внутри сайта (есть referrer с того же домена) - не показывать анимацию
  // Это означает переход между страницами через клики по ссылкам
  if (isInternalNavigation) {
    return false;
  }

  // Если флаг уже установлен и это не перезагрузка и не внутренняя навигация - не показывать
  // Это может быть повторный визит в той же сессии без перезагрузки
  if (hasSeenSite) {
    return false;
  }

  // Это первый визит на главную страницу в сессии (нет флага, нет внутренней навигации, не перезагрузка)
  // Устанавливаем флаг сразу, чтобы при навигации между страницами не показывать снова
  sessionStorage.setItem('intro-animation-shown', 'true');
  return true;
};

/**
 * Провайдер для интро-анимации
 * Управляет показом анимации глобально
 * Анимация показывается только на главной странице (/) при первом визите или при перезагрузке
 */
export function IntroAnimationProvider() {
  // Начальное значение false для SSR-safe подхода
  const [shouldShow, setShouldShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Проверяем только на клиенте после mount
    const navType = getNavigationType();
    const referrer = document.referrer;
    const hasSeenSite = sessionStorage.getItem('intro-animation-shown') === 'true';
    const show = shouldShowAnimation();
    
    // Временное логирование для отладки
    console.log('[IntroAnimation] Debug:', {
      navType,
      pathname: window.location.pathname,
      referrer,
      hasSeenSite,
      shouldShow: show,
      sessionStorageValue: sessionStorage.getItem('intro-animation-shown')
    });
    
    setShouldShow(show);
    if (show) {
      setIsAnimating(true);
    } else {
      setAnimationComplete(true);
    }
  }, []);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setAnimationComplete(true);
  };

  // Рендерим анимацию только если shouldShow === true
  return (
    <IntroAnimationContext.Provider value={{ isAnimating, animationComplete }}>
      {shouldShow && (
        <div 
          id="intro-animation-container"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, pointerEvents: 'none' }}
        >
          <IntroLanding
            images={introAnimationConfig.images}
            heading={introAnimationConfig.heading}
            counterText={introAnimationConfig.counterText}
            shouldPlay={true}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}
    </IntroAnimationContext.Provider>
  );
}
