/**
 * 🎫 API CLIENT - CUPONES
 * 
 * Gestión de cupones y descuentos
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export interface Cupon {
  id: number;
  codigo: string;
  descripcion: string;
  descuento: string;
  validoHasta: string;
  clienteId?: number;
  usado: boolean;
}

export interface ValidarCuponRequest {
  codigo: string;
  clienteId?: number;
  total?: number;
}

export interface ValidarCuponResponse {
  valido: boolean;
  cupon?: Cupon;
  mensaje?: string;
  descuentoCalculado?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const cuponesApi = {
  /**
   * Obtener todos los cupones (admin/gerente)
   */
  async getAll(): Promise<Cupon[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CUPONES), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener cupones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener cupones:', error);
      return [];
    }
  },

  /**
   * Validar cupón
   */
  async validar(data: ValidarCuponRequest): Promise<ValidarCuponResponse> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CUPON_VALIDAR), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return {
          valido: false,
          mensaje: 'Cupón no válido o expirado',
        };
      }

      const result = await response.json();
      
      if (result.valido) {
        toast.success(result.mensaje || 'Cupón aplicado correctamente');
      } else {
        toast.error(result.mensaje || 'Cupón no válido');
      }

      return result;
    } catch (error) {
      console.error('Error al validar cupón:', error);
      toast.error('Error al validar cupón');
      return {
        valido: false,
        mensaje: 'Error al validar cupón',
      };
    }
  },

  /**
   * Crear cupón (admin/gerente)
   */
  async create(data: Omit<Cupon, 'id' | 'usado'>): Promise<Cupon | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CUPONES), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear cupón');
      }

      const cupon = await response.json();
      toast.success('Cupón creado correctamente');
      return cupon;
    } catch (error) {
      console.error('Error al crear cupón:', error);
      toast.error('Error al crear cupón');
      return null;
    }
  },
};
