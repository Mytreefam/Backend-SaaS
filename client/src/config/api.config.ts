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
  BASE_URL: 'http://localhost:4000',
  
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
    
    // Clientes
    CLIENTES: '/clientes',
    CLIENTE_BY_ID: (id: string) => `/clientes/${id}`,
    CLIENTE_PEDIDOS: (id: string) => `/clientes/${id}/pedidos`,
    CLIENTE_PROMOCIONES: (id: string) => `/clientes/${id}/promociones`,
    CLIENTE_NOTIFICACIONES: (id: string) => `/clientes/${id}/notificaciones`,
    CLIENTE_TURNO_ACTIVO: (id: string) => `/clientes/${id}/turno-activo`,
    
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
    
    // Mensajes/Chat
    MENSAJES: '/mensajes',
    CHATS: '/chats',
    
    // Turnos
    TURNOS: '/turnos',
    
    // Garaje
    GARAJES: '/garajes',
    
    // Documentos
    DOCUMENTOS: '/documentos',
    
    // Presupuestos
    PRESUPUESTOS: '/presupuestos',
    
    // Upload
    UPLOAD: '/upload',

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
  // Intentar desde localStorage primero
  const token = localStorage.getItem('auth_token');
  if (token) return token;
  
  // Luego desde sessionStorage
  const sessionToken = sessionStorage.getItem('auth_token');
  if (sessionToken) return sessionToken;
  
  return null;
}

/**
 * Guarda el token de autenticación
 */
export function setAuthToken(token: string, remember: boolean = false): void {
  if (remember) {
    localStorage.setItem('auth_token', token);
  } else {
    sessionStorage.setItem('auth_token', token);
  }
}

/**
 * Elimina el token de autenticación
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
}

/**
 * Verifica si hay un token válido
 */
export function hasAuthToken(): boolean {
  return !!getAuthToken();
}
