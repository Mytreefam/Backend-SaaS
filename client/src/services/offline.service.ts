/**
 * SERVICIO DE OFFLINE Y SINCRONIZACIÓN
 * 
 * Gestiona:
 * - Detección de estado de conexión
 * - Cola de acciones offline
 * - Sincronización automática
 * - Almacenamiento en IndexedDB
 */

import { toast } from 'sonner@2.0.3';
import { envelopedFetch } from './http/envelopedFetch';

// ============================================================================
// TIPOS
// ============================================================================

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'order' | 'product' | 'customer' | 'employee' | 'stock';
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface ConnectionStatus {
  online: boolean;
  lastCheck: number;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
}

// ============================================================================
// ESTADO
// ============================================================================

let isOnline = navigator.onLine;
let syncInProgress = false;
let connectionListeners: Array<(status: ConnectionStatus) => void> = [];

// ============================================================================
// INDEXEDDB
// ============================================================================

const DB_NAME = 'udar-edge-offline';
const DB_VERSION = 1;
let db: IDBDatabase | null = null;

/**
 * Inicializa IndexedDB
 */
export async function initOfflineDB(): Promise<void> {
  // Verificar si IndexedDB está disponible
  if (typeof indexedDB === 'undefined') {
    console.warn('⚠️ IndexedDB no disponible en este entorno');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error abriendo IndexedDB:', request.error);
        // Resolver en lugar de rechazar para no bloquear la app
        db = null;
        resolve();
      };

      request.onsuccess = () => {
        db = request.result;
        console.log('✅ IndexedDB inicializado');
        
        // Manejar errores de la base de datos
        db.onerror = (event) => {
          console.error('Error de IndexedDB:', event);
        };
        
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;

        // Store para acciones pendientes
        if (!database.objectStoreNames.contains('offlineActions')) {
          const store = database.createObjectStore('offlineActions', {
            keyPath: 'id',
          });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para datos cacheados
        if (!database.objectStoreNames.contains('cachedData')) {
          const cacheStore = database.createObjectStore('cachedData', {
            keyPath: 'key',
          });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onblocked = () => {
        console.warn('⚠️ IndexedDB bloqueado - cierra otras pestañas de la app');
      };
    } catch (error) {
      console.error('Error inicializando IndexedDB:', error);
      db = null;
      resolve(); // Resolver para no bloquear la app
    }
  });
}

/**
 * Guarda una acción offline para sincronizar después
 */
