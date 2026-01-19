'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { TransitionType } from './types';

interface TransitionLinkProps extends Omit<React.ComponentProps<typeof Link>, 'onNavigate'> {
  children: React.ReactNode;
  onNavigate?: (to: string, direction: TransitionType) => void;
}

/**
 * Обёртка над Next.js Link для использования с переходами
 * Используйте этот компонент вместо обычного Link для страниц с переходами
 */
export default function TransitionLink({
  children,
  href,
  onNavigate,
  onClick,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname();
  
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      
      const targetPath = typeof href === 'string' ? href : href.pathname || '';
      
      if (!targetPath || targetPath === pathname) {
        return; // Не переходим на ту же страницу
      }
      
      // Определяем направление (простая логика, можно расширить)
      const routes = ['/', '/portfolio', '/frame1'];
      const currentIndex = routes.indexOf(pathname);
      const targetIndex = routes.indexOf(targetPath);
      const direction: TransitionType = 
        targetIndex > currentIndex || currentIndex === -1 ? 'forward' : 'backward';
      
      // Вызываем callback для начала перехода
      onNavigate?.(targetPath, direction);
      
      // Вызываем оригинальный onClick если он есть
      onClick?.(e);
    },
    [href, pathname, onNavigate, onClick]
  );
  
  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
