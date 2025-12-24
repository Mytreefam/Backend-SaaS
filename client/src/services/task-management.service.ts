/**
 * 📋 SERVICIO DE GESTIÓN DE TAREAS Y FORMACIÓN
 * 
 * Sistema híbrido que gestiona:
 * 1. Tareas operativas (día a día)
 * 2. Módulos de formación/onboarding
 * 
 * ✨ Características:
 * - El gerente decide si requiere reporte o es solo informativa
 * - Tareas informativas: Guion de trabajo (checklist visual)
 * - Tareas con reporte: Requieren confirmación del trabajador
 * - Notificaciones bidireccionales
 * - Tracking completo de asignación y completitud
 * - Soporte para recurrencia
 * - Sistema de aprobación para formación
 */

import { notificationsService } from './notifications.service';

// ============================================================================
// TIPOS
// ============================================================================

export type TipoTarea = 'operativa' | 'formacion';
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'aprobada' | 'rechazada' | 'vencida';
export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente';
export type FrecuenciaTarea = 'unica' | 'diaria' | 'semanal' | 'mensual';

export interface TareaBase {
  id: string;
  tipo: TipoTarea;
  
  // Información básica
  titulo: string;
  descripcion: string;
  instrucciones?: string; // Instrucciones detalladas
  
  // Jerarquía multiempresa
  empresaId: string;
  empresaNombre: string;
  marcaId?: string;
  marcaNombre?: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  
  // Asignación
  asignadoA: string; // ID del trabajador
  asignadoNombre: string; // Nombre del trabajador
  asignadoPor: string; // ID del gerente
  asignadoPorNombre: string; // Nombre del gerente
  
  // Estado y prioridad
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  
  // ⭐ CONTROL DE REPORTE (NUEVO)
  requiereReporte: boolean; // Si es true, el trabajador debe confirmar/reportar
  // Si es false, es solo informativa (guion de trabajo)
  
  // Fechas
  fechaAsignacion: string;
  fechaInicio?: string; // Cuándo se debe empezar
  fechaVencimiento?: string;
  fechaCompletada?: string;
  fechaAprobada?: string;
  
  // Recurrencia (solo para tareas operativas)
  recurrente: boolean;
  frecuencia?: FrecuenciaTarea;
  diasSemana?: number[]; // 0=Domingo, 1=Lunes, etc.
  
  // Evidencia/Reporte (solo si requiereReporte = true)
  comentarioTrabajador?: string;
  evidenciaUrl?: string[]; // URLs de fotos/documentos
  tiempoEmpleado?: number; // Minutos que tardó
  
  // Aprobación gerente (solo si requiereReporte = true)
  requiereAprobacion: boolean; // Si el gerente debe aprobar
  comentarioGerente?: string;
  fechaRevision?: string;
  
  // Específico de FORMACIÓN
  esFormacion: boolean;
  moduloFormacionId?: string;
  certificadoUrl?: string;
  puntuacion?: number; // 0-100
  duracionEstimada?: number; // Minutos
  urlRecurso?: string; // Video, PDF, etc.
  
  // Metadatos
  etiquetas?: string[];
  categoria?: string;
  observaciones?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// INTERFACES DE CREACIÓN
// ============================================================================

export interface CrearTareaOperativaParams {
  // Jerarquía
  empresaId: string;
  empresaNombre: string;
  marcaId?: string;
  marcaNombre?: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  
  // Básico
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  
  // Asignación
  asignadoA: string;
  asignadoNombre: string;
  asignadoPor: string;
  asignadoPorNombre: string;
  
  // Configuración
  prioridad: PrioridadTarea;
  requiereReporte: boolean; // ⭐ NUEVO: Define si es guion o requiere confirmación
  requiereAprobacion?: boolean; // Solo aplica si requiereReporte = true
  
  // Fechas
  fechaInicio?: string;
  fechaVencimiento?: string;
  
  // Recurrencia
  recurrente?: boolean;
  frecuencia?: FrecuenciaTarea;
  diasSemana?: number[];
  
