/**
 * 🛍️ API CLIENT - PRODUCTOS
 * 
 * Gestión de productos y catálogo
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const productosApi = {
  /**
   * Obtener todos los productos
   */
  async getAll(): Promise<Producto[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PRODUCTOS), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener productos:', error);
      toast.error('Error al cargar productos');
      return [];
    }
  },

  /**
   * Obtener producto por ID
   */
  async getById(id: string | number): Promise<Producto | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(String(id))), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Producto no encontrado');
          return null;
        }
        throw new Error('Error al obtener producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener producto:', error);
      toast.error('Error al cargar producto');
      return null;
    }
  },

  /**
   * Crear producto (admin/gerente)
   */
  async create(data: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PRODUCTOS), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear producto');
      }

      const producto = await response.json();
      toast.success('Producto creado correctamente');
      return producto;
    } catch (error) {
      console.error('Error al crear producto:', error);
      toast.error('Error al crear producto');
      return null;
    }
  },

  /**
   * Actualizar producto
   */
  async update(id: string | number, data: Partial<Producto>): Promise<Producto | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(String(id))), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto');
      }

      const producto = await response.json();
      toast.success('Producto actualizado correctamente');
      return producto;
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar producto');
      return null;
    }
  },

  /**
   * Eliminar producto
   */
  async delete(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(String(id))), {
        method: 'DELETE',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      toast.success('Producto eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
      return false;
    }
  },
};
