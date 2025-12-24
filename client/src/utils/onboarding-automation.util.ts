/**
 * ================================================================
 * AUTOMATIZACIÓN DE ONBOARDING
 * ================================================================
 * Funciones para automatizar el flujo completo de onboarding
 */

import { onboardingService } from '../services/onboarding.service';
import { 
  notificarBienvenidaEmpleado,
  notificarInvitacionAceptada 
} from './notificaciones-rrhh.util';
import type { CrearProcesoOnboardingRequest } from '../types/onboarding.types';

/**
 * Inicia el proceso de onboarding automáticamente al aceptar una invitación
 */
export async function iniciarOnboardingAutomatico(params: {
  invitacionId: string;
  empleadoId: string;
  empleadoNombre: string;
  empleadoEmail: string;
  empresaId: string;
  empresaNombre: string;
  gerenteId: string;
  puesto: string;
  departamento: string;
  fechaInicio: string;
}) {
  try {
    // 1. Crear el proceso de onboarding
    const request: CrearProcesoOnboardingRequest = {
      empleadoId: params.empleadoId,
      empresaId: params.empresaId,
      invitacionId: params.invitacionId,
      puesto: params.puesto,
      departamento: params.departamento,
      fechaInicio: params.fechaInicio
    };

    const response = await onboardingService.crearProceso(request);

    // 2. Enviar notificación de bienvenida al empleado
    await notificarBienvenidaEmpleado({
      empleadoId: params.empleadoId,
      empresaId: params.empresaId,
      nombreEmpleado: params.empleadoNombre,
      empresaNombre: params.empresaNombre,
      puesto: params.puesto
    });

    // 3. Notificar al gerente que la invitación fue aceptada
    await notificarInvitacionAceptada({
      gerenteId: params.gerenteId,
      empresaId: params.empresaId,
      nombreEmpleado: params.empleadoNombre,
      puesto: params.puesto,
      invitacionId: params.invitacionId
    });

    // 4. Programar recordatorios automáticos
    programarRecordatoriosOnboarding(response.proceso.id, params.empleadoId, params.gerenteId);

    return response.proceso;
  } catch (error) {
    console.error('Error iniciando onboarding automático:', error);
    throw error;
  }
}

/**
 * Programa recordatorios automáticos durante el proceso
 */
function programarRecordatoriosOnboarding(
  procesoId: string,
  empleadoId: string,
  gerenteId: string
) {
  // En producción, estos se programarían en el backend
  // Por ahora, solo simulamos la lógica

  const recordatorios = [
    {
      dias: 1,
      mensaje: 'Recordatorio: Completa tu documentación',
      destinatario: empleadoId
    },
    {
      dias: 3,
      mensaje: 'Seguimiento: Revisa el progreso del nuevo empleado',
      destinatario: gerenteId
    },
    {
      dias: 7,
      mensaje: 'Revisión semanal: Agenda reunión con el nuevo empleado',
      destinatario: gerenteId
    },
    {
      dias: 30,
      mensaje: 'Revisión mensual: Evalúa la integración del empleado',
      destinatario: gerenteId
    }
  ];

  console.log(`Recordatorios programados para proceso ${procesoId}:`, recordatorios);
}

/**
 * Verifica el progreso y envía alertas si hay retrasos
 */
