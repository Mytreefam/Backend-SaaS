import { useEffect, useState } from 'react';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';
import { Capacitor } from '@capacitor/core';

/**
 * Hook para gestionar el teclado virtual
 * Detecta cuando se muestra/oculta y ajusta la UI
 */
export const useKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Listener cuando el teclado se muestra
    const showListener = Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(info.keyboardHeight);
      console.log('[Keyboard] Teclado mostrado, altura:', info.keyboardHeight);
    });

    // Listener cuando el teclado se oculta
    const hideListener = Keyboard.addListener('keyboardWillHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      console.log('[Keyboard] Teclado oculto');
    });

    // Cleanup
    return () => {
      showListener.then(l => l.remove());
      hideListener.then(l => l.remove());
    };
  }, []);

  /**
   * Ocultar teclado manualmente
   */
  const hideKeyboard = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('[Keyboard] Error ocultando teclado:', error);
    }
  };

  /**
   * Mostrar teclado manualmente
   */
  const showKeyboard = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Keyboard.show();
    } catch (error) {
      console.error('[Keyboard] Error mostrando teclado:', error);
    }
  };

  /**
   * Configurar comportamiento del teclado
   */
  const setAccessoryBarVisible = async (visible: boolean) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Keyboard.setAccessoryBarVisible({ isVisible: visible });
    } catch (error) {
      console.error('[Keyboard] Error configurando accessory bar:', error);
    }
  };

  /**
   * Configurar si el teclado empuja el contenido o lo overlay
   */
  const setResizeMode = async (mode: 'native' | 'body' | 'ionic' | 'none') => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await Keyboard.setResizeMode({ mode });
    } catch (error) {
      console.error('[Keyboard] Error configurando resize mode:', error);
    }
  };

  return {
    isKeyboardVisible,
    keyboardHeight,
    hideKeyboard,
    showKeyboard,
    setAccessoryBarVisible,
    setResizeMode,
  };
};
