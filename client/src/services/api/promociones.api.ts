import { API_CONFIG } from '../../config/api.config';
import { envelopedFetch } from '../http/envelopedFetch';

export interface PromocionAPI {
  id: number;
  titulo: string;
  descripcion: string;
  descuento: string;
  validoHasta: string;
}

export const promocionesApi = {
  // Obtener todas las promociones
  getAll: async (): Promise<PromocionAPI[]> => {
    try {
      const response = await envelopedFetch<PromocionAPI[]>(`${API_CONFIG.BASE_URL}/promociones`, {
        method: 'GET',
        skipAuth: true,
      });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      const status = (error as any)?.status;
      if (typeof status === 'number') throw new Error(`Error HTTP: ${status}`);
      throw error;
    }
  },

  // Obtener promoción por ID
  getById: async (id: number): Promise<PromocionAPI> => {
    try {
      const response = await envelopedFetch<PromocionAPI>(`${API_CONFIG.BASE_URL}/promociones/${id}`, {
        method: 'GET',
        skipAuth: true,
      });
      return response.data.data as PromocionAPI;
    } catch (error) {
      console.error('Error al obtener promoción:', error);
      const status = (error as any)?.status;
      if (typeof status === 'number') throw new Error(`Error HTTP: ${status}`);
      throw error;
    }
  },

  // Crear nueva promoción
  create: async (promocion: Omit<PromocionAPI, 'id'>): Promise<PromocionAPI> => {
    try {
      const response = await envelopedFetch<PromocionAPI>(`${API_CONFIG.BASE_URL}/promociones`, {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify(promocion),
      });
      return response.data.data as PromocionAPI;
    } catch (error) {
      console.error('Error al crear promoción:', error);
      const status = (error as any)?.status;
      const message = error instanceof Error ? error.message : String(error);
      if (typeof status === 'number') throw new Error(`Error HTTP: ${status} - ${message}`);
      throw error;
    }
  },

  // Actualizar promoción
  update: async (id: number, promocion: Partial<PromocionAPI>): Promise<PromocionAPI> => {
    try {
      const response = await envelopedFetch<PromocionAPI>(`${API_CONFIG.BASE_URL}/promociones/${id}`, {
        method: 'PUT',
        skipAuth: true,
        body: JSON.stringify(promocion),
      });
      return response.data.data as PromocionAPI;
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      const status = (error as any)?.status;
      if (typeof status === 'number') throw new Error(`Error HTTP: ${status}`);
      throw error;
    }
  },

  // Eliminar promoción
  delete: async (id: number): Promise<void> => {
    try {
      await envelopedFetch<unknown>(`${API_CONFIG.BASE_URL}/promociones/${id}`, {
        method: 'DELETE',
        skipAuth: true,
      });
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      const status = (error as any)?.status;
      if (typeof status === 'number') throw new Error(`Error HTTP: ${status}`);
      throw error;
    }
  },
};