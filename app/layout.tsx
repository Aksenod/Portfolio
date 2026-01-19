import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from '@/components/pageTransition/ClientLayout';
import { IntroAnimationProvider } from '@/components/introAnimation';
import type { PageTransitionConfig } from '@/components/pageTransition/types';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Portfolio website',
};

// Конфигурация переходов - легко изменять для экспериментов
// Упрощенный подход: белый квадрат наезжает на экран и уезжает
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical', // 'horizontal' | 'vertical'
  duration: 0.8, // Длительность в секундах
  ease: 'power2.inOut', // GSAP easing: 'power1', 'power2', 'power3', 'power4', 'expo', 'sine', 'back', 'elastic', 'circ', 'bounce'
  maskColor: '#ffffff', // Цвет маски перехода
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <ClientLayout config={transitionConfig}>{children}</ClientLayout>
        <IntroAnimationProvider />
      </body>
    </html>
  );
}
