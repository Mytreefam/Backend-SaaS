/**
 * SERVICIO DE NOTIFICACIONES PUSH
 * 
 * Gestiona:
 * - Firebase Cloud Messaging (FCM)
 * - Permisos de notificaciones
 * - Tokens de dispositivo
 * - Manejo de notificaciones foreground/background
 * - Notificaciones locales
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export interface NotificationPayload {
  title: string;
  body: string;
  data?: any;
  image?: string;
  icon?: string;
  badge?: string;
  sound?: string;
  vibrate?: number[];
}

export interface NotificationAction {
  id: string;
  title: string;
  type?: 'foreground' | 'destructive';
}

// ============================================================================
// ESTADO
// ============================================================================

let fcmToken: string | null = null;
let notificationListeners: Array<(notification: NotificationPayload) => void> = [];

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa el servicio de notificaciones push
 */
export async function initPushNotifications(): Promise<void> {
  console.log('🔔 Inicializando notificaciones push...');

  if (!Capacitor.isNativePlatform()) {
    console.log('⚠️ Push notifications solo disponibles en plataformas nativas');
    await initWebPushNotifications();
    return;
  }

  try {
    // 1. Verificar y solicitar permisos
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('❌ Permisos de notificaciones denegados');
      return;
    }

    // 2. Registrar para push notifications
    await PushNotifications.register();

    // 3. Listeners
    setupPushListeners();

    console.log('✅ Notificaciones push inicializadas');
  } catch (error) {
    console.error('Error inicializando push notifications:', error);
  }
}

/**
 * Configura los listeners de notificaciones
 */
function setupPushListeners(): void {
  // Token recibido (FCM token)
  PushNotifications.addListener('registration', (token) => {
    console.log('✅ FCM Token recibido:', token.value);
    fcmToken = token.value;
    
    // Guardar token en localStorage
    localStorage.setItem('fcm_token', token.value);
    
    // Enviar token al servidor
    sendTokenToServer(token.value);
  });

  // Error en registro
  PushNotifications.addListener('registrationError', (error) => {
    console.error('❌ Error en registro de push:', error);
  });

  // Notificación recibida (foreground)
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('📨 Notificación recibida (foreground):', notification);
    
    const payload: NotificationPayload = {
      title: notification.title || 'Nueva notificación',
      body: notification.body || '',
      data: notification.data,
    };

    // Notificar a los listeners
    notificationListeners.forEach(listener => listener(payload));

    // Mostrar toast
    toast(payload.title, {
      description: payload.body,
      duration: 5000,
    });

    // Mostrar notificación local si la app está en foreground
    showLocalNotification(payload);
  });

  // Notificación clickeada
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('👆 Click en notificación:', action);
    
    const notification = action.notification;
    const payload: NotificationPayload = {
      title: notification.title || '',
      body: notification.body || '',
      data: notification.data,
    };

    // Manejar acción
    handleNotificationClick(payload, action.actionId);
  });
}

// ============================================================================
// NOTIFICACIONES WEB (PWA)
// ============================================================================

/**
 * Inicializa notificaciones web para PWA
 */
async function initWebPushNotifications(): Promise<void> {
  if (!('Notification' in window)) {
    console.log('❌ Notificaciones no soportadas en este navegador');
    return;
  }

  if (Notification.permission === 'granted') {
    console.log('✅ Permisos de notificaciones ya otorgados');
    registerServiceWorkerPush();
  } else if (Notification.permission !== 'denied') {
    console.log('⚠️ Permisos de notificaciones pendientes');
  }
}

/**
 * Solicita permisos de notificaciones web
 */
export async function requestWebNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('✅ Permisos de notificaciones otorgados');
    registerServiceWorkerPush();
    return true;
  }

  return false;
}

/**
 * Registra push en el Service Worker
 */
async function registerServiceWorkerPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // TODO: Configurar VAPID keys de Firebase
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    // });
    
    // sendSubscriptionToServer(subscription);
    
    console.log('✅ Push subscription creada');
  } catch (error) {
    console.error('Error creando push subscription:', error);
  }
}

// ============================================================================
// NOTIFICACIONES LOCALES
// ============================================================================

/**
 * Inicializa notificaciones locales
 */
