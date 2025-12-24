/**
 * HOOK: useBreakpoint
 * 
 * Detecta el breakpoint actual de Tailwind en tiempo real
 * 
 * @returns Breakpoint actual: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * 
 * @example
 * const breakpoint = useBreakpoint();
 * if (breakpoint === 'xs' || breakpoint === 'sm') {
 *   return <MobileLayout />;
 * }
 */

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'md';
    return getBreakpoint(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}

/**
 * Hook para verificar si estamos en un breakpoint específico o menor
 */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  const current = useBreakpoint();
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpoints.indexOf(current);
  const targetIndex = breakpoints.indexOf(breakpoint);
  return currentIndex <= targetIndex;
}

/**
 * Hook para verificar si estamos en un breakpoint específico o mayor
 */
export function useBreakpointUp(breakpoint: Breakpoint): boolean {
  const current = useBreakpoint();
  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpoints.indexOf(current);
  const targetIndex = breakpoints.indexOf(breakpoint);
  return currentIndex >= targetIndex;
}

/**
 * Hook para verificar si estamos exactamente en un breakpoint
 */
export function useBreakpointIs(breakpoint: Breakpoint): boolean {
  const current = useBreakpoint();
  return current === breakpoint;
}
