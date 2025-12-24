/**
 * 📅 TIPOS E INTERFACES - SISTEMA DE CITAS
 * Sistema completo de reservas/citas para clientes
 */

// ============================================
// CITA
// ============================================

export interface Cita {
  id: string;
  numero: string; // "CITA-0001"
  
  // Cliente
  clienteId: string;
  clienteNombre: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  
  // Servicio
  servicioId: string;
  servicioNombre: string;
  servicioDuracion: number; // minutos
  
  // Fecha y hora
  fecha: string; // "2024-12-05"
  horaInicio: string; // "10:00"
  horaFin: string; // "10:30"
  
  // Ubicación
  puntoVentaId: string;
  puntoVentaNombre: string;
  empresaId: string;
  marcaId: string;
  
  // Asignación
  trabajadorAsignadoId?: string;
  trabajadorAsignadoNombre?: string;
  
  // Estado
  estado: EstadoCita;
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  
  // Detalles
  mensaje?: string;
  archivosAdjuntos?: ArchivoAdjunto[];
  
  // Notificaciones
  notificacionEnviada: boolean;
  recordatorioEnviado: boolean;
  
  // Metadata
  fechaCreacion: string;
  fechaActualizacion: string;
  creadoPor: string;
  confirmadaPor?: string;
  fechaConfirmacion?: string;
  
  // Cancelación
  canceladaPor?: string;
  motivoCancelacion?: string;
  fechaCancelacion?: string;
}

export type EstadoCita = 
  | 'solicitada'      // Cliente creó la cita
  | 'confirmada'      // Trabajador/Gerente confirmó
  | 'en-progreso'     // Cita en curso
  | 'completada'      // Cita finalizada
  | 'cancelada'       // Cancelada por cliente o negocio
  | 'no-presentado';  // Cliente no se presentó

// ============================================
// CONFIGURACIÓN DE DISPONIBILIDAD (GERENTE)
// ============================================

export interface ConfiguracionCitas {
  id: string;
  puntoVentaId: string;
  empresaId: string;
  marcaId: string;
  
  // Configuración general
  habilitado: boolean;
  intervaloMinutos: 15 | 30 | 45 | 60; // Duración de cada slot
  capacidadSimultanea: number; // Cuántas citas a la vez
  
  // Horarios por día de semana
  horarios: HorarioDisponibilidad[];
  
  // Servicios ofrecidos
  servicios: ServicioCita[];
  
  // Restricciones
  anticipacionMinimaDias: number; // Cuántos días antes se puede pedir cita
  anticipacionMaximaDias: number; // Hasta cuándo se puede pedir cita
  
  // Notificaciones
  notificarNuevaCita: boolean;
  notificarRecordatorio: boolean;
  horasAntesRecordatorio: number; // 24h, 48h, etc
  
  // Metadata
  fechaCreacion: string;
  fechaActualizacion: string;
  actualizadoPor: string;
}

export interface HorarioDisponibilidad {
  diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 1 = Lunes...
  nombreDia: string; // "Lunes", "Martes"...
  habilitado: boolean;
  horaInicio: string; // "09:00"
  horaFin: string; // "18:00"
  descansoInicio?: string; // "14:00" (opcional)
  descansoFin?: string; // "15:00" (opcional)
}

export interface ServicioCita {
  id: string;
  nombre: string;
  descripcion?: string;
  duracionMinutos: number;
  precio?: number;
  habilitado: boolean;
  color?: string; // Para mostrar en calendario
  icono?: string;
  orden: number; // Para ordenar en lista
}

// ============================================
// DISPONIBILIDAD EN TIEMPO REAL
// ============================================

export interface DisponibilidadDia {
  fecha: string; // "2024-12-05"
  diaSemana: number;
  habilitado: boolean;
  slots: SlotDisponibilidad[];
}

export interface SlotDisponibilidad {
  horaInicio: string; // "10:00"
  horaFin: string; // "10:30"
  disponible: boolean;
  ocupados: number; // Cuántos slots ocupados
  capacidad: number; // Capacidad total
  citasEnSlot: string[]; // IDs de citas en este slot
}

// ============================================
// ADJUNTOS
// ============================================

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  tipo: string; // MIME type
  tamaño: number; // bytes
  url: string; // URL temporal o base64
  fechaSubida: string;
}

// ============================================
// FILTROS
// ============================================

export interface FiltrosCitas {
  puntoVentaId?: string;
  empresaId?: string;
  marcaId?: string;
  clienteId?: string;
  trabajadorId?: string;
  estado?: EstadoCita | EstadoCita[];
  fechaDesde?: string;
  fechaHasta?: string;
  servicioId?: string;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface EstadisticasCitas {
  totalCitas: number;
  citasSolicitadas: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasNoPresentado: number;
  
  tasaConfirmacion: number; // %
  tasaCumplimiento: number; // %
  tasaCancelacion: number; // %
  
  servicioMasSolicitado: string;
  horarioMasDemandado: string;
  
  tiempoPromedioConfirmacion: number; // minutos
}

// ============================================
// REQUESTS/RESPONSES
// ============================================

export interface SolicitudCita {
  clienteId: string;
  puntoVentaId: string;
  servicioId: string;
  fecha: string;
  horaInicio: string;
  mensaje?: string;
  archivos?: File[];
}

export interface ResultadoCrearCita {
  exito: boolean;
  cita?: Cita;
  error?: string;
  mensaje?: string;
}

export interface ResultadoConfirmarCita {
  exito: boolean;
  cita?: Cita;
  error?: string;
  trabajadorAsignado?: string;
}
