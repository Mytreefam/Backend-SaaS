import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Hook para feedback háptico (vibración)
 * Mejora la UX con feedback táctil en acciones importantes
 */
export const useHaptics = () => {

  /**
   * Impacto ligero (selección de items, cambio de tabs)
   */
  const light = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('[Haptics] Error en impacto ligero:', error);
    }
  };

  /**
   * Impacto medio (botones, acciones normales)
   */
  const medium = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('[Haptics] Error en impacto medio:', error);
    }
  };

  /**
   * Impacto fuerte (acciones importantes, confirmaciones)
   */
  const heavy = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('[Haptics] Error en impacto fuerte:', error);
    }
  };

  /**
   * Notificación de éxito
   */
  const success = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('[Haptics] Error en notificación de éxito:', error);
    }
  };

  /**
   * Notificación de advertencia
   */
  const warning = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('[Haptics] Error en notificación de advertencia:', error);
    }
  };

  /**
   * Notificación de error
   */
  const error = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('[Haptics] Error en notificación de error:', error);
    }
  };

  /**
   * Vibración de selección (como el picker de iOS)
   */
  const selection = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (error) {
      console.error('[Haptics] Error en vibración de selección:', error);
    }
  };

  /**
   * Vibración larga personalizada (para confirmaciones importantes)
   */
  const vibrateLong = async (duration: number = 500) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('[Haptics] Error en vibración larga:', error);
    }
  };

  // Casos de uso comunes
  const onButtonPress = medium;
  const onSuccess = success;
  const onError = error;
  const onWarning = warning;
  const onTabChange = light;
  const onSwipe = light;
  const onDelete = heavy;
  const onConfirm = heavy;

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    vibrateLong,
    // Alias para casos de uso
    onButtonPress,
    onSuccess,
    onError,
    onWarning,
    onTabChange,
    onSwipe,
    onDelete,
    onConfirm,
  };
};
