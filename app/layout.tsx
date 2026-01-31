import type { Metadata } from 'next';
import { localFont } from 'next/font/local';
import './globals.css';
import { ClientLayout } from '@/components/pageTransition/ClientLayout';
import { IntroAnimationProvider } from '@/components/introAnimation';
import type { PageTransitionConfig } from '@/components/pageTransition/types';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Portfolio website',
};

// Подключение шрифта Craftwork Grotesk через Next.js Font Optimization
const craftworkGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/CraftworkGrotesk-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/CraftworkGrotesk-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/CraftworkGrotesk-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/CraftworkGrotesk-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/CraftworkGrotesk-Heavy.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-craftwork',
  display: 'swap',
});

// Конфигурация переходов - легко изменять для экспериментов
// Упрощенный подход: белый квадрат наезжает на экран и уезжает
const transitionConfig: PageTransitionConfig = {
  direction: 'vertical', // 'horizontal' | 'vertical'
  duration: 0.56, // Длительность в секундах (ускорено на 30%: 0.8 * 0.7 = 0.56)
  ease: 'power2.inOut', // GSAP easing: 'power1', 'power2', 'power3', 'power4', 'expo', 'sine', 'back', 'elastic', 'circ', 'bounce'
  maskColor: '#ffffff', // Цвет маски перехода
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={craftworkGrotesk.variable}>
      <body className={craftworkGrotesk.className}>
        <ClientLayout config={transitionConfig}>{children}</ClientLayout>
        <IntroAnimationProvider />
      </body>
    </html>
  );
}
