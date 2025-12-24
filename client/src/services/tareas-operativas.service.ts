/**
 * 📋 WRAPPER PARA TAREAS OPERATIVAS
 * 
 * Interfaz simplificada para gestionar tareas del día a día.
 * Usa el servicio base task-management.service.ts
 */

import {
  crearTareaOperativa,
  completarTarea,
  marcarTareaComoVista,
  iniciarTarea,
  obtenerTareasFiltradas,
  type CrearTareaOperativaParams,
  type CompletarTareaParams,
  type TareaBase,
  type FiltrosTareas,
  type PrioridadTarea,
} from './task-management.service';

// ============================================================================
// FUNCIONES ESPECÍFICAS DE TAREAS OPERATIVAS
// ============================================================================

/**
 * Crear tarea operativa con reporte (trabajador debe confirmar cuando termine)
 */
export const crearTareaConReporte = async (params: Omit<CrearTareaOperativaParams, 'requiereReporte'>): Promise<TareaBase> => {
  return crearTareaOperativa({
    ...params,
    requiereReporte: true,
  });
};

/**
 * Crear guion de trabajo (informativo, no requiere confirmación)
 */
export const crearGuionTrabajo = async (params: Omit<CrearTareaOperativaParams, 'requiereReporte' | 'requiereAprobacion'>): Promise<TareaBase> => {
  return crearTareaOperativa({
    ...params,
    requiereReporte: false,
    requiereAprobacion: false,
  });
};

/**
 * Obtener tareas operativas de un trabajador
 */
export const obtenerTareasOperativasTrabajador = (
  trabajadorId: string,
  opciones?: {
    incluirCompletadas?: boolean;
    soloRequierenReporte?: boolean;
    soloInformativas?: boolean;
  }
): TareaBase[] => {
  const filtros: FiltrosTareas = {
    asignadoA: trabajadorId,
    tipo: 'operativa',
  };
  
  if (opciones?.soloRequierenReporte) {
    filtros.requiereReporte = true;
  }
  
  if (opciones?.soloInformativas) {
    filtros.requiereReporte = false;
  }
  
  if (!opciones?.incluirCompletadas) {
    filtros.estados = ['pendiente', 'en_progreso', 'completada'];
  }
  
  return obtenerTareasFiltradas(filtros);
};

/**
 * Obtener guion de trabajo del día (tareas informativas)
 */
export const obtenerGuionDelDia = (trabajadorId: string, puntoVentaId?: string): TareaBase[] => {
  const filtros: FiltrosTareas = {
    asignadoA: trabajadorId,
    tipo: 'operativa',
    requiereReporte: false,
    estados: ['pendiente', 'en_progreso'],
  };
  
  if (puntoVentaId) {
    filtros.puntoVentaId = puntoVentaId;
  }
  
  const tareas = obtenerTareasFiltradas(filtros);
  
  // Ordenar por prioridad
  const prioridadOrden: Record<PrioridadTarea, number> = {
    'urgente': 1,
    'alta': 2,
    'media': 3,
    'baja': 4,
  };
  
  return tareas.sort((a, b) => prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad]);
};

/**
 * Obtener tareas que requieren reporte (para completar)
 */
export const obtenerTareasParaReportar = (trabajadorId: string, puntoVentaId?: string): TareaBase[] => {
  const filtros: FiltrosTareas = {
    asignadoA: trabajadorId,
    tipo: 'operativa',
    requiereReporte: true,
    estados: ['pendiente', 'en_progreso', 'completada', 'rechazada'],
  };
  
  if (puntoVentaId) {
    filtros.puntoVentaId = puntoVentaId;
  }
  
  return obtenerTareasFiltradas(filtros);
};

/**
 * Obtener tareas por punto de venta
 */
export const obtenerTareasPorPDV = (puntoVentaId: string, opciones?: {
  soloActivas?: boolean;
}): TareaBase[] => {
  const filtros: FiltrosTareas = {
    tipo: 'operativa',
    puntoVentaId,
  };
  
  if (opciones?.soloActivas) {
    filtros.estados = ['pendiente', 'en_progreso'];
  }
  
  return obtenerTareasFiltradas(filtros);
};

/**
 * Obtener tareas creadas por gerente (para seguimiento)
 */
export const obtenerTareasOperativasGerente = (
  gerenteId: string,
  opciones?: {
    pendientesAprobacion?: boolean;
    empresaId?: string;
    marcaId?: string;
    puntoVentaId?: string;
  }
): TareaBase[] => {
  const filtros: FiltrosTareas = {
    asignadoPor: gerenteId,
    tipo: 'operativa',
  };
  
  if (opciones?.pendientesAprobacion) {
    filtros.estados = ['completada'];
  }
  
  if (opciones?.empresaId) {
    filtros.empresaId = opciones.empresaId;
  }
  
  if (opciones?.marcaId) {
    filtros.marcaId = opciones.marcaId;
  }
  
  if (opciones?.puntoVentaId) {
    filtros.puntoVentaId = opciones.puntoVentaId;
  }
  
  return obtenerTareasFiltradas(filtros);
};

// Re-exportar funciones comunes
export {
  completarTarea,
  marcarTareaComoVista,
  iniciarTarea,
  type TareaBase,
  type CompletarTareaParams,
};
