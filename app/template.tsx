'use client';

import { useTransitionContext } from '@/components/pageTransition';
import TransitionMask from '@/components/pageTransition/TransitionMask';

/**
 * Template компонент для Next.js App Router
 * Пересоздаётся при каждом переходе между маршрутами, что позволяет
 * анимировать переход между старым и новым контентом
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const { transitionState, handleCloseComplete, completeTransition, config } = useTransitionContext();

  return (
    <TransitionMask
      transitionState={transitionState}
      config={config}
      onCloseComplete={handleCloseComplete}
      onTransitionComplete={completeTransition}
    >
      {children}
    </TransitionMask>
  );
}
