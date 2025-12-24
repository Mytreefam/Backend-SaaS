import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  indicatorRef: React.RefObject<HTMLDivElement>;
}

/**
 * Indicador visual para Pull to Refresh
 * Se muestra en la parte superior cuando el usuario arrastra
 */
export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({ 
  indicatorRef 
}) => {
  return (
    <div
      ref={indicatorRef}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
      style={{
        transform: 'translateX(-50%) translateY(-100px)',
        opacity: 0,
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s',
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700">
        <RefreshCw className="w-6 h-6 text-teal-600" />
      </div>

      {/* Estilos inline para animación de refreshing */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .ptr-refreshing {
            animation: ptr-spin 1s linear infinite;
          }

          @keyframes ptr-spin {
            from {
              transform: translateY(60px) rotate(0deg);
            }
            to {
              transform: translateY(60px) rotate(360deg);
            }
          }
        `
      }} />
    </div>
  );
};
