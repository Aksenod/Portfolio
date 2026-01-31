'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import IntroLanding from './IntroLanding';
import { 
  introAnimationConfig as defaultIntroAnimationConfig,
  loadAnimationConfigFromStorage,
  type IntroAnimationConfig 
} from './config';
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
 * Нормализует URL для сравнения (убирает query, hash и trailing slash)
 * Вынесено в утилиту для переиспользования
 */
const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Убираем trailing slash для единообразия (кроме корня)
    let pathname = urlObj.pathname;
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return `${urlObj.protocol}//${urlObj.host}${pathname}`;
  } catch {
    // Fallback: убираем query, hash и trailing slash
    let normalized = url.split('?')[0].split('#')[0];
    if (normalized !== '/' && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }
};

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
      // Если type === 0, продолжаем проверку другими методами
    }
  } catch (e) {
    // Fallback метод недоступен
  }
  
  // Метод 3: Проверка через performance.timing (если доступен)
  try {
    const perfTiming = (performance as any).timing;
    if (perfTiming) {
      // Если navigationStart равен fetchStart или очень близок к нему - это может быть reload
      // При обычной навигации navigationStart обычно меньше fetchStart
      const navStart = perfTiming.navigationStart;
      const fetchStart = perfTiming.fetchStart;
      if (navStart && fetchStart && Math.abs(navStart - fetchStart) < 10) {
        // Это может быть reload, но не точный метод, поэтому продолжаем проверку
      }
    }
  } catch (e) {
    // performance.timing может быть недоступен
  }
  
  // Метод 4: Проверка через referrer (надежный fallback для reload)
  const referrer = document.referrer;
  const currentUrl = window.location.href;
  
  // Если referrer указывает на ту же страницу (без query/hash) - это reload
  if (referrer) {
    const normalizedReferrer = normalizeUrl(referrer);
    const normalizedCurrent = normalizeUrl(currentUrl);
    if (normalizedReferrer === normalizedCurrent) {
      return 'reload';
    }
  }
  
  // Метод 5: Проверка через sessionStorage (для мобильных устройств, где referrer может быть недоступен)
  // Если referrer пустой, но есть sessionStorage с флагом - это скорее всего reload
  // (при первой загрузке referrer тоже может быть пустым, но флаг не будет установлен)
  try {
    const hasSeenSite = sessionStorage.getItem('intro-animation-shown') === 'true';
    if (!referrer && hasSeenSite) {
      // Высокая вероятность, что это reload (флаг был установлен ранее)
      return 'reload';
    }
  } catch (e) {
    // sessionStorage может быть недоступен в приватном режиме или заблокирован
    // Продолжаем без этой проверки
  }
  
  // По умолчанию считаем это новой навигацией
  // Если все методы не сработали (Performance API недоступен, referrer заблокирован, sessionStorage недоступен)
  // - считаем это новой навигацией (безопасный fallback)
  return 'navigate';
};

/**
 * Определяет, должна ли показываться анимация
 * Анимация показывается при первом визите на главную страницу в сессии или при перезагрузке главной страницы (F5/Cmd+R)
 */
