/**
 * API CLIENT - TURNOS
 * Servicio HTTP para gestión de turnos (persistencia real)
 */
import { API_CONFIG } from '../../config/api.config';
import { envelopedFetch } from '../http/envelopedFetch';

export interface Turno {
  id: number;
  numero: string;
  estado: string;
  tiempoEstimado?: string;
  clienteId: number;
  pedidoId?: number | null;
  origenPedido?: string;
  geolocalizacionValidada?: boolean;
  fechaGeolocalizacion?: string | null;
  creadoEn?: string;
  cliente?: any;
  pedido?: any;
}

export interface TurnoCreate {
  numero: string;
  estado?: string;
  tiempoEstimado?: string;
  clienteId: number;
  pedidoId?: number;
  origenPedido?: string;
  geolocalizacionValidada?: boolean;
  fechaGeolocalizacion?: string;
}

export const turnosApi = {
  async getAll(): Promise<Turno[]> {
    const response = await envelopedFetch<Turno[]>(API_CONFIG.ENDPOINTS.TURNOS, {
      headers: API_CONFIG.HEADERS,
    });
    return response.data.data || [];
  },
  async getById(id: number): Promise<Turno | null> {
    try {
      const response = await envelopedFetch<Turno>(`${API_CONFIG.ENDPOINTS.TURNOS}/${id}`, {
        headers: API_CONFIG.HEADERS,
      });
      return response.data.data || null;
    } catch (error) {
      console.error('Error al obtener turno:', error);
      return null;
    }
  },
  async create(data: TurnoCreate): Promise<Turno | null> {
    try {
      const response = await envelopedFetch<Turno>(API_CONFIG.ENDPOINTS.TURNOS, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      });
      return response.data.data || null;
    } catch (error) {
      console.error('Error al crear turno:', error);
      return null;
    }
  },
  async update(id: number, data: Partial<Turno>): Promise<Turno | null> {
    try {
      const response = await envelopedFetch<Turno>(`${API_CONFIG.ENDPOINTS.TURNOS}/${id}`, {
        method: 'PUT',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify(data),
      });
      return response.data.data || null;
    } catch (error) {
      console.error('Error al actualizar turno:', error);
      return null;
    }
  },
  async delete(id: number): Promise<boolean> {
    try {
      await envelopedFetch<unknown>(`${API_CONFIG.ENDPOINTS.TURNOS}/${id}`, {
        method: 'DELETE',
        headers: API_CONFIG.HEADERS,
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar turno:', error);
      return false;
    }
  },
};
