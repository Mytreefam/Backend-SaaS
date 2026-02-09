/**
 * 📅 SERVICIO DE CITAS - VERSIÓN HTTP
 * Realiza peticiones HTTP reales al backend para obtener citas
 */

import { envelopedFetch } from './http/envelopedFetch';
import type {
  Cita,
  EstadisticasCitas,
  FiltrosCitas,
  CrearCitaPayload,
  ActualizarCitaPayload,
  CambiarEstadoPayload
} from '../types/cita.types';

const API_BASE = '/citas';

/**
 * Transforma los datos del backend al formato esperado por el frontend
 */
function transformarCita(cita: any): Cita {
  return {
    id: cita.id?.toString() || '',
    numero: cita.numero || `CITA-${cita.id}`,
    clienteId: cita.clienteId?.toString() || '',
    clienteNombre: cita.cliente?.nombre || cita.clienteNombre || 'Cliente',
    clienteTelefono: cita.cliente?.telefono || cita.telefono || cita.clienteTelefono,
    clienteEmail: cita.cliente?.email || cita.email || cita.clienteEmail,
    servicioId: cita.servicioId?.toString() || '',
    servicioNombre: cita.servicio?.nombre || cita.servicioNombre || cita.servicio || 'Servicio',
    servicioDuracion: cita.servicio?.duracion || cita.servicioDuracion || 30,
    fecha: cita.fecha || '',
    horaInicio: cita.hora || cita.horaInicio || '',
    horaFin: cita.horaFin || '',
    ubicacion: cita.ubicacion || '',
    trabajadorAsignadoId: cita.trabajadorAsignadoId?.toString() || undefined,
    trabajadorAsignadoNombre: cita.trabajadorAsignado?.nombre || cita.trabajadorAsignadoNombre,
    estado: (cita.estado?.replace(/_/g, '-') || 'solicitada') as any,
    descripcion: cita.motivo || cita.notas || cita.descripcion || '',
    precio: cita.precio || 0,
    notas: cita.notas || '',
  } as Cita;
}

/**
 * Servicio HTTP para gestión de citas
 * Realiza peticiones al backend Express
 */
class CitasAPIService {
  /**
   * Obtiene todas las citas del servidor
   * @param filtros Filtros opcionales
   * @returns Lista de citas
   */
  async obtenerCitas(filtros?: FiltrosCitas): Promise<Cita[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.clienteId) params.append('clienteId', filtros.clienteId.toString());
      if (filtros?.servicio) params.append('servicio', filtros.servicio);
      if (filtros?.mes) params.append('mes', filtros.mes.toString());
      if (filtros?.anio) params.append('anio', filtros.anio.toString());

      const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
      
      console.log('📡 GET', url);
      const response = await envelopedFetch<unknown>(url);
      console.log('📥 Response completa:', response);

      const raw = response.data.data;
      const citasRaw: any[] = Array.isArray(raw) ? raw : [];
      
      // Transformar al formato esperado
      const citas = citasRaw.map(transformarCita);
      