const shouldShowAnimation = (): boolean => {
  if (typeof window === 'undefined') return false;

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

  // Анимация показывается только на главной странице
  // Если это не главная страница - не показывать анимацию
  if (!isHomePage) {
    return false;
  }

  const navType = getNavigationType();
  const referrer = document.referrer;
  const currentHost = window.location.host;
  const currentUrl = window.location.href;
  
  // Безопасная проверка referrer с обработкой ошибок
  let referrerUrl: URL | null = null;
  let isInternalNavigation = false;
  try {
    referrerUrl = referrer ? new URL(referrer) : null;
    isInternalNavigation = referrerUrl !== null && referrerUrl.host === currentHost;
  } catch (e) {
    // Если не удалось распарсить referrer - игнорируем
  }
  
  // Дополнительная проверка на reload через referrer
  const isReloadByReferrer = referrer ? normalizeUrl(referrer) === normalizeUrl(currentUrl) : false;
  
  // Дополнительная проверка для мобильных устройств через sessionStorage
  // Упрощенная логика: если есть флаг в sessionStorage, мы на главной странице,
  // и referrer либо пустой, либо указывает на ту же страницу - это reload
  // Это особенно важно для мобильных браузеров, где referrer может быть недоступен
  let hasSeenSite = false;
  try {
    hasSeenSite = sessionStorage.getItem('intro-animation-shown') === 'true';
  } catch (e) {
    // sessionStorage может быть недоступен в приватном режиме
  }
  
  // Упрощенная логика: если есть флаг в sessionStorage и мы на главной странице - это скорее всего reload
  // Ключевая идея: если флаг установлен, значит страница уже загружалась в этой сессии
  // Если мы снова на главной странице, это либо:
  // 1. Перезагрузка (F5, адресная строка) - показываем анимацию
  // 2. Обычная навигация по ссылке - не показываем анимацию
  // Отличить можно по: navType, referrer, или комбинации
  // Если navType === 'reload' или referrer указывает на ту же страницу или referrer пустой - это reload
  // Если navType === 'navigate' и referrer указывает на другую страницу того же домена - это обычная навигация (не reload)
  const isReloadBySessionStorage = hasSeenSite && (
    !referrer ||                    // Нет referrer - скорее всего reload
    isReloadByReferrer ||           // Referrer указывает на ту же страницу - это reload
    navType === 'reload' ||         // Performance API определил reload
    navType === 'back_forward' ||   // Навигация назад/вперед
    (navType === 'navigate' && !isInternalNavigation)  // Обычная навигация, но не внутренняя - может быть reload через адресную строку
  );
  
  const isReload = navType === 'reload' || isReloadByReferrer || isReloadBySessionStorage;

  // Если это перезагрузка страницы (F5, Cmd+R, Ctrl+Shift+R) - показываем анимацию
  // ИГНОРИРУЕМ sessionStorage при перезагрузке
  if (isReload) {
    return true;
  }

  // Если это навигация внутри сайта (есть referrer с того же домена) - не показывать анимацию
  // НО: если это reload (определено выше), то показываем анимацию даже при внутренней навигации
  // Это важно для случаев, когда пользователь перезагружает главную страницу, находясь на другой странице
  // Проверка isReload уже выполнена выше, так что если мы здесь - это не reload
  if (isInternalNavigation) {
    return false;
  }

  // Проверяем sessionStorage только если это НЕ перезагрузка
  // Если флаг уже установлен и это не перезагрузка и не внутренняя навигация - не показывать
  // Это может быть повторный визит в той же сессии без перезагрузки
  if (hasSeenSite) {
    return false;
  }

  // Это первый визит на главную страницу в сессии (нет флага, нет внутренней навигации, не перезагрузка)
  // Устанавливаем флаг сразу, чтобы при навигации между страницами не показывать снова
  try {
    sessionStorage.setItem('intro-animation-shown', 'true');
  } catch (e) {
    // sessionStorage может быть недоступен в приватном режиме - игнорируем ошибку
    // Анимация все равно покажется, но при следующей навигации может показаться снова
  }
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
  const [animationConfig, setAnimationConfig] = useState<IntroAnimationConfig>(defaultIntroAnimationConfig);

  // Загрузка конфигурации анимации
  useEffect(() => {
    loadAnimationConfigFromStorage().then((config) => {
      setAnimationConfig(config.introAnimationConfig);
    });
  }, []);

  useEffect(() => {
    // Проверяем только на клиенте после mount
    // Используем requestAnimationFrame и задержки для гарантии готовности Performance API
    
    let timeoutId: NodeJS.Timeout | null = null;
    let rafId: number | null = null;
    
    let checkCount = 0;
    const MAX_CHECKS = 4; // Увеличено для надежности на мобильных устройствах
    
    const checkAnimation = () => {
      checkCount++;
      
      // Проверяем готовность Performance API (для информации, но не блокируем)
      let isPerformanceReady = false;
      try {
        const navEntries = performance.getEntriesByType('navigation');
        isPerformanceReady = navEntries.length > 0 || !!(performance as any).navigation;
      } catch (e) {
        // Performance API недоступен - продолжаем без него
      }
      
      const navType = getNavigationType();
      const referrer = document.referrer;
      let hasSeenSite = false;
      try {
        hasSeenSite = sessionStorage.getItem('intro-animation-shown') === 'true';
      } catch (e) {
        // sessionStorage недоступен - игнорируем
      }
      
      const show = shouldShowAnimation();
      
      // Логирование для отладки (можно удалить в продакшене)
      if (process.env.NODE_ENV === 'development') {
        console.log('[IntroAnimation] Debug:', {
          checkCount,
          navType,
          pathname: window.location.pathname,
          referrer,
          hasSeenSite,
          shouldShow: show,
        });
      }
      
      // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Если анимация должна показываться - применяем результат СРАЗУ
      // (независимо от готовности Performance API)
      if (show) {
        setShouldShow(true);
        setIsAnimating(true);
        return true; // Успешно определили
      }
      
      // Если show === false и достигли максимального количества проверок - применяем результат
      // НЕ зависим от isPerformanceReady, так как на некоторых устройствах он может быть недоступен
      if (checkCount >= MAX_CHECKS) {
        setShouldShow(false);
        setAnimationComplete(true);
        return true; // Применили результат после максимального количества попыток
      }
      
      // Если show === false и Performance API готов - применяем результат сразу
      // (оптимизация: не ждем MAX_CHECKS, если API уже готов)
      if (isPerformanceReady) {
        setShouldShow(false);
        setAnimationComplete(true);
        return true; // Успешно определили
      }
      
      return false; // Нужна еще одна проверка
    };
    
    // Первая проверка через requestAnimationFrame для гарантии готовности DOM
    rafId = requestAnimationFrame(() => {
      const success = checkAnimation();
      
      // Если не удалось определить - делаем повторные проверки с увеличивающимися задержками
      if (!success) {
        // Вторая проверка через 150ms (увеличено для мобильных устройств)
        timeoutId = setTimeout(() => {
          const success2 = checkAnimation();
          
          // Третья проверка через 200ms (если вторая не помогла)
          if (!success2) {
            setTimeout(() => {
              const success3 = checkAnimation();
              
              // Финальная проверка через 250ms (применяет результат в любом случае)
              if (!success3) {
                setTimeout(() => {
                  checkAnimation(); // Финальная проверка - применяет результат в любом случае
                }, 250);
              }
            }, 200);
          }
        }, 150);
      }
    });
    
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
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
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10010, pointerEvents: 'none' }}
        >
          <IntroLanding
            images={animationConfig.images}
            heading={animationConfig.heading}
            counterText={animationConfig.counterText}
            shouldPlay={true}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}
    </IntroAnimationContext.Provider>
  );
}
