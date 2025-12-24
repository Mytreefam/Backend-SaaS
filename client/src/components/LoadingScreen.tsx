/**
 * ⏳ LOADING SCREEN
 * Pantalla de carga con animación del logo del tenant
 */

import { motion } from 'motion/react';
import { ACTIVE_TENANT } from '../config/tenant.config';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  message, 
  fullScreen = true 
}: LoadingScreenProps) {
  const { branding, texts } = ACTIVE_TENANT;

  const content = (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      {/* Logo con pulso */}
      {typeof branding.logo === 'string' && branding.logo.startsWith('figma:asset') ? (
        <motion.img
          src={branding.logo}
          alt={branding.appName}
          className="h-20 w-auto object-contain"
          animate={{ 
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ) : (
        <motion.div
          className="text-6xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {branding.logo}
        </motion.div>
      )}

      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Loader2 
          className="w-8 h-8" 
          style={{ color: branding.colors.primary }}
        />
      </motion.div>

      {/* Mensaje */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
        style={{ 
          color: branding.colors.foreground,
          fontFamily: branding.fonts.body
        }}
      >
        {message || texts.common.loading}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: branding.colors.background }}
      >
        {content}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center min-h-[400px]"
      style={{ backgroundColor: branding.colors.background }}
    >
      {content}
    </div>
  );
}
