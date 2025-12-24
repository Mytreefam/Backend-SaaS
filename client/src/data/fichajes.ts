/**
 * FICHAJES - SISTEMA DE CONTROL HORARIO
 * 
 * Sistema completo de fichajes que se integra con:
 * - /components/FichajeColaborador.tsx (UI para trabajadores)
 * - /data/trabajadores.ts (cálculo de distribución de costes)
 * - /data/gastos-operativos.ts (asignación de nóminas por PDV)
 * 
 * FUNCIONALIDADES:
 * ✅ Registro de entrada/salida por PDV
 * ✅ Geolocalización de fichajes
 * ✅ Control de pausas
 * ✅ Cálculo automático de distribución de costes
 * ✅ Métricas de absentismo
 * ✅ Reportes de horas trabajadas
 */

import { trabajadores } from './trabajadores';
import { PUNTOS_VENTA } from '../constants/empresaConfig';

// ============================================
// INTERFACES
// ============================================

export interface Pausa {
  inicio: string;           // ISO timestamp
  fin?: string;             // ISO timestamp
  duracionMinutos?: number; // Calculado al finalizar
}

export interface Geolocalizacion {
  latitud: number;
  longitud: number;
  precision: number;        // En metros
}

export interface Fichaje {
  // Identificación
  id: string;
  trabajadorId: string;
  puntoVentaId: string;
  
  // Fecha y hora (separados para consultas)
  fecha: string;            // YYYY-MM-DD
  horaEntrada: string;      // HH:mm:ss
  horaSalida?: string;      // HH:mm:ss
  
  // Timestamps completos (para cálculos)
  timestampEntrada: string; // ISO 8601
  timestampSalida?: string; // ISO 8601
  
  // Tiempo trabajado
  tiempoTotalMinutos?: number;      // Total sin pausas
  tiempoPausasMinutos?: number;     // Total de pausas
  tiempoEfectivoMinutos?: number;   // Total - Pausas
  
  // Pausas
  pausas?: Pausa[];
  enPausaActualmente?: boolean;
  
  // Geolocalización (opcional pero recomendado)
  geolocalizacionEntrada?: Geolocalizacion;
  geolocalizacionSalida?: Geolocalizacion;
  
  // Validación
  validado: boolean;        // Aprobado por responsable
  observaciones?: string;
  
  // Metadatos
  createdAt: string;
  updatedAt?: string;
}

export interface ResumenFichajesTrabajador {
  trabajadorId: string;
  trabajadorNombre: string;
  periodo: string;          // "2025-11" (año-mes)
  
  // Por PDV
  distribucionPDV: {
    puntoVentaId: string;
    puntoVentaNombre: string;
    horasTrabajadas: number;
    diasTrabajados: number;
    porcentaje: number;     // % de horas respecto al total
  }[];
  
  // Totales
  totalHorasTrabajadas: number;
  totalDiasTrabajados: number;
  horasContrato: number;
  horasExtra: number;
  horasFaltantes: number;
  
  // Absentismo
  diasAbsentismo: number;
  porcentajeAbsentismo: number;
}

export interface MetricasAbsentismo {
  trabajadorId: string;
  periodo: string;
  
  // Días
  diasContrato: number;       // Días que debería trabajar
  diasFichados: number;       // Días que realmente fichó
  diasAusencia: number;       // Diferencia
  
  // Horas
  horasContrato: number;      // Horas contractuales
  horasFichadas: number;      // Horas reales fichadas
  horasAusencia: number;      // Diferencia
  
  // Porcentajes
  porcentajeAbsentismoDias: number;
  porcentajeAbsentismoHoras: number;
  
  // Detalle
  ausentismoJustificado?: number;
  ausentismoNoJustificado?: number;
}

// ============================================
// DATOS MOCK - FICHAJES NOVIEMBRE 2025
// ============================================

