/**
 * 📅 API CLIENT - HORARIOS (TRABAJADOR)
 *
 * Fuente de verdad: endpoints /trabajador/horarios*
 * Devuelve los mismos shapes usados por `horarios.service.ts` para minimizar cambios en UI.
 */

import { envelopedFetch } from '../http/envelopedFetch';
import type { Turno, SolicitudCambioHorario, TipoSolicitud } from '../horarios.service';

export const horariosApi = {
  async getTurnos(params?: { from?: string; to?: string }): Promise<Turno[]> {
    try {
      const qs = new URLSearchParams();
      if (params?.from) qs.set('from', params.from);
      if (params?.to) qs.set('to', params.to);

      const url = qs.toString() ? `/trabajador/horarios?${qs.toString()}` : '/trabajador/horarios';
      const res = await envelopedFetch<Turno[]>(url, { method: 'GET' });
      return res.data.data ?? [];
    } catch (error) {
      console.error('Error cargando horarios:', error);
      return [];
    }
  },

  async getSolicitudes(): Promise<SolicitudCambioHorario[]> {
    try {
      const res = await envelopedFetch<SolicitudCambioHorario[]>('/trabajador/horarios/solicitudes', { method: 'GET' });
      return res.data.data ?? [];
    } catch (error) {
      console.error('Error cargando solicitudes de horario:', error);
      return [];
    }
  },

  async crearSolicitud(input: {
    tipo: TipoSolicitud;
    fechaSolicitada: string;
    motivoSolicitud: string;
    detalles?: string;
  }): Promise<SolicitudCambioHorario | null> {
    try {
      const res = await envelopedFetch<SolicitudCambioHorario>('/trabajador/horarios/solicitudes', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return res.data.data ?? null;
    } catch (error) {
      console.error('Error creando solicitud de horario:', error);
      return null;
    }
  },
};

