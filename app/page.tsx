'use client';

import { useState, useEffect } from 'react';
import { HeroContent } from '@/components/HeroContent';
import { 
  defaultHeroConfig, 
  loadAnimationConfigFromStorage,
  type HeroConfig 
} from '@/components/introAnimation/config';

export default function Home() {
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(defaultHeroConfig);

  useEffect(() => {
    loadAnimationConfigFromStorage().then((config) => {
      setHeroConfig(config.heroConfig);
    });
  }, []);

  return (
    <main className="h-screen md:min-h-screen bg-black relative overflow-hidden">
      {/* Hero-контент - главное изображение и заголовок */}
      {/* Конфигурация загружается динамически из хранилища или используется значение по умолчанию */}
      {/* Точное соответствие финальному кадру анимации (пиксель в пиксель) */}
      <HeroContent 
        image={heroConfig.image}
        heading={heroConfig.heading}
      />
    </main>
  );
}
