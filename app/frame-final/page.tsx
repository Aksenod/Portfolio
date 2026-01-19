'use client';

import { heroConfig } from '@/components/introAnimation/config';
import { TransitionLink, useTransitionContext } from '@/components/pageTransition';

/**
 * Страница с финальным кадром анимации
 * Показывает центральное изображение в увеличенном виде (scale 3x) и заголовок
 */
export default function FrameFinalPage() {
  const { navigate } = useTransitionContext();

  // Параметры из анимации
  const CONTAINER_WIDTH = 8; // vw - ширина контейнера
  const CONTAINER_HEIGHT = 16; // vh - высота контейнера
  const SCALE_CENTER_FINAL = 3; // Финальный масштаб центрального изображения

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Кнопка для возврата на главную */}
      <TransitionLink
        href="/"
        onNavigate={navigate}
        className="fixed top-0 left-0 z-50 text-white p-6 hover:text-white/80 transition-colors pointer-events-auto"
      >
        ← Назад
      </TransitionLink>

      {/* Информация о кадре */}
      <div className="fixed top-0 right-0 z-50 text-white p-6 text-sm pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg pointer-events-auto">
          <h2 className="font-bold mb-2">Финальный кадр анимации</h2>
          <ul className="space-y-1 text-white/80 text-xs">
            <li>• Центральное изображение: scale {SCALE_CENTER_FINAL}x</li>
            <li>• Размер контейнера: {CONTAINER_WIDTH}vw × {CONTAINER_HEIGHT}vh</li>
            <li>• Изображение: {heroConfig.image}</li>
          </ul>
        </div>
      </div>

      {/* Финальный кадр анимации */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        {/* Центральное увеличенное изображение - точно как в финальном кадре анимации */}
        <div
          className="intro-landing-image-container absolute"
          style={{
            width: `${CONTAINER_WIDTH}vw`,
            height: `${CONTAINER_HEIGHT}vh`,
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${SCALE_CENTER_FINAL})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={heroConfig.image}
            alt={heroConfig.heading.line1}
            className="intro-landing-image w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Заголовок (как в финальном кадре - видимый, без масок) */}
      <div className="intro-landing-heading-wrapper fixed inset-x-0 bottom-0 flex flex-col items-center pb-[10vh] z-40 pointer-events-none">
        <div className="intro-landing-heading-line-1 text-white text-6xl md:text-8xl font-bold uppercase tracking-tight mb-2">
          {heroConfig.heading.line1}
        </div>
        <div className="intro-landing-heading-line-2 text-white text-6xl md:text-8xl font-bold uppercase tracking-tight mb-2">
          {heroConfig.heading.line2}
        </div>
        <div className="intro-landing-heading-line-3 text-white text-6xl md:text-8xl font-bold uppercase tracking-tight">
          {heroConfig.heading.line3}
        </div>
      </div>
    </main>
  );
}
