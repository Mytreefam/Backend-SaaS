/**
 * BREAKPOINT INDICATOR
 * 
 * Herramienta de desarrollo que muestra el breakpoint actual
 * Siempre visible - para ocultar, quitar de App.tsx
 */

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useState, useEffect } from 'react';

export function BreakpointIndicator() {
  const breakpoint = useBreakpoint();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // SIEMPRE RENDERIZAR (sin verificación que causa problemas)
  // Para ocultar en producción, quitar el componente de App.tsx

  const colors = {
    xs: 'bg-red-500',
    sm: 'bg-orange-500',
    md: 'bg-yellow-500',
    lg: 'bg-green-500',
    xl: 'bg-blue-500',
    '2xl': 'bg-purple-500',
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none">
      <div
        className={`${colors[breakpoint]} text-white px-4 py-2 rounded-lg shadow-lg font-mono text-sm`}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-base">{breakpoint.toUpperCase()}</span>
            <span className="text-xs opacity-90">
              {dimensions.width}×{dimensions.height}
            </span>
          </div>
          <div className="text-xs opacity-75">
            {getBreakpointRange(breakpoint)}
          </div>
        </div>
      </div>
    </div>
  );
}

function getBreakpointRange(breakpoint: string): string {
  const ranges = {
    xs: '< 640px',
    sm: '640px - 767px',
    md: '768px - 1023px',
    lg: '1024px - 1279px',
    xl: '1280px - 1535px',
    '2xl': '≥ 1536px',
  };
  return ranges[breakpoint as keyof typeof ranges] || '';
}
