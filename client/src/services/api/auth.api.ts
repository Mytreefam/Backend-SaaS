/**
 * 🔐 API CLIENT - AUTENTICACIÓN
 * 
 * Maneja el login, logout y gestión de sesiones
 */

import { API_CONFIG, buildUrl, setAuthToken, clearAuthToken } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';
import { envelopedFetch } from '../http/envelopedFetch';

// ============================================================================
// TIPOS
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  id: string;
  nombre: string;
  email: string;
  role: 'cliente' | 'trabajador' | 'gerente';
  token?: string;
  avatar?: string;
  telefono?: string;
}

export interface AuthError {
  message: string;
  code: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const authApi = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await envelopedFetch<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = response.data.data;
      if (!data) {
        throw new Error('Error al iniciar sesión');
      }

      // Guardar token si existe
      if (data.token) {
        setAuthToken(data.token, credentials.remember || false);
      }

      // Guardar datos del usuario en localStorage
      const userData = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        telefono: data.telefono,
      };
      localStorage.setItem('user', JSON.stringify(userData));

      toast.success(`¡Bienvenido ${data.nombre}!`);

      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Llamar al endpoint de logout
      await envelopedFetch<{ ok?: boolean }>(API_CONFIG.ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        credentials: 'include',
      });

      // Limpiar tokens y datos locales
      clearAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');

      toast.info('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar de todas formas
      clearAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  /**
   * Refrescar token (si el backend lo soporta)
   */
  async refreshToken(): Promise<string | null> {
    try {
      const response = await envelopedFetch<{ token?: string }>(API_CONFIG.ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        credentials: 'include', // Para enviar cookies si se usan
        skipAuth: true,
      });

      const token = response.data.data?.token;
      if (!token) return null;

      setAuthToken(token, true);
      return token;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      return null;
    }
  },
};
