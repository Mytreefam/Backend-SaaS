/**
 * 👤 API CLIENT - CLIENTES
 * 
 * CRUD de clientes y operaciones relacionadas
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  avatar?: string;
  idioma?: string;
  ciudad?: string;
  role: string;
  creadoEn: string;
  direcciones?: Direccion[];
  pedidos?: any[];
}

export interface Direccion {
  id: number;
  clienteId: number;
  calle: string;
  ciudad: string;
  provincia: string;
  pais: string;
  codigoPostal: string;
}

export interface ClienteCreate {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  avatar?: string;
  idioma?: string;
  ciudad?: string;
}

export interface ClienteUpdate {
  nombre?: string;
  email?: string;
  telefono?: string;
  avatar?: string;
  idioma?: string;
  ciudad?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const clientesApi = {
  /**
   * Obtener todos los clientes (solo admin/gerente)
   */
  async getAll(): Promise<Cliente[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTES), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener clientes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      toast.error('Error al cargar clientes');
      return [];
    }
  },

  /**
   * Obtener cliente por ID
   */
  async getById(id: string | number): Promise<Cliente | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_BY_ID(String(id))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Cliente no encontrado');
          return null;
        }
        throw new Error('Error al obtener cliente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      toast.error('Error al cargar datos del cliente');
      return null;
    }
  },

  /**
   * Crear nuevo cliente (registro)
   */
  async create(data: ClienteCreate): Promise<Cliente | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTES), {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400) {
          toast.error('Email ya registrado');
          return null;
        }
        throw new Error('Error al crear cliente');
      }

      const cliente = await response.json();
      toast.success('Cliente registrado correctamente');
      return cliente;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast.error('Error al registrar cliente');
      return null;
    }
  },

  /**
   * Actualizar cliente
   */
  async update(id: string | number, data: ClienteUpdate): Promise<Cliente | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_BY_ID(String(id))), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar cliente');
      }

      const cliente = await response.json();
      toast.success('Datos actualizados correctamente');
      return cliente;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      toast.error('Error al actualizar datos');
      return null;
    }
  },

  /**
   * Eliminar cliente
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_BY_ID(String(id))), {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar cliente');
      }

      toast.success('Cliente eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      toast.error('Error al eliminar cliente');
      return false;
    }
  },

  /**
   * Obtener pedidos de un cliente
   */
  async getPedidos(clienteId: string | number): Promise<any[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_PEDIDOS(String(clienteId))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener pedidos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener pedidos del cliente:', error);
      toast.error('Error al cargar pedidos');
      return [];
    }
  },

  /**
   * Obtener promociones de un cliente
   */
  async getPromociones(clienteId: string | number): Promise<any[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_PROMOCIONES(String(clienteId))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener promociones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      return [];
    }
  },

  /**
   * Obtener notificaciones de un cliente
   */
  async getNotificaciones(clienteId: string | number): Promise<any[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_NOTIFICACIONES(String(clienteId))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  },

  /**
   * Obtener turno activo de un cliente
   */
  async getTurnoActivo(clienteId: string | number): Promise<any | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CLIENTE_TURNO_ACTIVO(String(clienteId))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
      console.error('Error al obtener turno activo:', error);
      return null;
    }
  },
};
