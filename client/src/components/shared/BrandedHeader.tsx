/**
 * 🎨 HEADER CON BRANDING DINÁMICO
 * Ejemplo de componente que usa el sistema de branding
 */

import { useBranding, useTexts } from '../../hooks/useTenant';
import { Button } from '../ui/button';
import { LogOut, Settings } from 'lucide-react';

interface BrandedHeaderProps {
  userName?: string;
  onLogout?: () => void;
  showSettings?: boolean;
}

export function BrandedHeader({ userName, onLogout, showSettings = true }: BrandedHeaderProps) {
  const branding = useBranding();
  const texts = useTexts();

  return (
    <header 
      className="bg-white border-b sticky top-0 z-50"
      style={{
        borderColor: branding.colors.border,
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo + Nombre de la app */}
        <div className="flex items-center gap-3">
          <div 
            className="text-3xl"
            style={{
              fontFamily: branding.fonts.heading,
            }}
          >
            {branding.logo}
          </div>
          
          <div className="hidden sm:block">
            <h1 
              className="font-medium"
              style={{
                color: branding.colors.primary,
                fontFamily: branding.fonts.heading,
              }}
            >
              {branding.appName}
            </h1>
            {branding.tagline && (
              <p 
                className="text-sm"
                style={{
                  color: branding.colors.muted,
                }}
              >
                {branding.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Usuario + Acciones */}
        <div className="flex items-center gap-2">
          {userName && (
            <span 
              className="hidden md:block text-sm font-medium"
              style={{ color: branding.colors.foreground }}
            >
              {userName}
            </span>
          )}

          {showSettings && (
            <Button
              variant="ghost"
              size="icon"
              className="touch-target"
              aria-label={texts.common.settings}
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}

          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="touch-target"
              style={{
                color: branding.colors.foreground,
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">{texts.common.logout}</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
