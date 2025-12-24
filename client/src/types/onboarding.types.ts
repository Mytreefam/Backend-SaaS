/**
 * ================================================================
 * TIPOS DE ONBOARDING - Sistema Udar Edge
 * ================================================================
 * Sistema completo de integración de nuevos empleados
 */

// ==================== ENUMS Y TIPOS BASE ====================

export type FaseOnboarding = 
  | 'invitacion_enviada'
  | 'registro_iniciado'
  | 'registro_completado'
  | 'documentacion_pendiente'
  | 'documentacion_completada'
  | 'formacion_pendiente'
  | 'formacion_en_progreso'
  | 'formacion_completada'
  | 'primer_dia_pendiente'
  | 'primer_dia_completado'
  | 'seguimiento_programado'
  | 'onboarding_completado';

export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'omitida';

export type TipoDocumento = 
  | 'dni_frontal'
  | 'dni_trasera'
  | 'contrato'
  | 'numero_seguridad_social'
  | 'certificado_delitos'
  | 'titulacion'
  | 'carnet_manipulador'
  | 'datos_bancarios'
  | 'otros';

export type TipoFormacion = 
  | 'video'
  | 'documento'
  | 'cuestionario'
  | 'firma_digital'
  | 'lectura';

export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'critica';

// ==================== INTERFACES PRINCIPALES ====================

/**
 * Proceso de onboarding completo de un empleado
 */
export interface ProcesoOnboarding {
  id: string;
  empleadoId: string;
  empleadoNombre: string;
  empleadoEmail: string;
  empresaId: string;
  empresaNombre: string;
  
  // Información del puesto
  puesto: string;
  departamento: string;
  fechaInicio: string;
  
  // Estado del proceso
  faseActual: FaseOnboarding;
  progresoGeneral: number; // 0-100
  fechaCreacion: string;
  fechaUltimaActualizacion: string;
  fechaCompletado?: string;
  
  // Invitación
  invitacionId: string;
  canalInvitacion: 'email' | 'whatsapp' | 'sms' | 'link';
  fechaInvitacion: string;
  fechaAceptacion?: string;
  
  // Checklist de tareas
  tareas: TareaOnboarding[];
  tareasCompletadas: number;
  tareasTotal: number;
  
  // Documentos
  documentos: DocumentoOnboarding[];
  documentosCompletados: number;
  documentosTotal: number;
  
  // Formación
  formaciones: FormacionOnboarding[];
  formacionesCompletadas: number;
  formacionesTotal: number;
  
  // Seguimiento
  mentor?: string; // ID del empleado mentor
  proximaRevision?: string; // Fecha de próxima reunión
  notas: NotaOnboarding[];
  
  // Métricas
  tiempoProceso?: number; // Días desde invitación hasta completado
  satisfaccion?: number; // 1-5 estrellas (feedback del empleado)
  
  // Flags
  requiereAccion: boolean; // Hay tareas pendientes críticas
  alertas: string[]; // Alertas o problemas detectados
}

/**
 * Tarea individual del checklist de onboarding
 */
export interface TareaOnboarding {
  id: string;
  titulo: string;
  descripcion: string;
  fase: FaseOnboarding;
  estado: EstadoTarea;
  prioridad: PrioridadTarea;
  orden: number;
  
  // Asignación
  asignadoA: 'empleado' | 'gerente' | 'sistema';
  requiereAprobacion: boolean;
  
  // Fechas
  fechaCreacion: string;
  fechaLimite?: string;
  fechaCompletado?: string;
  
  // Relación con otros elementos
  documentoRelacionado?: string; // ID del documento
  formacionRelacionada?: string; // ID de la formación
  
  // Instrucciones
  instrucciones?: string;
  urlAyuda?: string;
  
  // Aprobación
  aprobadoPor?: string; // ID del usuario que aprobó
  fechaAprobacion?: string;
  motivoRechazo?: string;
}

/**
 * Documento del onboarding
 */
export interface DocumentoOnboarding {
  id: string;
  tipo: TipoDocumento;
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
  
