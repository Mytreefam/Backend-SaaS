/**
 * API CLIENT - TURNOS
 * Servicio HTTP para gestión de turnos (persistencia real)
 */
import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

export interface Turno {
  id: number;
  numero: string;
  estado: string;
  tiempoEstimado?: string;
  clienteId: number;
  pedidoId: number;
  cliente?: any;
  pedido?: any;
}

export interface TurnoCreate {
  numero: string;
  estado?: string;
  tiempoEstimado?: string;
  clienteId: number;
  pedidoId: number;
}

export const turnosApi = {
  async getAll(): Promise<Turno[]> {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.TURNOS), {
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) throw new Error('Error al obtener turnos');
    return await response.json();
  },
  async getById(id: number): Promise<Turno | null> {
    const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.TURNOS}/${id}`), {
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!response.ok) return null;
    return await response.json();
  },
  async create(data: TurnoCreate): Promise<Turno | null> {
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.TURNOS), {
      method: 'POST',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  },
  async update(id: number, data: Partial<Turno>): Promise<Turno | null> {
    const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.TURNOS}/${id}`), {
      method: 'PUT',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) return null;
    return await response.json();
  },
  async delete(id: number): Promise<boolean> {
    const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.TURNOS}/${id}`), {
      method: 'DELETE',
      headers: {
        ...API_CONFIG.HEADERS,
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return response.ok;
  },
};
