import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, LucideIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { getConfig } from '../../config/white-label.config';
import udarLogo from 'figma:asset/841a58f721c551c9787f7d758f8005cf7dfb6bc5.png';

export interface DrawerMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick?: () => void;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: DrawerMenuItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  title?: string;
  userName?: string;
}

export function MobileDrawer({
  isOpen,
  onOpenChange,
  items,
  activeSection,
  onSectionChange,
  title = "Más opciones",
  userName
}: MobileDrawerProps) {
  const handleItemClick = (item: DrawerMenuItem) => {
    if (item.onClick) {
      // Si tiene onClick personalizado, ejecutarlo
      item.onClick();
      onOpenChange(false);
    } else {
      // Si no, cambiar sección normalmente
      onSectionChange(item.id);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-black border-r border-gray-800">
        <SheetHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-gray-800"
          style={{
            background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.1) 0%, transparent 100%)'
          }}
        >
          {/* Logo del sistema */}
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center p-2 border shadow-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.2) 0%, rgba(237, 28, 36, 0.1) 100%)',
                borderColor: 'rgba(237, 28, 36, 0.3)',
                boxShadow: '0 0 20px rgba(237, 28, 36, 0.3)'
              }}
            >
              <span 
                className="tracking-widest"
                style={{
                  color: '#ED1C24',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: '0.5rem',
                  textShadow: '0 0 10px rgba(237, 28, 36, 0.5)',
                  letterSpacing: '0.1em'
                }}
              >
                HOY
                <br />
                PECAMOS
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-white truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {userName || 'Usuario'}
              </p>
              <p className="text-xs text-gray-400 truncate">Cliente</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>{title}</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-9 w-9 min-h-[44px] min-w-[44px] text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>
        
        <nav className="p-3 sm:p-4 overflow-y-auto scrollbar-hide max-h-[calc(100vh-5rem)]">
          <div className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 min-h-[52px] touch-manipulation active:scale-98 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(237, 28, 36, 0.3) 0%, rgba(237, 28, 36, 0.15) 100%)',
                    borderLeft: '3px solid #ED1C24',
                    boxShadow: '0 0 20px rgba(237, 28, 36, 0.3)'
                  } : {}}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-[#ED1C24] text-white border-none text-xs min-w-[24px] h-[20px] flex items-center justify-center"
                      style={{ boxShadow: '0 0 10px rgba(237, 28, 36, 0.6)' }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}