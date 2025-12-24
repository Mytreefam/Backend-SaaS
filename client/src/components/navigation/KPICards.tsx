import { Card, CardContent } from '../ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface KPIData {
  id: string;
  label: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

interface KPICardsProps {
  kpis: KPIData[];
}

export function KPICards({ kpis }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change !== undefined && kpi.change > 0;
        const isNegative = kpi.change !== undefined && kpi.change < 0;
        
        return (
          <Card key={kpi.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
                <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm leading-tight pr-1">{kpi.label}</p>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${kpi.iconColor || 'text-gray-400'}`} />
              </div>
              <p className="text-gray-900 text-base sm:text-lg md:text-xl lg:text-2xl mb-1 sm:mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {kpi.value}
              </p>
              {kpi.change !== undefined && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {isPositive && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />}
                  {isNegative && <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 shrink-0" />}
                  <span className={`text-[10px] sm:text-xs md:text-sm ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                    {isPositive && '+'}{kpi.change}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
