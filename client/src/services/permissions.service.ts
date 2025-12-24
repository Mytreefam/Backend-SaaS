/**
 * SERVICIO DE GESTIÓN DE PERMISOS NATIVOS
 * 
 * Maneja todos los permisos del dispositivo (cámara, ubicación, notificaciones, etc.)
 */

import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner@2.0.3';
import { t } from '../config/i18n.config';

export type PermissionType = 'camera' | 'location' | 'notifications' | 'storage';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

// ============================================================================
// VERIFICAR PERMISOS
// ============================================================================

/**
 * Verifica si un permiso ya está otorgado
 */
export const checkPermission = async (type: PermissionType): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    // En web, considerar que los permisos están otorgados
    return true;
  }

  try {
    switch (type) {
      case 'camera':
        const cameraStatus = await Camera.checkPermissions();
        return cameraStatus.camera === 'granted';
        
      case 'location':
        const locationStatus = await Geolocation.checkPermissions();
        return locationStatus.location === 'granted';
        
      case 'notifications':
        const notifStatus = await PushNotifications.checkPermissions();
        return notifStatus.receive === 'granted';
        
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${type} permission:`, error);
    return false;
  }
};

// ============================================================================
// SOLICITAR PERMISOS
// ============================================================================

/**
 * Solicita permiso de CÁMARA
 * Usado para: Foto de perfil, escanear documentos, OCR, códigos QR
 */
export const requestCameraPermission = async (): Promise<PermissionResult> => {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true };
  }

  try {
    const status = await Camera.requestPermissions();
    
    if (status.camera === 'granted') {
      toast.success(t('permissions.camera.title'));
      return { granted: true };
    } else {
      toast.error(t('permissions.camera.denied'));
      return {
        granted: false,
        message: t('permissions.camera.deniedDescription'),
      };
    }
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    toast.error(t('errors.generic'));
    return { granted: false };
  }
};

/**
 * Solicita permiso de UBICACIÓN
 * Usado para: Verificar fichaje en punto de venta, "Estoy en tienda"
 */
export const requestLocationPermission = async (): Promise<PermissionResult> => {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true };
  }

  try {
    const status = await Geolocation.requestPermissions();
    
    if (status.location === 'granted') {
      toast.success(t('permissions.location.title'));
      return { granted: true };
    } else {
      toast.error(t('permissions.location.denied'));
      return {
        granted: false,
        message: t('permissions.location.deniedDescription'),
      };
    }
  } catch (error) {
    console.error('Error requesting location permission:', error);
    toast.error(t('errors.generic'));
    return { granted: false };
  }
};

/**
 * Solicita permiso de NOTIFICACIONES
 * Usado para: Push notifications de pedidos, chats, alertas
 */
export const requestNotificationsPermission = async (): Promise<PermissionResult> => {
  if (!Capacitor.isNativePlatform()) {
    return { granted: true };
  }

  try {
    const status = await PushNotifications.requestPermissions();
    
    if (status.receive === 'granted') {
      // Registrar para recibir notificaciones
      await PushNotifications.register();
      toast.success(t('permissions.notifications.title'));
      return { granted: true };
    } else {
      toast.error(t('permissions.notifications.denied'));
      return {
        granted: false,
        message: t('permissions.notifications.deniedDescription'),
      };
    }
  } catch (error) {
    console.error('Error requesting notifications permission:', error);
    toast.error(t('errors.generic'));
    return { granted: false };
  }
};

/**
 * Solicita permiso de ALMACENAMIENTO
 * Usado para: Subir/descargar documentos, fotos, PDFs
 */
export const requestStoragePermission = async (): Promise<PermissionResult> => {
  // En Android 13+ (API 33), no se necesita permiso de almacenamiento para archivos de la app
  // En iOS, siempre se tiene acceso al sandbox de la app
  
  if (!Capacitor.isNativePlatform()) {
    return { granted: true };
  }

  // Para versiones antiguas de Android
  if (Capacitor.getPlatform() === 'android') {
    // TODO: Implementar si es necesario para Android < 13
    return { granted: true };
  }

  return { granted: true };
};

// ============================================================================
// VERIFICAR UBICACIÓN EN TIEMPO REAL
// ============================================================================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface PointOfSale {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // Radio de geofencing (ej: 100 metros)
}

/**
 * Obtiene la ubicación actual del dispositivo
 */
export const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
  if (!Capacitor.isNativePlatform()) {
    // En desarrollo web, retornar ubicación de prueba
    return {
      latitude: 41.3851,
      longitude: 2.1734,
      accuracy: 10,
    };
  }

  try {
    // Verificar permiso primero
    const hasPermission = await checkPermission('location');
    if (!hasPermission) {
      const result = await requestLocationPermission();
      if (!result.granted) {
        return null;
      }
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    toast.error('No se pudo obtener tu ubicación');
    return null;
  }
};

/**
 * Calcula la distancia entre dos puntos (en metros)
 * Usando la fórmula de Haversine
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Verifica si el usuario está en el punto de venta
 * Para fichaje y "Estoy en tienda"
 */
export const verifyLocationInStore = async (
  pointOfSale: PointOfSale
): Promise<{ isInside: boolean; distance?: number; message: string }> => {
  const location = await getCurrentLocation();

  if (!location) {
    return {
      isInside: false,
      message: 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.',
    };
  }

  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    pointOfSale.latitude,
    pointOfSale.longitude
  );

  const isInside = distance <= pointOfSale.radiusMeters;

  if (isInside) {
    return {
      isInside: true,
      distance: Math.round(distance),
      message: `Estás en ${pointOfSale.name} (${Math.round(distance)}m del centro)`,
    };
  } else {
    return {
      isInside: false,
      distance: Math.round(distance),
      message: `Estás a ${Math.round(distance)}m de ${pointOfSale.name}. Debes estar a menos de ${pointOfSale.radiusMeters}m.`,
    };
  }
};

// ============================================================================
// TOMAR FOTO CON CÁMARA
// ============================================================================

export interface PhotoResult {
  dataUrl: string;
  format: string;
}

/**
 * Toma una foto con la cámara del dispositivo
 */
export const takePicture = async (): Promise<PhotoResult | null> => {
  if (!Capacitor.isNativePlatform()) {
    toast.info('Cámara no disponible en web');
    return null;
  }

  try {
    // Verificar permiso
    const hasPermission = await checkPermission('camera');
    if (!hasPermission) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        return null;
      }
    }

    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'DataUrl',
      source: 'CAMERA',
    });

    return {
      dataUrl: image.dataUrl!,
      format: image.format,
    };
  } catch (error) {
    console.error('Error taking picture:', error);
    toast.error('No se pudo tomar la foto');
    return null;
  }
};

/**
 * Selecciona una foto de la galería
 */
export const pickImage = async (): Promise<PhotoResult | null> => {
  if (!Capacitor.isNativePlatform()) {
    toast.info('Galería no disponible en web');
    return null;
  }

  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'DataUrl',
      source: 'PHOTOS',
    });

    return {
      dataUrl: image.dataUrl!,
      format: image.format,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    toast.error('No se pudo seleccionar la imagen');
    return null;
  }
};

// ============================================================================
// ESCANEAR CÓDIGO QR
// ============================================================================

/**
 * Escanea un código QR con la cámara
 * Nota: Requiere plugin adicional @capacitor-community/barcode-scanner
 */
export const scanQRCode = async (): Promise<string | null> => {
  if (!Capacitor.isNativePlatform()) {
    toast.info('Escáner QR no disponible en web');
    return null;
  }

  try {
    // Verificar permiso de cámara
    const hasPermission = await checkPermission('camera');
    if (!hasPermission) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        return null;
      }
    }

    // TODO: Implementar con @capacitor-community/barcode-scanner
    // const result = await BarcodeScanner.scan();
    // return result.content;

    toast.info('Escáner QR - Por implementar con plugin');
    return null;
  } catch (error) {
    console.error('Error scanning QR:', error);
    toast.error('No se pudo escanear el código QR');
    return null;
  }
};

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa el servicio de permisos
 * Llamar al iniciar la app
 */
export const initializePermissionsService = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Permissions] Running on web, skipping native initialization');
    return;
  }

  console.log('[Permissions] Initializing permissions service...');
  
  // Verificar estado de permisos críticos
  const cameraGranted = await checkPermission('camera');
  const locationGranted = await checkPermission('location');
  const notificationsGranted = await checkPermission('notifications');

  console.log('[Permissions] Status:', {
    camera: cameraGranted,
    location: locationGranted,
    notifications: notificationsGranted,
  });
};

// ============================================================================
// ABRIR CONFIGURACIÓN DEL DISPOSITIVO
// ============================================================================

/**
 * Abre la configuración de la app en el dispositivo
 * Para que el usuario pueda habilitar permisos manualmente
 */
export const openAppSettings = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    toast.info('No disponible en web');
    return;
  }

  try {
    // TODO: Implementar con plugin @capacitor/app
    // await App.openSettings();
    toast.info('Abre la configuración de tu dispositivo y busca Udar Edge');
  } catch (error) {
    console.error('Error opening settings:', error);
  }
};