export const fichajes: Fichaje[] = [
  // ==========================================
  // TRABAJADOR: Carlos (TRB-001) - PDV TIANA
  // ==========================================
  // Lunes 25 Nov
  {
    id: 'FICH-001',
    trabajadorId: 'TRB-001',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-25',
    horaEntrada: '06:00:00',
    horaSalida: '14:00:00',
    timestampEntrada: '2025-11-25T06:00:00.000Z',
    timestampSalida: '2025-11-25T14:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-25T10:00:00.000Z', fin: '2025-11-25T10:30:00.000Z', duracionMinutos: 30 }
    ],
    geolocalizacionEntrada: { latitud: 41.4933, longitud: 2.2633, precision: 15 },
    geolocalizacionSalida: { latitud: 41.4933, longitud: 2.2633, precision: 12 },
    validado: true,
    createdAt: '2025-11-25T06:00:00.000Z'
  },
  // Martes 26 Nov
  {
    id: 'FICH-002',
    trabajadorId: 'TRB-001',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-26',
    horaEntrada: '06:00:00',
    horaSalida: '14:00:00',
    timestampEntrada: '2025-11-26T06:00:00.000Z',
    timestampSalida: '2025-11-26T14:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-26T10:00:00.000Z', fin: '2025-11-26T10:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-26T06:00:00.000Z'
  },
  // Miércoles 27 Nov
  {
    id: 'FICH-003',
    trabajadorId: 'TRB-001',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-27',
    horaEntrada: '06:00:00',
    horaSalida: '14:00:00',
    timestampEntrada: '2025-11-27T06:00:00.000Z',
    timestampSalida: '2025-11-27T14:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-27T10:00:00.000Z', fin: '2025-11-27T10:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-27T06:00:00.000Z'
  },
  // Jueves 28 Nov
  {
    id: 'FICH-004',
    trabajadorId: 'TRB-001',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-28',
    horaEntrada: '06:00:00',
    horaSalida: '14:00:00',
    timestampEntrada: '2025-11-28T06:00:00.000Z',
    timestampSalida: '2025-11-28T14:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-28T10:00:00.000Z', fin: '2025-11-28T10:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-28T06:00:00.000Z'
  },
  // Viernes 29 Nov
  {
    id: 'FICH-005',
    trabajadorId: 'TRB-001',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-29',
    horaEntrada: '06:00:00',
    horaSalida: '14:00:00',
    timestampEntrada: '2025-11-29T06:00:00.000Z',
    timestampSalida: '2025-11-29T14:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-29T10:00:00.000Z', fin: '2025-11-29T10:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-29T06:00:00.000Z'
  },

  // ==========================================
  // TRABAJADOR: María (TRB-002) - MULTI-PDV
  // Trabaja en TIANA (60%) y BADALONA (40%)
  // ==========================================
  // Lunes 25 Nov - TIANA
  {
    id: 'FICH-006',
    trabajadorId: 'TRB-002',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-25',
    horaEntrada: '07:00:00',
    horaSalida: '15:00:00',
    timestampEntrada: '2025-11-25T07:00:00.000Z',
    timestampSalida: '2025-11-25T15:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-25T11:00:00.000Z', fin: '2025-11-25T11:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-25T07:00:00.000Z'
  },
  // Martes 26 Nov - BADALONA
  {
    id: 'FICH-007',
    trabajadorId: 'TRB-002',
    puntoVentaId: 'PDV-BADALONA',
    fecha: '2025-11-26',
    horaEntrada: '07:00:00',
    horaSalida: '15:00:00',
    timestampEntrada: '2025-11-26T07:00:00.000Z',
    timestampSalida: '2025-11-26T15:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-26T11:00:00.000Z', fin: '2025-11-26T11:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-26T07:00:00.000Z'
  },
  // Miércoles 27 Nov - TIANA
  {
    id: 'FICH-008',
    trabajadorId: 'TRB-002',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-27',
    horaEntrada: '07:00:00',
    horaSalida: '15:00:00',
    timestampEntrada: '2025-11-27T07:00:00.000Z',
    timestampSalida: '2025-11-27T15:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-27T11:00:00.000Z', fin: '2025-11-27T11:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-27T07:00:00.000Z'
  },
  // Jueves 28 Nov - TIANA
  {
    id: 'FICH-009',
    trabajadorId: 'TRB-002',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-28',
    horaEntrada: '07:00:00',
    horaSalida: '15:00:00',
    timestampEntrada: '2025-11-28T07:00:00.000Z',
    timestampSalida: '2025-11-28T15:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-28T11:00:00.000Z', fin: '2025-11-28T11:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-28T07:00:00.000Z'
  },
  // Viernes 29 Nov - BADALONA
  {
    id: 'FICH-010',
    trabajadorId: 'TRB-002',
    puntoVentaId: 'PDV-BADALONA',
    fecha: '2025-11-29',
    horaEntrada: '07:00:00',
    horaSalida: '15:00:00',
    timestampEntrada: '2025-11-29T07:00:00.000Z',
    timestampSalida: '2025-11-29T15:00:00.000Z',
    tiempoTotalMinutos: 480,
    tiempoPausasMinutos: 30,
    tiempoEfectivoMinutos: 450,
    pausas: [
      { inicio: '2025-11-29T11:00:00.000Z', fin: '2025-11-29T11:30:00.000Z', duracionMinutos: 30 }
    ],
    validado: true,
    createdAt: '2025-11-29T07:00:00.000Z'
  },
];

