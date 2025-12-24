/**
 * ================================================================
 * UTILIDADES DE NOTIFICACIONES PUSH - RRHH
 * ================================================================
 * Helper functions para crear notificaciones automáticas relacionadas
 * con invitaciones de empleados, fichajes, nóminas, etc.
 */

import { notificationsService } from '../services/notifications.service';
import type { CreateNotificationRequest } from '../types/notifications.types';

// ==================== NOTIFICACIONES PARA GERENTE ====================

/**
 * Notificación cuando un empleado acepta una invitación
 */
export async function notificarInvitacionAceptada(params: {
  gerenteId: string;
  empresaId: string;
  nombreEmpleado: string;
  puesto: string;
  invitacionId: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'invitacion',
    titulo: '✅ Invitación aceptada',
    mensaje: `${params.nombreEmpleado} ha aceptado la invitación como ${params.puesto}`,
    descripcion: 'El empleado ha completado su registro y está listo para empezar',
    prioridad: 'normal',
    usuarioId: params.gerenteId,
    empresaId: params.empresaId,
    relacionId: params.invitacionId,
    relacionTipo: 'invitacion',
    urlAccion: `/gerente/equipo`,
    accionTexto: 'Ver equipo',
    canales: ['push', 'in_app', 'email'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación cuando una invitación está por expirar
 */
export async function notificarInvitacionPorExpirar(params: {
  gerenteId: string;
  empresaId: string;
  emailEmpleado: string;
  puesto: string;
  invitacionId: string;
  diasRestantes: number;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'invitacion',
    titulo: '⏰ Invitación por expirar',
    mensaje: `La invitación para ${params.emailEmpleado} (${params.puesto}) expira en ${params.diasRestantes} días`,
    descripcion: 'Considera reenviar la invitación si el empleado no ha respondido',
    prioridad: 'normal',
    usuarioId: params.gerenteId,
    empresaId: params.empresaId,
    relacionId: params.invitacionId,
    relacionTipo: 'invitacion',
    urlAccion: `/gerente/invitaciones`,
    accionTexto: 'Ver invitaciones',
    canales: ['push', 'in_app'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación cuando un empleado completa documentación
 */
export async function notificarDocumentacionCompletada(params: {
  gerenteId: string;
  empresaId: string;
  nombreEmpleado: string;
  empleadoId: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'rrhh',
    titulo: '📄 Documentación completada',
    mensaje: `${params.nombreEmpleado} ha subido toda la documentación requerida`,
    descripcion: 'Revisa y aprueba los documentos para finalizar el alta',
    prioridad: 'normal',
    usuarioId: params.gerenteId,
    empresaId: params.empresaId,
    relacionId: params.empleadoId,
    relacionTipo: 'empleado',
    urlAccion: `/gerente/equipo/${params.empleadoId}`,
    accionTexto: 'Revisar documentos',
    canales: ['push', 'in_app'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de fichaje irregular
 */
export async function notificarFichajeIrregular(params: {
  gerenteId: string;
  empresaId: string;
  nombreEmpleado: string;
  tipoIrregularidad: 'falta_entrada' | 'falta_salida' | 'exceso_horas';
  fecha: string;
  empleadoId: string;
}) {
  const mensajes = {
    falta_entrada: 'No hay registro de entrada',
    falta_salida: 'No hay registro de salida',
    exceso_horas: 'Exceso de horas trabajadas'
  };

  const request: CreateNotificationRequest = {
    tipo: 'fichaje',
    titulo: '⚠️ Fichaje irregular',
    mensaje: `${params.nombreEmpleado} - ${mensajes[params.tipoIrregularidad]} (${params.fecha})`,
    descripcion: 'Revisa el fichaje y toma las acciones necesarias',
    prioridad: 'alta',
    usuarioId: params.gerenteId,
    empresaId: params.empresaId,
    relacionId: params.empleadoId,
    relacionTipo: 'fichaje',
    urlAccion: `/gerente/fichajes`,
    accionTexto: 'Ver fichajes',
    canales: ['push', 'in_app'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de solicitud de vacaciones
 */
export async function notificarSolicitudVacaciones(params: {
  gerenteId: string;
  empresaId: string;
  nombreEmpleado: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  solicitudId: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'vacaciones',
    titulo: '🏖️ Solicitud de vacaciones',
    mensaje: `${params.nombreEmpleado} solicita ${params.dias} días de vacaciones`,
    descripcion: `Del ${params.fechaInicio} al ${params.fechaFin}`,
    prioridad: 'normal',
    usuarioId: params.gerenteId,
    empresaId: params.empresaId,
    relacionId: params.solicitudId,
    relacionTipo: 'vacaciones',
    urlAccion: `/gerente/vacaciones`,
    accionTexto: 'Revisar solicitud',
    canales: ['push', 'in_app', 'email'],
  };

  return await notificationsService.createNotification(request);
}

// ==================== NOTIFICACIONES PARA TRABAJADOR ====================

/**
 * Notificación de bienvenida al aceptar invitación
 */
export async function notificarBienvenidaEmpleado(params: {
  empleadoId: string;
  empresaId: string;
  nombreEmpleado: string;
  empresaNombre: string;
  puesto: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'sistema',
    titulo: `🎉 ¡Bienvenido a ${params.empresaNombre}!`,
    mensaje: `Tu perfil como ${params.puesto} ha sido activado correctamente`,
    descripcion: 'Completa tu perfil y empieza a explorar la aplicación',
    prioridad: 'normal',
    usuarioId: params.empleadoId,
    empresaId: params.empresaId,
    urlAccion: `/trabajador/perfil`,
    accionTexto: 'Ir a mi perfil',
    canales: ['push', 'in_app', 'email'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de recordatorio de fichaje
 */
export async function notificarRecordatorioFichaje(params: {
  empleadoId: string;
  empresaId: string;
  tipo: 'entrada' | 'salida';
}) {
  const mensajes = {
    entrada: '¡No olvides fichar tu entrada!',
    salida: '¡No olvides fichar tu salida!'
  };

  const request: CreateNotificationRequest = {
    tipo: 'fichaje',
    titulo: '🕐 Recordatorio de fichaje',
    mensaje: mensajes[params.tipo],
    descripcion: 'Recuerda registrar tu fichaje para mantener tu horario actualizado',
    prioridad: 'alta',
    usuarioId: params.empleadoId,
    empresaId: params.empresaId,
    urlAccion: `/trabajador/fichajes`,
    accionTexto: 'Fichar ahora',
    canales: ['push', 'in_app'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de nómina disponible
 */
export async function notificarNominaDisponible(params: {
  empleadoId: string;
  empresaId: string;
  mes: string;
  año: number;
  importeNeto: number;
  nominaId: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'nomina',
    titulo: '💰 Nómina disponible',
    mensaje: `Tu nómina de ${params.mes} ${params.año} está disponible`,
    descripcion: `Importe neto: ${params.importeNeto.toFixed(2)}€`,
    prioridad: 'alta',
    usuarioId: params.empleadoId,
    empresaId: params.empresaId,
    relacionId: params.nominaId,
    relacionTipo: 'nomina',
    urlAccion: `/trabajador/nominas`,
    accionTexto: 'Ver nómina',
    canales: ['push', 'in_app', 'email'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de respuesta a solicitud de vacaciones
 */
export async function notificarRespuestaVacaciones(params: {
  empleadoId: string;
  empresaId: string;
  estado: 'aprobada' | 'rechazada';
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
  solicitudId: string;
}) {
  const emojis = {
    aprobada: '✅',
    rechazada: '❌'
  };

  const titulos = {
    aprobada: 'Vacaciones aprobadas',
    rechazada: 'Vacaciones rechazadas'
  };

  const request: CreateNotificationRequest = {
    tipo: 'vacaciones',
    titulo: `${emojis[params.estado]} ${titulos[params.estado]}`,
    mensaje: `Tu solicitud de vacaciones del ${params.fechaInicio} al ${params.fechaFin} ha sido ${params.estado}`,
    descripcion: params.motivo || undefined,
    prioridad: params.estado === 'aprobada' ? 'normal' : 'alta',
    usuarioId: params.empleadoId,
    empresaId: params.empresaId,
    relacionId: params.solicitudId,
    relacionTipo: 'vacaciones',
    urlAccion: `/trabajador/vacaciones`,
    accionTexto: 'Ver detalles',
    canales: ['push', 'in_app', 'email'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de cambio de horario
 */
export async function notificarCambioHorario(params: {
  empleadoId: string;
  empresaId: string;
  fecha: string;
  horarioAnterior: string;
  horarioNuevo: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'rrhh',
    titulo: '📅 Cambio de horario',
    mensaje: `Tu horario del ${params.fecha} ha cambiado`,
    descripcion: `Anterior: ${params.horarioAnterior} → Nuevo: ${params.horarioNuevo}`,
    prioridad: 'alta',
    usuarioId: params.empleadoId,
    empresaId: params.empresaId,
    urlAccion: `/trabajador/horarios`,
    accionTexto: 'Ver horarios',
    canales: ['push', 'in_app', 'sms'],
  };

  return await notificationsService.createNotification(request);
}

/**
 * Notificación de curso de formación disponible
 */
export async function notificarCursoDisponible(params: {
  empleadoId: string;
  empresaId: string;
  nombreCurso: string;
  fechaLimite?: string;
  cursoId: string;
}) {
  const request: CreateNotificationRequest = {
    tipo: 'formacion',
    titulo: '📚 Nuevo curso disponible',
    mensaje: `Curso: ${params.nombreCurso}`,
    descripcion: params.fechaLimite 
      ? `Fecha límite: ${params.fechaLimite}` 
      : 'Curso autoguiado, complétalo a tu ritmo',
    prioridad: 'normal',
    usuarioId: params.empleadoId,
    empresaId: params.empresaId,
    relacionId: params.cursoId,
    relacionTipo: 'formacion',
    urlAccion: `/trabajador/formacion`,
    accionTexto: 'Ver curso',
    canales: ['push', 'in_app'],
  };

  return await notificationsService.createNotification(request);
}

// ==================== FUNCIONES DE EJEMPLO/TESTING ====================

/**
 * Función para crear notificaciones de ejemplo (desarrollo/testing)
 */
export async function crearNotificacionesEjemplo(usuarioId: string, empresaId: string, perfil: 'gerente' | 'trabajador') {
  const ejemplos: CreateNotificationRequest[] = [];

  if (perfil === 'gerente') {
    ejemplos.push(
      {
        tipo: 'invitacion',
        titulo: '✅ Nueva invitación aceptada',
        mensaje: 'María García ha aceptado la invitación como Camarera',
        prioridad: 'normal',
        usuarioId,
        empresaId,
        canales: ['push', 'in_app'],
        urlAccion: '/gerente/equipo',
        accionTexto: 'Ver equipo'
      },
      {
        tipo: 'fichaje',
        titulo: '⚠️ Fichaje irregular detectado',
        mensaje: 'Carlos López - Falta registro de salida (24/11/2024)',
        prioridad: 'alta',
        usuarioId,
        empresaId,
        canales: ['push', 'in_app'],
        urlAccion: '/gerente/fichajes',
        accionTexto: 'Revisar'
      },
      {
        tipo: 'vacaciones',
        titulo: '🏖️ Nueva solicitud de vacaciones',
        mensaje: 'Ana Martínez solicita 15 días de vacaciones',
        descripcion: 'Del 15/12/2024 al 29/12/2024',
        prioridad: 'normal',
        usuarioId,
        empresaId,
        canales: ['push', 'in_app', 'email'],
        urlAccion: '/gerente/vacaciones',
        accionTexto: 'Revisar solicitud'
      }
    );
  } else {
    ejemplos.push(
      {
        tipo: 'nomina',
        titulo: '💰 Nómina disponible',
        mensaje: 'Tu nómina de Noviembre 2024 está disponible',
        descripcion: 'Importe neto: 1,450.00€',
        prioridad: 'alta',
        usuarioId,
        empresaId,
        canales: ['push', 'in_app', 'email'],
        urlAccion: '/trabajador/nominas',
        accionTexto: 'Ver nómina'
      },
      {
        tipo: 'fichaje',
        titulo: '🕐 Recordatorio de fichaje',
        mensaje: '¡No olvides fichar tu salida!',
        prioridad: 'alta',
        usuarioId,
        empresaId,
        canales: ['push', 'in_app'],
        urlAccion: '/trabajador/fichajes',
        accionTexto: 'Fichar ahora'
      },
      {
        tipo: 'vacaciones',
        titulo: '✅ Vacaciones aprobadas',
        mensaje: 'Tu solicitud de vacaciones del 15/12/2024 al 29/12/2024 ha sido aprobada',
        prioridad: 'normal',
        usuarioId,
        empresaId,
        canales: ['push', 'in_app', 'email'],
        urlAccion: '/trabajador/vacaciones',
        accionTexto: 'Ver detalles'
      }
    );
  }

  const results = await Promise.all(
    ejemplos.map(ejemplo => notificationsService.createNotification(ejemplo))
  );

  return results;
}