  // Metadata
  etiquetas?: string[];
  categoria?: string;
  observaciones?: string;
}

export interface CrearModuloFormacionParams {
  // Jerarquía
  empresaId: string;
  empresaNombre: string;
  
  // Básico
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  
  // Asignación
  asignadoA: string;
  asignadoNombre: string;
  asignadoPor: string;
  asignadoPorNombre: string;
  
  // Configuración formación
  moduloFormacionId: string;
  duracionEstimada?: number;
  urlRecurso?: string;
  requiereAprobacion?: boolean;
  
  // Fechas
  fechaVencimiento?: string;
  
  // Metadata
  etiquetas?: string[];
  categoria?: string;
}

export interface CompletarTareaParams {
  tareaId: string;
  trabajadorId: string;
  comentario?: string;
  evidenciaUrls?: string[];
  tiempoEmpleado?: number;
  puntuacion?: number; // Solo para formación
}

export interface AprobarTareaParams {
  tareaId: string;
  gerenteId: string;
  aprobada: boolean;
  comentario?: string;
  certificadoUrl?: string; // Solo para formación
}

export interface FiltrosTareas {
  empresaId?: string;
  marcaId?: string;
  puntoVentaId?: string;
  asignadoA?: string;
  asignadoPor?: string;
  tipo?: TipoTarea;
  estados?: EstadoTarea[];
  prioridades?: PrioridadTarea[];
  requiereReporte?: boolean; // Filtrar solo informativas o con reporte
  fechaDesde?: Date;
  fechaHasta?: Date;
  etiquetas?: string[];
}

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY = 'udar-tareas';

const getTareas = (): TareaBase[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al cargar tareas:', error);
    return [];
  }
};

const saveTareas = (tareas: TareaBase[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
  } catch (error) {
    console.error('Error al guardar tareas:', error);
  }
};