export async function verificarProgresoOnboarding(procesoId: string, empresaId: string) {
  try {
    const proceso = await onboardingService.obtenerProceso(procesoId);
    
    const ahora = new Date();
    const inicio = new Date(proceso.fechaInvitacion);
    const diasTranscurridos = Math.floor((ahora.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    const alertas = [];

    // Alertas basadas en tiempo
    if (diasTranscurridos > 3 && proceso.progresoGeneral < 25) {
      alertas.push('El progreso es más lento de lo esperado');
    }

    if (diasTranscurridos > 7 && proceso.progresoGeneral < 50) {
      alertas.push('El proceso está retrasado significativamente');
    }

    // Alertas basadas en documentos
    const documentosPendientes = proceso.documentos.filter(d => 
      d.obligatorio && d.estado === 'pendiente'
    );
    if (documentosPendientes.length > 0 && diasTranscurridos > 2) {
      alertas.push(`${documentosPendientes.length} documentos obligatorios sin subir`);
    }

    // Alertas basadas en formación
    const formacionesPendientes = proceso.formaciones.filter(f => 
      f.obligatorio && f.estado === 'pendiente'
    );
    if (formacionesPendientes.length > 0 && diasTranscurridos > 5) {
      alertas.push(`${formacionesPendientes.length} formaciones obligatorias pendientes`);
    }

    return {
      procesoId,
      diasTranscurridos,
      alertas,
      requiereAtencion: alertas.length > 0
    };
  } catch (error) {
    console.error('Error verificando progreso:', error);
    throw error;
  }
}

/**
 * Completa automáticamente el onboarding cuando se cumplen todos los requisitos
 */
export async function verificarCompletadoOnboarding(procesoId: string) {
  try {
    const proceso = await onboardingService.obtenerProceso(procesoId);

    // Verificar si todas las tareas obligatorias están completadas
    const tareasObligatorias = proceso.tareas.filter(t => t.prioridad === 'critica');
    const tareasCompletadas = tareasObligatorias.filter(t => t.estado === 'completada');

    // Verificar documentos obligatorios
    const documentosObligatorios = proceso.documentos.filter(d => d.obligatorio);
    const documentosAprobados = documentosObligatorios.filter(d => d.estado === 'aprobado');

    // Verificar formaciones obligatorias
    const formacionesObligatorias = proceso.formaciones.filter(f => f.obligatorio);
    const formacionesCompletadas = formacionesObligatorias.filter(f => 
      f.estado === 'aprobada' || f.estado === 'completada'
    );

    const todoCompletado = 
      tareasCompletadas.length === tareasObligatorias.length &&
      documentosAprobados.length === documentosObligatorios.length &&
      formacionesCompletadas.length === formacionesObligatorias.length;

    if (todoCompletado && proceso.faseActual !== 'onboarding_completado') {
      // Actualizar a completado
      await onboardingService.actualizarFase(procesoId, 'onboarding_completado');
      
      // Aquí se podría enviar notificación de felicitación
      console.log(`¡Onboarding completado para proceso ${procesoId}!`);
      
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verificando completado:', error);
    throw error;
  }
}

/**
 * Genera un reporte de onboarding para el empleado
 */
export async function generarReporteOnboarding(procesoId: string): Promise<string> {
  try {
    const proceso = await onboardingService.obtenerProceso(procesoId);

    const reporte = `
===========================================
REPORTE DE ONBOARDING
===========================================

Empleado: ${proceso.empleadoNombre}
Puesto: ${proceso.puesto}
Departamento: ${proceso.departamento}
Fecha de inicio: ${new Date(proceso.fechaInicio).toLocaleDateString('es-ES')}

-------------------------------------------
PROGRESO GENERAL
-------------------------------------------
Progreso: ${proceso.progresoGeneral}%
Fase actual: ${proceso.faseActual}

-------------------------------------------
TAREAS
-------------------------------------------
Completadas: ${proceso.tareasCompletadas}/${proceso.tareasTotal}
${proceso.tareas.map(t => `${t.estado === 'completada' ? '✓' : '○'} ${t.titulo}`).join('\n')}

-------------------------------------------
DOCUMENTOS
-------------------------------------------
Aprobados: ${proceso.documentos.filter(d => d.estado === 'aprobado').length}/${proceso.documentosTotal}
${proceso.documentos.map(d => `${d.estado === 'aprobado' ? '✓' : '○'} ${d.nombre}`).join('\n')}

-------------------------------------------
FORMACIÓN
-------------------------------------------
Completadas: ${proceso.formacionesCompletadas}/${proceso.formacionesTotal}
${proceso.formaciones.map(f => `${f.estado === 'aprobada' || f.estado === 'completada' ? '✓' : '○'} ${f.titulo}`).join('\n')}

-------------------------------------------
${proceso.fechaCompletado ? 
  `COMPLETADO EL: ${new Date(proceso.fechaCompletado).toLocaleDateString('es-ES')}
Tiempo total: ${proceso.tiempoProceso} días` :
  'PROCESO EN CURSO'}
===========================================
    `.trim();

    return reporte;
  } catch (error) {
    console.error('Error generando reporte:', error);
    throw error;
  }
}

/**
 * Obtiene las próximas acciones recomendadas para el empleado
 */
export async function obtenerProximasAcciones(procesoId: string) {
  try {
    const proceso = await onboardingService.obtenerProceso(procesoId);

    const acciones = [];

    // Tareas pendientes (ordenadas por prioridad)
    const tareasPendientes = proceso.tareas
      .filter(t => t.asignadoA === 'empleado' && t.estado === 'pendiente')
      .sort((a, b) => {
        const prioridades = { critica: 4, alta: 3, media: 2, baja: 1 };
        return prioridades[b.prioridad] - prioridades[a.prioridad];
      });

    if (tareasPendientes.length > 0) {
      acciones.push({
        tipo: 'tarea',
        prioridad: tareasPendientes[0].prioridad,
        titulo: tareasPendientes[0].titulo,
        descripcion: tareasPendientes[0].descripcion,
        id: tareasPendientes[0].id
      });
    }

    // Documentos pendientes
    const documentosPendientes = proceso.documentos.filter(d => 
      d.estado === 'pendiente' || d.estado === 'rechazado'
    );

    if (documentosPendientes.length > 0) {
      acciones.push({
        tipo: 'documento',
        prioridad: documentosPendientes[0].obligatorio ? 'alta' : 'media',
        titulo: `Subir ${documentosPendientes[0].nombre}`,
        descripcion: documentosPendientes[0].descripcion,
        id: documentosPendientes[0].id
      });
    }

    // Formaciones pendientes
    const formacionesPendientes = proceso.formaciones.filter(f => 
      f.estado === 'pendiente'
    );

    if (formacionesPendientes.length > 0) {
      acciones.push({
        tipo: 'formacion',
        prioridad: formacionesPendientes[0].obligatorio ? 'alta' : 'media',
        titulo: `Completar ${formacionesPendientes[0].titulo}`,
        descripcion: `${formacionesPendientes[0].duracionEstimada} minutos`,
        id: formacionesPendientes[0].id
      });
    }

    return acciones.slice(0, 3); // Máximo 3 acciones
  } catch (error) {
    console.error('Error obteniendo próximas acciones:', error);
    throw error;
  }
}
