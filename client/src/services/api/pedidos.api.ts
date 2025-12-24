/**
 * 📦 API CLIENT - PEDIDOS
 * 
 * Gestión de pedidos del cliente
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';
import { CartItem } from '../../contexts/CartContext';

// ============================================================================
// TIPOS
// ============================================================================

export interface PedidoCreate {
  clienteId: number;
  items: Array<{
    productoId: number;
    cantidad: number;
    precio: number;
  }>;
  total: number;
  estado?: string;
  tipoEntrega?: 'recogida' | 'domicilio';
  direccionEntrega?: string;
  metodoPago?: 'tarjeta' | 'efectivo' | 'bizum';
}

export interface Pedido {
  id: number;
  clienteId: number;
  fecha: string;
  estado: string;
  total: number;
  items: Array<{
    id: number;
    pedidoId: number;
    productoId: number;
    cantidad: number;
    precio: number;
    producto?: {
      id: number;
      nombre: string;
      descripcion: string;
      precio: number;
      imagen?: string;
    };
  }>;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const pedidosApi = {
  /**
   * Obtener todos los pedidos (admin/gerente)
   */
  async getAll(): Promise<Pedido[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PEDIDOS), {
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
      console.error('Error al obtener pedidos:', error);
      toast.error('Error al cargar pedidos');
      return [];
    }
  },

  /**
   * Obtener pedido por ID
   */
  async getById(id: string | number): Promise<Pedido | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PEDIDO_BY_ID(String(id))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Pedido no encontrado');
          return null;
        }
        throw new Error('Error al obtener pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      toast.error('Error al cargar pedido');
      return null;
    }
  },

  /**
   * Crear nuevo pedido
   */
  async create(data: PedidoCreate): Promise<Pedido | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PEDIDOS), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear pedido');
      }

      const pedido = await response.json();
      toast.success('Pedido creado correctamente');
      return pedido;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al crear pedido');
      return null;
    }
  },

  /**
   * Actualizar estado de pedido
   */
  async update(id: string | number, data: Partial<Pedido>): Promise<Pedido | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PEDIDO_BY_ID(String(id))), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar pedido');
      }

      const pedido = await response.json();
      toast.success('Pedido actualizado correctamente');
      return pedido;
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      toast.error('Error al actualizar pedido');
      return null;
    }
  },

  /**
   * Cancelar pedido
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PEDIDO_BY_ID(String(id))), {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cancelar pedido');
      }

      toast.success('Pedido cancelado correctamente');
      return true;
    } catch (error) {
      console.error('Error al cancelar pedido:', error);
      toast.error('Error al cancelar pedido');
      return false;
    }
  },
};
