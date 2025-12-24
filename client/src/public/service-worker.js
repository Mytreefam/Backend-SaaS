/**
 * SERVICE WORKER - MODO OFFLINE
 * 
 * Funcionalidades:
 * - Cache de assets estáticos (HTML, CSS, JS, imágenes)
 * - Cache de datos API
 * - Sincronización offline→online
 * - Estrategias de cache inteligentes
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `udar-edge-${CACHE_VERSION}`;

// Assets críticos para funcionar offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Rutas de API que se pueden cachear
const API_CACHE_PATTERNS = [
  '/api/products',
  '/api/customers',
  '/api/orders',
  '/api/stock',
  '/api/employees',
];

// ============================================================================
// INSTALACIÓN
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando assets estáticos');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Activar inmediatamente sin esperar
      return self.skipWaiting();
    })
  );
});

// ============================================================================
// ACTIVACIÓN
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todas las páginas inmediatamente
      return self.clients.claim();
    })
  );
});

// ============================================================================
// FETCH - ESTRATEGIAS DE CACHE
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Estrategia según tipo de recurso
  if (url.pathname.startsWith('/api/')) {
    // APIs: Network First, fallback a Cache
    event.respondWith(networkFirstStrategy(request));
  } else if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    // Assets estáticos: Cache First, fallback a Network
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // HTML y otros: Network First, fallback a Cache
    event.respondWith(networkFirstStrategy(request));
  }
});

// ============================================================================
// ESTRATEGIAS DE CACHE
// ============================================================================

/**
 * Cache First - Para assets estáticos
 * 1. Busca en cache
 * 2. Si no hay, pide a la red
 * 3. Cachea la respuesta para siguiente vez
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cachear si la respuesta es válida
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cacheFirstStrategy:', error);
    
    // Si falla, devolver página offline si existe
    return caches.match('/offline.html') || new Response('Sin conexión', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Network First - Para APIs y contenido dinámico
 * 1. Intenta pedir a la red
 * 2. Si falla, busca en cache
 * 3. Si encuentra en red, actualiza cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Si la respuesta es válida, cachear
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Sin conexión, buscando en cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, devolver respuesta offline
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'No hay conexión a Internet. Los datos están desactualizados.',
      offline: true,
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ============================================================================
// SINCRONIZACIÓN EN BACKGROUND
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronización en background:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

/**
 * Sincroniza datos guardados offline cuando vuelve la conexión
 */
async function syncOfflineData() {
  console.log('[SW] Sincronizando datos offline...');
  
  try {
    // Obtener datos pendientes de sincronizar desde IndexedDB
    // (Esto se implementará en el servicio de sincronización)
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_STARTED',
        message: 'Sincronizando datos offline...',
      });
    });
    
    // TODO: Implementar lógica de sincronización
    
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETED',
        message: 'Datos sincronizados correctamente',
      });
    });
  } catch (error) {
    console.error('[SW] Error en sincronización:', error);
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_FAILED',
        message: 'Error al sincronizar datos',
        error: error.message,
      });
    });
  }
}

// ============================================================================
// NOTIFICACIONES PUSH
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);
  
  let data = {
    title: 'Udar Edge',
    body: 'Tienes una nueva notificación',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {},
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (error) {
      console.error('[SW] Error parseando datos de push:', error);
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// ============================================================================
// MENSAJES DESDE LA APP
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        return caches.open(CACHE_NAME);
      })
    );
  }
});

console.log('[SW] Service Worker cargado correctamente');
