/**
 * ================================================================
 * SERVICIO: GESTIÓN DE INVITACIONES DE EMPLEADOS
 * ================================================================
 * Maneja la lógica de invitaciones (simulación sin backend)
 */

import {
  InvitacionEmpleado,
  FormularioInvitacion,
  DatosAceptacionInvitacion,
  EstadisticasInvitaciones,
  EstadoInvitacion
} from '../types/invitaciones.types';
import { toast } from 'sonner@2.0.3';

// ================================================================
// ALMACENAMIENTO LOCAL (SIMULACIÓN)
// ================================================================

const STORAGE_KEY = 'udar_invitaciones_empleados';

function getInvitaciones(): InvitacionEmpleado[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveInvitaciones(invitaciones: InvitacionEmpleado[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invitaciones));
}

// ================================================================
// GENERADORES DE CÓDIGOS Y LINKS
// ================================================================

function generarCodigoInvitacion(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const parte1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const parte2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `UDAR-${parte1}-${parte2}`;
}

function generarLinkInvitacion(invitacionId: string): string {
  // En producción, esto sería una URL real del backend
  const baseUrl = window.location.origin;
  return `${baseUrl}/aceptar-invitacion?token=${invitacionId}`;
}

function generarCredencialesTemporales(email: string) {
  const usuario = email.split('@')[0];
  const password = Array.from({ length: 12 }, () => 
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'[
      Math.floor(Math.random() * 65)
    ]
  ).join('');
  
  return { usuario, password };
}

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
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    const invitacionId = `INV-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const ahora = new Date();
    const expiracion = new Date(ahora);
    expiracion.setDate(expiracion.getDate() + 7); // Expira en 7 días

    const invitacion: InvitacionEmpleado = {
      id: invitacionId,
      empresaId,
      empresaNombre,
      metodo: formulario.metodo,
      email: formulario.email,
      nombre: formulario.nombre,
      apellidos: formulario.apellidos,
      puesto: formulario.puesto,
      departamento: formulario.departamento,
      estado: 'pendiente',
      fechaCreacion: ahora.toISOString(),
      fechaExpiracion: expiracion.toISOString(),
      creadoPor,
      creadoPorNombre,
      horasSemanales: formulario.horasSemanales,
      tipoContrato: formulario.tipoContrato,
      notas: formulario.notas,
    };

    // Generar datos según el método
    if (formulario.metodo === 'codigo') {
      invitacion.codigoInvitacion = generarCodigoInvitacion();
    } else if (formulario.metodo === 'email') {
      invitacion.linkInvitacion = generarLinkInvitacion(invitacionId);
    } else if (formulario.metodo === 'preregistro') {
      invitacion.credencialesTemporales = generarCredencialesTemporales(formulario.email);
    }

    // Guardar
    const invitaciones = getInvitaciones();
    invitaciones.push(invitacion);
    saveInvitaciones(invitaciones);

    // Simular envío de email
    if (formulario.enviarEmailInmediatamente && formulario.metodo === 'email') {
      await this.enviarEmailInvitacion(invitacion);
    }

    return invitacion;
  }

  /**
   * Obtener todas las invitaciones de una empresa
   */
  async getInvitacionesPorEmpresa(empresaId: string): Promise<InvitacionEmpleado[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const invitaciones = getInvitaciones();
    return invitaciones.filter(inv => inv.empresaId === empresaId);
  }

  /**
   * Obtener invitación por ID
   */
  async getInvitacionPorId(invitacionId: string): Promise<InvitacionEmpleado | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const invitaciones = getInvitaciones();
    return invitaciones.find(inv => inv.id === invitacionId) || null;
  }

  /**
   * Obtener invitación por código
   */
  async getInvitacionPorCodigo(codigo: string): Promise<InvitacionEmpleado | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const invitaciones = getInvitaciones();
    return invitaciones.find(inv => 
      inv.codigoInvitacion?.toLowerCase() === codigo.toLowerCase() && 
      inv.estado === 'pendiente'
    ) || null;
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
    await new Promise(resolve => setTimeout(resolve, 800));

    const validacion = await this.validarInvitacion(datos.invitacionId, datos.codigo);
    
    if (!validacion.valida) {
      return {
        exito: false,
        mensaje: validacion.motivo || 'Invitación no válida'
      };
    }

    const invitacion = validacion.invitacion!;

    // Crear el empleado (en producción, esto crearía el usuario en el backend)
    const empleadoId = `EMP-${Date.now()}`;
    
    // Actualizar invitación
    await this.actualizarEstadoInvitacion(invitacion.id, 'aceptada');

    // Guardar fecha de aceptación
    const invitaciones = getInvitaciones();
    const idx = invitaciones.findIndex(i => i.id === invitacion.id);
    if (idx !== -1) {
      invitaciones[idx].fechaAceptacion = new Date().toISOString();
      saveInvitaciones(invitaciones);
    }

    return {
      exito: true,
      mensaje: 'Invitación aceptada correctamente',
      empleadoId
    };
  }

  /**
   * Cancelar invitación
   */
  async cancelarInvitacion(invitacionId: string): Promise<void> {
    await this.actualizarEstadoInvitacion(invitacionId, 'cancelada');
    toast.success('Invitación cancelada');
  }

  /**
   * Reenviar invitación
   */
  async reenviarInvitacion(invitacionId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const invitacion = await this.getInvitacionPorId(invitacionId);
    
    if (!invitacion) {
      toast.error('Invitación no encontrada');
      return;
    }

    if (invitacion.metodo === 'email') {
      await this.enviarEmailInvitacion(invitacion);
    }

    // Extender expiración
    const nuevaExpiracion = new Date();
    nuevaExpiracion.setDate(nuevaExpiracion.getDate() + 7);
    
    const invitaciones = getInvitaciones();
    const idx = invitaciones.findIndex(i => i.id === invitacionId);
    if (idx !== -1) {
      invitaciones[idx].fechaExpiracion = nuevaExpiracion.toISOString();
      saveInvitaciones(invitaciones);
    }

    toast.success('Invitación reenviada correctamente');
  }

  /**
   * Actualizar estado de invitación
   */
  private async actualizarEstadoInvitacion(
    invitacionId: string,
    nuevoEstado: EstadoInvitacion
  ): Promise<void> {
    const invitaciones = getInvitaciones();
    const idx = invitaciones.findIndex(i => i.id === invitacionId);
    
    if (idx !== -1) {
      invitaciones[idx].estado = nuevoEstado;
      saveInvitaciones(invitaciones);
    }
  }

  /**
   * Simular envío de email
   */
  private async enviarEmailInvitacion(invitacion: InvitacionEmpleado): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('📧 EMAIL SIMULADO ENVIADO:');
    console.log('==========================');
    console.log(`Para: ${invitacion.email}`);
    console.log(`Asunto: Invitación para unirte a ${invitacion.empresaNombre}`);
    console.log('\nContenido:');
    console.log(`Hola ${invitacion.nombre || ''},`);
    console.log(`\n${invitacion.creadoPorNombre} te ha invitado a unirte a ${invitacion.empresaNombre} como ${invitacion.puesto}.`);
    
    if (invitacion.metodo === 'email') {
      console.log(`\nHaz clic en el siguiente enlace para aceptar:`);
      console.log(invitacion.linkInvitacion);
    } else if (invitacion.metodo === 'codigo') {
      console.log(`\nTu código de invitación es: ${invitacion.codigoInvitacion}`);
      console.log(`Úsalo al registrarte en la aplicación.`);
    } else if (invitacion.metodo === 'preregistro') {
      console.log(`\nTus credenciales temporales son:`);
      console.log(`Usuario: ${invitacion.credencialesTemporales?.usuario}`);
      console.log(`Contraseña: ${invitacion.credencialesTemporales?.password}`);
      console.log(`\nPor favor, cámbialas en tu primer inicio de sesión.`);
    }
    
    console.log('\n==========================\n');
    
    toast.success('Email de invitación enviado', {
      description: `Enviado a ${invitacion.email}`
    });
  }

  /**
   * Obtener estadísticas
   */
  async getEstadisticas(empresaId: string): Promise<EstadisticasInvitaciones> {
    const invitaciones = await this.getInvitacionesPorEmpresa(empresaId);
    
    const stats: EstadisticasInvitaciones = {
      total: invitaciones.length,
      pendientes: invitaciones.filter(i => i.estado === 'pendiente').length,
      aceptadas: invitaciones.filter(i => i.estado === 'aceptada').length,
      rechazadas: invitaciones.filter(i => i.estado === 'rechazada').length,
      expiradas: invitaciones.filter(i => i.estado === 'expirada').length,
      porMetodo: {
        email: invitaciones.filter(i => i.metodo === 'email').length,
        codigo: invitaciones.filter(i => i.metodo === 'codigo').length,
        preregistro: invitaciones.filter(i => i.metodo === 'preregistro').length,
      },
      tasaAceptacion: invitaciones.length > 0 
        ? (invitaciones.filter(i => i.estado === 'aceptada').length / invitaciones.length) * 100
        : 0
    };
    
    return stats;
  }

  /**
   * Limpiar invitaciones expiradas
   */
  async limpiarExpiradas(empresaId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const invitaciones = getInvitaciones();
    const ahora = new Date();
    let contador = 0;
    
    invitaciones.forEach(inv => {
      if (inv.empresaId === empresaId && inv.estado === 'pendiente') {
        const expiracion = new Date(inv.fechaExpiracion);
        if (ahora > expiracion) {
          inv.estado = 'expirada';
          contador++;
        }
      }
    });
    
    if (contador > 0) {
      saveInvitaciones(invitaciones);
      toast.info(`${contador} invitación(es) marcadas como expiradas`);
    }
    
    return contador;
  }
}

// Exportar instancia única
export const invitacionesService = new InvitacionesService();
