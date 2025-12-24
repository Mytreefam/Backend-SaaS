/**
 * RESPONSIVE CONTAINER
 * 
 * Renderiza diferentes contenidos según el breakpoint actual
 * 
 * @example
 * <ResponsiveContainer
 *   mobile={<MobileLayout />}
 *   tablet={<TabletLayout />}
 *   desktop={<DesktopLayout />}
 * />
 * 
 * @example Solo mobile vs desktop
 * <ResponsiveContainer
 *   mobile={<SimplifiedView />}
 *   desktop={<CompleteView />}
 * />
 */

import { useBreakpoint } from '../../hooks/useBreakpoint';
import type { ReactNode } from 'react';

interface ResponsiveContainerProps {
  /** Contenido para móviles (xs, sm) */
  mobile?: ReactNode;
  /** Contenido para tablets (md) */
  tablet?: ReactNode;
  /** Contenido para desktop (lg, xl, 2xl) */
  desktop?: ReactNode;
  /** Fallback si no se especifican las variantes */
  children?: ReactNode;
}

export function ResponsiveContainer({
  mobile,
  tablet,
  desktop,
  children,
}: ResponsiveContainerProps) {
  const breakpoint = useBreakpoint();

  // Mobile (xs, sm)
  if (mobile && (breakpoint === 'xs' || breakpoint === 'sm')) {
    return <>{mobile}</>;
  }

  // Tablet (md)
  if (tablet && breakpoint === 'md') {
    return <>{tablet}</>;
  }

  // Desktop (lg, xl, 2xl)
  if (desktop && (breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl')) {
    return <>{desktop}</>;
  }

  // Fallback con prioridad
  if (mobile && !tablet && !desktop) {
    // Solo mobile definido -> usar para tablet y desktop también
    return <>{mobile}</>;
  }

  if (desktop && !mobile && !tablet) {
    // Solo desktop definido -> usar para mobile y tablet también
    return <>{desktop}</>;
  }

  // Usar children como último recurso
  return <>{children}</>;
}

/**
 * Variante simplificada: solo mobile vs desktop
 */
interface ResponsiveSwitchProps {
  mobile: ReactNode;
  desktop: ReactNode;
}

export function ResponsiveSwitch({ mobile, desktop }: ResponsiveSwitchProps) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  return <>{isMobile ? mobile : desktop}</>;
}

/**
 * Hook para usar dentro de componentes
 */
export function useResponsive<T>(values: {
  mobile: T;
  tablet?: T;
  desktop: T;
}): T {
  const breakpoint = useBreakpoint();

  if (breakpoint === 'xs' || breakpoint === 'sm') {
    return values.mobile;
  }

  if (breakpoint === 'md' && values.tablet) {
    return values.tablet;
  }

  return values.desktop;
}