// ============================================
// FUNCIONES HELPER - CONSULTAS BÁSICAS
// ============================================

/**
 * Obtener fichajes de un trabajador en un periodo
 */
export const obtenerFichajesTrabajador = (
  trabajadorId: string,
  fechaDesde?: string,
  fechaHasta?: string
): Fichaje[] => {
  let fichajesFiltrados = fichajes.filter(f => f.trabajadorId === trabajadorId);
  
  if (fechaDesde) {
    fichajesFiltrados = fichajesFiltrados.filter(f => f.fecha >= fechaDesde);
  }
  
  if (fechaHasta) {
    fichajesFiltrados = fichajesFiltrados.filter(f => f.fecha <= fechaHasta);
  }
  
  return fichajesFiltrados.sort((a, b) => a.fecha.localeCompare(b.fecha));
};

/**
 * Obtener fichajes de un PDV en un periodo
 */
export const obtenerFichajesPDV = (
  puntoVentaId: string,
  fechaDesde?: string,
  fechaHasta?: string
): Fichaje[] => {
  let fichajesFiltrados = fichajes.filter(f => f.puntoVentaId === puntoVentaId);
  
  if (fechaDesde) {
    fichajesFiltrados = fichajesFiltrados.filter(f => f.fecha >= fechaDesde);
  }
  
  if (fechaHasta) {
    fichajesFiltrados = fichajesFiltrados.filter(f => f.fecha <= fechaHasta);
  }
  
  return fichajesFiltrados.sort((a, b) => a.fecha.localeCompare(b.fecha));
};

/**
 * Obtener fichajes de un mes específico
 */
export const obtenerFichajesMes = (
  trabajadorId: string,
  año: number,
  mes: number
): Fichaje[] => {
  const mesStr = String(mes).padStart(2, '0');
  const periodoPrefix = `${año}-${mesStr}`;
  
  return fichajes.filter(
    f => f.trabajadorId === trabajadorId && f.fecha.startsWith(periodoPrefix)
  );
};

// ============================================
// FUNCIONES - CÁLCULO DE DISTRIBUCIÓN
// ============================================

/**
 * ⭐ CORE: Calcular distribución de costes por fichajes reales
 * Esta es la función clave que reemplaza la distribución manual
 */
export const calcularDistribucionPorFichajes = (
  trabajadorId: string,
  año: number,
  mes: number
): { puntoVentaId: string; porcentaje: number; horasTrabajadas: number }[] => {
  const fichajesMes = obtenerFichajesMes(trabajadorId, año, mes);
  
  if (fichajesMes.length === 0) {
    return [];
  }
  
  // Agrupar horas por PDV
  const horasPorPDV = new Map<string, number>();
  
  fichajesMes.forEach(fichaje => {
    const horas = (fichaje.tiempoEfectivoMinutos || 0) / 60;
    const horasActuales = horasPorPDV.get(fichaje.puntoVentaId) || 0;
    horasPorPDV.set(fichaje.puntoVentaId, horasActuales + horas);
  });
  
  // Calcular total de horas
  const totalHoras = Array.from(horasPorPDV.values()).reduce((sum, h) => sum + h, 0);
  
  // Calcular porcentajes
  const distribucion = Array.from(horasPorPDV.entries()).map(([pdvId, horas]) => ({
    puntoVentaId: pdvId,
    porcentaje: Number(((horas / totalHoras) * 100).toFixed(2)),
    horasTrabajadas: Number(horas.toFixed(2))
  }));
  
  return distribucion.sort((a, b) => b.porcentaje - a.porcentaje);
};

