import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MoreHorizontal, LucideIcon } from 'lucide-react';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onMoreClick: () => void;
  maxItems?: number;
}

export function BottomNav({
  items,
  activeSection,
  onSectionChange,
  onMoreClick,
  maxItems = 4
}: BottomNavProps) {
  const visibleItems = items.slice(0, maxItems);
  const hasMoreItems = items.length > maxItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-50 safe-area-inset-bottom"
      style={{
        boxShadow: '0 -4px 6px -1px rgba(237, 28, 36, 0.2), 0 -2px 4px -1px rgba(237, 28, 36, 0.1)'
      }}
    >
      {/* Ajustado a grid-cols-4 para 4 items reales, h-[72px] para mejor touch target */}
      <div className={`grid ${hasMoreItems ? 'grid-cols-5' : 'grid-cols-4'} h-[72px] pb-[env(safe-area-inset-bottom)]`}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative min-h-[64px] touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-[#ED1C24]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center pointer-events-none bg-[#ED1C24] text-white border-none"
                    style={{ boxShadow: '0 0 10px rgba(237, 28, 36, 0.6)' }}
                  >
                    {item.badge > 9 ? '9+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] leading-tight truncate max-w-full px-0.5 mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
        
        {hasMoreItems && (
          <button
            onClick={onMoreClick}
            className="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-white transition-all duration-200 min-h-[64px] touch-manipulation active:scale-95"
          >
            <MoreHorizontal className="w-6 h-6" />
            <span className="text-[10px] leading-tight mt-0.5">Más</span>
          </button>
        )}
      </div>
    </nav>
  );
}