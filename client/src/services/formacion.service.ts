/**
 * 🎓 WRAPPER PARA FORMACIÓN Y ONBOARDING
 * 
 * Interfaz simplificada para gestionar módulos de formación.
 * Usa el servicio base task-management.service.ts
 */

import {
  crearModuloFormacion,
  completarTarea,
  iniciarTarea,
  obtenerTareasFiltradas,
  type CrearModuloFormacionParams,
  type CompletarTareaParams,
  type TareaBase,
  type FiltrosTareas,
} from './task-management.service';

// ============================================================================
// CATEGORÍAS DE FORMACIÓN PREDEFINIDAS
// ============================================================================

export const CATEGORIAS_FORMACION = {
  onboarding: 'Onboarding Inicial',
  seguridad: 'Seguridad e Higiene',
  sistemas: 'Uso de Sistemas',
  atencionCliente: 'Atención al Cliente',
  productos: 'Conocimiento de Productos',
  procedimientos: 'Procedimientos Operativos',
  normativa: 'Normativa y Cumplimiento',
  desarrollo: 'Desarrollo Profesional',
} as const;

export type CategoriaFormacion = keyof typeof CATEGORIAS_FORMACION;

// ============================================================================
// MÓDULOS DE FORMACIÓN PREDEFINIDOS
// ============================================================================

export interface ModuloFormacionTemplate {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaFormacion;
  duracionEstimada: number; // minutos
  obligatorio: boolean;
  orden?: number; // Para secuenciar el onboarding
  recursos?: {
    tipo: 'video' | 'pdf' | 'interactivo' | 'evaluacion';
    url: string;
    titulo: string;
  }[];
}

export const MODULOS_ONBOARDING: ModuloFormacionTemplate[] = [
  {
    id: 'onb-001',
    titulo: 'Bienvenida a la empresa',
    descripcion: 'Conoce nuestra historia, valores y cultura empresarial',
    categoria: 'onboarding',
    duracionEstimada: 15,
    obligatorio: true,
    orden: 1,
  },
  {
    id: 'onb-002',
    titulo: 'Uso del TPV',
    descripcion: 'Aprende a usar el sistema de punto de venta',
    categoria: 'sistemas',
    duracionEstimada: 30,
    obligatorio: true,
    orden: 2,
  },
  {
    id: 'onb-003',
    titulo: 'Fichas y horarios',
    descripcion: 'Cómo fichar, gestionar turnos y pausas',
    categoria: 'procedimientos',
    duracionEstimada: 20,
    obligatorio: true,
    orden: 3,
  },
  {
    id: 'onb-004',
    titulo: 'Seguridad alimentaria',
    descripcion: 'Normas básicas de manipulación de alimentos',
    categoria: 'seguridad',
    duracionEstimada: 45,
    obligatorio: true,
    orden: 4,
  },
  {
    id: 'onb-005',
    titulo: 'Atención al cliente',
    descripcion: 'Protocolos de atención y resolución de incidencias',
    categoria: 'atencionCliente',
    duracionEstimada: 25,
    obligatorio: true,
    orden: 5,
  },
];

export const MODULOS_ADICIONALES: ModuloFormacionTemplate[] = [
  {
    id: 'form-101',
    titulo: 'Gestión de stock avanzada',
    descripcion: 'Control de inventarios y pedidos a proveedores',
    categoria: 'sistemas',
    duracionEstimada: 40,
    obligatorio: false,
  },
  {
    id: 'form-102',
    titulo: 'Prevención de riesgos laborales',
    descripcion: 'Seguridad en el trabajo y prevención de accidentes',
    categoria: 'seguridad',
    duracionEstimada: 50,
    obligatorio: true,
  },
  {
    id: 'form-103',
    titulo: 'Carta de productos',
    descripcion: 'Conoce todos los productos, ingredientes y alergenos',
    categoria: 'productos',
    duracionEstimada: 35,
    obligatorio: true,
  },
  {
    id: 'form-104',
    titulo: 'Protección de datos (RGPD)',
    descripcion: 'Normativa de protección de datos personales',
    categoria: 'normativa',
    duracionEstimada: 30,
    obligatorio: true,
  },
];

