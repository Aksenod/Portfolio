'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import { getStaticPath } from '@/lib/utils/paths';
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
          <div className="grid grid-cols-3 gap-[20px] px-6 md:px-10 py-6">
            {/* Колонка 1 - пустая */}
            <div className="h-fit"></div>
            
            {/* Колонки 2 и 3 - Заголовок H4 */}
            <div className="col-span-2 h-fit">
              <h4 className="text-foreground text-xl md:text-2xl font-semibold tracking-tight">
                {card.title}
              </h4>
            </div>
            
            {/* Все три колонки - Изображение во всю высоту экрана */}
            <div className="col-span-3 relative w-full min-h-screen overflow-hidden flex items-center justify-center">
              <Image
                src={card.image.startsWith('/') ? getStaticPath(card.image) : card.image}
                alt={card.title}
                width={1920}
                height={2560}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

StickyCard.displayName = 'StickyCard';