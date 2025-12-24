import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant?: 'default' | 'teal' | 'blue' | 'green' | 'orange' | 'purple';
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

const variantColors = {
  default: 'bg-gray-600 hover:bg-gray-700',
  teal: 'bg-teal-600 hover:bg-teal-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
};

export function QuickActions({ actions, title = "Acciones Rápidas" }: QuickActionsProps) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <h3 className="text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {title}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const colorClass = variantColors[action.variant || 'default'];
            
            return (
              <Button
                key={action.id}
                onClick={action.onClick}
                className={`h-auto min-h-[72px] sm:min-h-[80px] py-3 sm:py-4 px-2 flex flex-col items-center justify-center gap-1.5 sm:gap-2 ${colorClass} transition-all hover:shadow-md touch-manipulation active:scale-95`}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
                <span className="text-[10px] sm:text-xs text-center leading-tight w-full">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