// ============================================================================
// FUNCIONES ESPECÍFICAS DE FORMACIÓN
// ============================================================================

/**
 * Asignar módulo de formación desde plantilla
 */
export const asignarModuloFormacionDesdeTemplate = async (
  templateId: string,
  params: {
    asignadoA: string;
    asignadoNombre: string;
    asignadoPor: string;
    asignadoPorNombre: string;
    empresaId: string;
    empresaNombre: string;
    fechaVencimiento?: string;
    instruccionesAdicionales?: string;
  }
): Promise<TareaBase | null> => {
  // Buscar template
  const template = [...MODULOS_ONBOARDING, ...MODULOS_ADICIONALES].find(m => m.id === templateId);
  
  if (!template) {
    console.error('Módulo de formación no encontrado:', templateId);
    return null;
  }
  
  return crearModuloFormacion({
    moduloFormacionId: template.id,
    titulo: template.titulo,
    descripcion: template.descripcion,
    instrucciones: params.instruccionesAdicionales,
    asignadoA: params.asignadoA,
    asignadoNombre: params.asignadoNombre,
    asignadoPor: params.asignadoPor,
    asignadoPorNombre: params.asignadoPorNombre,
    empresaId: params.empresaId,
    empresaNombre: params.empresaNombre,
    duracionEstimada: template.duracionEstimada,
    fechaVencimiento: params.fechaVencimiento,
    requiereAprobacion: true,
    etiquetas: [CATEGORIAS_FORMACION[template.categoria]],
    categoria: template.categoria,
  });
};

/**
 * Asignar programa de onboarding completo a un nuevo trabajador
 */
export const asignarOnboardingCompleto = async (params: {
  trabajadorId: string;
  trabajadorNombre: string;
  gerenteId: string;
  gerenteNombre: string;
  empresaId: string;
  empresaNombre: string;
}): Promise<TareaBase[]> => {
  const tareasCreadas: TareaBase[] = [];
  
  // Calcular fechas de vencimiento escalonadas (1 semana para completar todo)
  const hoy = new Date();
  
  for (const modulo of MODULOS_ONBOARDING) {
    // Calcular fecha de vencimiento según el orden
    const diasVencimiento = (modulo.orden || 1) * 1; // 1 día por módulo
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);
    
    const tarea = await asignarModuloFormacionDesdeTemplate(modulo.id, {
      asignadoA: params.trabajadorId,
      asignadoNombre: params.trabajadorNombre,
      asignadoPor: params.gerenteId,
      asignadoPorNombre: params.gerenteNombre,
      empresaId: params.empresaId,
      empresaNombre: params.empresaNombre,
      fechaVencimiento: fechaVencimiento.toISOString(),
    });
    
    if (tarea) {
      tareasCreadas.push(tarea);
    }
  }
  
  console.log(`✅ Onboarding completo asignado: ${tareasCreadas.length} módulos`);
  return tareasCreadas;
};

/**
 * Obtener formación de un trabajador
 */
export const obtenerFormacionTrabajador = (
  trabajadorId: string,
  opciones?: {
    soloObligatorios?: boolean;
    soloCompletados?: boolean;
    categoria?: CategoriaFormacion;
  }
): TareaBase[] => {
  const filtros: FiltrosTareas = {
    asignadoA: trabajadorId,
    tipo: 'formacion',
  };
  
  if (!opciones?.soloCompletados) {
    filtros.estados = ['pendiente', 'en_progreso', 'completada'];
  } else {
    filtros.estados = ['aprobada'];
  }
  
  let tareas = obtenerTareasFiltradas(filtros);
  
  // Filtrar por categoría si se especifica
  if (opciones?.categoria) {
    tareas = tareas.filter(t => t.categoria === opciones.categoria);
  }
  
  // Ordenar por fecha de asignación
  return tareas.sort((a, b) => 
    new Date(a.fechaAsignacion).getTime() - new Date(b.fechaAsignacion).getTime()
  );
};