const generarIdTarea = (): string => {
  return `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Crear tarea operativa
 */
export const crearTareaOperativa = async (params: CrearTareaOperativaParams): Promise<TareaBase> => {
  const now = new Date().toISOString();
  
  const tarea: TareaBase = {
    id: generarIdTarea(),
    tipo: 'operativa',
    
    titulo: params.titulo,
    descripcion: params.descripcion,
    instrucciones: params.instrucciones,
    
    empresaId: params.empresaId,
    empresaNombre: params.empresaNombre,
    marcaId: params.marcaId,
    marcaNombre: params.marcaNombre,
    puntoVentaId: params.puntoVentaId,
    puntoVentaNombre: params.puntoVentaNombre,
    
    asignadoA: params.asignadoA,
    asignadoNombre: params.asignadoNombre,
    asignadoPor: params.asignadoPor,
    asignadoPorNombre: params.asignadoPorNombre,
    
    estado: 'pendiente',
    prioridad: params.prioridad,
    
    requiereReporte: params.requiereReporte,
    requiereAprobacion: params.requiereAprobacion || false,
    
    fechaAsignacion: now,
    fechaInicio: params.fechaInicio,
    fechaVencimiento: params.fechaVencimiento,
    
    recurrente: params.recurrente || false,
    frecuencia: params.frecuencia,
    diasSemana: params.diasSemana,
    
    esFormacion: false,
    
    etiquetas: params.etiquetas,
    categoria: params.categoria,
    observaciones: params.observaciones,
    
    createdAt: now,
    updatedAt: now,
  };
  
  const tareas = getTareas();
  tareas.unshift(tarea);
  saveTareas(tareas);
  
  // Enviar notificación al trabajador
  try {
    await notificationsService.createNotification({
      tipo: 'tarea',
      titulo: params.requiereReporte 
        ? `Nueva tarea asignada: ${params.titulo}`
        : `Guion de trabajo: ${params.titulo}`,
      mensaje: params.descripcion,
      prioridad: params.prioridad === 'urgente' ? 'urgente' : params.prioridad === 'alta' ? 'alta' : 'normal',
      usuarioId: params.asignadoA,
      empresaId: params.empresaId,
      puntoVentaId: params.puntoVentaId,
      relacionId: tarea.id,
      relacionTipo: 'tarea',
      urlAccion: '/tareas',
      accionTexto: params.requiereReporte ? 'Ver tarea' : 'Ver guion',
      canales: ['push', 'in_app'],
    });
  } catch (error) {
    console.error('Error al enviar notificación de tarea:', error);
  }
  
  console.log('✅ Tarea operativa creada:', tarea.id, params.requiereReporte ? '(requiere reporte)' : '(informativa)');
  return tarea;
};

/**
 * Crear módulo de formación
 */
export const crearModuloFormacion = async (params: CrearModuloFormacionParams): Promise<TareaBase> => {
  const now = new Date().toISOString();
  
  const tarea: TareaBase = {
    id: generarIdTarea(),
    tipo: 'formacion',
    
    titulo: params.titulo,
    descripcion: params.descripcion,
    instrucciones: params.instrucciones,
    
    empresaId: params.empresaId,
    empresaNombre: params.empresaNombre,
    
    asignadoA: params.asignadoA,
    asignadoNombre: params.asignadoNombre,
    asignadoPor: params.asignadoPor,
    asignadoPorNombre: params.asignadoPorNombre,
    
    estado: 'pendiente',
    prioridad: 'media',
    
    requiereReporte: true, // Formación siempre requiere completar
    requiereAprobacion: params.requiereAprobacion || true, // Formación por defecto requiere aprobación
    
    fechaAsignacion: now,
    fechaVencimiento: params.fechaVencimiento,
    
    recurrente: false,
    
    esFormacion: true,
    moduloFormacionId: params.moduloFormacionId,
    duracionEstimada: params.duracionEstimada,
    urlRecurso: params.urlRecurso,
    
    etiquetas: params.etiquetas,
    categoria: params.categoria,
    
    createdAt: now,
    updatedAt: now,
  };
  
  const tareas = getTareas();
  tareas.unshift(tarea);
  saveTareas(tareas);
  
  // Enviar notificación al trabajador
  try {
    await notificationsService.createNotification({
      tipo: 'formacion',
      titulo: `Nuevo módulo de formación: ${params.titulo}`,
      mensaje: params.descripcion,
      prioridad: 'normal',
      usuarioId: params.asignadoA,
      empresaId: params.empresaId,
      relacionId: tarea.id,
      relacionTipo: 'formacion',
      urlAccion: '/formacion',
      accionTexto: 'Comenzar formación',
      canales: ['push', 'in_app', 'email'],
    });
  } catch (error) {
    console.error('Error al enviar notificación de formación:', error);
  }
  
  console.log('✅ Módulo de formación creado:', tarea.id);
  return tarea;
};

/**
 * Completar tarea (trabajador)
 */
export const completarTarea = async (params: CompletarTareaParams): Promise<TareaBase | null> => {
  const tareas = getTareas();
  const index = tareas.findIndex(t => t.id === params.tareaId);
  
  if (index === -1) return null;
  
  const tarea = tareas[index];
  
  // Validar que sea el trabajador asignado
  if (tarea.asignadoA !== params.trabajadorId) {
    console.warn('Trabajador no autorizado para completar esta tarea');
    return null;
  }
  
  // Si no requiere reporte, no se puede "completar" de esta forma
  if (!tarea.requiereReporte) {
    console.warn('Esta tarea es informativa y no requiere reporte de completitud');
    return null;
  }
  
  const now = new Date().toISOString();
  
  // Actualizar tarea
  tareas[index] = {
    ...tarea,
    estado: tarea.requiereAprobacion ? 'completada' : 'aprobada', // Si no requiere aprobación, directamente aprobada
    fechaCompletada: now,
    comentarioTrabajador: params.comentario,
    evidenciaUrl: params.evidenciaUrls,
    tiempoEmpleado: params.tiempoEmpleado,
    puntuacion: params.puntuacion,
    updatedAt: now,
  };
  
  // Si no requiere aprobación, también es la fecha de aprobación
  if (!tarea.requiereAprobacion) {
    tareas[index].fechaAprobada = now;
  }
  
  saveTareas(tareas);
  
  // Notificar al gerente si requiere aprobación
  if (tarea.requiereAprobacion) {
    try {
      await notificationsService.createNotification({
        tipo: 'tarea',
        titulo: `Tarea completada por ${tarea.asignadoNombre}`,
        mensaje: `${tarea.titulo} - Pendiente de revisión`,
        prioridad: 'normal',
        usuarioId: tarea.asignadoPor,
        empresaId: tarea.empresaId,
        puntoVentaId: tarea.puntoVentaId,
        relacionId: tarea.id,
        relacionTipo: 'tarea',
        urlAccion: `/tareas/${tarea.id}`,
        accionTexto: 'Revisar tarea',
        canales: ['push', 'in_app'],
      });
    } catch (error) {
      console.error('Error al notificar al gerente:', error);
    }
  }
  
  console.log('✅ Tarea completada:', params.tareaId);
  return tareas[index];
};

/**
 * Aprobar/Rechazar tarea (gerente)
 */
export const aprobarTarea = async (params: AprobarTareaParams): Promise<TareaBase | null> => {
  const tareas = getTareas();
  const index = tareas.findIndex(t => t.id === params.tareaId);
  
  if (index === -1) return null;
  
  const tarea = tareas[index];
  
  // Validar que sea el gerente que la asignó
  if (tarea.asignadoPor !== params.gerenteId) {
    console.warn('Gerente no autorizado para aprobar esta tarea');
    return null;
  }
  
  // Validar que esté completada
  if (tarea.estado !== 'completada') {
    console.warn('Solo se pueden aprobar/rechazar tareas completadas');
    return null;
  }
  
  const now = new Date().toISOString();
  
  tareas[index] = {
    ...tarea,
    estado: params.aprobada ? 'aprobada' : 'rechazada',
    comentarioGerente: params.comentario,
    fechaAprobada: params.aprobada ? now : undefined,
    fechaRevision: now,
    certificadoUrl: params.certificadoUrl,
    updatedAt: now,
  };
  
  saveTareas(tareas);
  
  // Notificar al trabajador
  try {
    await notificationsService.createNotification({
      tipo: tarea.esFormacion ? 'formacion' : 'tarea',
      titulo: params.aprobada 
        ? `✅ Tarea aprobada: ${tarea.titulo}`
        : `❌ Tarea rechazada: ${tarea.titulo}`,
      mensaje: params.comentario || (params.aprobada ? 'Tu trabajo ha sido aprobado' : 'Necesita correcciones'),
      prioridad: params.aprobada ? 'normal' : 'alta',
      usuarioId: tarea.asignadoA,
      empresaId: tarea.empresaId,
      puntoVentaId: tarea.puntoVentaId,
      relacionId: tarea.id,
      relacionTipo: 'tarea',
      urlAccion: `/tareas/${tarea.id}`,
      accionTexto: params.aprobada ? 'Ver detalles' : 'Revisar y corregir',
      canales: ['push', 'in_app'],
    });
  } catch (error) {
    console.error('Error al notificar al trabajador:', error);
  }
  
  console.log(params.aprobada ? '✅ Tarea aprobada:' : '❌ Tarea rechazada:', params.tareaId);
  return tareas[index];
};

/**
 * Marcar tarea informativa como vista (no requiere reporte)
 */
export const marcarTareaComoVista = (tareaId: string, trabajadorId: string): TareaBase | null => {
  const tareas = getTareas();
  const index = tareas.findIndex(t => t.id === tareaId);
  
  if (index === -1) return null;
  
  const tarea = tareas[index];
  
  // Validar que sea el trabajador asignado
  if (tarea.asignadoA !== trabajadorId) {
    return null;
  }
  
  // Solo para tareas que NO requieren reporte
  if (tarea.requiereReporte) {
    console.warn('Esta tarea requiere reporte, usar completarTarea()');
    return null;
  }
  
  // Simplemente marcar como "completada" (es informativa, no requiere aprobación)
  tareas[index] = {
    ...tarea,
    estado: 'aprobada', // Las informativas directamente se marcan como aprobadas
    fechaCompletada: new Date().toISOString(),
    fechaAprobada: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveTareas(tareas);
  
  console.log('👁️ Tarea informativa marcada como vista:', tareaId);
  return tareas[index];
};

/**
 * Iniciar tarea (trabajador marca que está trabajando en ella)
 */
export const iniciarTarea = (tareaId: string, trabajadorId: string): TareaBase | null => {
  const tareas = getTareas();
  const index = tareas.findIndex(t => t.id === tareaId);
  
  if (index === -1) return null;
  
  const tarea = tareas[index];
  
  if (tarea.asignadoA !== trabajadorId) return null;
  
  if (tarea.estado !== 'pendiente') {
    console.warn('La tarea ya fue iniciada anteriormente');
    return null;
  }
  
  tareas[index] = {
    ...tarea,
    estado: 'en_progreso',
    updatedAt: new Date().toISOString(),
  };
  
  saveTareas(tareas);
  
  console.log('▶️ Tarea iniciada:', tareaId);
  return tareas[index];
};

/**
 * Cancelar tarea (gerente)
 */
export const cancelarTarea = async (tareaId: string, gerenteId: string, motivo?: string): Promise<TareaBase | null> => {
  const tareas = getTareas();
  const index = tareas.findIndex(t => t.id === tareaId);
  
  if (index === -1) return null;
  
  const tarea = tareas[index];
  
  if (tarea.asignadoPor !== gerenteId) {
    console.warn('Gerente no autorizado para cancelar esta tarea');
    return null;
  }
  
  // Eliminar la tarea
  tareas.splice(index, 1);
  saveTareas(tareas);
  
  // Notificar al trabajador
  try {
    await notificationsService.createNotification({
      tipo: 'tarea',
      titulo: `Tarea cancelada: ${tarea.titulo}`,
      mensaje: motivo || 'La tarea ha sido cancelada por el gerente',
      prioridad: 'normal',
      usuarioId: tarea.asignadoA,
      empresaId: tarea.empresaId,
      puntoVentaId: tarea.puntoVentaId,
      canales: ['push', 'in_app'],
    });
  } catch (error) {
    console.error('Error al notificar cancelación:', error);
  }
  
  console.log('🗑️ Tarea cancelada:', tareaId);
  return tarea;
};

// ============================================================================
// CONSULTAS
// ============================================================================

/**
 * Obtener todas las tareas
 */
export const obtenerTodasLasTareas = (): TareaBase[] => {
  return getTareas();
};

/**
 * Obtener tarea por ID
 */
export const obtenerTarea = (tareaId: string): TareaBase | null => {
  const tareas = getTareas();
  return tareas.find(t => t.id === tareaId) || null;
};

/**
 * Obtener tareas de un trabajador
 */
export const obtenerTareasTrabajador = (trabajadorId: string): TareaBase[] => {
  const tareas = getTareas();
  return tareas.filter(t => t.asignadoA === trabajadorId);
};

/**
 * Obtener tareas creadas por un gerente
 */
export const obtenerTareasGerente = (gerenteId: string): TareaBase[] => {
  const tareas = getTareas();
  return tareas.filter(t => t.asignadoPor === gerenteId);
};

/**
 * Obtener tareas con filtros avanzados
 */
export const obtenerTareasFiltradas = (filtros: FiltrosTareas): TareaBase[] => {
  let tareas = getTareas();
  
  if (filtros.empresaId) {
    tareas = tareas.filter(t => t.empresaId === filtros.empresaId);
  }
  
  if (filtros.marcaId) {
    tareas = tareas.filter(t => t.marcaId === filtros.marcaId);
  }
  
  if (filtros.puntoVentaId) {
    tareas = tareas.filter(t => t.puntoVentaId === filtros.puntoVentaId);
  }
  
  if (filtros.asignadoA) {
    tareas = tareas.filter(t => t.asignadoA === filtros.asignadoA);
  }
  
  if (filtros.asignadoPor) {
    tareas = tareas.filter(t => t.asignadoPor === filtros.asignadoPor);
  }
  
  if (filtros.tipo) {
    tareas = tareas.filter(t => t.tipo === filtros.tipo);
  }
  
  if (filtros.estados && filtros.estados.length > 0) {
    tareas = tareas.filter(t => filtros.estados!.includes(t.estado));
  }
  
  if (filtros.prioridades && filtros.prioridades.length > 0) {
    tareas = tareas.filter(t => filtros.prioridades!.includes(t.prioridad));
  }
  
  if (filtros.requiereReporte !== undefined) {
    tareas = tareas.filter(t => t.requiereReporte === filtros.requiereReporte);
  }
  
  if (filtros.fechaDesde) {
    const fechaDesdeISO = filtros.fechaDesde.toISOString();
    tareas = tareas.filter(t => t.fechaAsignacion >= fechaDesdeISO);
  }
  
  if (filtros.fechaHasta) {
    const fechaHastaISO = filtros.fechaHasta.toISOString();
    tareas = tareas.filter(t => t.fechaAsignacion <= fechaHastaISO);
  }
  
  if (filtros.etiquetas && filtros.etiquetas.length > 0) {
    tareas = tareas.filter(t => 
      t.etiquetas && t.etiquetas.some(tag => filtros.etiquetas!.includes(tag))
    );
  }
  
  return tareas;
};

/**
 * Obtener estadísticas de tareas
 */
export const obtenerEstadisticasTareas = (trabajadorId?: string) => {
  let tareas = getTareas();
  
  if (trabajadorId) {
    tareas = tareas.filter(t => t.asignadoA === trabajadorId);
  }
  
  const tareasOperativas = tareas.filter(t => t.tipo === 'operativa');
  const tareasFormacion = tareas.filter(t => t.tipo === 'formacion');
  
  return {
    total: tareas.length,
    
    // Por tipo
    operativas: tareasOperativas.length,
    formacion: tareasFormacion.length,
    
    // Por estado
    pendientes: tareas.filter(t => t.estado === 'pendiente').length,
    enProgreso: tareas.filter(t => t.estado === 'en_progreso').length,
    completadas: tareas.filter(t => t.estado === 'completada').length,
    aprobadas: tareas.filter(t => t.estado === 'aprobada').length,
    rechazadas: tareas.filter(t => t.estado === 'rechazada').length,
    vencidas: tareas.filter(t => t.estado === 'vencida').length,
    
    // Por reporte
    requierenReporte: tareas.filter(t => t.requiereReporte).length,
    informativas: tareas.filter(t => !t.requiereReporte).length,
    
    // Por prioridad
    urgentes: tareas.filter(t => t.prioridad === 'urgente').length,
    altas: tareas.filter(t => t.prioridad === 'alta').length,
    medias: tareas.filter(t => t.prioridad === 'media').length,
    bajas: tareas.filter(t => t.prioridad === 'baja').length,
    
    // Pendientes de aprobación
    pendientesAprobacion: tareas.filter(t => t.estado === 'completada' && t.requiereAprobacion).length,
  };
};

/**
 * Verificar tareas vencidas y actualizarlas
 */
export const actualizarTareasVencidas = (): number => {
  const tareas = getTareas();
  const now = new Date();
  let actualizadas = 0;
  
  tareas.forEach((tarea, index) => {
    if (
      tarea.fechaVencimiento &&
      (tarea.estado === 'pendiente' || tarea.estado === 'en_progreso') &&
      new Date(tarea.fechaVencimiento) < now
    ) {
      tareas[index].estado = 'vencida';
      tareas[index].updatedAt = now.toISOString();
      actualizadas++;
    }
  });
  
  if (actualizadas > 0) {
    saveTareas(tareas);
    console.log(`⏰ ${actualizadas} tareas marcadas como vencidas`);
  }
  
  return actualizadas;
};

/**
 * Limpiar todas las tareas (solo desarrollo)
 */
export const limpiarTareas = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Todas las tareas eliminadas');
};
