'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { TransitionLink, useTransitionContext } from '@/components/pageTransition';
import { useIntroAnimation } from '@/components/introAnimation';
import { gsap } from 'gsap';

export function Header() {
  const { navigate } = useTransitionContext();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { isAnimating, animationComplete } = useIntroAnimation();

  // Проверка мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // Закрываем меню при изменении размера на десктоп
      if (!newIsMobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMenuOpen]);

  // Блокировка скролла при открытом меню
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isMobile]);

  // Управление видимостью Header во время анимации
  useEffect(() => {
    if (!headerRef.current) return;

    if (isAnimating) {
      // Скрываем Header во время анимации
      gsap.set(headerRef.current, {
        y: -100,
        opacity: 0,
        visibility: 'hidden',
      });
      // Закрываем мобильное меню, если оно открыто во время анимации
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    } else if (animationComplete && !isAnimating) {
      // Плавно показываем Header сверху после завершения анимации
      gsap.set(headerRef.current, {
        visibility: 'visible',
      });
      gsap.to(headerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      });
    } else if (!isAnimating && !animationComplete) {
      // Если анимация не должна показываться (например, на других страницах),
      // Header должен быть виден сразу
      gsap.set(headerRef.current, {
        y: 0,
        opacity: 1,
        visibility: 'visible',
      });
    }
  }, [isAnimating, animationComplete, isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <>
      <header 
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-[10001] flex justify-between items-center px-6 md:px-10 py-6 pointer-events-none"
      >
        <nav className="flex items-center gap-4 pointer-events-auto" aria-label="Навигация">
          <TransitionLink
            href="/"
            onNavigate={navigate}
            className={`text-base font-medium tracking-tight transition-colors focus:text-foreground focus:outline-none ${
              pathname === '/' 
                ? 'text-foreground' 
                : 'text-foreground hover:text-foreground/80'
            }`}
          >
            Bugrov.space
          </TransitionLink>
        </nav>
        
        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center gap-6 pointer-events-auto" aria-label="Основная навигация">
          <TransitionLink
            href="/portfolio"
            onNavigate={navigate}
            className={`text-base font-medium pointer-events-auto transition-colors focus:text-foreground focus:outline-none ${
              pathname === '/portfolio' 
                ? 'text-foreground' 
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            Portfolio
          </TransitionLink>
          <TransitionLink
            href="/case"
            onNavigate={navigate}
            className={`text-base font-medium pointer-events-auto transition-colors focus:text-foreground focus:outline-none ${
              pathname === '/case' 
                ? 'text-foreground' 
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            Кейс
          </TransitionLink>
          <TransitionLink
            href="/ui-kit"
            onNavigate={navigate}
            className={`text-base font-medium pointer-events-auto transition-colors focus:text-foreground focus:outline-none ${
              pathname === '/ui-kit' 
                ? 'text-foreground' 
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            UI Kit
          </TransitionLink>
          <TransitionLink
            href="/admin"
            onNavigate={navigate}
            className={`text-base font-medium pointer-events-auto transition-colors focus:text-foreground focus:outline-none ${
              pathname?.startsWith('/admin') 
                ? 'text-foreground' 
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            Админка
          </TransitionLink>
        </nav>

        {/* Кнопка меню для мобильных */}
        <button
          onClick={toggleMenu}
          className={`md:hidden flex items-center justify-center pointer-events-auto text-base text-foreground/80 font-medium hover:text-foreground focus:text-foreground focus:outline-none transition-all ${
            isMenuOpen ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible pointer-events-auto'
          }`}
          aria-label="Открыть меню"
          aria-expanded={isMenuOpen}
        >
          Меню
        </button>
      </header>

      {/* Мобильное меню (drawer) - на весь экран */}
      <nav
        className={`fixed top-0 left-0 right-0 bottom-0 h-full w-full bg-base-secondary z-[10001] md:hidden transform transition-transform duration-300 ease-in-out pointer-events-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Мобильная навигация"
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-col h-full pt-6 px-6">
          {/* Крестик в правом верхнем углу */}
          <div className="flex justify-end mb-8">
            <button
              onClick={closeMenu}
              className="flex flex-col justify-center items-center w-11 h-11 text-foreground/80 hover:text-foreground focus:text-foreground focus:outline-none transition-colors"
              aria-label="Закрыть меню"
            >
              <span className="block w-5 h-0.5 bg-current rotate-45 translate-y-0" />
              <span className="block w-5 h-0.5 bg-current -rotate-45 -translate-y-0.5" />
            </button>
          </div>

          {/* Меню - кнопки на всю ширину */}
          <div className="flex flex-col gap-2 flex-1">
            <TransitionLink
              href="/portfolio"
              onNavigate={navigate}
              onClick={handleLinkClick}
              className={`w-full text-lg font-medium py-6 px-6 rounded transition-colors focus:text-foreground focus:outline-none hover:bg-base ${
                pathname === '/portfolio' 
                  ? 'text-foreground' 
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              Portfolio
            </TransitionLink>
            <TransitionLink
              href="/case"
              onNavigate={navigate}
              onClick={handleLinkClick}
              className={`w-full text-lg font-medium py-6 px-6 rounded transition-colors focus:text-foreground focus:outline-none hover:bg-base ${
                pathname === '/case' 
                  ? 'text-foreground' 
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              Кейс
            </TransitionLink>
            <TransitionLink
              href="/ui-kit"
              onNavigate={navigate}
              onClick={handleLinkClick}
              className={`w-full text-lg font-medium py-6 px-6 rounded transition-colors focus:text-foreground focus:outline-none hover:bg-base ${
                pathname === '/ui-kit' 
                  ? 'text-foreground' 
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              UI Kit
            </TransitionLink>
            <TransitionLink
              href="/admin"
              onNavigate={navigate}
              onClick={handleLinkClick}
              className={`w-full text-lg font-medium py-6 px-6 rounded transition-colors focus:text-foreground focus:outline-none hover:bg-base ${
                pathname?.startsWith('/admin') 
                  ? 'text-foreground' 
                  : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              Админка
            </TransitionLink>
          </div>
        </div>
      </nav>
    </>
  );
}
