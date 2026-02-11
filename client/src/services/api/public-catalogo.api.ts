import { envelopedFetch } from '../http/envelopedFetch';

export interface MarcaPublicaApi {
  id: string;
  codigo?: string | null;
  nombre: string;
  colorIdentidad?: string | null;
  icono?: string | null;
  logoUrl?: string | null;
  empresaId: string;
  activo: boolean;
}

export interface PuntoVentaPublicoApi {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  empresaId: string;
  marcasIds: string[];
  activo: boolean;
}

export const publicCatalogoApi = {
  async listMarcas(): Promise<MarcaPublicaApi[]> {
    const res = await envelopedFetch<MarcaPublicaApi[]>('/public/marcas', { method: 'GET', skipAuth: true });
    return res.data.data ?? [];
  },
  async listPuntosVenta(): Promise<PuntoVentaPublicoApi[]> {
    const res = await envelopedFetch<PuntoVentaPublicoApi[]>('/public/puntos-venta', { method: 'GET', skipAuth: true });
    return res.data.data ?? [];
  },
};