export async function saveOfflineAction(
  type: OfflineAction['type'],
  entity: OfflineAction['entity'],
  data: any
): Promise<string> {
  if (!db) {
    // Silencioso - generar ID temporal
    return `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  const action: OfflineAction = {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    type,
    entity,
    data,
    timestamp: Date.now(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.add(action);

    request.onsuccess = () => {
      console.log('✅ Acción guardada offline:', action);
      toast.info('Acción guardada. Se sincronizará cuando haya conexión.');
      resolve(action.id);
    };

    request.onerror = () => {
      console.error('Error guardando acción offline:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtiene todas las acciones pendientes de sincronizar
 */
export async function getPendingActions(): Promise<OfflineAction[]> {
  if (!db) {
    // Silenciar warning - es normal que DB no esté lista al inicio
    return []; // Retornar array vacío en lugar de throw
  }

  return new Promise((resolve) => {
    try {
      const transaction = db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.openCursor();
      
      const pendingActions: OfflineAction[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          const action: OfflineAction = cursor.value;
          // Filtrar manualmente por synced = false
          if (action.synced === false) {
            pendingActions.push(action);
          }
          cursor.continue();
        } else {
          // No hay más resultados
          resolve(pendingActions);
        }
      };

      request.onerror = () => {
        console.error('Error obteniendo acciones pendientes:', request.error);
        resolve([]); // Resolver con array vacío en lugar de reject
      };

      transaction.onerror = () => {
        console.error('Error en transacción:', transaction.error);
        resolve([]);
      };
    } catch (error) {
      console.error('Error obteniendo acciones pendientes:', error);
      resolve([]); // Resolver con array vacío en caso de error
    }
  });
}

/**
 * Marca una acción como sincronizada
 */
export async function markActionAsSynced(actionId: string): Promise<void> {
  if (!db) {
    // Silencioso - no hacer nada si DB no está lista
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const getRequest = store.get(actionId);

    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (action) {
        action.synced = true;
        const updateRequest = store.put(action);

        updateRequest.onsuccess = () => {
          console.log('✅ Acción marcada como sincronizada:', actionId);
          resolve();
        };

        updateRequest.onerror = () => {
          reject(updateRequest.error);
        };
      } else {
        resolve();
      }
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
}

/**
 * Elimina acciones sincronizadas antiguas (más de 7 días)
 */
export async function cleanupOldActions(): Promise<void> {
  if (!db) return;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['offlineActions'], 'readwrite');
    const store = transaction.objectStore('offlineActions');
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const action: OfflineAction = cursor.value;
        if (action.synced && action.timestamp < sevenDaysAgo) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        console.log('✅ Acciones antiguas eliminadas');
        resolve();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ============================================================================
// CACHE DE DATOS
// ============================================================================

/**
 * Guarda datos en cache local
 */
export async function cacheData(key: string, data: any): Promise<void> {
  if (!db) {
    // Silencioso - no cachear si DB no está lista
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['cachedData'], 'readwrite');
    const store = transaction.objectStore('cachedData');
    const request = store.put({
      key,
      data,
      timestamp: Date.now(),
    });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Obtiene datos del cache
 */
export async function getCachedData(key: string): Promise<any | null> {
  if (!db) {
    // Silencioso - retornar null si DB no está lista
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['cachedData'], 'readonly');
    const store = transaction.objectStore('cachedData');
    const request = store.get(key);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.data);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// ============================================================================
// DETECCIÓN DE CONEXIÓN
// ============================================================================

/**
 * Obtiene el estado actual de conexión
 */
export function getConnectionStatus(): ConnectionStatus {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  return {
    online: isOnline,
    lastCheck: Date.now(),
    effectiveType: connection?.effectiveType,
  };
}

/**
 * Suscribirse a cambios de estado de conexión
 */
export function onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
  connectionListeners.push(callback);

  // Devolver función para desuscribirse
  return () => {
    connectionListeners = connectionListeners.filter(cb => cb !== callback);
  };
}

/**
 * Notificar a todos los listeners del cambio de estado
 */
function notifyConnectionChange() {
  const status = getConnectionStatus();
  connectionListeners.forEach(callback => callback(status));
}

// ============================================================================
// SINCRONIZACIÓN
// ============================================================================

/**
 * Sincroniza todas las acciones pendientes
 */
export async function syncPendingActions(): Promise<void> {
  if (!db) {
    console.log('⚠️ IndexedDB no disponible - omitiendo sincronización');
    return;
  }

  if (!isOnline) {
    console.log('❌ No hay conexión, no se puede sincronizar');
    return;
  }

  if (syncInProgress) {
    console.log('⏳ Sincronización ya en progreso');
    return;
  }

  syncInProgress = true;
  
  try {
    const actions = await getPendingActions();

    if (actions.length === 0) {
      console.log('✅ No hay acciones pendientes');
      syncInProgress = false;
      return;
    }

    console.log(`🔄 Sincronizando ${actions.length} acciones...`);
    toast.info('Sincronizando datos...');

    let successCount = 0;
    let errorCount = 0;

    for (const action of actions) {
      try {
        await syncSingleAction(action);
        await markActionAsSynced(action.id);
        successCount++;
      } catch (error) {
        console.error('Error sincronizando acción:', action, error);
        errorCount++;
      }
    }

    if (errorCount === 0) {
      toast.success(`✅ ${successCount} acciones sincronizadas correctamente`);
    } else {
      toast.warning(`⚠️ ${successCount} sincronizadas, ${errorCount} con error`);
    }

    // Limpiar acciones antiguas
    await cleanupOldActions();

  } catch (error) {
    console.error('Error en sincronización:', error);
    toast.error('Error al sincronizar datos');
  } finally {
    syncInProgress = false;
  }
}

/**
 * Sincroniza una sola acción con el servidor
 */
async function syncSingleAction(action: OfflineAction): Promise<void> {
  // TODO: Conectar con API real
  console.log('Sincronizando acción:', action);

  const endpoint = `/api/${action.entity}s`;
  let method = 'POST';
  let url = endpoint;

  switch (action.type) {
    case 'create':
      method = 'POST';
      break;
    case 'update':
      method = 'PUT';
      url = `${endpoint}/${action.data.id}`;
      break;
    case 'delete':
      method = 'DELETE';
      url = `${endpoint}/${action.data.id}`;
      break;
  }

  // Simulación
  await new Promise(resolve => setTimeout(resolve, 500));

  // En producción:
  // const response = await fetch(url, {
  //   method,
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //   },
  //   body: JSON.stringify(action.data),
  // });
  // 
  // if (!response.ok) {
  //   throw new Error(`Error ${response.status}: ${response.statusText}`);
  // }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Inicializa el servicio de offline
 */
export async function initOfflineService(): Promise<void> {
  console.log('🔄 Inicializando servicio offline...');

  try {
    // Inicializar IndexedDB
    await initOfflineDB();
  } catch (error) {
    console.error('Error inicializando IndexedDB:', error);
    // Continuar sin IndexedDB
  }

  // Detectar estado inicial
  isOnline = true; // Forzar online para desarrollo
  // isOnline = navigator.onLine;

  // Escuchar cambios de conexión
  window.addEventListener('online', () => {
    console.log('✅ Conexión restaurada');
    isOnline = true;
    notifyConnectionChange();
    toast.success('Conexión restaurada');
    
    // Sincronizar automáticamente solo si DB está inicializado
    if (db) {
      setTimeout(() => {
        syncPendingActions();
      }, 1000);
    }
  });

  window.addEventListener('offline', () => {
    console.log('❌ Sin conexión');
    isOnline = false;
    notifyConnectionChange();
    toast.warning('Sin conexión. Los cambios se guardarán localmente.');
  });

  // Si hay conexión y DB inicializado, sincronizar al iniciar
  if (isOnline && db) {
    setTimeout(() => {
      syncPendingActions();
    }, 2000);
  }

  // Registrar Service Worker (solo en entornos que lo soporten)
  if ('serviceWorker' in navigator) {
    try {
      // Verificar si estamos en un entorno seguro (HTTPS o localhost)
      const isSecureContext = window.isSecureContext || 
                             window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost';
      
      // No intentar registrar en iframes o entornos no seguros
      if (!isSecureContext || window.self !== window.top) {
        console.log('⚠️ Service Worker no disponible en este contexto');
        return;
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registrado:', registration);

      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Mensaje del SW:', event.data);

        if (event.data.type === 'SYNC_COMPLETED') {
          toast.success(event.data.message);
        } else if (event.data.type === 'SYNC_FAILED') {
          toast.error(event.data.message);
        }
      });
    } catch (error) {
      // No mostrar error si es problema de MIME type (entorno de desarrollo)
      if (error instanceof Error && error.message.includes('MIME type')) {
        console.log('⚠️ Service Worker no disponible (MIME type incorrecto)');
      } else {
        console.error('Error registrando Service Worker:', error);
      }
    }
  }

  console.log('✅ Servicio offline inicializado');
}

/**
 * Verifica si el servicio offline está listo
 */
export function isOfflineServiceReady(): boolean {
  return db !== null;
}

/**
 * Comprueba si hay conexión a Internet
 */
export function isConnectionOnline(): boolean {
  return isOnline;
}

/**
 * Fuerza una comprobación de conexión
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await envelopedFetch<unknown>('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
      skipAuth: true,
      responseType: 'none',
    });
    isOnline = true;
  } catch {
    isOnline = false;
  }

  notifyConnectionChange();
  return isOnline;
}
