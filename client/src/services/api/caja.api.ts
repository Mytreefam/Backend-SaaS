import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

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
    const response = await fetch(buildUrl(API_CONFIG.ENDPOINTS.CIERRE_CAJA), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear cierre de caja');
    return response.json();
  },

  async listarCierresCaja(params?: { puntoVentaId?: string; empresaId?: string }): Promise<CierreCaja[]> {
    const url = new URL(buildUrl(API_CONFIG.ENDPOINTS.CIERRE_CAJA));
    if (params?.puntoVentaId) url.searchParams.append('puntoVentaId', params.puntoVentaId);
    if (params?.empresaId) url.searchParams.append('empresaId', params.empresaId);
    const response = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Error al listar cierres de caja');
    return response.json();
  },

  async obtenerCierreCaja(id: number): Promise<CierreCaja> {
    const response = await fetch(buildUrl(`${API_CONFIG.ENDPOINTS.CIERRE_CAJA}/${id}`), {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Error al obtener cierre de caja');
    return response.json();
  }
};
