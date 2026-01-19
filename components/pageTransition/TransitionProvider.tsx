'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePageTransition } from './usePageTransition';
import type { PageTransitionConfig, TransitionType } from './types';

interface TransitionContextValue {
  navigate: (to: string, direction?: TransitionType) => void;
  transitionState: ReturnType<typeof usePageTransition>['transitionState'];
  handleCloseComplete: () => void;
  completeTransition: () => void;
  determineDirection: (from: string, to: string) => TransitionType;
  pathname: string;
  config: PageTransitionConfig;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransitionContext() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransitionContext must be used within TransitionProvider');
  }
  return context;
}

interface TransitionProviderProps {
  children: ReactNode;
  config: PageTransitionConfig;
}

/**
 * Провайдер контекста для управления переходами между страницами
 */
export function TransitionProvider({ children, config }: TransitionProviderProps) {
  const transition = usePageTransition({
    onTransitionStart: (toPath, direction) => {
      // Можно добавить логику при начале перехода
      // console.log(`Transition started: ${toPath} (${direction})`);
    },
    onCloseComplete: () => {
      // Маска закрылась, можно выполнить дополнительные действия
      // console.log('Close animation completed');
    },
    onTransitionComplete: (toPath) => {
      // Можно добавить логику при завершении перехода
      // console.log(`Transition completed: ${toPath}`);
    },
  });

  return (
    <TransitionContext.Provider value={{ ...transition, config }}>
      {children}
    </TransitionContext.Provider>
  );
}
