import { envelopedFetch } from '../http/envelopedFetch';

export interface SolicitudVacacionesApi {
  id: number;
  empleadoId: number;
  desde: string;
  hasta: string;
  motivo: string;
  estado: string;
  creadoEn: string;
  resueltoEn?: string | null;
}

export interface SolicitudHorasExtraApi {
  id: number;
  empleadoId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  estado: string;
  creadoEn: string;
  resueltoEn?: string | null;
}

export interface ConsumoInternoApi {
  id: number;
  empleadoId: number;
  producto: string;
  categoria: string;
  cantidad: number;
  precio: number;
  fecha: string;
  notas?: string | null;
}

export interface GastoTrabajadorApi {
  id: number;
  empleadoId: number;
  concepto: string;
  categoria: string;
  importe: number;
  fechaGasto: string;
  estado: string;
  justificanteUrl?: string | null;
  notas?: string | null;
  creadoEn: string;
}

export const trabajadorRrhhApi = {
  async listVacaciones(): Promise<SolicitudVacacionesApi[]> {
    const res = await envelopedFetch<SolicitudVacacionesApi[]>('/trabajador/rrhh/vacaciones', { method: 'GET' });
    return res.data.data ?? [];
  },
  async createVacaciones(input: { desde: string; hasta: string; motivo: string }): Promise<SolicitudVacacionesApi | null> {
    const res = await envelopedFetch<SolicitudVacacionesApi>('/trabajador/rrhh/vacaciones', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data.data ?? null;
  },

  async listHorasExtra(): Promise<SolicitudHorasExtraApi[]> {
    const res = await envelopedFetch<SolicitudHorasExtraApi[]>('/trabajador/rrhh/horas-extra', { method: 'GET' });
    return res.data.data ?? [];
  },
  async createHorasExtra(input: { fecha: string; horaInicio: string; horaFin: string; motivo: string }): Promise<SolicitudHorasExtraApi | null> {
    const res = await envelopedFetch<SolicitudHorasExtraApi>('/trabajador/rrhh/horas-extra', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data.data ?? null;
  },

  async listConsumos(): Promise<ConsumoInternoApi[]> {
    const res = await envelopedFetch<ConsumoInternoApi[]>('/trabajador/rrhh/consumos', { method: 'GET' });
    return res.data.data ?? [];
  },
  async createConsumo(input: {
    producto: string;
    categoria: string;
    cantidad?: number;
    precio?: number;
    fecha?: string;
    notas?: string;
  }): Promise<ConsumoInternoApi | null> {
    const res = await envelopedFetch<ConsumoInternoApi>('/trabajador/rrhh/consumos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data.data ?? null;
  },

  async listGastos(): Promise<GastoTrabajadorApi[]> {
    const res = await envelopedFetch<GastoTrabajadorApi[]>('/trabajador/rrhh/gastos', { method: 'GET' });
    return res.data.data ?? [];
  },
  async createGasto(input: {
    concepto: string;
    categoria: string;
    importe: number;
    fechaGasto?: string;
    justificanteUrl?: string;
    notas?: string;
  }): Promise<GastoTrabajadorApi | null> {
    const res = await envelopedFetch<GastoTrabajadorApi>('/trabajador/rrhh/gastos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return res.data.data ?? null;
  },
};

