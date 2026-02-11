import { API_CONFIG, buildUrl } from '../../config/api.config';
import { envelopedFetch } from '../http/envelopedFetch';

export interface ImpresoraConfig {
  id: number;
  puntoVentaId: string;
  nombre: string;
  activa: boolean;
  categorias: string[];
  ipAddress?: string | null;
  modelo?: string | null;
  creadoEn?: string;
  modificadoEn?: string;
}

export type ImpresoraCreate = Omit<ImpresoraConfig, 'id' | 'creadoEn' | 'modificadoEn'>;
export type ImpresoraUpdate = Partial<Omit<ImpresoraConfig, 'id' | 'puntoVentaId' | 'creadoEn' | 'modificadoEn'>>;

export const impresorasApi = {
  async list(puntoVentaId: string): Promise<ImpresoraConfig[]> {
    const url = new URL(buildUrl('/trabajador/impresoras'));
    url.searchParams.set('puntoVentaId', puntoVentaId);
    const response = await envelopedFetch<ImpresoraConfig[]>(url.toString(), {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    });
    return response.data.data ?? [];
  },

  async create(data: ImpresoraCreate): Promise<ImpresoraConfig | null> {
    const response = await envelopedFetch<ImpresoraConfig>('/trabajador/impresoras', {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(data),
    });
    return response.data.data ?? null;
  },

  async update(id: number, data: ImpresoraUpdate): Promise<ImpresoraConfig | null> {
    const response = await envelopedFetch<ImpresoraConfig>(`/trabajador/impresoras/${id}`, {
      method: 'PUT',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(data),
    });
    return response.data.data ?? null;
  },

  async delete(id: number): Promise<boolean> {
    await envelopedFetch<unknown>(`/trabajador/impresoras/${id}`, {
      method: 'DELETE',
      headers: API_CONFIG.HEADERS,
    });
    return true;
  },
};

