export type TransitionDirection = 'horizontal' | 'vertical';
export type TransitionType = 'forward' | 'backward';
export type TransitionPhase = 'closing' | 'opening' | 'idle';

export interface PageTransitionConfig {
  /** Направление перехода */
  direction: TransitionDirection;
  /** Длительность анимации в секундах */
  duration: number;
  /** Easing функция для GSAP */
  ease: string;
  /** Цвет маски перехода */
  maskColor: string;
}

export interface TransitionState {
  isTransitioning: boolean;
  phase: TransitionPhase;
  direction: TransitionType;
  toPath: string | null;
}
