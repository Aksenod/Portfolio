'use client';

import { forwardRef } from 'react';
import Image from 'next/image';

interface CaseHeroProps {
  sectionLabel?: string;
  caseType?: string;
  headline: string;
  image: string;
  imageAlt?: string;
  scrollProgress?: number; // Progress от ScrollTrigger (0-1)
}

export const CaseHero = forwardRef<HTMLElement, CaseHeroProps>(
  ({
    sectionLabel = '(CASE)',
    caseType,
    headline,
    image,
    imageAlt = 'Case image',
    scrollProgress = 0,
  }, ref) => {
    return (
      <section
        ref={ref}
        className="min-h-screen bg-base grid grid-cols-3 gap-[20px] px-6 md:px-10 pt-[140px] pb-10 relative"
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
      {/* Колонка 1 - метка секции и тип кейса */}
      <div className="flex flex-col items-start justify-start gap-3 sticky top-[10vh] self-start">
        <div className="flex flex-col gap-1">
          <p className="text-foreground/60 uppercase tracking-wider text-xs md:text-sm font-medium leading-none">
            {sectionLabel}
          </p>
          {caseType && (
            <>
              <div className="w-6 h-px bg-foreground/20 mt-2 mb-1"></div>
              <p className="text-foreground/50 text-xs md:text-sm font-normal leading-relaxed">
                {caseType}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Колонки 2 и 3 - заголовок и изображение в вертикальном flex */}
      <div className="col-span-2 flex flex-col items-start justify-start gap-8 md:gap-16 h-auto">
        {/* Заголовок */}
        <div className="max-w-4xl">
          <h1 className="text-foreground text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold md:font-[900] leading-[1.1] tracking-tight">
            {headline}
          </h1>
        </div>

        {/* Изображение */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/10] overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </div>
      </div>
    </section>
    );
  }
);

CaseHero.displayName = 'CaseHero';
