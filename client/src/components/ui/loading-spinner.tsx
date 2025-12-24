import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = '#4DB8BA',
  message,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const messageSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Spinner */}
      <div className="relative">
        {/* Círculo de fondo con blur */}
        <div 
          className="absolute inset-0 blur-lg opacity-30 animate-pulse"
          style={{ backgroundColor: color }}
        />
        
        {/* Spinner principal */}
        <svg
          className={`${sizeClasses[size]} animate-spin`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke={color}
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill={color}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      {/* Message */}
      {message && (
        <p 
          className={`${messageSizeClasses[size]} text-gray-600 dark:text-gray-400 
            animate-pulse text-center max-w-xs`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// Componente para loading de página completa
export function LoadingPage({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 
      backdrop-blur-sm z-50">
      <LoadingSpinner size="xl" message={message} />
    </div>
  );
}

// Componente para loading inline
export function LoadingInline({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" message={message} />
    </div>
  );
}