/**
 * Obtener horas totales trabajadas por un trabajador en un mes
 */
export const calcularHorasTrabajadas = (
  trabajadorId: string,
  año: number,
  mes: number
): number => {
  const fichajesMes = obtenerFichajesMes(trabajadorId, año, mes);
  
  const totalMinutos = fichajesMes.reduce(
    (sum, f) => sum + (f.tiempoEfectivoMinutos || 0),
    0
  );
  
  return Number((totalMinutos / 60).toFixed(2));
};

/**
 * Obtener días trabajados por un trabajador en un mes
 */
export const calcularDiasTrabajados = (
  trabajadorId: string,
  año: number,
  mes: number
): number => {
  const fichajesMes = obtenerFichajesMes(trabajadorId, año, mes);
  
  // Obtener fechas únicas
  const fechasUnicas = new Set(fichajesMes.map(f => f.fecha));
  
  return fechasUnicas.size;
};

// ============================================
// FUNCIONES - RESUMEN Y REPORTES
// ============================================

/**
 * ⭐ Generar resumen completo de fichajes de un trabajador
 */
export const generarResumenFichajes = (
  trabajadorId: string,
  año: number,
  mes: number
): ResumenFichajesTrabajador | null => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return null;
  
  const fichajesMes = obtenerFichajesMes(trabajadorId, año, mes);
  if (fichajesMes.length === 0) return null;
  
  // Calcular distribución por PDV
  const distribucionPDV = calcularDistribucionPorFichajes(trabajadorId, año, mes);
  
  // Enriquecer con nombres de PDVs
  const distribucionConNombres = distribucionPDV.map(d => ({
    puntoVentaId: d.puntoVentaId,
    puntoVentaNombre: PUNTOS_VENTA[d.puntoVentaId]?.nombre || d.puntoVentaId,
    horasTrabajadas: d.horasTrabajadas,
    diasTrabajados: fichajesMes.filter(f => f.puntoVentaId === d.puntoVentaId).length,
    porcentaje: d.porcentaje
  }));
  
  // Calcular totales
  const totalHorasTrabajadas = distribucionPDV.reduce((sum, d) => sum + d.horasTrabajadas, 0);
  const totalDiasTrabajados = calcularDiasTrabajados(trabajadorId, año, mes);
  const horasContrato = trabajador.horasContrato;
  
  return {
    trabajadorId,
    trabajadorNombre: `${trabajador.nombre} ${trabajador.apellidos}`,
    periodo: `${año}-${String(mes).padStart(2, '0')}`,
    distribucionPDV: distribucionConNombres,
    totalHorasTrabajadas,
    totalDiasTrabajados,
    horasContrato,
    horasExtra: Math.max(0, totalHorasTrabajadas - horasContrato),
    horasFaltantes: Math.max(0, horasContrato - totalHorasTrabajadas),
    diasAbsentismo: 0, // Se calcula en calcularAbsentismo()
    porcentajeAbsentismo: 0
  };
};

// ============================================
// FUNCIONES - ABSENTISMO
// ============================================

/**
 * ⭐ Calcular absentismo de un trabajador
 */
export const calcularAbsentismo = (
  trabajadorId: string,
  año: number,
  mes: number
): MetricasAbsentismo => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) {
    throw new Error(`Trabajador ${trabajadorId} no encontrado`);
  }
  
  // Obtener fichajes del mes
  const horasFichadas = calcularHorasTrabajadas(trabajadorId, año, mes);
  const diasFichados = calcularDiasTrabajados(trabajadorId, año, mes);
  
  // Datos contractuales
  const horasContrato = trabajador.horasContrato;
  
  // Calcular días de contrato (asumiendo 22 días laborables/mes)
  const diasContrato = 22;
  
  // Calcular ausencias
  const horasAusencia = Math.max(0, horasContrato - horasFichadas);
  const diasAusencia = Math.max(0, diasContrato - diasFichados);
  
  // Calcular porcentajes
  const porcentajeAbsentismoDias = diasContrato > 0 
    ? Number(((diasAusencia / diasContrato) * 100).toFixed(2))
    : 0;
    
  const porcentajeAbsentismoHoras = horasContrato > 0
    ? Number(((horasAusencia / horasContrato) * 100).toFixed(2))
    : 0;
  
  return {
    trabajadorId,
    periodo: `${año}-${String(mes).padStart(2, '0')}`,
    diasContrato,
    diasFichados,
    diasAusencia,
    horasContrato,
    horasFichadas,
    horasAusencia,
    porcentajeAbsentismoDias,
    porcentajeAbsentismoHoras
  };
};

