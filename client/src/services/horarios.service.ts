/**
 * 📅 SERVICIO DE HORARIOS
 * 
 * Gestión bidireccional de horarios:
 * - Gerente asigna horarios a trabajadores
 * - Trabajadores ven sus horarios
 * - Trabajadores solicitan cambios
 * - Gerente aprueba/rechaza cambios
 */

// ========== TIPOS ==========

export type TipoTurno = 'manana' | 'tarde' | 'noche' | 'partido' | 'descanso';

export type EstadoTurno = 'confirmado' | 'pendiente' | 'modificado';

export type TipoSolicitud = 'cambio_turno' | 'dia_libre' | 'cambio_horario' | 'intercambio';

export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface Turno {
  id: string;
  trabajadorId: string;
  trabajadorNombre: string;
  fecha: string; // YYYY-MM-DD
  diaSemana: string; // Lun, Mar, Mie, etc.
  tipoTurno: TipoTurno;
  horaInicio?: string; // HH:mm
  horaFin?: string; // HH:mm
  horaInicio2?: string; // Para turnos partidos
  horaFin2?: string; // Para turnos partidos
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  estado: EstadoTurno;
  notas?: string;
  creadoPor: string;
  creadoEn: string;
  modificadoPor?: string;
  modificadoEn?: string;
}

export interface SolicitudCambioHorario {
  id: string;
  trabajadorId: string;
  trabajadorNombre: string;
  tipo: TipoSolicitud;
  turnoOriginalId?: string; // Si es cambio de turno existente
  fechaSolicitada: string; // YYYY-MM-DD
  motivoSolicitud: string;
  detalles?: string;
  turnoActual?: {
    tipo: TipoTurno;
    horaInicio?: string;
    horaFin?: string;
  };
  turnoDeseado?: {
    tipo: TipoTurno;
    horaInicio?: string;
    horaFin?: string;
  };
  trabajadorIntercambioId?: string; // Si es intercambio con otro trabajador
  estado: EstadoSolicitud;
  respuesta?: string;
  solicitadoEn: string;
  revisadoPor?: string;
  revisadoEn?: string;
}

export interface PlantillaHorario {
  id: string;
  nombre: string;
  descripcion?: string;
  turnos: {
    diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 6 = Sábado
    tipoTurno: TipoTurno;
    horaInicio?: string;
    horaFin?: string;
    horaInicio2?: string;
    horaFin2?: string;
  }[];
  creadoPor: string;
  creadoEn: string;
}

// ========== CONSTANTES ==========

export const TIPOS_TURNO: { value: TipoTurno; label: string; descripcion?: string }[] = [
  { value: 'manana', label: 'Mañana', descripcion: '08:00 - 14:00' },
  { value: 'tarde', label: 'Tarde', descripcion: '14:00 - 22:00' },
  { value: 'noche', label: 'Noche', descripcion: '22:00 - 06:00' },
  { value: 'partido', label: 'Partido', descripcion: '09:00-13:00 / 17:00-21:00' },
  { value: 'descanso', label: 'Descanso' },
];

export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ========== STORAGE KEYS ==========

const STORAGE_KEYS = {
  TURNOS: 'udar_turnos',
  SOLICITUDES: 'udar_solicitudes_horario',
  PLANTILLAS: 'udar_plantillas_horario',
};

// ========== DATOS MOCK INICIALES ==========

