/**
 * 🏪 API CLIENT - PUNTOS DE VENTA
 *
 * Lectura de puntos de venta para checkout y citas.
 */
import { envelopedFetch } from '../http/envelopedFetch';

export interface PuntoVenta {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  marcasIds: string[];
  activo: boolean;
}

export const puntosVentaApi = {
  async getAll(): Promise<PuntoVenta[]> {
    try {
      const response = await envelopedFetch<PuntoVenta[]>('/puntos-venta', { method: 'GET' });
      return response.data.data ?? [];
    } catch (e) {
      console.error('Error al obtener puntos de venta:', e);
      return [];
    }
  },

  async getById(id: string): Promise<PuntoVenta | null> {
    try {
      const response = await envelopedFetch<PuntoVenta>(`/puntos-venta/${encodeURIComponent(id)}`, { method: 'GET' });
      return response.data.data ?? null;
    } catch (e) {
      console.error('Error al obtener punto de venta:', e);
      return null;
    }
  },
};

