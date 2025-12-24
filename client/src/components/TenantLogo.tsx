/**
 * 🎨 TENANT LOGO COMPONENT
 * Muestra el logo del tenant activo de forma consistente
 */

import { ACTIVE_TENANT } from '../config/tenant.config';

interface TenantLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
};

export function TenantLogo({ 
  size = 'md', 
  showTagline = false,
  className = ''
}: TenantLogoProps) {
  const { branding } = ACTIVE_TENANT;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo */}
      {typeof branding.logo === 'string' && branding.logo.startsWith('figma:asset') ? (
        <img
          src={branding.logo}
          alt={branding.appName}
          className={`${sizeClasses[size]} w-auto object-contain`}
        />
      ) : (
        <div 
          className={`${sizeClasses[size]} flex items-center justify-center text-4xl`}
        >
          {branding.logo}
        </div>
      )}

      {/* Tagline opcional */}
      {showTagline && (
        <p
          className="text-sm mt-2 opacity-80"
          style={{ 
            color: branding.colors.foreground,
            fontFamily: branding.fonts.body
          }}
        >
          {branding.tagline}
        </p>
      )}
    </div>
  );
}
