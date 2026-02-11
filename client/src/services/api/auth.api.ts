/**
 * 🔐 API CLIENT - AUTENTICACIÓN
 * 
 * Maneja el login, logout y gestión de sesiones
 */

import { API_CONFIG, buildUrl, setAuthToken, clearAuthToken, hasAuthToken } from '../../config/api.config';
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

export interface AuthSession {
  id: number;
  createdAt: string;
  expiresAt: string;
  userAgent?: string | null;
  ip?: string | null;
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
        // IMPORTANT: login sets refresh_token cookie; must include credentials so browser stores it
        credentials: 'include',
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
    const tokenOk = hasAuthToken();

    // If we have a persisted user but no token, treat as logged out
    if (user && !tokenOk) {
      clearAuthToken();
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      return false;
    }

    return !!user && tokenOk;
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): LoginResponse | null {
    // If token is missing, consider session invalid
    if (!hasAuthToken()) return null;

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

  /**
   * Cambiar contraseña (revoca sesiones en backend)
   */
  async changePassword(params: { currentPassword: string; newPassword: string }): Promise<boolean> {
    try {
      await envelopedFetch<{ ok?: boolean }>(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(params),
      });
      toast.success('Contraseña actualizada correctamente');
      return true;
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      const message = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      toast.error(message || 'Error al cambiar contraseña');
      return false;
    }
  },

  async getSessions(): Promise<AuthSession[]> {
    try {
      const response = await envelopedFetch<{ sessions: AuthSession[] }>(API_CONFIG.ENDPOINTS.AUTH_SESSIONS, {
        method: 'GET',
        headers: API_CONFIG.HEADERS,
      });
      return response.data.data?.sessions ?? [];
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      toast.error('Error al cargar sesiones');
      return [];
    }
  },

  async revokeAllSessions(): Promise<boolean> {
    try {
      await envelopedFetch<{ revoked?: number }>(API_CONFIG.ENDPOINTS.AUTH_SESSIONS_REVOKE_ALL, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
      });
      toast.success('Sesiones cerradas');
      return true;
    } catch (error) {
      console.error('Error revocando sesiones:', error);
      toast.error('Error al cerrar sesiones');
      return false;
    }
  },
};
