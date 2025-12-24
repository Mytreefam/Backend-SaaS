/**
 * UDAR EDGE - Servicio API Base
 * 
 * Maneja todas las peticiones HTTP al backend.
 * Incluye:
 * - Autenticación automática
 * - Manejo de errores
 * - Retry logic
 * - Caché
 * - Offline support
 */

import { saveOfflineAction, isConnectionOnline } from './offline.service';
import { toast } from 'sonner@2.0.3';
import { API_CONFIG, buildUrl, getAuthToken } from '../config/api.config';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const API_URL = API_CONFIG.BASE_URL;
const API_TIMEOUT = API_CONFIG.TIMEOUT;
const MAX_RETRIES = API_CONFIG.MAX_RETRIES;
const RETRY_DELAY = API_CONFIG.RETRY_DELAY;

// ============================================================================
// TIPOS
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipOffline?: boolean;
  retry?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene el token de autenticación
 * (Ahora importado desde api.config.ts)
 */

/**
 * Construye headers de la petición
 */
function buildHeaders(skipAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Maneja errores de API
 */
function handleApiError(error: any): ApiError {
  console.error('API Error:', error);
  
  // Error de red (sin conexión)
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Error de conexión. Verifica tu internet.',
      status: 0,
    };
  }
  
  // Error HTTP
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: error.message || 'Datos inválidos',
          status: 400,
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Sesión expirada. Inicia sesión nuevamente.',
          status: 401,
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para realizar esta acción',
          status: 403,
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: 'Recurso no encontrado',
          status: 404,
        };
      case 422:
        return {
          code: 'VALIDATION_ERROR',
          message: error.message || 'Error de validación',
          status: 422,
          details: error.details,
        };
      case 429:
        return {
          code: 'RATE_LIMIT',
          message: 'Demasiadas peticiones. Intenta más tarde.',
          status: 429,
        };
      case 500:
        return {
          code: 'SERVER_ERROR',
          message: 'Error del servidor. Intenta más tarde.',
          status: 500,
        };
      case 503:
        return {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Servicio no disponible. Intenta más tarde.',
          status: 503,
        };
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Error desconocido',
          status: error.status,
        };
    }
  }
  
  // Error genérico
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Error desconocido',
  };
}

/**
 * Espera un tiempo antes de reintentar
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// PETICIONES HTTP
// ============================================================================

/**
 * Petición GET
 */
export async function get<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders(options.skipAuth);
    
    // Verificar conexión
    if (!isConnectionOnline() && !options.skipOffline) {
      throw new Error('Sin conexión a internet');
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw { status: response.status, ...error };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    
    // Retry si está configurado
    if (options.retry && apiError.code === 'NETWORK_ERROR') {
      for (let i = 0; i < MAX_RETRIES; i++) {
        await delay(RETRY_DELAY * (i + 1));
        try {
          return await get<T>(endpoint, { ...options, retry: false });
        } catch {
          // Continuar al siguiente retry
        }
      }
    }
    
    return {
      success: false,
      error: apiError.code,
      message: apiError.message,
    };
  }
}

/**
 * Petición POST
 */
export async function post<T = any>(
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders(options.skipAuth);
    
    // Si no hay conexión, guardar offline
    if (!isConnectionOnline() && !options.skipOffline) {
      await saveOfflineAction('create', getEntityFromEndpoint(endpoint), data);
      toast.warning('Sin conexión. Cambios guardados localmente.');
      
      return {
        success: true,
        data: { ...data, id: `temp-${Date.now()}` } as T,
        message: 'Guardado offline',
      };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw { status: response.status, ...error };
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    
    // Mostrar error al usuario
    toast.error(apiError.message);
    
    return {
      success: false,
      error: apiError.code,
      message: apiError.message,
    };
  }
}

/**
 * Petición PUT
 */
export async function put<T = any>(
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders(options.skipAuth);
    
    // Si no hay conexión, guardar offline
    if (!isConnectionOnline() && !options.skipOffline) {
      await saveOfflineAction('update', getEntityFromEndpoint(endpoint), data);
      toast.warning('Sin conexión. Cambios guardados localmente.');
      
      return {
        success: true,
        data: data as T,
        message: 'Guardado offline',
      };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw { status: response.status, ...error };
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    toast.error(apiError.message);
    
    return {
      success: false,
      error: apiError.code,
      message: apiError.message,
    };
  }
}

/**
 * Petición DELETE
 */
export async function del<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders(options.skipAuth);
    
    // Si no hay conexión, guardar offline
    if (!isConnectionOnline() && !options.skipOffline) {
      const id = endpoint.split('/').pop();
      await saveOfflineAction('delete', getEntityFromEndpoint(endpoint), { id });
      toast.warning('Sin conexión. Cambios guardados localmente.');
      
      return {
        success: true,
        message: 'Eliminado offline',
      };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw { status: response.status, ...error };
    }
    
    const responseData = await response.json().catch(() => ({}));
    
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    toast.error(apiError.message);
    
    return {
      success: false,
      error: apiError.code,
      message: apiError.message,
    };
  }
}

/**
 * Petición PATCH
 */
export async function patch<T = any>(
  endpoint: string,
  data: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders(options.skipAuth);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw { status: response.status, ...error };
    }
    
    const responseData = await response.json();
    
    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    const apiError = handleApiError(error);
    toast.error(apiError.message);
    
    return {
      success: false,
      error: apiError.code,
      message: apiError.message,
    };
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Extrae el tipo de entidad del endpoint
 */
function getEntityFromEndpoint(endpoint: string): 'order' | 'product' | 'customer' | 'employee' | 'stock' {
  if (endpoint.includes('order')) return 'order';
  if (endpoint.includes('product')) return 'product';
  if (endpoint.includes('customer')) return 'customer';
  if (endpoint.includes('employee')) return 'employee';
  if (endpoint.includes('stock')) return 'stock';
  
  return 'order'; // default
}

/**
 * Verifica el estado de salud del backend
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await get('/health', { skipAuth: true, retry: false });
    return response.success;
  } catch {
    return false;
  }
}

/**
 * Configura el token de autenticación
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Elimina el token de autenticación
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// ============================================================================
// EXPORTAR TODO
// ============================================================================

export const apiService = {
  get,
  post,
  put,
  patch,
  del,
  delete: del,
  healthCheck,
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
};

export default apiService;
