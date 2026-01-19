'use client';

import { useState, useEffect } from 'react';
import { getStaticPath } from '@/lib/utils/paths';

interface HeroContentProps {
  image: string;
  heading: {
    line1: string;
    line2: string;
    line3: string;
  };
  className?: string;
}

/**
 * Компонент Hero-контента с главным изображением и заголовком
 * Точное соответствие финальному кадру анимации (пиксель в пиксель)
 * Изменяйте контент в components/introAnimation/config.ts (heroConfig)
 */
export function HeroContent({ image, heading, className = '' }: HeroContentProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Параметры из анимации для точного соответствия
  const CONTAINER_WIDTH = 8; // vw
  const SCALE_CENTER_FINAL = isMobile ? 4.5 : 3; // Финальный масштаб центрального изображения

  return (
    <div className={`hero-content absolute inset-0 pointer-events-none ${className}`}>
      {/* Wrapper для изображений - точно как в IntroLanding */}
      <div className="intro-landing-images-wrapper absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {/* Центральное увеличенное изображение - финальное состояние */}
        {/* В GSAP финальное состояние: x: '0vw' (центр экрана), y: 0, scale: 3 */}
        {/* Для точного соответствия используем абсолютное центрирование */}
        <div
          className="intro-landing-image-container absolute"
          suppressHydrationWarning
          style={{
            width: `${CONTAINER_WIDTH}vw`,
            aspectRatio: '4/6',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${SCALE_CENTER_FINAL})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={image.startsWith('/') ? getStaticPath(image) : image}
            alt={heading.line1}
            className="intro-landing-image w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </div>

      {/* Заголовок - точно как в IntroLanding */}
      <div className="intro-landing-heading-wrapper absolute inset-x-0 bottom-0 flex flex-col items-center pb-[10vh] z-40 pointer-events-none">
        <div className="intro-landing-heading-line-1 text-white text-5xl md:text-8xl font-bold uppercase tracking-tight mb-2">
          {heading.line1}
        </div>
        <div className="intro-landing-heading-line-2 text-white text-5xl md:text-8xl font-bold uppercase tracking-tight mb-2">
          {heading.line2}
        </div>
        <div className="intro-landing-heading-line-3 text-white text-5xl md:text-8xl font-bold uppercase tracking-tight">
          {heading.line3}
        </div>
      </div>
    </div>
  );
}
