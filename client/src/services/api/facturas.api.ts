/**
 * 📄 API CLIENT - FACTURAS
 * 
 * Gestión de facturas del cliente
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

// ============================================================================
// TIPOS
// ============================================================================

export interface Factura {
  id: number;
  numero: string;
  fecha: string;
  clienteId: number;
  total: number;
  subtotal: number;
  iva: number;
  estado: string;
  pedidoId?: number;
  pdfUrl?: string;
  qrCode?: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const facturasApi = {
  /**
   * Obtener todas las facturas
   */
  async getAll(): Promise<Factura[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.FACTURAS), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener facturas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      return [];
    }
  },

  /**
   * Obtener factura por ID
   */
  async getById(id: number): Promise<Factura | null> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.FACTURAS}/${id}`), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener factura:', error);
      return null;
    }
  },

  /**
   * Obtener facturas de un cliente específico
   */
  async getByClienteId(clienteId: number): Promise<Factura[]> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.FACTURAS), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener facturas');
      }

      const facturas = await response.json();
      // Filtrar por clienteId (en un backend real, esto debería ser un query param)
      return facturas.filter((f: Factura) => f.clienteId === clienteId);
    } catch (error) {
      console.error('Error al obtener facturas del cliente:', error);
      return [];
    }
  },

  /**
   * Crear nueva factura
   */
  async create(data: Partial<Factura>): Promise<Factura | null> {
    try {
      const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.FACTURAS), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear factura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear factura:', error);
      return null;
    }
  },

  /**
   * Descargar PDF de factura
   */
  async downloadPdf(id: number): Promise<Blob | null> {
    try {
      const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.FACTURAS}/${id}/pdf`), {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar factura');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error al descargar factura:', error);
      return null;
    }
  },
};
