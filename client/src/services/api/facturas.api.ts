/**
 * 📄 API CLIENT - FACTURAS
 * 
 * Gestión de facturas del cliente
 */

import { API_CONFIG } from '../../config/api.config';
import { envelopedFetch } from '../http/envelopedFetch';

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
      const response = await envelopedFetch<Factura[]>(API_CONFIG.ENDPOINTS.FACTURAS, { method: 'GET' });
      return response.data.data ?? [];
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
      const response = await envelopedFetch<Factura>(`${API_CONFIG.ENDPOINTS.FACTURAS}/${id}`, {
        method: 'GET',
      });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<Factura[]>(API_CONFIG.ENDPOINTS.FACTURAS, { method: 'GET' });
      const facturas = response.data.data ?? [];
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
      const response = await envelopedFetch<Factura>(API_CONFIG.ENDPOINTS.FACTURAS, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
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
      const response = await envelopedFetch<Blob>(`${API_CONFIG.ENDPOINTS.FACTURAS}/${id}/pdf`, {
        method: 'GET',
        responseType: 'blob',
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al descargar factura:', error);
      return null;
    }
  },
};
