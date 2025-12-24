import React from 'react';
import { Skeleton } from './skeleton';

interface SkeletonListProps {
  items?: number;
  variant?: 'simple' | 'withAvatar' | 'withImage' | 'detailed';
  className?: string;
}

export function SkeletonList({ 
  items = 3, 
  variant = 'simple',
  className = '' 
}: SkeletonListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border bg-white dark:bg-gray-800 
            animate-pulse"
        >
          {variant === 'simple' && (
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          )}

          {variant === 'withAvatar' && (
            <>
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </>
          )}

          {variant === 'withImage' && (
            <>
              <Skeleton className="h-16 w-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </>
          )}

          {variant === 'detailed' && (
            <>
              <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
