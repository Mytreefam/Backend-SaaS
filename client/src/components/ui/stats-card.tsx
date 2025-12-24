import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  iconColor?: string;
  variant?: 'default' | 'gradient' | 'glassmorphic';
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className = '',
  iconColor = '#4DB8BA',
  variant = 'default',
  onClick
}: StatsCardProps) {
  const isPositiveTrend = trend && trend.value > 0;
  const isNegativeTrend = trend && trend.value < 0;
  const isNeutralTrend = trend && trend.value === 0;

  const TrendIcon = isPositiveTrend 
    ? TrendingUp 
    : isNegativeTrend 
    ? TrendingDown 
    : Minus;

  const baseClasses = `
    p-4 sm:p-6
    transition-all duration-300 ease-out
    hover:shadow-xl
    ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
    animate-in fade-in-50 slide-in-from-bottom-3 duration-500
  `;

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-2 border-transparent hover:border-[#4DB8BA]/20',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-none shadow-lg',
    glassmorphic: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 shadow-xl'
  };

  return (
    <Card 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Header con icon y trend */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          {/* Icon */}
          <div className="relative group">
            <div 
              className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-30 transition-opacity"
              style={{ backgroundColor: iconColor }}
            />
            <div className="relative p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100
              dark:from-gray-700 dark:to-gray-800">
              <Icon 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ color: iconColor }}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Trend Badge */}
          {trend && (
            <Badge 
              variant="secondary"
              className={`
                flex items-center gap-1 text-xs
                ${isPositiveTrend ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                ${isNegativeTrend ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                ${isNeutralTrend ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400' : ''}
              `}
            >
              <TrendIcon className="w-3 h-3" />
              <span>{Math.abs(trend.value)}%</span>
            </Badge>
          )}
        </div>

        {/* Title */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
          {title}
        </p>

        {/* Value */}
        <p 
          className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1"
          style={{
            background: `linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {value}
        </p>

        {/* Trend Label */}
        {trend?.label && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
