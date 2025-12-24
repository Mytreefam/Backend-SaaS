/**
 * SPLASH SCREEN - WHITE LABEL (NUEVO DISEÑO)
 * 
 * Pantalla de carga inicial fugaz (2 segundos)
 * Diseño espectacular con logo HoyPecamos y degradado radial
 * 
 * ✅ OPTIMIZADO PARA MÓVILES
 */

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ACTIVE_TENANT } from '../../config/tenant.config';

// Importar logo HoyPecamos (fondo negro)
import logoHoyPecamos from 'figma:asset/a3428b28dbe9517759563dab398d0145766bcbf4.png';
import textoHoyPecamos from 'figma:asset/c51377fad35836fd711cff8bb83c268403db4cac.png';

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const { branding } = ACTIVE_TENANT;

  // 🔥 Detección de móvil para optimización
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  // Optimización: menos partículas en móvil
  const particleCount = isMobile ? 10 : 20;

  useEffect(() => {
    // 🐛 DEBUG: Para testing, pasar directo al login después de 500ms
    console.log('🎬 SplashScreen iniciado');
    const timer = setTimeout(() => {
      console.log('🎬 SplashScreen terminado, llamando onFinish');
      onFinish();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#000000'
      }}
    >
      {/* Grid de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, ${branding.colors.primary} 1px, transparent 1px),
            linear-gradient(to bottom, ${branding.colors.primary} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Partículas flotantes (OPTIMIZADAS) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(particleCount)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: -50,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + 50,
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: branding.colors.primary,
              willChange: 'transform, opacity'
            }}
          />
        ))}
      </div>

      {/* Círculos animados de fondo (OPTIMIZADOS) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 2.5, opacity: 0.02 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute w-[600px] h-[600px] rounded-full border"
        style={{ 
          borderColor: branding.colors.primary,
          borderWidth: '1px',
          willChange: 'transform, opacity'
        }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 2, opacity: 0.03 }}
        transition={{ duration: 2, delay: 0.2, ease: "easeOut" }}
        className="absolute w-96 h-96 rounded-full border"
        style={{ 
          borderColor: branding.colors.primary,
          borderWidth: '1px',
          willChange: 'transform, opacity'
        }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.04 }}
        transition={{ duration: 2, delay: 0.4, ease: "easeOut" }}
        className="absolute w-64 h-64 rounded-full border"
        style={{ 
          borderColor: branding.colors.primary,
          borderWidth: '1px',
          willChange: 'transform, opacity'
        }}
      />

      {/* Logo con animación espectacular */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotateY: -180 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 150, 
          damping: 15,
          duration: 1
        }}
        className={`relative flex flex-col items-center ${isMobile ? 'gap-4' : 'gap-6'}`}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Glow effect detrás del logo (OPTIMIZADO Y SUTIL) */}
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute -inset-8 rounded-full ${isMobile ? 'blur-2xl' : 'blur-3xl'}`}
          style={{ 
            backgroundColor: branding.colors.primary,
            willChange: 'transform, opacity',
            top: isMobile ? '-1.5rem' : '-2rem'
          }}
        />

        {/* 🔥 LOGO HOY PECAMOS con máscara radial - MÁS GRANDE EN MÓVIL */}
        <motion.img
          src={logoHoyPecamos}
          alt={branding.appName}
          className={`object-contain relative z-10 ${isMobile ? 'w-56 h-56' : 'w-56 h-56'}`}
          animate={{ 
            filter: [
              `brightness(1.1) drop-shadow(0 0 15px ${branding.colors.primary}40)`,
              `brightness(1.15) drop-shadow(0 0 20px ${branding.colors.primary}50)`,
              `brightness(1.1) drop-shadow(0 0 15px ${branding.colors.primary}40)`
            ]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            filter: `brightness(1.1) drop-shadow(0 0 15px ${branding.colors.primary}40)`,
            WebkitMaskImage: 'radial-gradient(circle, black 62%, transparent 78%)',
            maskImage: 'radial-gradient(circle, black 62%, transparent 78%)',
            willChange: 'filter'
          }}
        />

        {/* 🔥 TEXTO "HOY PECAMOS" debajo del logo - MÁS GRANDE EN MÓVIL */}
        <motion.img
          src={textoHoyPecamos}
          alt="Hoy Pecamos"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1,
            y: 0,
            filter: [
              `brightness(1.05) drop-shadow(0 0 12px ${branding.colors.primary}35)`,
              `brightness(1.1) drop-shadow(0 0 16px ${branding.colors.primary}45)`,
              `brightness(1.05) drop-shadow(0 0 12px ${branding.colors.primary}35)`
            ]
          }}
          transition={{ 
            opacity: { delay: 0.3, duration: 0.5 },
            y: { delay: 0.3, duration: 0.5 },
            filter: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className={`object-contain relative z-10 ${isMobile ? 'w-48' : 'w-48'}`}
          style={{
            filter: `brightness(1.05) drop-shadow(0 0 12px ${branding.colors.primary}35)`,
            WebkitMaskImage: 'radial-gradient(ellipse 120% 80% at center, black 68%, transparent 88%)',
            maskImage: 'radial-gradient(ellipse 120% 80% at center, black 68%, transparent 88%)',
            willChange: 'filter, opacity'
          }}
        />

        {/* Anillos orbitales alrededor del logo (OPTIMIZADOS) */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`orbital-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [1, 1.8, 2.5],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut"
            }}
            className="absolute border-2 rounded-full"
            style={{ 
              borderColor: branding.colors.primary,
              willChange: 'transform, opacity',
              inset: isMobile ? '-0.5rem' : '-1rem',
              top: isMobile ? '-1.5rem' : '-2rem',
              bottom: isMobile ? '2rem' : '3rem'
            }}
          />
        ))}
      </motion.div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30 pointer-events-none" />

      {/* 🏢 POWERED BY UDAR EDGE */}
      <div
        className="absolute bottom-6 left-0 right-0 text-center z-50"
        style={{
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.6
        }}
      >
        POWERED BY UDAREDGE
      </div>
    </div>
  );
}