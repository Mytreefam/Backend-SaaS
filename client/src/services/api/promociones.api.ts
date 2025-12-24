import { API_CONFIG } from '../../config/api.config';

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
      const response = await fetch(`${API_CONFIG.BASE_URL}/promociones`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      throw error;
    }
  },

  // Obtener promoción por ID
  getById: async (id: number): Promise<PromocionAPI> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/promociones/${id}`);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener promoción:', error);
      throw error;
    }
  },

  // Crear nueva promoción
  create: async (promocion: Omit<PromocionAPI, 'id'>): Promise<PromocionAPI> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/promociones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promocion),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error HTTP: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al crear promoción:', error);
      throw error;
    }
  },

  // Actualizar promoción
  update: async (id: number, promocion: Partial<PromocionAPI>): Promise<PromocionAPI> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/promociones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promocion),
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar promoción:', error);
      throw error;
    }
  },

  // Eliminar promoción
  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/promociones/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al eliminar promoción:', error);
      throw error;
    }
  },
};