/**
 * ONBOARDING - WHITE LABEL
 * 
 * Diseño 100% adaptable según el tenant activo
 * Soporta: HoyPecamos, Udar Edge, y todos los tenants configurados
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ACTIVE_TENANT } from '../../config/tenant.config';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronRight, Check, X } from 'lucide-react';

interface OnboardingProps {
  onFinish: () => void;
  onSkip: () => void;
}

// Imágenes profesionales de Unsplash para HoyPecamos (pizzas/burgers)
const backgroundImages = [
  'https://images.unsplash.com/photo-1700513971603-eda40374ba0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGJ1cmdlciUyMGZvb2QlMjB0YWJsZSUyMGZlYXN0JTIwY29sb3JmdWx8ZW58MXx8fHwxNzY0NjMzOTI5fDA&ixlib=rb-4.1.0&q=80&w=1080', // Mesa con pizzas y burgers juntos
  'https://images.unsplash.com/photo-1703575572016-b82f05e6d4f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXN0JTIwZm9vZCUyMHBpenphJTIwYnVyZ2VyJTIwZnJpZXMlMjB0YWJsZSUyMHZhcmlldHl8ZW58MXx8fHwxNzY0NjMzOTMwfDA&ixlib=rb-4.1.0&q=80&w=1080', // Variedad fast food: pizza, burger, fries
  'https://images.unsplash.com/photo-1654683413645-d8d15189384c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwZGVsaXZlcnklMjBzbWFydHBob25lJTIwYXBwJTIwb3JkZXJ8ZW58MXx8fHwxNzY0NjMzNTgzfDA&ixlib=rb-4.1.0&q=80&w=1080', // Delivery app
  'https://images.unsplash.com/photo-1638981368648-d6279e23f294?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGNoZWYlMjBtYWtpbmclMjBwaXp6YSUyMG92ZW4lMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzY0NjM0NDIwfDA&ixlib=rb-4.1.0&q=80&w=1080', // Pizzero profesional haciendo pizzas
];

export function Onboarding({ onFinish, onSkip }: OnboardingProps) {
  const { branding, texts } = ACTIVE_TENANT;
  const [currentScreen, setCurrentScreen] = useState(0);
  const slides = texts.onboarding.slides;
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Detectar swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentScreen < slides.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentScreen > 0) {
      handlePrev();
    }
  };

  const handleNext = () => {
    if (currentScreen < slides.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const currentSlide = slides[currentScreen];

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col">
      {/* 🔥 FONDO PERMANENTE - Patrón de líneas horizontales rojas (scanlines) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: '#000000',
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${branding.colors.primary} 2px,
            ${branding.colors.primary} 3px
          )`
        }}
      />

      {/* Imagen de fondo profesional con overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          className="absolute inset-0"
        >
          <ImageWithFallback
            src={backgroundImages[currentScreen]}
            alt="Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay con el color corporativo */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                ${branding.colors.background}E6 0%, 
                ${branding.colors.background}99 40%, 
                ${branding.colors.background}CC 60%, 
                ${branding.colors.background}F2 100%)`
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Header con logo */}
      <div className="relative z-10 flex justify-between items-center px-5 py-6">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Logo - Solo mostrar si no es 'devil-heart' */}
          {typeof branding.logo === 'string' && branding.logo.startsWith('figma:asset') ? (
            <img 
              src={branding.logo} 
              alt={branding.appName} 
              className="h-12 w-auto drop-shadow-2xl"
            />
          ) : branding.logo !== 'devil-heart' ? (
            <div className="text-5xl drop-shadow-2xl">{branding.logo}</div>
          ) : null}
        </motion.div>
        
        {currentScreen < slides.length - 1 && (
          <motion.button
            onClick={onSkip}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-4 py-2 rounded-lg transition-all backdrop-blur-xl"
            style={{ 
              color: branding.colors.primary,
              backgroundColor: `${branding.colors.foreground}20`,
              border: `1px solid ${branding.colors.primary}40`
            }}
          >
            <div className="flex items-center gap-2">
              <X className="w-4 h-4" />
              <span className="text-sm">{texts.onboarding.skip}</span>
            </div>
          </motion.button>
        )}
      </div>

      {/* Contenido principal - Centrado abajo */}
      <div 
        className="relative z-10 flex-1 flex flex-col justify-end px-6 overflow-y-auto pb-[260px] md:pb-[300px]" 
        onTouchStart={onTouchStart} 
        onTouchMove={onTouchMove} 
        onTouchEnd={onTouchEnd}
      >
        <div
          key={currentScreen}
          className="space-y-6 max-w-lg mx-auto w-full"
        >
          {/* Título */}
          <h2
            className="text-4xl md:text-5xl leading-tight drop-shadow-2xl"
            style={{ 
              color: branding.colors.foreground,
              fontFamily: branding.fonts.heading
            }}
          >
            {currentSlide.title}
          </h2>

          {/* Descripción */}
          <p
            className="text-lg md:text-xl leading-relaxed drop-shadow-lg"
            style={{ 
              color: `${branding.colors.foreground}E6`,
              fontFamily: branding.fonts.body
            }}
          >
            {currentSlide.description}
          </p>
        </div>
      </div>

      {/* Footer con indicadores y botón - POSICIÓN FIJA */}
      <div className="fixed bottom-0 md:bottom-12 left-0 right-0 z-20 px-6 pb-8 md:pb-12 space-y-6" style={{ backgroundColor: 'transparent' }}>
        {/* Indicadores de progreso */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (index !== currentScreen) {
                  setCurrentScreen(index);
                }
              }}
              className="h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index === currentScreen 
                  ? branding.colors.primary 
                  : `${branding.colors.foreground}30`,
                width: index === currentScreen ? '32px' : '8px',
                boxShadow: index === currentScreen ? `0 0 15px ${branding.colors.primary}80` : 'none'
              }}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Botón principal */}
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 transition-all touch-manipulation"
          style={{
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryForeground,
            fontFamily: branding.fonts.body,
            boxShadow: `0 10px 40px ${branding.colors.primary}60`
          }}
        >
          {currentScreen === slides.length - 1 ? (
            <>
              <Check className="w-5 h-5" />
              <span className="text-lg">{texts.onboarding.getStarted}</span>
            </>
          ) : (
            <>
              <span className="text-lg">{texts.onboarding.next}</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Hint de swipe - SIEMPRE VISIBLE para mantener altura constante */}
        <div className="h-5 md:hidden">
          {currentScreen < slides.length - 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm"
              style={{ color: `${branding.colors.foreground}60` }}
            >
              o desliza para continuar →
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}