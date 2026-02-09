/**
 * 👤 API CLIENT - CLIENTES
 * 
 * CRUD de clientes y operaciones relacionadas
 */

import { API_CONFIG } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';
import { envelopedFetch } from '../http/envelopedFetch';

function isNotFoundMessage(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes('no encontrado') || m.includes('not_found') || m.includes('not found');
}

function isDuplicateMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('email') ||
    m.includes('duplicate') ||
    m.includes('unique') ||
    m.includes('ya registrado') ||
    m.includes('already exists')
  );
}

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
      const response = await envelopedFetch<Cliente[]>(API_CONFIG.ENDPOINTS.CLIENTES, {
        headers: API_CONFIG.HEADERS,
      });

      return response.data.data || [];
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
      const response = await envelopedFetch<Cliente>(API_CONFIG.ENDPOINTS.CLIENTE_BY_ID(String(id)), {
        headers: API_CONFIG.HEADERS,
      });

      return response.data.data || null;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      const message = error instanceof Error ? error.message : '';
      if (isNotFoundMessage(message)) {
        toast.error('Cliente no encontrado');
      } else {
        toast.error('Error al cargar datos del cliente');
      }
      return null;
    }
  },

  /**
   * Crear nuevo cliente (registro)
   */
  async create(data: ClienteCreate): Promise<Cliente | null> {
    try {
      const response = await envelopedFetch<Cliente>(API_CONFIG.ENDPOINTS.CLIENTES, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      });

      const cliente = response.data.data;
      toast.success('Cliente registrado correctamente');
      return cliente || null;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      const message = error instanceof Error ? error.message : '';
      if (isDuplicateMessage(message)) {
        toast.error('Email ya registrado');
        return null;
      }
      toast.error('Error al registrar cliente');
      return null;
    }
  },

  /**
   * Actualizar cliente
   */
  async update(id: string | number, data: ClienteUpdate): Promise<Cliente | null> {
    try {
      const response = await envelopedFetch<Cliente>(API_CONFIG.ENDPOINTS.CLIENTE_BY_ID(String(id)), {
        method: 'PUT',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      });

      const cliente = response.data.data;
      toast.success('Datos actualizados correctamente');
      return cliente || null;
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
      await envelopedFetch<unknown>(API_CONFIG.ENDPOINTS.CLIENTE_BY_ID(String(id)), {
        method: 'DELETE',
        headers: API_CONFIG.HEADERS,
      });

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
      const response = await envelopedFetch<any[]>(API_CONFIG.ENDPOINTS.CLIENTE_PEDIDOS(String(clienteId)), {
        headers: API_CONFIG.HEADERS,
      });

      return response.data.data || [];
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
      const response = await envelopedFetch<any[]>(API_CONFIG.ENDPOINTS.CLIENTE_PROMOCIONES(String(clienteId)), {
        headers: API_CONFIG.HEADERS,
      });

      return response.data.data || [];
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
      const response = await envelopedFetch<any[]>(API_CONFIG.ENDPOINTS.CLIENTE_NOTIFICACIONES(String(clienteId)), {
        headers: API_CONFIG.HEADERS,
      });

      return response.data.data || [];
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
      const response = await envelopedFetch<any>(API_CONFIG.ENDPOINTS.CLIENTE_TURNO_ACTIVO(String(clienteId)), {
        headers: API_CONFIG.HEADERS,
      });

      const data = response.data.data;
      if (!data) return null;
      return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
      console.error('Error al obtener turno activo:', error);
      return null;
    }
  },
};
