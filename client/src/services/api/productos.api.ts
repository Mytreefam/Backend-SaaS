/**
 * 🛍️ API CLIENT - PRODUCTOS
 * 
 * Gestión de productos y catálogo
 */

import { API_CONFIG } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';
import { envelopedFetch } from '../http/envelopedFetch';

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
      const response = await envelopedFetch<Producto[]>(API_CONFIG.ENDPOINTS.PRODUCTOS, { method: 'GET' });
      return response.data.data ?? [];
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
      const response = await envelopedFetch<Producto>(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(String(id)), {
        method: 'GET',
      });
      return response.data.data ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      console.error('Error al obtener producto:', error);

      if (message.includes('No encontrado') || message.includes('NOT_FOUND')) {
        toast.error('Producto no encontrado');
        return null;
      }

      toast.error('Error al cargar producto');
      return null;
    }
  },

  /**
   * Crear producto (admin/gerente)
   */
  async create(data: Omit<Producto, 'id'>): Promise<Producto | null> {
    try {
      const response = await envelopedFetch<Producto>(API_CONFIG.ENDPOINTS.PRODUCTOS, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast.success('Producto creado correctamente');
      return response.data.data ?? null;
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
      const response = await envelopedFetch<Producto>(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(String(id)), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      toast.success('Producto actualizado correctamente');
      return response.data.data ?? null;
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
      await envelopedFetch<unknown>(API_CONFIG.ENDPOINTS.PRODUCTO_BY_ID(String(id)), { method: 'DELETE' });
      toast.success('Producto eliminado correctamente');
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
      return false;
    }
  },
};
