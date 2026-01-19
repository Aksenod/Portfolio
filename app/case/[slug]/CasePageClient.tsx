'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StickyCards } from '@/components/stickyCards/StickyCards';
import type { CardData } from '@/components/stickyCards/types';
import { CaseHero } from '@/components/CaseHero';
import type { Case } from '@/lib/api/types';

// Регистрация ScrollTrigger плагина
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CasePageClientProps {
  caseData: Case | null;
}

export function CasePageClient({ caseData }: CasePageClientProps) {
  const heroRef = useRef<HTMLElement>(null);

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

  // Преобразование screenshotBlocks в CardData
  const cardsData: CardData[] = caseData?.screenshotBlocks
    ?.filter((block) => block.images && block.images.length > 0 && block.images[0])
    .map((block, index) => ({
      id: `${caseData.id}-${index}`,
      index,
      title: block.title,
      description: undefined, // Описание не используется в текущей структуре
      image: block.images[0], // Берем первое изображение из блока
    })) || [];

  if (!caseData) {
    return (
      <main className="bg-base min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-xl font-semibold mb-2">Кейс не найден</p>
          <p className="text-foreground/60">Кейс с таким slug не существует</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-base">
      {/* Hero-секция - первый экран */}
      <CaseHero
        ref={heroRef}
        sectionLabel="(CASE)"
        caseType={caseData.caseType}
        headline={caseData.title}
        image={caseData.heroImage}
        imageAlt={`${caseData.title} - Hero image`}
      />
      
      {/* StickyCards секция */}
      {cardsData.length > 0 && (
        <StickyCards cards={cardsData} heroRef={heroRef} />
      )}
    </main>
  );
}
