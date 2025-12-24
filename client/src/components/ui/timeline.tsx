import React from 'react';
import { Check, Circle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  status: 'completed' | 'current' | 'pending';
  date?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  variant?: 'default' | 'compact';
  className?: string;
}

export function Timeline({ 
  items, 
  orientation = 'vertical',
  variant = 'default',
  className = '' 
}: TimelineProps) {
  if (orientation === 'horizontal') {
    return <TimelineHorizontal items={items} variant={variant} className={className} />;
  }

  return <TimelineVertical items={items} variant={variant} className={className} />;
}

function TimelineVertical({ items, variant, className }: Omit<TimelineProps, 'orientation'>) {
  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';
        const isPending = item.status === 'pending';
        const isLast = index === items.length - 1;

        return (
          <div key={item.id} className="relative flex gap-4">
            {/* Timeline line */}
            {!isLast && (
              <div 
                className={`
                  absolute left-[19px] top-10 w-0.5 h-full
                  ${isCompleted ? 'bg-[#4DB8BA]' : 'bg-gray-200 dark:bg-gray-700'}
                  transition-colors duration-500
                `}
              />
            )}

            {/* Icon/Circle */}
            <div className="relative flex-shrink-0 z-10">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${isCompleted ? 'bg-[#4DB8BA] shadow-lg shadow-[#4DB8BA]/30' : ''}
                  ${isCurrent ? 'bg-white dark:bg-gray-800 border-2 border-[#4DB8BA] shadow-lg shadow-[#4DB8BA]/20 scale-110' : ''}
                  ${isPending ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600' : ''}
                `}
              >
                {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                {isCurrent && Icon && <Icon className="w-5 h-5 text-[#4DB8BA]" />}
                {isCurrent && !Icon && <Circle className="w-3 h-3 text-[#4DB8BA] fill-current" />}
                {isPending && <Circle className="w-3 h-3 text-gray-400" />}
              </div>

              {/* Pulse animation para current */}
              {isCurrent && (
                <div className="absolute inset-0 rounded-full bg-[#4DB8BA] opacity-30 
                  animate-ping" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${variant === 'compact' ? 'pt-2' : 'pt-1'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 
                    className={`
                      font-medium transition-colors
                      ${isCompleted || isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}
                      ${isCurrent ? 'text-[#4DB8BA]' : ''}
                    `}
                  >
                    {item.title}
                  </h4>
                  {variant === 'default' && item.description && (
                    <p className={`
                      text-sm mt-1 transition-colors
                      ${isCompleted || isCurrent ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}
                    `}>
                      {item.description}
                    </p>
                  )}
                </div>
                {item.date && (
                  <span className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TimelineHorizontal({ items, className }: Omit<TimelineProps, 'orientation' | 'variant'>) {
  return (
    <div className={`relative ${className}`}>
      {/* Timeline line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-[#4DB8BA] transition-all duration-500"
          style={{
            width: `${(items.filter(i => i.status === 'completed').length / items.length) * 100}%`
          }}
        />
      </div>

      {/* Items */}
      <div className="flex justify-between">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';
          const isPending = item.status === 'pending';

          return (
            <div key={item.id} className="flex flex-col items-center z-10 flex-1">
              {/* Icon/Circle */}
              <div className="relative mb-3">
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted ? 'bg-[#4DB8BA] shadow-lg shadow-[#4DB8BA]/30' : ''}
                    ${isCurrent ? 'bg-white dark:bg-gray-800 border-2 border-[#4DB8BA] shadow-lg shadow-[#4DB8BA]/20 scale-110' : ''}
                    ${isPending ? 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600' : ''}
                  `}
                >
                  {isCompleted && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                  {isCurrent && Icon && <Icon className="w-5 h-5 text-[#4DB8BA]" />}
                  {isCurrent && !Icon && <Circle className="w-3 h-3 text-[#4DB8BA] fill-current" />}
                  {isPending && <Circle className="w-3 h-3 text-gray-400" />}
                </div>

                {/* Pulse animation */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-[#4DB8BA] opacity-30 animate-ping" />
                )}
              </div>

              {/* Label */}
              <p 
                className={`
                  text-xs sm:text-sm text-center max-w-[80px] sm:max-w-none
                  transition-colors
                  ${isCompleted || isCurrent ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'}
                  ${isCurrent ? 'text-[#4DB8BA] font-medium' : ''}
                `}
              >
                {item.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
