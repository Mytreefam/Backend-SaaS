/**
 * 🔧 CONFIGURACIÓN DE API
 * 
 * Configuración centralizada para la conexión con el backend
 */

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

export const API_CONFIG = {
  // URL base del backend
  BASE_URL: (() => {
    const envBase = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;

    // Default: same-origin behind nginx (/sass/api -> 127.0.0.1:4000)
    const defaultBase =
      typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/sass/api`
        : 'https://mytreefam.com/sass/api';

    const raw = (envBase || defaultBase).trim();
    // Avoid double slashes when concatenating with endpoints like "/auth/login"
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
  })(),
  
  // Timeout de peticiones (30 segundos)
  TIMEOUT: 30000,
  
  // Reintentos automáticos
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  
  // Headers por defecto
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configuración de caché
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  
  // Endpoints
  ENDPOINTS: {
    // Autenticación
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
    AUTH_SESSIONS: '/auth/sessions',
    AUTH_SESSIONS_REVOKE_ALL: '/auth/sessions/revoke-all',
    
    // Clientes
    CLIENTES: '/clientes',
    CLIENTE_BY_ID: (id: string) => `/clientes/${id}`,
    CLIENTE_PEDIDOS: (id: string) => `/clientes/${id}/pedidos`,
    CLIENTE_PROMOCIONES: (id: string) => `/clientes/${id}/promociones`,
    CLIENTE_NOTIFICACIONES: (id: string) => `/clientes/${id}/notificaciones`,
    CLIENTE_TURNO_ACTIVO: (id: string) => `/clientes/${id}/turno-activo`,
    CLIENTE_DIRECCIONES: (id: string) => `/clientes/${id}/direcciones`,
    CLIENTE_DIRECCION_BY_ID: (id: string, direccionId: string) => `/clientes/${id}/direcciones/${direccionId}`,
    
    // Productos
    PRODUCTOS: '/productos',
    PRODUCTO_BY_ID: (id: string) => `/productos/${id}`,
    
    // Pedidos
    PEDIDOS: '/pedidos',
    PEDIDO_BY_ID: (id: string) => `/pedidos/${id}`,
    
    // Cupones
    CUPONES: '/cupones',
    CUPON_VALIDAR: '/cupones/validar',
    
    // Promociones
    PROMOCIONES: '/promociones',
    
    // Citas
    CITAS: '/citas',
    CITA_BY_ID: (id: string) => `/citas/${id}`,
    
    // Facturas
    FACTURAS: '/facturas',
    FACTURA_BY_ID: (id: string) => `/facturas/${id}`,
    
    // Notificaciones
    NOTIFICACIONES: '/notificaciones',
    NOTIFICACIONES_PREFERENCIAS: '/notificaciones/preferences',
    NOTIFICACIONES_DEVICES: '/notificaciones/devices',
    NOTIFICACIONES_TEST: '/notificaciones/test',
    
    // Mensajes/Chat
    MENSAJES: '/mensajes',
    CHATS: '/chats',
    
    // Turnos
    TURNOS: '/turnos',

    // Uploads
    UPLOAD: '/upload',
    
    // Garaje
    GARAJES: '/garajes',
    
    // Documentos
    DOCUMENTOS: '/documentos',
    
    // Presupuestos
    PRESUPUESTOS: '/presupuestos',
    
    // Caja
    CIERRE_CAJA: '/caja',
  }
} as const;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Construye la URL completa para un endpoint
 */
export function buildUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * Obtiene el token de autenticación almacenado
 */
export function getAuthToken(): string | null {
  const keys = ['auth_token', 'taller360_auth_token', 'token', 'access_token'] as const;

  // Intentar desde localStorage primero
  for (const k of keys) {
    const token = localStorage.getItem(k);
    if (token) return token;
  }

  // Luego desde sessionStorage
  for (const k of keys) {
    const token = sessionStorage.getItem(k);
    if (token) return token;
  }

  return null;
}

/**
 * Guarda el token de autenticación
 */
export function setAuthToken(token: string, remember: boolean = false): void {
  if (remember) {
    localStorage.setItem('auth_token', token);
    // Legacy compat keys (some flows stored token under 'token')
    localStorage.setItem('token', token);
    localStorage.setItem('taller360_auth_token', token);
  } else {
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('taller360_auth_token', token);
  }
}

/**
 * Elimina el token de autenticación
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('taller360_auth_token');
  sessionStorage.removeItem('taller360_auth_token');
  // OAuth legacy
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('refreshToken');
}

/**
 * Verifica si hay un token válido
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken();
}