const TURNOS_MOCK: Turno[] = [
  // Semana actual para trabajador TRB-001
  {
    id: 'TRN-001',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-02',
    diaSemana: 'Lun',
    tipoTurno: 'manana',
    horaInicio: '08:00',
    horaFin: '14:00',
    puntoVentaId: 'PDV-001',
    puntoVentaNombre: 'Badalona Centro',
    estado: 'confirmado',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
  {
    id: 'TRN-002',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-03',
    diaSemana: 'Mar',
    tipoTurno: 'tarde',
    horaInicio: '14:00',
    horaFin: '22:00',
    puntoVentaId: 'PDV-001',
    puntoVentaNombre: 'Badalona Centro',
    estado: 'confirmado',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
  {
    id: 'TRN-003',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-04',
    diaSemana: 'Mié',
    tipoTurno: 'descanso',
    estado: 'confirmado',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
  {
    id: 'TRN-004',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-05',
    diaSemana: 'Jue',
    tipoTurno: 'manana',
    horaInicio: '08:00',
    horaFin: '14:00',
    puntoVentaId: 'PDV-001',
    puntoVentaNombre: 'Badalona Centro',
    estado: 'confirmado',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
  {
    id: 'TRN-005',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-06',
    diaSemana: 'Vie',
    tipoTurno: 'partido',
    horaInicio: '09:00',
    horaFin: '13:00',
    horaInicio2: '17:00',
    horaFin2: '21:00',
    puntoVentaId: 'PDV-001',
    puntoVentaNombre: 'Badalona Centro',
    estado: 'confirmado',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
  {
    id: 'TRN-006',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-07',
    diaSemana: 'Sáb',
    tipoTurno: 'tarde',
    horaInicio: '14:00',
    horaFin: '22:00',
    puntoVentaId: 'PDV-001',
    puntoVentaNombre: 'Badalona Centro',
    estado: 'pendiente',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
  {
    id: 'TRN-007',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    fecha: '2024-12-08',
    diaSemana: 'Dom',
    tipoTurno: 'descanso',
    estado: 'confirmado',
    creadoPor: 'GRT-001',
    creadoEn: '2024-11-25T10:00:00Z',
  },
];

const SOLICITUDES_MOCK: SolicitudCambioHorario[] = [
  {
    id: 'SOL-001',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    tipo: 'cambio_turno',
    turnoOriginalId: 'TRN-020',
    fechaSolicitada: '2024-12-15',
    motivoSolicitud: 'Cita médica por la tarde',
    detalles: 'Necesito cambiar de turno de tarde a turno de mañana',
    turnoActual: {
      tipo: 'tarde',
      horaInicio: '14:00',
      horaFin: '22:00',
    },
    turnoDeseado: {
      tipo: 'manana',
      horaInicio: '08:00',
      horaFin: '14:00',
    },
    estado: 'pendiente',
    solicitadoEn: '2024-11-28T09:30:00Z',
  },
  {
    id: 'SOL-002',
    trabajadorId: 'TRB-001',
    trabajadorNombre: 'Juan Pérez',
    tipo: 'dia_libre',
    fechaSolicitada: '2024-12-22',
    motivoSolicitud: 'Motivos personales',
    detalles: 'Asunto familiar que requiere mi presencia',
    estado: 'aprobada',
    respuesta: 'Aprobado, disfruta tu día',
    solicitadoEn: '2024-11-25T14:00:00Z',
    revisadoPor: 'GRT-001',
    revisadoEn: '2024-11-26T10:00:00Z',
  },
];

// ========== FUNCIONES DE STORAGE ==========

function cargarTurnos(): Turno[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TURNOS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(TURNOS_MOCK));
      return TURNOS_MOCK;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando turnos:', error);
    return TURNOS_MOCK;
  }
}

function guardarTurnos(turnos: Turno[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(turnos));
  } catch (error) {
    console.error('Error guardando turnos:', error);
  }
}

function cargarSolicitudes(): SolicitudCambioHorario[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SOLICITUDES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(SOLICITUDES_MOCK));
      return SOLICITUDES_MOCK;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando solicitudes:', error);
    return SOLICITUDES_MOCK;
  }
}

function guardarSolicitudes(solicitudes: SolicitudCambioHorario[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOLICITUDES, JSON.stringify(solicitudes));
  } catch (error) {
    console.error('Error guardando solicitudes:', error);
  }
}

// ========== FUNCIONES PARA TRABAJADOR ==========

/**
 * Obtener turnos de un trabajador por rango de fechas
 */
