'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StickyCards } from '@/components/stickyCards/StickyCards';
import type { CardData } from '@/components/stickyCards/types';
import { CaseHero } from '@/components/CaseHero';

// Регистрация ScrollTrigger плагина
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Mock данные для прототипа (4 карточки)
const mockCardsData: CardData[] = [
  {
    id: '1',
    index: 0,
    title: 'Кейс 1',
    description: 'Описание первого кейса для тестирования эффекта sticky-cards scroll',
    image: '/images/photo-1.webp',
  },
  {
    id: '2',
    index: 1,
    title: 'Кейс 2',
    description: 'Описание второго кейса для тестирования эффекта sticky-cards scroll',
    image: '/images/photo-2.webp',
  },
  {
    id: '3',
    index: 2,
    title: 'Кейс 3',
    description: 'Описание третьего кейса для тестирования эффекта sticky-cards scroll',
    image: '/images/photo-3.webp',
  },
  {
    id: '4',
    index: 3,
    title: 'Кейс 4',
    description: 'Последняя карточка (не pin\'ится)',
    image: '/images/photo-4.webp',
  },
];

export default function CasePage() {
  const heroRef = useRef<HTMLElement>(null);

  // Временно отключено для тестирования нативного скролла
  // const lenisRef = useRef<Lenis | null>(null);

  // useEffect(() => {
  //   // Инициализация Lenis
  //   const lenis = new Lenis({
  //     duration: 1.2,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  //     orientation: 'vertical',
  //     gestureOrientation: 'vertical',
  //     smoothWheel: true,
  //     wheelMultiplier: 1,
  //     touchMultiplier: 2,
  //     infinite: false,
  //   });

  //   lenisRef.current = lenis;

  //   // Регистрация raf для GSAP
  //   function raf(time: number) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }

  //   requestAnimationFrame(raf);

  //   // Обновление ScrollTrigger при скролле Lenis
  //   lenis.on('scroll', () => {
  //     ScrollTrigger.update();
  //   });

  //   return () => {
  //     lenis.destroy();
  //   };
  // }, []);

  // Обновление ScrollTrigger при нативном скролле
  useEffect(() => {
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <main className="bg-base">
      {/* Hero-секция - первый экран */}
      <CaseHero
        ref={heroRef}
        sectionLabel="(CASE)"
        headline="Great architecture isn't just about talent and experience, but collaborations and relationships."
        image="/images/photo-1.webp"
        imageAlt="Case hero image"
      />
      
      {/* StickyCards секция */}
      <StickyCards cards={mockCardsData} heroRef={heroRef} />
    </main>
  );
}
