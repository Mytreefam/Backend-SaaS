/**
 * 🎫 SERVICIO DE TURNOS SIN PEDIDO
 * 
 * Gestiona clientes que llegan al negocio sin pedido previo.
 * Persistencia en localStorage con sincronización automática.
 */

import { TurnoSinPedido, EstadisticasTurnosSinPedido } from '../types/turno-sin-pedido.types';

const STORAGE_KEY = 'udar-turnos-sin-pedido';

/**
 * Obtener todos los turnos sin pedido
 */
export function obtenerTurnosSinPedido(): TurnoSinPedido[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al obtener turnos sin pedido:', error);
    return [];
  }
}

/**
 * Guardar turnos sin pedido
 */
function guardarTurnosSinPedido(turnos: TurnoSinPedido[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turnos));
    
    // Disparar evento personalizado para sincronización
    window.dispatchEvent(new CustomEvent('turnos-sin-pedido-updated', { 
      detail: { turnos } 
    }));
  } catch (error) {
    console.error('Error al guardar turnos sin pedido:', error);
  }
}

/**
 * Crear nuevo turno sin pedido
 */
export function crearTurnoSinPedido(params: {
  clienteId: string;
  clienteNombre: string;
  clienteTelefono?: string;
  motivo?: TurnoSinPedido['motivo'];
  notas?: string;
}): TurnoSinPedido {
  const nuevoTurno: TurnoSinPedido = {
    id: `turno-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    clienteId: params.clienteId,
    clienteNombre: params.clienteNombre,
    clienteTelefono: params.clienteTelefono,
    fechaLlegada: new Date().toISOString(),
    estado: 'esperando',
    motivo: params.motivo,
    notas: params.notas,
    geolocalizacionValidada: true, // Ya validado al hacer "Ya estoy aquí"
    fechaGeolocalizacion: new Date().toISOString()
  };

  const turnos = obtenerTurnosSinPedido();
  turnos.push(nuevoTurno);
  guardarTurnosSinPedido(turnos);

  console.log('✅ Turno sin pedido creado:', nuevoTurno);
  return nuevoTurno;
}

/**
 * Obtener turno por ID
 */
export function obtenerTurnoPorId(turnoId: string): TurnoSinPedido | null {
  const turnos = obtenerTurnosSinPedido();
  return turnos.find(t => t.id === turnoId) || null;
}

/**
 * Obtener turnos de un cliente
 */
export function obtenerTurnosCliente(clienteId: string): TurnoSinPedido[] {
  const turnos = obtenerTurnosSinPedido();
  return turnos.filter(t => t.clienteId === clienteId);
}

/**
 * Actualizar estado de un turno
 */
export function actualizarEstadoTurno(
  turnoId: string, 
  nuevoEstado: TurnoSinPedido['estado']
): boolean {
  const turnos = obtenerTurnosSinPedido();
  const index = turnos.findIndex(t => t.id === turnoId);
  
  if (index === -1) {
    console.error('Turno no encontrado:', turnoId);
    return false;
  }

  turnos[index].estado = nuevoEstado;
  
  // Actualizar fechas según el estado
  if (nuevoEstado === 'atendiendo' && !turnos[index].fechaAtencion) {
    turnos[index].fechaAtencion = new Date().toISOString();
  } else if (nuevoEstado === 'completado' && !turnos[index].fechaCompletado) {
    turnos[index].fechaCompletado = new Date().toISOString();
  }

  guardarTurnosSinPedido(turnos);
  console.log(`✅ Turno ${turnoId} actualizado a: ${nuevoEstado}`);
  
  return true;
}

/**
 * Marcar turno como atendiendo
 */
export function atenderTurno(turnoId: string): boolean {
  return actualizarEstadoTurno(turnoId, 'atendiendo');
}

/**
 * Completar turno
 */
export function completarTurno(turnoId: string): boolean {
  return actualizarEstadoTurno(turnoId, 'completado');
}

/**
 * Cancelar turno
 */
export function cancelarTurno(turnoId: string): boolean {
  return actualizarEstadoTurno(turnoId, 'cancelado');
}

/**
 * Eliminar turno
 */
export function eliminarTurno(turnoId: string): boolean {
  const turnos = obtenerTurnosSinPedido();
  const turnosFiltrados = turnos.filter(t => t.id !== turnoId);
  
  if (turnosFiltrados.length === turnos.length) {
    console.error('Turno no encontrado:', turnoId);
    return false;
  }

  guardarTurnosSinPedido(turnosFiltrados);
  console.log(`✅ Turno ${turnoId} eliminado`);
  
  return true;
}

/**
 * Obtener turnos activos (esperando o atendiendo)
 */
export function obtenerTurnosActivos(): TurnoSinPedido[] {
  const turnos = obtenerTurnosSinPedido();
  return turnos
    .filter(t => t.estado === 'esperando' || t.estado === 'atendiendo')
    .sort((a, b) => {
      // Ordenar por fecha de llegada (más antiguos primero)
      return new Date(a.fechaLlegada).getTime() - new Date(b.fechaLlegada).getTime();
    });
}

/**
 * Obtener turnos esperando con geolocalización validada
 */
export function obtenerTurnosEsperando(): TurnoSinPedido[] {
  const turnos = obtenerTurnosSinPedido();
  return turnos
    .filter(t => t.estado === 'esperando' && t.geolocalizacionValidada)
    .sort((a, b) => {
      return new Date(a.fechaLlegada).getTime() - new Date(b.fechaLlegada).getTime();
    });
}

/**
 * Obtener estadísticas de turnos sin pedido
 */
export function obtenerEstadisticasTurnos(): EstadisticasTurnosSinPedido {
  const turnos = obtenerTurnosSinPedido();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const turnosHoy = turnos.filter(t => {
    const fechaTurno = new Date(t.fechaLlegada);
    fechaTurno.setHours(0, 0, 0, 0);
    return fechaTurno.getTime() === hoy.getTime();
  });

  const esperando = turnosHoy.filter(t => t.estado === 'esperando').length;
  const atendiendo = turnosHoy.filter(t => t.estado === 'atendiendo').length;
  const completadosHoy = turnosHoy.filter(t => t.estado === 'completado').length;

  // Calcular tiempo promedio de espera
  const turnosConEspera = turnosHoy.filter(t => 
    t.fechaAtencion && t.fechaLlegada
  );
  
  const tiempoPromedioEspera = turnosConEspera.length > 0
    ? turnosConEspera.reduce((acc, t) => {
        const espera = new Date(t.fechaAtencion!).getTime() - new Date(t.fechaLlegada).getTime();
        return acc + (espera / 1000 / 60); // Convertir a minutos
      }, 0) / turnosConEspera.length
    : 0;

  // Calcular tiempo promedio de atención
  const turnosCompletados = turnosHoy.filter(t => 
    t.fechaCompletado && t.fechaAtencion
  );
  
  const tiempoPromedioAtencion = turnosCompletados.length > 0
    ? turnosCompletados.reduce((acc, t) => {
        const atencion = new Date(t.fechaCompletado!).getTime() - new Date(t.fechaAtencion!).getTime();
        return acc + (atencion / 1000 / 60); // Convertir a minutos
      }, 0) / turnosCompletados.length
    : 0;

  return {
    totalHoy: turnosHoy.length,
    esperando,
    atendiendo,
    completadosHoy,
    tiempoPromedioEspera: Math.round(tiempoPromedioEspera * 10) / 10,
    tiempoPromedioAtencion: Math.round(tiempoPromedioAtencion * 10) / 10
  };
}

/**
 * Limpiar turnos antiguos (más de 7 días)
 */
export function limpiarTurnosAntiguos(): number {
  const turnos = obtenerTurnosSinPedido();
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  const turnosFiltrados = turnos.filter(t => {
    const fechaTurno = new Date(t.fechaLlegada);
    return fechaTurno >= hace7Dias;
  });

  const eliminados = turnos.length - turnosFiltrados.length;
  
  if (eliminados > 0) {
    guardarTurnosSinPedido(turnosFiltrados);
    console.log(`🧹 Limpiados ${eliminados} turnos antiguos`);
  }

  return eliminados;
}

/**
 * Limpiar todos los turnos (para testing)
 */
export function limpiarTodosTurnos(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('turnos-sin-pedido-updated', { 
    detail: { turnos: [] } 
  }));
  console.log('🧹 Todos los turnos sin pedido eliminados');
}
