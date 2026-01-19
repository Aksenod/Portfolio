'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StickyCard } from './StickyCard';
import type { CardData } from './types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  window.gsap = gsap;
}

interface StickyCardsProps {
  cards: CardData[];
  heroRef?: React.RefObject<HTMLElement | null> | null;
}

export function StickyCards({ cards, heroRef }: StickyCardsProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const triggersRef = useRef<ScrollTrigger[]>([]);
  const [scrollProgresses, setScrollProgresses] = useState<number[]>(new Array(cards.length).fill(0));

  useEffect(() => {
    // Инициализация массива рефов для всех карточек
    cardsRef.current = cardsRef.current.slice(0, cards.length);

    const triggers: ScrollTrigger[] = [];

    // Создаем ScrollTrigger для Hero -> первая карточка (если heroRef передан)
    if (heroRef?.current && cardsRef.current[0]) {
      const heroElement = heroRef.current;
      const firstCard = cardsRef.current[0];

      const heroTrigger = ScrollTrigger.create({
        trigger: heroElement,
        start: 'bottom bottom', // Анимация начинается когда нижний край Hero касается нижней границы экрана
        endTrigger: firstCard,
        end: 'top top', // Анимация заканчивается когда верх первой карточки касается верха экрана
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          // Деградация Hero при входе первой карточки
          if (progress > 0) {
            const scale = 1 - 0.25 * progress;
            // Hero с индексом -1, чередуем rotation: четные карточки вправо, нечетные влево
            // Для Hero используем -1, что даст -2 * progress (влево)

            gsap.set(heroElement, {
              scale,
              rotation: -2 * progress,
              '--overlay-opacity': progress,
            });
          } else {
            // Сброс при скролле назад
            gsap.set(heroElement, {
              scale: 1,
              rotation: 0,
              '--overlay-opacity': 0,
            });
          }
        },
      });

      triggers.push(heroTrigger);
    }

    // Создаем ScrollTrigger для каждой карточки кроме последней
    for (let i = 0; i < cards.length - 1; i++) {
      const currentCard = cardsRef.current[i];
      const nextCard = cardsRef.current[i + 1];

      if (!currentCard || !nextCard) continue;

      const trigger = ScrollTrigger.create({
        trigger: currentCard,
        start: 'bottom bottom', // Анимация начинается когда нижний край карточки касается нижней границы экрана
        endTrigger: nextCard,
        end: 'top top', // Анимация заканчивается когда верх следующей карточки касается верха экрана
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          
          // Обновляем progress для текущей карточки
          setScrollProgresses(prev => {
            const newProgresses = [...prev];
            newProgresses[i] = progress;
            return newProgresses;
          });

          // Деградация текущей карточки при входе следующей
          if (progress > 0) {
            const scale = 1 - 0.25 * progress;
            const rotation = i % 2 === 0 ? -2 * progress : 2 * progress;

            gsap.set(currentCard, {
              scale,
              rotation,
              '--overlay-opacity': progress,
            });
          } else {
            // Сброс при скролле назад
            gsap.set(currentCard, {
              scale: 1,
              rotation: 0,
              '--overlay-opacity': 0,
            });
          }
        },
      });

      triggers.push(trigger);
    }

    triggersRef.current = triggers;

    // Обновление ScrollTrigger при resize
    ScrollTrigger.refresh();
    
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Cleanup всех триггеров
      triggers.forEach((trigger) => trigger.kill());
      window.removeEventListener('resize', handleResize);
    };
  }, [cards, heroRef]);

  return (
    <div className="w-screen relative overflow-visible">
      {cards.map((card, index) => (
        <StickyCard
          key={card.id}
          card={card}
          ref={(el) => {
            cardsRef.current[index] = el;
          }}
          scrollProgress={scrollProgresses[index]}
        />
      ))}
    </div>
  );
}