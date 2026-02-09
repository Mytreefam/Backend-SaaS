import { API_CONFIG, buildUrl } from '../../config/api.config';
import { envelopedFetch } from '../http/envelopedFetch';

export interface CierreCaja {
  id?: number;
  numero?: string;
  puntoVentaId: string;
  empresaId: string;
  fecha?: string;
  turno: string;
  empleadoAperturaId?: number;
  empleadoCierreId?: number;
  efectivoInicial: number;
  totalVentasEfectivo: number;
  totalVentasTarjeta: number;
  totalVentasOnline: number;
  gastosCaja: number;
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
  estado?: string;
  observaciones?: string;
  validadoPor?: number;
  fechaValidacion?: string;
  creadoEn?: string;
  modificadoEn?: string;
}

export const cajaApi = {
  async crearCierreCaja(data: CierreCaja): Promise<CierreCaja> {
    try {
      const response = await envelopedFetch<CierreCaja>(API_CONFIG.ENDPOINTS.CIERRE_CAJA, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data as CierreCaja;
    } catch {
      throw new Error('Error al crear cierre de caja');
    }
  },

  async listarCierresCaja(params?: { puntoVentaId?: string; empresaId?: string }): Promise<CierreCaja[]> {
    const url = new URL(buildUrl(API_CONFIG.ENDPOINTS.CIERRE_CAJA));
    if (params?.puntoVentaId) url.searchParams.append('puntoVentaId', params.puntoVentaId);
    if (params?.empresaId) url.searchParams.append('empresaId', params.empresaId);
    try {
      const response = await envelopedFetch<CierreCaja[]>(url.toString(), {
        method: 'GET',
      });
      return response.data.data ?? [];
    } catch {
      throw new Error('Error al listar cierres de caja');
    }
  },

  async obtenerCierreCaja(id: number): Promise<CierreCaja> {
    try {
      const response = await envelopedFetch<CierreCaja>(`${API_CONFIG.ENDPOINTS.CIERRE_CAJA}/${id}`, {
        method: 'GET',
      });
      return response.data.data as CierreCaja;
    } catch {
      throw new Error('Error al obtener cierre de caja');
    }
  }
};
