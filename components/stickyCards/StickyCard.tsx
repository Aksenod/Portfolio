'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import type { CardData } from './types';

interface StickyCardProps {
  card: CardData;
  scrollProgress?: number; // Progress от ScrollTrigger (0-1)
}

export const StickyCard = forwardRef<HTMLDivElement, StickyCardProps>(
  ({ card, scrollProgress = 0 }, ref) => {
    return (
      <div
        ref={ref}
        className="w-screen relative"
        style={
          {
            '--overlay-opacity': 0,
          } as React.CSSProperties
        }
      >
        {/* Overlay затемнение */}
        <div
          className="absolute inset-0 bg-black pointer-events-none z-10"
          style={{
            opacity: 'var(--overlay-opacity)',
          }}
        />

        {/* Контент карточки */}
        <div className="relative z-0 w-full">
          <div className="grid grid-cols-3 grid-rows-[auto_auto] gap-[20px] px-6 md:px-10 py-6">
            {/* Первая строка: Колонка 1 - пустая */}
            <div className="border border-red-500 h-fit"></div>
            
            {/* Первая строка: Колонки 2 и 3 - Заголовок H4 */}
            <div className="col-span-2 border border-red-500 h-fit">
              <h4 className="text-foreground text-xl md:text-2xl font-semibold tracking-tight">
                {card.title}
              </h4>
            </div>
            
            {/* Вторая строка: Все три колонки - Flex контейнер с изображениями */}
            <div className="col-span-3 row-start-2 border border-red-500 flex flex-col gap-[20px]">
              {/* Первое изображение */}
              <div className="relative w-full h-[800px] overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
              </div>
              
              {/* Второе изображение */}
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
              </div>
              
              {/* Третье изображение */}
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 100vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StickyCard.displayName = 'StickyCard';