/**
 * 📦 API CLIENT - ESCANDALLO
 * 
 * Servicios para gestión de escandallos y costes de productos
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

// ============================================================================
// TIPOS
// ============================================================================

export interface Ingrediente {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  costeUnitario: number;
  costeTotal: number;
  proveedorId?: number;
  proveedorNombre?: string;
}

export interface Escandallo {
  id: number;
  productoId: number;
  productoNombre: string;
  categoria: string;
  pvp: number;
  costeUnitario: number;
  costeMedioAnual: number;
  margen: number;
  margenPorcentaje: number;
  rentable: boolean;
  ingredientes: Ingrediente[];
  unidadesVendidas?: number;
  fechaActualizacion: string;
}

export interface ResumenEscandallo {
  totalProductos: number;
  productosRentables: number;
  productosNoRentables: number;
  margenMedio: number;
  costesMedios: number;
  ventasTotales: number;
}

export interface CostePorProveedor {
  proveedorId: number;
  proveedorNombre: string;
  articulo: string;
  ultimoCoste: number;
  costeMedio: number;
  variacion: number;
  ultimaCompra: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const escandalloApi = {
  /**
   * Obtener todos los escandallos
   */
  async getAll(params?: {
    empresaId?: number;
    categoria?: string;
    soloRentables?: boolean;
    soloNoRentables?: boolean;
  }): Promise<Escandallo[]> {
    try {
      let url = '/gerente/escandallos';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.soloRentables) queryParams.append('solo_rentables', 'true');
      if (params?.soloNoRentables) queryParams.append('solo_no_rentables', 'true');
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener escandallos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener escandallos:', error);
      return [];
    }
  },

  /**
   * Obtener escandallo de un producto
   */
  async getByProductoId(productoId: number): Promise<Escandallo | null> {
    try {
      const response = await fetch(buildUrl(`/gerente/escandallos/producto/${productoId}`), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener escandallo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener escandallo:', error);
      return null;
    }
  },

  /**
   * Crear/Actualizar escandallo de un producto
   */
  async guardar(productoId: number, ingredientes: Omit<Ingrediente, 'id' | 'costeTotal'>[]): Promise<Escandallo | null> {
    try {
      const response = await fetch(buildUrl('/gerente/escandallos'), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ productoId, ingredientes }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar escandallo');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al guardar escandallo:', error);
      return null;
    }
  },

  /**
   * Obtener resumen de escandallos
   */
  async getResumen(empresaId?: number): Promise<ResumenEscandallo> {
    try {
      let url = '/gerente/escandallos/resumen';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener resumen');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      return {
        totalProductos: 0,
        productosRentables: 0,
        productosNoRentables: 0,
        margenMedio: 0,
        costesMedios: 0,
        ventasTotales: 0,
      };
    }
  },

  /**
   * Obtener costes por proveedor
   */
  async getCostesPorProveedor(empresaId?: number): Promise<CostePorProveedor[]> {
    try {
      let url = '/gerente/escandallos/costes-proveedor';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener costes por proveedor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener costes por proveedor:', error);
      return [];
    }
  },

  /**
   * Recalcular escandallos basados en últimos costes
   */
  async recalcular(empresaId?: number): Promise<{actualizados: number; errores: number}> {
    try {
      const response = await fetch(buildUrl('/gerente/escandallos/recalcular'), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ empresaId }),
      });

      if (!response.ok) {
        throw new Error('Error al recalcular escandallos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al recalcular escandallos:', error);
      return { actualizados: 0, errores: 0 };
    }
  },
};
