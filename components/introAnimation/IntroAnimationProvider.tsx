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
 * Использует несколько методов для надежного определения типа навигации
 */
const getNavigationType = (): 'reload' | 'navigate' | 'back_forward' | 'prerender' => {
  if (typeof window === 'undefined') return 'navigate';
  
  // Метод 1: Performance Navigation Timing API (предпочтительный)
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const navEntry = navEntries[0] as PerformanceNavigationTiming;
      if (navEntry?.type) {
        return navEntry.type as 'reload' | 'navigate' | 'back_forward' | 'prerender';
      }
    }
  } catch (e) {
    // Performance API может быть недоступен в некоторых браузерах
  }
  
  // Метод 2: Fallback через performance.navigation (устаревший, но надежный)
  try {
    const perfNav = (performance as any).navigation;
    if (perfNav) {
      // 1 = TYPE_RELOAD, 2 = TYPE_BACK_FORWARD, 0 = TYPE_NAVIGATE
      if (perfNav.type === 1) return 'reload';
      if (perfNav.type === 2) return 'back_forward';
      return 'navigate';
    }
  } catch (e) {
    // Fallback метод недоступен
  }
  
  // Метод 3: Проверка через sessionStorage и referrer (последний fallback)
  // Если нет referrer и страница только что загрузилась - это может быть reload
  // Но это ненадежно, поэтому используем как последний вариант
  const referrer = document.referrer;
  const currentUrl = window.location.href;
  
  // Если referrer пустой или указывает на ту же страницу - возможно это reload
  // Но это не точный метод, поэтому возвращаем 'navigate' по умолчанию
  return 'navigate';
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
    // Используем небольшую задержку, чтобы убедиться, что Performance API готов
    const checkAnimation = () => {
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
    };
    
    // Проверяем сразу, но также делаем повторную проверку через небольшую задержку
    // на случай, если Performance API еще не готов
    checkAnimation();
    
    // Повторная проверка через 50ms для надежности (если Performance API был не готов)
    const timeoutId = setTimeout(() => {
      checkAnimation();
    }, 50);
    
    return () => clearTimeout(timeoutId);
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