  // Estado
  estado: 'pendiente' | 'subido' | 'revision' | 'aprobado' | 'rechazado';
  
  // Archivo
  archivoUrl?: string;
  archivoNombre?: string;
  archivoTamanio?: number; // bytes
  fechaSubida?: string;
  
  // Validación
  validadoPor?: string; // ID del gerente
  fechaValidacion?: string;
  motivoRechazo?: string;
  
  // Firma digital
  requiereFirma: boolean;
  firmado: boolean;
  fechaFirma?: string;
  firmaDigitalUrl?: string;
}

/**
 * Formación del onboarding
 */
export interface FormacionOnboarding {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: TipoFormacion;
  obligatorio: boolean;
  duracionEstimada: number; // minutos
  
  // Estado
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'aprobada';
  progreso: number; // 0-100
  
  // Contenido
  contenidoUrl?: string; // URL del vídeo, documento, etc.
  cuestionarioId?: string;
  
  // Fechas
  fechaInicio?: string;
  fechaCompletado?: string;
  fechaLimite?: string;
  
  // Resultados (si es cuestionario)
  puntuacion?: number; // 0-100
  intentos?: number;
  intentosMaximos?: number;
  puntuacionMinima?: number; // Para aprobar
  
  // Certificado
  generaCertificado: boolean;
  certificadoUrl?: string;
}

/**
 * Nota de seguimiento
 */
export interface NotaOnboarding {
  id: string;
  fecha: string;
  autorId: string;
  autorNombre: string;
  tipo: 'general' | 'reunion' | 'incidencia' | 'logro';
  titulo: string;
  contenido: string;
  privada: boolean; // Solo visible para gerentes
}

/**
 * Template/Plantilla de onboarding
 */
export interface PlantillaOnboarding {
  id: string;
  nombre: string;
  descripcion: string;
  departamento?: string; // Si es específica para un departamento
  puesto?: string; // Si es específica para un puesto
  
  // Configuración
  duracionEstimada: number; // días
  activo: boolean;
  
  // Tareas predefinidas
  tareas: Omit<TareaOnboarding, 'id' | 'estado' | 'fechaCreacion' | 'fechaCompletado'>[];
  
  // Documentos requeridos
  documentos: Omit<DocumentoOnboarding, 'id' | 'estado' | 'archivoUrl' | 'fechaSubida'>[];
  
  // Formaciones incluidas
  formaciones: Omit<FormacionOnboarding, 'id' | 'estado' | 'progreso' | 'fechaInicio'>[];
  
  // Fechas clave automáticas
  programarRevisionEn?: number; // Días después del inicio
  notificarGerenteEn?: number[]; // Días para recordatorios
  
  // Metadata
  creadoPor: string;
  fechaCreacion: string;
  ultimaActualizacion: string;
}

/**
 * Estadísticas de onboarding (para dashboard del gerente)
 */
export interface EstadisticasOnboarding {
  // Generales
  totalProcesos: number;
  procesosActivos: number;
  procesosCompletados: number;
  progresoPromedio: number; // 0-100
  
  // Por fase
  porFase: Record<FaseOnboarding, number>;
  
  // Tiempos
  tiempoPromedioCompletado: number; // días
  tiempoMasRapido: number;
  tiempoMasLento: number;
  
  // Documentación
  documentosPendientesRevision: number;
  
  // Formación
  formacionesPendientes: number;
  tasaAprobacionCuestionarios: number; // 0-100
  
  // Satisfacción
  satisfaccionPromedio: number; // 1-5
  
  // Alertas
  procesosRetrasados: number;
  procesosRequierenAccion: number;
  
  // Tendencias (últimos 30 días)
  nuevosIniciados: number;
  completadosRecientes: number;
  
  // Por departamento
  porDepartamento: {
    departamento: string;
    activos: number;
    completados: number;
    progresoPromedio: number;
  }[];
}

/**
 * Configuración de cuestionario de formación
 */