/**
 * Obtener trabajadores con alto absentismo (>10%)
 */
export const obtenerTrabajadoresAltoAbsentismo = (
  año: number,
  mes: number,
  umbral: number = 10
): MetricasAbsentismo[] => {
  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'activo');
  
  const metricas = trabajadoresActivos
    .map(t => calcularAbsentismo(t.id, año, mes))
    .filter(m => m.porcentajeAbsentismoHoras >= umbral)
    .sort((a, b) => b.porcentajeAbsentismoHoras - a.porcentajeAbsentismoHoras);
  
  return metricas;
};

// ============================================
// FUNCIONES - VALIDACIÓN Y CONTROL
// ============================================

/**
 * Validar fichaje (aprobación por responsable)
 */
export const validarFichaje = (fichajeId: string, observaciones?: string): boolean => {
  const fichaje = fichajes.find(f => f.id === fichajeId);
  if (!fichaje) return false;
  
  fichaje.validado = true;
  fichaje.observaciones = observaciones;
  fichaje.updatedAt = new Date().toISOString();
  
  return true;
};

/**
 * Obtener fichajes pendientes de validar
 */
export const obtenerFichajesPendientesValidacion = (
  puntoVentaId?: string
): Fichaje[] => {
  let fichajesPendientes = fichajes.filter(f => !f.validado);
  
  if (puntoVentaId) {
    fichajesPendientes = fichajesPendientes.filter(f => f.puntoVentaId === puntoVentaId);
  }
  
  return fichajesPendientes.sort((a, b) => a.fecha.localeCompare(b.fecha));
};

/**
 * Detectar fichajes incompletos (sin salida)
 */
export const obtenerFichajesIncompletos = (): Fichaje[] => {
  const ahora = new Date();
  const haceDosDias = new Date(ahora.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fechaLimite = haceDosDias.toISOString().split('T')[0];
  
  return fichajes.filter(
    f => !f.horaSalida && f.fecha < fechaLimite
  );
};

// ============================================
// FUNCIONES - ESTADÍSTICAS GENERALES
// ============================================

/**
 * Obtener promedio de horas trabajadas por PDV
 */
export const calcularPromedioHorasPDV = (
  puntoVentaId: string,
  año: number,
  mes: number
): number => {
  const fichajesPDV = obtenerFichajesPDV(
    puntoVentaId,
    `${año}-${String(mes).padStart(2, '0')}-01`,
    `${año}-${String(mes).padStart(2, '0')}-31`
  );
  
  if (fichajesPDV.length === 0) return 0;
  
  const totalMinutos = fichajesPDV.reduce(
    (sum, f) => sum + (f.tiempoEfectivoMinutos || 0),
    0
  );
  
  return Number((totalMinutos / 60 / fichajesPDV.length).toFixed(2));
};

/**
 * Obtener ranking de trabajadores por horas trabajadas
 */
export const obtenerRankingHorasTrabajadas = (
  año: number,
  mes: number,
  limite: number = 10
): { trabajadorId: string; trabajadorNombre: string; horas: number }[] => {
  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'activo');
  
  const ranking = trabajadoresActivos
    .map(t => ({
      trabajadorId: t.id,
      trabajadorNombre: `${t.nombre} ${t.apellidos}`,
      horas: calcularHorasTrabajadas(t.id, año, mes)
    }))
    .filter(r => r.horas > 0)
    .sort((a, b) => b.horas - a.horas)
    .slice(0, limite);
  
  return ranking;
};