      console.log('✅ Citas obtenidas:', citas.length, citas);
      return citas;
    } catch (error) {
      console.error('❌ Error obtener citas:', error);
      return [];
    }
  }

  /**
   * Obtiene una cita específica
   * @param id ID de la cita
   * @returns Cita encontrada
   */
  async obtenerCita(id: number | string): Promise<Cita | null> {
    try {
      const url = `${API_BASE}/${id}`;
      console.log('📡 GET', url);
      const response = await envelopedFetch<Cita>(url);
      const cita = response.data.data;
      console.log('✅ Cita obtenida:', (cita as any)?.id);
      return cita || null;
    } catch (error) {
      console.error(`❌ Error obtener cita ${id}:`, error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de citas
   * @param filtros Filtros opcionales
   * @returns Estadísticas calculadas
   */
  async obtenerEstadisticas(filtros?: FiltrosCitas): Promise<EstadisticasCitas> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.estado) params.append('estado', filtros.estado);
      if (filtros?.clienteId) params.append('clienteId', filtros.clienteId.toString());
      if (filtros?.servicio) params.append('servicio', filtros.servicio);
      if (filtros?.mes) params.append('mes', filtros.mes.toString());
      if (filtros?.anio) params.append('anio', filtros.anio.toString());

      const url = params.toString() ? `${API_BASE}/stats?${params}` : `${API_BASE}/stats`;
      
      console.log('📡 GET', url);
      const response = await envelopedFetch<EstadisticasCitas>(url);
      const stats = response.data.data;
      console.log('✅ Estadísticas obtenidas', stats);

      return stats || {
        total: 0,
        solicitadas: 0,
        confirmadas: 0,
        enProgreso: 0,
        completadas: 0,
        canceladas: 0,
        noPresantado: 0,
        tasaConfirmacion: 0,
        tasaCumplimiento: 0,
        tasaCancelacion: 0
      };
    } catch (error) {
      console.error('❌ Error obtener estadísticas:', error);
      return {
        total: 0,
        solicitadas: 0,
        confirmadas: 0,
        enProgreso: 0,
        completadas: 0,
        canceladas: 0,
        noPresantado: 0,
        tasaConfirmacion: 0,
        tasaCumplimiento: 0,
        tasaCancelacion: 0
      };
    }
  }

  /**
   * Crea una nueva cita
   * @param payload Datos de la nueva cita
   * @returns Cita creada
   */
  async crearCita(payload: CrearCitaPayload): Promise<Cita | null> {
    try {
      console.log('📡 POST', API_BASE, payload);
      const response = await envelopedFetch<Cita>(API_BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const cita = response.data.data;
      console.log('✅ Cita creada:', (cita as any)?.id);
      return cita || null;
    } catch (error) {
      console.error('❌ Error crear cita:', error);
      return null;
    }
  }

  /**
   * Actualiza una cita existente
   * @param id ID de la cita
   * @param payload Datos a actualizar
   * @returns Cita actualizada
   */
  async actualizarCita(id: number | string, payload: ActualizarCitaPayload): Promise<Cita | null> {
    try {
      const url = `${API_BASE}/${id}`;
      console.log('📡 PUT', url, payload);
      const response = await envelopedFetch<Cita>(url, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const cita = response.data.data;
      console.log('✅ Cita actualizada:', (cita as any)?.id);
      return cita || null;
    } catch (error) {
      console.error(`❌ Error actualizar cita ${id}:`, error);
      return null;
    }
  }

  /**
   * Cambia el estado de una cita
   * @param id ID de la cita
   * @param payload Nuevo estado
   * @returns Cita con estado actualizado
   */
  async cambiarEstado(id: number | string, payload: CambiarEstadoPayload): Promise<Cita | null> {
    try {
      const url = `${API_BASE}/${id}/status`;
      console.log('📡 PATCH', url, payload);
      const response = await envelopedFetch<Cita>(url, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const cita = response.data.data;
      console.log('✅ Estado actualizado:', (cita as any)?.estado);
      return cita || null;
    } catch (error) {
      console.error(`❌ Error cambiar estado ${id}:`, error);
      return null;
    }
  }

  /**
   * Confirma una cita
   * @param id ID de la cita
   * @returns Cita confirmada
   */
  async confirmarCita(id: number | string): Promise<Cita | null> {
    try {
      return this.cambiarEstado(id, { estado: 'confirmada' });
    } catch (error) {
      console.error(`❌ Error confirmar cita ${id}:`, error);
      return null;
    }
  }

  /**
   * Cancela una cita
   * @param id ID de la cita
   * @param canceladaPor Usuario que cancela
   * @param razonCancelacion Motivo de cancelación
   * @returns Cita cancelada
   */
  async cancelarCita(
    id: number | string,
    canceladaPor: string,
    razonCancelacion: string
  ): Promise<Cita | null> {
    try {
      const url = `${API_BASE}/${id}/cancel`;
      const payload = { canceladaPor, razonCancelacion };
      console.log('📡 PATCH', url, payload);
      const response = await envelopedFetch<Cita>(url, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      console.log('✅ Cita cancelada');
      return response.data.data || null;
    } catch (error) {
      console.error(`❌ Error cancelar cita ${id}:`, error);
      return null;
    }
  }

  /**
   * Elimina una cita
   * @param id ID de la cita
   * @returns Confirmación de eliminación
   */
  async eliminarCita(id: number | string): Promise<boolean> {
    try {
      const url = `${API_BASE}/${id}`;
      console.log('📡 DELETE', url);
      await envelopedFetch<unknown>(url, { method: 'DELETE' });
      console.log('✅ Cita eliminada');
      return true;
    } catch (error) {
      console.error(`❌ Error eliminar cita ${id}:`, error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const citasAPIService = new CitasAPIService();
