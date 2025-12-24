/**
 * 🎫 TIPOS PARA SISTEMA DE TURNOS SIN PEDIDO
 * 
 * Para clientes que llegan al negocio sin haber hecho un pedido previo
 * desde la app. Permite registrar su llegada y gestionar la cola de atención.
 */

export interface TurnoSinPedido {
  /** ID único del turno */
  id: string;
  
  /** ID del cliente (si está registrado) */
  clienteId: string;
  
  /** Nombre del cliente */
  clienteNombre: string;
  
  /** Teléfono del cliente (opcional) */
  clienteTelefono?: string;
  
  /** Fecha y hora de llegada */
  fechaLlegada: string;
  
  /** Estado del turno */
  estado: 'esperando' | 'atendiendo' | 'completado' | 'cancelado';
  
  /** Motivo de la visita (opcional) */
  motivo?: 'compra' | 'consulta' | 'recogida' | 'otro';
  
  /** Notas adicionales (opcional) */
  notas?: string;
  
  /** Fecha de atención (cuando se marca como atendiendo) */
  fechaAtencion?: string;
  
  /** Fecha de completado */
  fechaCompletado?: string;
  
  /** Validación de geolocalización */
  geolocalizacionValidada: boolean;
  
  /** Fecha de validación de geolocalización */
  fechaGeolocalizacion?: string;
}

export interface EstadisticasTurnosSinPedido {
  /** Total de turnos sin pedido hoy */
  totalHoy: number;
  
  /** Turnos esperando atención */
  esperando: number;
  
  /** Turnos siendo atendidos */
  atendiendo: number;
  
  /** Turnos completados hoy */
  completadosHoy: number;
  
  /** Tiempo promedio de espera (minutos) */
  tiempoPromedioEspera: number;
  
  /** Tiempo promedio de atención (minutos) */
  tiempoPromedioAtencion: number;
}
