/**
 * ================================================================
 * SERVICIO: GESTIÓN DE INVITACIONES DE EMPLEADOS
 * ================================================================
 * Backend-first: invitaciones persistidas en BD via API.
 */

import {
  InvitacionEmpleado,
  FormularioInvitacion,
  DatosAceptacionInvitacion,
  EstadisticasInvitaciones,
  EstadoInvitacion
} from '../types/invitaciones.types';
import { toast } from 'sonner@2.0.3';
import { envelopedFetch } from './http/envelopedFetch';

// ================================================================
// SERVICIO PRINCIPAL
// ================================================================

class InvitacionesService {
  /**
   * Crear nueva invitación
   */
  async crearInvitacion(
    formulario: FormularioInvitacion,
    empresaId: string,
    empresaNombre: string,
    creadoPor: string,
    creadoPorNombre: string
  ): Promise<InvitacionEmpleado> {
    const res = await envelopedFetch<any>('/gerente/rrhh/invitaciones', {
      method: 'POST',
      body: JSON.stringify({
        empresaId,
        empresaNombre,
        metodo: formulario.metodo,
        email: formulario.email,
        nombre: formulario.nombre,
        apellidos: formulario.apellidos,
        puesto: formulario.puesto,
        departamento: formulario.departamento,
        creadoPor,
        creadoPorNombre,
        horasSemanales: formulario.horasSemanales,
        tipoContrato: formulario.tipoContrato,
        notas: formulario.notas,
      }),
    });

    toast.success('Invitación creada');
    return res.data.data as InvitacionEmpleado;
  }

  /**
   * Obtener todas las invitaciones de una empresa
   */
  async getInvitacionesPorEmpresa(empresaId: string): Promise<InvitacionEmpleado[]> {
    const qp = new URLSearchParams({ empresa_id: empresaId }).toString();
    const res = await envelopedFetch<InvitacionEmpleado[]>(`/gerente/rrhh/invitaciones?${qp}`, { method: 'GET' });
    return (res.data.data ?? []) as any;
  }

  /**
   * Obtener invitación por ID
   */
  async getInvitacionPorId(invitacionId: string): Promise<InvitacionEmpleado | null> {
    // Not required by gerente UI today (list screen uses list endpoint).
    void invitacionId;
    return null;
  }

  /**
   * Obtener invitación por código
   */
  async getInvitacionPorCodigo(codigo: string): Promise<InvitacionEmpleado | null> {
    // Acceptance flow (trabajador) not implemented yet.
    void codigo;
    return null;
  }

  /**
   * Validar invitación
   */
  async validarInvitacion(invitacionId: string, codigo?: string): Promise<{
    valida: boolean;
    motivo?: string;
    invitacion?: InvitacionEmpleado;
  }> {
    const invitacion = codigo 
      ? await this.getInvitacionPorCodigo(codigo)
      : await this.getInvitacionPorId(invitacionId);

    if (!invitacion) {
      return { valida: false, motivo: 'Invitación no encontrada' };
    }

    if (invitacion.estado !== 'pendiente') {
      return { valida: false, motivo: `Esta invitación ya ha sido ${invitacion.estado}` };
    }

    const ahora = new Date();
    const expiracion = new Date(invitacion.fechaExpiracion);
    if (ahora > expiracion) {
      // Marcar como expirada
      await this.actualizarEstadoInvitacion(invitacion.id, 'expirada');
      return { valida: false, motivo: 'Esta invitación ha expirado' };
    }

    return { valida: true, invitacion };
  }

  /**
   * Aceptar invitación
   */
  async aceptarInvitacion(datos: DatosAceptacionInvitacion): Promise<{
    exito: boolean;
    mensaje: string;
    empleadoId?: string;
  }> {
    void datos;
    return { exito: false, mensaje: 'Aceptación de invitación no implementada' };
  }

  /**
   * Cancelar invitación
   */
  async cancelarInvitacion(invitacionId: string): Promise<void> {
    await envelopedFetch(`/gerente/rrhh/invitaciones/${encodeURIComponent(invitacionId)}/cancelar`, { method: 'PUT' });
    toast.success('Invitación cancelada');
  }

  /**
   * Reenviar invitación
   */
  async reenviarInvitacion(invitacionId: string): Promise<void> {
    await envelopedFetch(`/gerente/rrhh/invitaciones/${encodeURIComponent(invitacionId)}/reenviar`, { method: 'POST' });
    toast.success('Invitación reenviada correctamente');
  }

  // NOTE: EstadoInvitacion + validarInvitacion() remain for future acceptance flow.
  private async actualizarEstadoInvitacion(invitacionId: string, nuevoEstado: EstadoInvitacion): Promise<void> {
    // backend is source of truth
    void invitacionId;
    void nuevoEstado;
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(empresaId: string): Promise<EstadisticasInvitaciones> {
    const qp = new URLSearchParams({ empresa_id: empresaId }).toString();
    const res = await envelopedFetch<any>(`/gerente/rrhh/invitaciones/estadisticas?${qp}`, { method: 'GET' });
    const s = res.data.data || {};
    const total = Number(s.total || 0);
    const pendientes = Number(s.pendientes || 0);
    const aceptadas = Number(s.aceptadas || 0);
    const rechazadas = Number(s.rechazadas || 0);
    const expiradas = Number(s.expiradas || 0);
    const canceladas = Number(s.canceladas || 0);

    // We do not compute porMetodo in backend yet; derive from list for UI.
    const invitaciones = await this.getInvitacionesPorEmpresa(empresaId);
    const porMetodo = {
      email: invitaciones.filter((i) => i.metodo === 'email').length,
      codigo: invitaciones.filter((i) => i.metodo === 'codigo').length,
      preregistro: invitaciones.filter((i) => i.metodo === 'preregistro').length,
    };

    return {
      total,
      pendientes,
      aceptadas,
      rechazadas,
      expiradas,
      canceladas,
      porMetodo,
      tasaAceptacion: total > 0 ? (aceptadas / total) * 100 : 0,
    } as any;
  }

  /**
   * Limpiar invitaciones expiradas
   */
  async limpiarExpiradas(empresaId: string): Promise<number> {
    const qp = new URLSearchParams({ empresa_id: empresaId }).toString();
    const res = await envelopedFetch<any>(`/gerente/rrhh/invitaciones/limpiar-expiradas?${qp}`, { method: 'POST' });
    const n = Number(res.data.data?.actualizadas ?? 0);
    if (n > 0) toast.info(`${n} invitación(es) marcadas como expiradas`);
    return n;
  }
}

// Exportar instancia única
export const invitacionesService = new InvitacionesService();
