import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Icon con animación sutil */}
      <div className="mb-4 animate-in fade-in-50 zoom-in-95 duration-500">
        <div className="relative">
          {/* Círculo de fondo con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4DB8BA]/10 to-[#3A9799]/5 
            rounded-full blur-xl scale-150" />
          
          {/* Icon */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 
            dark:from-gray-800 dark:to-gray-900
            rounded-full p-6 shadow-lg">
            <Icon className="w-12 h-12 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Título */}
      <h3 className="text-lg sm:text-xl mb-2 text-gray-900 dark:text-gray-100
        animate-in fade-in-50 slide-in-from-bottom-3 duration-500 delay-100">
        {title}
      </h3>

      {/* Descripción */}
      {description && (
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 
          max-w-md mb-6
          animate-in fade-in-50 slide-in-from-bottom-3 duration-500 delay-200">
          {description}
        </p>
      )}

      {/* Acción */}
      {action && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-3 duration-500 delay-300">
          <Button
            onClick={action.onClick}
            variant={action.variant || 'default'}
            className="shadow-lg hover:shadow-xl transition-all duration-300
              hover:scale-105 active:scale-95"
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
