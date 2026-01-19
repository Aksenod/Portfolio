'use client';

import { HeroContent } from '@/components/HeroContent';
import { heroConfig } from '@/components/introAnimation/config';

export default function Home() {
  return (
    <main className="h-screen md:min-h-screen bg-black relative overflow-hidden">
      {/* Hero-контент - главное изображение и заголовок */}
      {/* Конфигурация в components/introAnimation/config.ts (heroConfig) */}
      {/* Точное соответствие финальному кадру анимации (пиксель в пиксель) */}
      <HeroContent 
        image={heroConfig.image}
        heading={heroConfig.heading}
      />
    </main>
  );
}