export async function initLocalNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const granted = await LocalNotifications.requestPermissions();
    
    if (granted.display === 'granted') {
      console.log('✅ Permisos de notificaciones locales otorgados');
      
      // Listener para clicks en notificaciones locales
      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('👆 Click en notificación local:', action);
        handleNotificationClick(action.notification.extra, action.actionId);
      });
    }
  } catch (error) {
    console.error('Error inicializando notificaciones locales:', error);
  }
}

/**
 * Muestra una notificación local
 */
export async function showLocalNotification(payload: NotificationPayload): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    // En web, usar Web Notifications API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/badge-72.png',
        data: payload.data,
        vibrate: payload.vibrate || [200, 100, 200],
      });
    }
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: payload.title,
          body: payload.body,
          extra: payload.data,
          smallIcon: payload.icon,
          largeIcon: payload.image,
          sound: payload.sound,
        },
      ],
    });
  } catch (error) {
    console.error('Error mostrando notificación local:', error);
  }
}

/**
 * Programa una notificación local para el futuro
 */
export async function scheduleLocalNotification(
  payload: NotificationPayload,
  scheduleAt: Date
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('⚠️ Scheduled notifications solo disponibles en nativo');
    return;
  }

  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: Date.now(),
          title: payload.title,
          body: payload.body,
          extra: payload.data,
          schedule: {
            at: scheduleAt,
          },
        },
      ],
    });
    
    console.log('✅ Notificación programada para:', scheduleAt);
  } catch (error) {
    console.error('Error programando notificación:', error);
  }
}

/**
 * Cancela todas las notificaciones locales pendientes
 */
export async function cancelAllLocalNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const pending = await LocalNotifications.getPending();
    const ids = pending.notifications.map(n => n.id);
    
    if (ids.length > 0) {
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      console.log(`✅ ${ids.length} notificaciones canceladas`);
    }
  } catch (error) {
    console.error('Error cancelando notificaciones:', error);
  }
}

// ============================================================================
// MANEJO DE NOTIFICACIONES
// ============================================================================

/**
 * Maneja el click en una notificación
 */
function handleNotificationClick(payload: NotificationPayload, actionId?: string): void {
  console.log('👆 Manejando click en notificación:', payload, actionId);

  // TODO: Implementar navegación según tipo de notificación
  
  if (payload.data?.type === 'new_order') {
    // Navegar a pedidos
    window.location.href = '#/pedidos';
  } else if (payload.data?.type === 'low_stock') {
    // Navegar a stock
    window.location.href = '#/stock';
  } else if (payload.data?.type === 'employee_request') {
    // Navegar a empleados
    window.location.href = '#/empleados';
  }
}

/**
 * Suscribirse a notificaciones recibidas
 */
export function onNotificationReceived(
  callback: (notification: NotificationPayload) => void
): () => void {
  notificationListeners.push(callback);

  return () => {
    notificationListeners = notificationListeners.filter(cb => cb !== callback);
  };
}

// ============================================================================
// TOKEN Y SERVIDOR
// ============================================================================

/**
 * Obtiene el FCM token actual
 */
export function getFCMToken(): string | null {
  return fcmToken || localStorage.getItem('fcm_token');
}

/**
 * Envía el token al servidor
 */
async function sendTokenToServer(token: string): Promise<void> {
  try {
    // TODO: Conectar con API
    console.log('📤 Enviando token al servidor:', token);
    
    // const response = await fetch('/api/devices/register', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
    //   },
    //   body: JSON.stringify({
    //     token,
    //     platform: Capacitor.getPlatform(),
    //     userId: getCurrentUserId(),
    //   }),
    // });
    
    // if (response.ok) {
    //   console.log('✅ Token registrado en servidor');
    // }
  } catch (error) {
    console.error('Error enviando token al servidor:', error);
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte VAPID key a Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Obtiene el badge count actual
 */
export async function getBadgeCount(): Promise<number> {
  if (!Capacitor.isNativePlatform()) {
    return 0;
  }

  try {
    const result = await PushNotifications.getDeliveredNotifications();
    return result.notifications.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Limpia el badge count
 */
export async function clearBadgeCount(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await PushNotifications.removeAllDeliveredNotifications();
  } catch (error) {
    console.error('Error limpiando badge count:', error);
  }
}

/**
 * Comprueba si las notificaciones están habilitadas
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const status = await PushNotifications.checkPermissions();
    return status.receive === 'granted';
  } else if ('Notification' in window) {
    return Notification.permission === 'granted';
  }
  
  return false;
}
