'use client';

import { TransitionProvider } from './TransitionProvider';
import type { PageTransitionConfig } from './types';
import { Header } from '@/components/Header';

interface ClientLayoutProps {
  children: React.ReactNode;
  config: PageTransitionConfig;
}

/**
 * Client-компонент обёртка для TransitionProvider
 * Используется в server layout.tsx
 */
export function ClientLayout({ children, config }: ClientLayoutProps) {
  return (
    <TransitionProvider config={config}>
      <Header />
      {children}
    </TransitionProvider>
  );
}