export function obtenerTurnosTrabajador(
  trabajadorId: string,
  fechaInicio?: string,
  fechaFin?: string
): Turno[] {
  const turnos = cargarTurnos();
  let turnosFiltrados = turnos.filter(t => t.trabajadorId === trabajadorId);

  if (fechaInicio) {
    turnosFiltrados = turnosFiltrados.filter(t => t.fecha >= fechaInicio);
  }

  if (fechaFin) {
    turnosFiltrados = turnosFiltrados.filter(t => t.fecha <= fechaFin);
  }

  return turnosFiltrados.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/**
 * Obtener turnos de la semana actual
 */
export function obtenerTurnosSemanaActual(trabajadorId: string): Turno[] {
  const hoy = new Date();
  const inicioDeSemana = new Date(hoy);
  inicioDeSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
  
  const finDeSemana = new Date(inicioDeSemana);
  finDeSemana.setDate(inicioDeSemana.getDate() + 6); // Domingo

  const fechaInicio = inicioDeSemana.toISOString().split('T')[0];
  const fechaFin = finDeSemana.toISOString().split('T')[0];

  return obtenerTurnosTrabajador(trabajadorId, fechaInicio, fechaFin);
}

/**
 * Obtener turnos del mes actual
 */
export function obtenerTurnosMesActual(trabajadorId: string): Turno[] {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  const fechaInicio = inicioMes.toISOString().split('T')[0];
  const fechaFin = finMes.toISOString().split('T')[0];

  return obtenerTurnosTrabajador(trabajadorId, fechaInicio, fechaFin);
}

/**
 * Obtener solicitudes de un trabajador
 */
export function obtenerSolicitudesTrabajador(trabajadorId: string): SolicitudCambioHorario[] {
  const solicitudes = cargarSolicitudes();
  return solicitudes
    .filter(s => s.trabajadorId === trabajadorId)
    .sort((a, b) => new Date(b.solicitadoEn).getTime() - new Date(a.solicitadoEn).getTime());
}

/**
 * Crear nueva solicitud de cambio
 */
export function crearSolicitudCambio(
  solicitud: Omit<SolicitudCambioHorario, 'id' | 'estado' | 'solicitadoEn'>
): SolicitudCambioHorario {
  const solicitudes = cargarSolicitudes();
  
  const nuevaSolicitud: SolicitudCambioHorario = {
    ...solicitud,
    id: `SOL-${Date.now()}`,
    estado: 'pendiente',
    solicitadoEn: new Date().toISOString(),
  };

  solicitudes.push(nuevaSolicitud);
  guardarSolicitudes(solicitudes);

  return nuevaSolicitud;
}

// ========== FUNCIONES PARA GERENTE ==========

/**
 * Obtener todos los turnos (con filtros opcionales)
 */
export function obtenerTodosTurnos(filtros?: {
  trabajadorId?: string;
  puntoVentaId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado?: EstadoTurno;
}): Turno[] {
  let turnos = cargarTurnos();

  if (filtros?.trabajadorId) {
    turnos = turnos.filter(t => t.trabajadorId === filtros.trabajadorId);
  }

  if (filtros?.puntoVentaId) {
    turnos = turnos.filter(t => t.puntoVentaId === filtros.puntoVentaId);
  }

  if (filtros?.fechaInicio) {
    turnos = turnos.filter(t => t.fecha >= filtros.fechaInicio!);
  }

  if (filtros?.fechaFin) {
    turnos = turnos.filter(t => t.fecha <= filtros.fechaFin!);
  }

  if (filtros?.estado) {
    turnos = turnos.filter(t => t.estado === filtros.estado);
  }

  return turnos.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/**
 * Crear nuevo turno
 */
export function crearTurno(
  turno: Omit<Turno, 'id' | 'creadoEn'>
): Turno {
  const turnos = cargarTurnos();
  
  const nuevoTurno: Turno = {
    ...turno,
    id: `TRN-${Date.now()}`,
    creadoEn: new Date().toISOString(),
  };

  turnos.push(nuevoTurno);
  guardarTurnos(turnos);

  return nuevoTurno;
}

/**
 * Actualizar turno existente
 */
export function actualizarTurno(
  turnoId: string,
  cambios: Partial<Omit<Turno, 'id' | 'trabajadorId' | 'creadoPor' | 'creadoEn'>>,
  modificadoPor: string
): Turno | null {
  const turnos = cargarTurnos();
  const index = turnos.findIndex(t => t.id === turnoId);

  if (index === -1) return null;

  turnos[index] = {
    ...turnos[index],
    ...cambios,
    modificadoPor,
    modificadoEn: new Date().toISOString(),
  };

  guardarTurnos(turnos);
  return turnos[index];
}

/**
 * Eliminar turno
 */
export function eliminarTurno(turnoId: string): boolean {
  const turnos = cargarTurnos();
  const turnosFiltrados = turnos.filter(t => t.id !== turnoId);
  
  if (turnosFiltrados.length === turnos.length) return false;

  guardarTurnos(turnosFiltrados);
  return true;
}

/**
 * Crear múltiples turnos (asignación masiva)
 */
export function crearTurnosMasivos(turnos: Omit<Turno, 'id' | 'creadoEn'>[]): Turno[] {
  const turnosExistentes = cargarTurnos();
  
  const nuevosTurnos = turnos.map(turno => ({
    ...turno,
    id: `TRN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    creadoEn: new Date().toISOString(),
  }));

  turnosExistentes.push(...nuevosTurnos);
  guardarTurnos(turnosExistentes);

  return nuevosTurnos;
}

/**
 * Obtener todas las solicitudes (con filtros)
 */
export function obtenerTodasSolicitudes(filtros?: {
  trabajadorId?: string;
  estado?: EstadoSolicitud;
  tipo?: TipoSolicitud;
}): SolicitudCambioHorario[] {
  let solicitudes = cargarSolicitudes();

  if (filtros?.trabajadorId) {
    solicitudes = solicitudes.filter(s => s.trabajadorId === filtros.trabajadorId);
  }

  if (filtros?.estado) {
    solicitudes = solicitudes.filter(s => s.estado === filtros.estado);
  }

  if (filtros?.tipo) {
    solicitudes = solicitudes.filter(s => s.tipo === filtros.tipo);
  }

  return solicitudes.sort(
    (a, b) => new Date(b.solicitadoEn).getTime() - new Date(a.solicitadoEn).getTime()
  );
}

/**
 * Aprobar solicitud de cambio
 */
export function aprobarSolicitud(
  solicitudId: string,
  gerenteId: string,
  respuesta?: string
): SolicitudCambioHorario | null {
  const solicitudes = cargarSolicitudes();
  const index = solicitudes.findIndex(s => s.id === solicitudId);

  if (index === -1) return null;

  solicitudes[index] = {
    ...solicitudes[index],
    estado: 'aprobada',
    respuesta: respuesta || 'Solicitud aprobada',
    revisadoPor: gerenteId,
    revisadoEn: new Date().toISOString(),
  };

  guardarSolicitudes(solicitudes);

  // Si la solicitud tenía un turno original asociado, actualizarlo
  if (solicitudes[index].turnoOriginalId && solicitudes[index].turnoDeseado) {
    const turnoDeseado = solicitudes[index].turnoDeseado!;
    actualizarTurno(
      solicitudes[index].turnoOriginalId!,
      {
        tipoTurno: turnoDeseado.tipo,
        horaInicio: turnoDeseado.horaInicio,
        horaFin: turnoDeseado.horaFin,
        estado: 'modificado',
      },
      gerenteId
    );
  }

  return solicitudes[index];
}

/**
 * Rechazar solicitud de cambio
 */
export function rechazarSolicitud(
  solicitudId: string,
  gerenteId: string,
  respuesta: string
): SolicitudCambioHorario | null {
  const solicitudes = cargarSolicitudes();
  const index = solicitudes.findIndex(s => s.id === solicitudId);

  if (index === -1) return null;

  solicitudes[index] = {
    ...solicitudes[index],
    estado: 'rechazada',
    respuesta,
    revisadoPor: gerenteId,
    revisadoEn: new Date().toISOString(),
  };

  guardarSolicitudes(solicitudes);
  return solicitudes[index];
}

/**
 * Obtener estadísticas de horarios
 */
export function obtenerEstadisticasHorarios(trabajadorId?: string) {
  const turnos = trabajadorId 
    ? obtenerTurnosTrabajador(trabajadorId)
    : cargarTurnos();

  const solicitudes = trabajadorId
    ? obtenerSolicitudesTrabajador(trabajadorId)
    : cargarSolicitudes();

  return {
    totalTurnos: turnos.length,
    turnosConfirmados: turnos.filter(t => t.estado === 'confirmado').length,
    turnosPendientes: turnos.filter(t => t.estado === 'pendiente').length,
    turnosModificados: turnos.filter(t => t.estado === 'modificado').length,
    totalSolicitudes: solicitudes.length,
    solicitudesPendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    solicitudesAprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
    solicitudesRechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
  };
}