export interface CuestionarioFormacion {
  id: string;
  formacionId: string;
  titulo: string;
  descripcion: string;
  
  // Configuración
  tiempoLimite?: number; // minutos
  intentosMaximos: number;
  puntuacionMinima: number; // 0-100 para aprobar
  ordenAleatorio: boolean; // Randomizar preguntas
  
  // Preguntas
  preguntas: PreguntaCuestionario[];
  
  // Resultados
  aprobados: number;
  suspensos: number;
  puntuacionPromedio: number;
}

/**
 * Pregunta de cuestionario
 */
export interface PreguntaCuestionario {
  id: string;
  pregunta: string;
  tipo: 'opcion_multiple' | 'verdadero_falso' | 'texto_libre';
  puntos: number;
  
  // Opciones (para opción múltiple)
  opciones?: OpcionRespuesta[];
  
  // Respuesta correcta
  respuestaCorrecta?: string | string[]; // ID de la opción o texto
  
  // Configuración
  obligatoria: boolean;
  orden: number;
}

/**
 * Opción de respuesta
 */
export interface OpcionRespuesta {
  id: string;
  texto: string;
  esCorrecta: boolean;
}

/**
 * Intento de cuestionario
 */
export interface IntentoCuestionario {
  id: string;
  cuestionarioId: string;
  empleadoId: string;
  numeroIntento: number;
  
  // Respuestas
  respuestas: RespuestaCuestionario[];
  
  // Resultado
  puntuacion: number; // 0-100
  aprobado: boolean;
  
  // Tiempos
  fechaInicio: string;
  fechaFin: string;
  tiempoEmpleado: number; // segundos
}

/**
 * Respuesta a pregunta de cuestionario
 */
export interface RespuestaCuestionario {
  preguntaId: string;
  respuesta: string | string[]; // ID de opción o texto libre
  correcta: boolean;
  puntosObtenidos: number;
}

/**
 * Evento del calendario de onboarding
 */
export interface EventoOnboarding {
  id: string;
  procesoOnboardingId: string;
  empleadoId: string;
  tipo: 'primer_dia' | 'reunion_seguimiento' | 'formacion' | 'revision' | 'otro';
  titulo: string;
  descripcion?: string;
  fecha: string;
  hora?: string;
  duracion?: number; // minutos
  ubicacion?: string;
  asistentes?: string[]; // IDs de usuarios
  recordatorios: number[]; // Minutos antes para recordar
  completado: boolean;
}

// ==================== REQUEST/RESPONSE API ====================

export interface CrearProcesoOnboardingRequest {
  empleadoId: string;
  empresaId: string;
  invitacionId: string;
  plantillaId?: string; // Usar plantilla predefinida
  puesto: string;
  departamento: string;
  fechaInicio: string;
  mentorId?: string;
}

export interface CrearProcesoOnboardingResponse {
  success: boolean;
  proceso: ProcesoOnboarding;
}

export interface ActualizarTareaRequest {
  tareaId: string;
  estado: EstadoTarea;
  completadoPor: string;
  notas?: string;
}

export interface SubirDocumentoRequest {
  procesoId: string;
  documentoId: string;
  archivo: File;
  empleadoId: string;
}

export interface ValidarDocumentoRequest {
  documentoId: string;
  aprobado: boolean;
  validadoPor: string;
  motivoRechazo?: string;
}

export interface CompletarFormacionRequest {
  formacionId: string;
  empleadoId: string;
  puntuacion?: number;
}

export interface AgregarNotaRequest {
  procesoId: string;
  autorId: string;
  tipo: NotaOnboarding['tipo'];
  titulo: string;
  contenido: string;
  privada: boolean;
}

export interface CrearPlantillaRequest {
  nombre: string;
  descripcion: string;
  departamento?: string;
  puesto?: string;
  tareas: PlantillaOnboarding['tareas'];
  documentos: PlantillaOnboarding['documentos'];
  formaciones: PlantillaOnboarding['formaciones'];
  creadoPor: string;
}
