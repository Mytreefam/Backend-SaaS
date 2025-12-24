/**
 * 👋 ONBOARDING SCREENS
 * Pantallas de bienvenida personalizadas por tenant
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';
import { ACTIVE_TENANT } from '../config/tenant.config';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingScreen({ onComplete, onSkip }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { branding, texts } = ACTIVE_TENANT;
  const slides = texts.onboarding.slides;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip?.();
    onComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: branding.colors.background }}
    >
      {/* Header con botón Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
          style={{ 
            color: branding.colors.foreground,
            backgroundColor: branding.colors.muted
          }}
        >
          <X className="w-4 h-4" />
          <span className="text-sm">{texts.onboarding.skip}</span>
        </button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full flex flex-col items-center text-center"
          >
            {/* Imagen decorativa (opcional) */}
            {branding.images.onboardingSlides?.[currentSlide] && (
              <div className="mb-8">
                <ImageWithFallback
                  src={branding.images.onboardingSlides[currentSlide]}
                  alt={slides[currentSlide].title}
                  className="w-64 h-64 object-contain mx-auto"
                />
              </div>
            )}

            {/* Ilustración con color del tenant si no hay imagen */}
            {!branding.images.onboardingSlides?.[currentSlide] && (
              <div 
                className="w-48 h-48 rounded-full mb-8 flex items-center justify-center"
                style={{ 
                  backgroundColor: `${branding.colors.primary}20`,
                }}
              >
                <div 
                  className="text-6xl"
                  style={{ color: branding.colors.primary }}
                >
                  {currentSlide === 0 && '👋'}
                  {currentSlide === 1 && '✨'}
                  {currentSlide === 2 && '🚀'}
                </div>
              </div>
            )}

            {/* Título */}
            <h2
              className="text-3xl mb-4"
              style={{ 
                color: branding.colors.foreground,
                fontFamily: branding.fonts.heading
              }}
            >
              {slides[currentSlide].title}
            </h2>

            {/* Descripción */}
            <p
              className="text-lg opacity-80 leading-relaxed"
              style={{ 
                color: branding.colors.foreground,
                fontFamily: branding.fonts.body
              }}
            >
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer con indicadores y botón */}
      <div className="p-6 pb-8">
        {/* Indicadores de progreso */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className="h-2 rounded-full transition-all"
              style={{
                backgroundColor: index === currentSlide 
                  ? branding.colors.primary 
                  : branding.colors.muted,
                width: index === currentSlide ? '32px' : '8px',
              }}
              animate={{
                width: index === currentSlide ? '32px' : '8px',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Botón siguiente/empezar */}
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg"
          style={{
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryForeground,
            fontFamily: branding.fonts.body,
          }}
        >
          <span className="text-lg">
            {currentSlide < slides.length - 1 
              ? texts.onboarding.next 
              : texts.onboarding.getStarted
            }
          </span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