/**
 * Obtener progreso de onboarding de un trabajador
 */
export const obtenerProgresoOnboarding = (trabajadorId: string) => {
  const filtros: FiltrosTareas = {
    asignadoA: trabajadorId,
    tipo: 'formacion',
  };
  
  const tareas = obtenerTareasFiltradas(filtros);
  
  // Filtrar solo módulos de onboarding
  const modulosOnboarding = tareas.filter(t => 
    t.categoria === 'onboarding' || 
    MODULOS_ONBOARDING.some(m => m.id === t.moduloFormacionId)
  );
  
  const total = MODULOS_ONBOARDING.length;
  const completados = modulosOnboarding.filter(t => t.estado === 'aprobada').length;
  const enProgreso = modulosOnboarding.filter(t => t.estado === 'en_progreso').length;
  const pendientes = modulosOnboarding.filter(t => t.estado === 'pendiente').length;
  
  return {
    total,
    completados,
    enProgreso,
    pendientes,
    porcentaje: Math.round((completados / total) * 100),
    finalizado: completados === total,
  };
};

/**
 * Obtener trabajadores con formación pendiente (vista gerente)
 */
export const obtenerTrabajadoresConFormacionPendiente = (
  gerenteId: string,
  opciones?: {
    empresaId?: string;
    marcaId?: string;
    puntoVentaId?: string;
  }
): { trabajadorId: string; trabajadorNombre: string; pendientes: number }[] => {
  const filtros: FiltrosTareas = {
    asignadoPor: gerenteId,
    tipo: 'formacion',
    estados: ['pendiente', 'en_progreso'],
  };
  
  if (opciones?.empresaId) {
    filtros.empresaId = opciones.empresaId;
  }
  
  if (opciones?.marcaId) {
    filtros.marcaId = opciones.marcaId;
  }
  
  if (opciones?.puntoVentaId) {
    filtros.puntoVentaId = opciones.puntoVentaId;
  }
  
  const tareas = obtenerTareasFiltradas(filtros);
  
  // Agrupar por trabajador
  const agrupado = tareas.reduce((acc, tarea) => {
    if (!acc[tarea.asignadoA]) {
      acc[tarea.asignadoA] = {
        trabajadorId: tarea.asignadoA,
        trabajadorNombre: tarea.asignadoNombre,
        pendientes: 0,
      };
    }
    acc[tarea.asignadoA].pendientes++;
    return acc;
  }, {} as Record<string, { trabajadorId: string; trabajadorNombre: string; pendientes: number }>);
  
  return Object.values(agrupado);
};

/**
 * Obtener formación pendiente de aprobación (vista gerente)
 */
export const obtenerFormacionPendienteAprobacion = (
  gerenteId: string,
  opciones?: {
    empresaId?: string;
  }
): TareaBase[] => {
  const filtros: FiltrosTareas = {
    asignadoPor: gerenteId,
    tipo: 'formacion',
    estados: ['completada'],
  };
  
  if (opciones?.empresaId) {
    filtros.empresaId = opciones.empresaId;
  }
  
  return obtenerTareasFiltradas(filtros);
};

/**
 * Completar módulo de formación con evaluación
 */
export const completarModuloFormacion = async (params: {
  moduloId: string;
  trabajadorId: string;
  puntuacion?: number; // 0-100
  comentario?: string;
}): Promise<TareaBase | null> => {
  return completarTarea({
    tareaId: params.moduloId,
    trabajadorId: params.trabajadorId,
    puntuacion: params.puntuacion,
    comentario: params.comentario,
  });
};

// Re-exportar funciones comunes
export {
  iniciarTarea,
  type TareaBase,
  type CompletarTareaParams,
};
