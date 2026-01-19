'use client';

import Frame1Experiment from '@/components/Frame1Experiment';
import { TransitionLink, useTransitionContext } from '@/components/pageTransition';

export default function Frame1Page() {
  // Изображения из generated-page.html (ITEMS_DATA) - первые 5 уникальных
  const images = [
    'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=500&q=80', // Alpha Dimension
    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=500&q=80', // Vortex Valley
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&q=80', // Quantum Quarters
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&q=80', // Nebula Nexus
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80', // Cosmic Corridor
  ];

  const { navigate } = useTransitionContext();

  return (
    <main className="min-h-screen bg-black relative">
      <Frame1Experiment images={images} />
      
      {/* Кнопка для возврата на главную */}
      <TransitionLink
        href="/"
        onNavigate={navigate}
        className="fixed top-0 left-0 z-50 text-white p-6 hover:text-white/80 transition-colors"
      >
        ← Назад
      </TransitionLink>
      
      {/* Информация о настройках */}
      <div className="fixed top-0 right-0 z-50 text-white p-6 text-sm">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg">
          <h2 className="font-bold mb-2">Кадр 1: Появление и схождение</h2>
          <ul className="space-y-1 text-white/80">
            <li>• Задержка старта: 500ms</li>
            <li>• Сцена 1 (появление): 1000ms</li>
            <li>• Сцена 2 (схождение): 2000ms</li>
            <li>• Easing: expo.out</li>
            <li>• Scale: 0.9 → 1.0</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
