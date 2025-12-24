// Gastos Operativos - Sistema Udar Edge
// Gastos fijos y variables por Punto de Venta

import { 
  calcularNominaPDV, 
  obtenerTrabajadoresPorPDV 
} from './trabajadores';
import { calcularNominaPDVConDistribucion } from './trabajadores-integracion-fichajes';

export type TipoGasto = 
  | 'alquiler' 
  | 'suministros' 
  | 'nominas' 
  | 'marketing' 
  | 'seguros' 
  | 'mantenimiento' 
  | 'limpieza'
  | 'software'
  | 'otros';

export interface GastoFijo {
  id: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  tipo: TipoGasto;
  concepto: string;
  importeMensual: number;
  importeDiario: number;  // Prorrateado: mensual / 30
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
}

export interface GastoVariable {
  id: string;
  puntoVentaId: string;
  fecha: string;
  tipo: TipoGasto;
  concepto: string;
  importe: number;
  factura?: string;
  notas?: string;
}

// ============================================
// GASTOS FIJOS POR PUNTO DE VENTA
// ============================================

export const gastosFijos: GastoFijo[] = [
  // ==========================================
  // PDV TIANA - Modomio
  // ==========================================
  {
    id: 'GF-001',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'alquiler',
    concepto: 'Alquiler local comercial',
    importeMensual: 2500.00,
    importeDiario: 83.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-002',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'suministros',
    concepto: 'Electricidad',
    importeMensual: 450.00,
    importeDiario: 15.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-003',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'suministros',
    concepto: 'Agua',
    importeMensual: 120.00,
    importeDiario: 4.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-004',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'suministros',
    concepto: 'Gas',
    importeMensual: 200.00,
    importeDiario: 6.67,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-005',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'nominas',
    concepto: 'Nóminas personal (6 empleados)',
    importeMensual: 8500.00,
    importeDiario: 283.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-006',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'marketing',
    concepto: 'Publicidad online y redes sociales',
    importeMensual: 300.00,
    importeDiario: 10.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-007',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'seguros',
    concepto: 'Seguro local comercial',
    importeMensual: 150.00,
    importeDiario: 5.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-008',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'limpieza',
    concepto: 'Servicio de limpieza',
    importeMensual: 400.00,
    importeDiario: 13.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-009',
    puntoVentaId: 'PDV-TIANA',
    puntoVentaNombre: 'Tiana',
    tipo: 'software',
    concepto: 'Licencias software y TPV',
    importeMensual: 180.00,
    importeDiario: 6.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  // TOTAL PDV TIANA: 12,800€/mes (426.67€/día)

  // ==========================================
  // PDV BADALONA - Modomio
  // ==========================================
  {
    id: 'GF-010',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'alquiler',
    concepto: 'Alquiler local comercial',
    importeMensual: 2800.00,
    importeDiario: 93.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-011',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'suministros',
    concepto: 'Electricidad',
    importeMensual: 520.00,
    importeDiario: 17.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-012',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'suministros',
    concepto: 'Agua',
    importeMensual: 140.00,
    importeDiario: 4.67,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-013',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'suministros',
    concepto: 'Gas',
    importeMensual: 230.00,
    importeDiario: 7.67,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-014',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'nominas',
    concepto: 'Nóminas personal (8 empleados)',
    importeMensual: 10500.00,
    importeDiario: 350.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-015',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'marketing',
    concepto: 'Publicidad online y redes sociales',
    importeMensual: 350.00,
    importeDiario: 11.67,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-016',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'seguros',
    concepto: 'Seguro local comercial',
    importeMensual: 180.00,
    importeDiario: 6.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-017',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'limpieza',
    concepto: 'Servicio de limpieza',
    importeMensual: 450.00,
    importeDiario: 15.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-018',
    puntoVentaId: 'PDV-BADALONA',
    puntoVentaNombre: 'Badalona',
    tipo: 'software',
    concepto: 'Licencias software y TPV',
    importeMensual: 180.00,
    importeDiario: 6.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  // TOTAL PDV BADALONA: 15,350€/mes (511.67€/día)

  // ==========================================
  // PDV MONTGAT - Blackburguer
  // ==========================================
  {
    id: 'GF-019',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'alquiler',
    concepto: 'Alquiler local comercial',
    importeMensual: 2200.00,
    importeDiario: 73.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-020',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'suministros',
    concepto: 'Electricidad',
    importeMensual: 380.00,
    importeDiario: 12.67,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-021',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'suministros',
    concepto: 'Agua',
    importeMensual: 100.00,
    importeDiario: 3.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-022',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'suministros',
    concepto: 'Gas',
    importeMensual: 180.00,
    importeDiario: 6.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-023',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'nominas',
    concepto: 'Nóminas personal (5 empleados)',
    importeMensual: 7200.00,
    importeDiario: 240.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-024',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'marketing',
    concepto: 'Publicidad online',
    importeMensual: 250.00,
    importeDiario: 8.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-025',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'seguros',
    concepto: 'Seguro local comercial',
    importeMensual: 130.00,
    importeDiario: 4.33,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-026',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'limpieza',
    concepto: 'Servicio de limpieza',
    importeMensual: 350.00,
    importeDiario: 11.67,
    fechaInicio: '2024-01-01',
    activo: true
  },
  {
    id: 'GF-027',
    puntoVentaId: 'PDV-MONTGAT',
    puntoVentaNombre: 'Montgat',
    tipo: 'software',
    concepto: 'Licencias software y TPV',
    importeMensual: 180.00,
    importeDiario: 6.00,
    fechaInicio: '2024-01-01',
    activo: true
  },
  // TOTAL PDV MONTGAT: 10,970€/mes (365.67€/día)
];

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * ⭐ NUEVO: Obtener gasto de nóminas calculado automáticamente
 * Reemplaza el gasto hardcodeado por el cálculo real desde trabajadores
 */
export const obtenerGastoNominas = (puntoVentaId: string, puntoVentaNombre: string): GastoFijo => {
  const trabajadores = obtenerTrabajadoresPorPDV(puntoVentaId);
  const nominaTotal = calcularNominaPDV(puntoVentaId);
  
  return {
    id: `GF-NOMINAS-${puntoVentaId}`,
    puntoVentaId,
    puntoVentaNombre,
    tipo: 'nominas',
    concepto: `Nóminas personal (${trabajadores.length} trabajadores)`,
    importeMensual: Number(nominaTotal.toFixed(2)),
    importeDiario: Number((nominaTotal / 30).toFixed(2)),
    fechaInicio: '2024-01-01',
    activo: true
  };
};

/**
 * ⭐ NUEVO V2: Obtener gasto de nóminas con distribución por fichajes
 * Usa el sistema mixto de distribución (manual override + fichajes calculados)
 */
export const obtenerGastoNominasConFichajes = (
  puntoVentaId: string,
  puntoVentaNombre: string,
  año?: number,
  mes?: number
): GastoFijo => {
  const trabajadores = obtenerTrabajadoresPorPDV(puntoVentaId);
  const nominaTotal = calcularNominaPDVConDistribucion(puntoVentaId, año, mes);
  
  return {
    id: `GF-NOMINAS-${puntoVentaId}`,
    puntoVentaId,
    puntoVentaNombre,
    tipo: 'nominas',
    concepto: `Nóminas personal (${trabajadores.length} trabajadores)`,
    importeMensual: Number(nominaTotal.toFixed(2)),
    importeDiario: Number((nominaTotal / 30).toFixed(2)),
    fechaInicio: '2024-01-01',
    activo: true
  };
};

/**
 * ⭐ NUEVO: Obtener gastos fijos con nóminas calculadas automáticamente
 * Reemplaza los gastos de nóminas hardcodeados por cálculos reales
 */
export const obtenerGastosFijosConNominasCalculadas = (puntoVentaId: string): GastoFijo[] => {
  // Obtener gastos fijos base (sin nóminas hardcodeadas)
  const gastosBase = gastosFijos.filter(
    gasto => gasto.puntoVentaId === puntoVentaId && gasto.tipo !== 'nominas' && gasto.activo
  );
  
  // Obtener el nombre del PDV desde los gastos existentes
  const puntoVentaNombre = gastosFijos.find(g => g.puntoVentaId === puntoVentaId)?.puntoVentaNombre || '';
  
  // Agregar nóminas calculadas
  const gastoNominas = obtenerGastoNominas(puntoVentaId, puntoVentaNombre);
  
  return [...gastosBase, gastoNominas];
};

/**
 * Obtener gastos fijos activos de un punto de venta (ORIGINAL - mantener para compatibilidad)
 */
export const obtenerGastosFijosPorPDV = (puntoVentaId: string): GastoFijo[] => {
  return gastosFijos.filter(
    gasto => gasto.puntoVentaId === puntoVentaId && gasto.activo
  );
};

/**
 * Calcular total de gastos fijos mensuales de un PDV
 */
export const calcularTotalGastosMensuales = (puntoVentaId: string): number => {
  const gastos = obtenerGastosFijosPorPDV(puntoVentaId);
  return gastos.reduce((total, gasto) => total + gasto.importeMensual, 0);
};

/**
 * ⭐ NUEVO: Calcular total de gastos fijos mensuales con nóminas dinámicas
 */
export const calcularTotalGastosMensualesConNominas = (puntoVentaId: string): number => {
  const gastos = obtenerGastosFijosConNominasCalculadas(puntoVentaId);
  return gastos.reduce((total, gasto) => total + gasto.importeMensual, 0);
};

/**
 * Calcular total de gastos fijos diarios de un PDV
 */
export const calcularTotalGastosDiarios = (puntoVentaId: string): number => {
  const gastos = obtenerGastosFijosPorPDV(puntoVentaId);
  return gastos.reduce((total, gasto) => total + gasto.importeDiario, 0);
};

/**
 * ⭐ NUEVO: Calcular total de gastos fijos diarios con nóminas dinámicas
 */
export const calcularTotalGastosDiariosConNominas = (puntoVentaId: string): number => {
  const gastos = obtenerGastosFijosConNominasCalculadas(puntoVentaId);
  return gastos.reduce((total, gasto) => total + gasto.importeDiario, 0);
};

/**
 * Calcular gastos operativos de un periodo
 * @param puntoVentaId - ID del punto de venta
 * @param fechaDesde - Fecha inicio del periodo
 * @param fechaHasta - Fecha fin del periodo
 * @returns Total de gastos operativos del periodo
 */
export const calcularGastosOperativosPeriodo = (
  puntoVentaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): number => {
  const gastosDiarios = calcularTotalGastosDiarios(puntoVentaId);
  
  // Calcular número de días en el periodo
  const diffTime = Math.abs(fechaHasta.getTime() - fechaDesde.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  
  return gastosDiarios * diffDays;
};

/**
 * Obtener desglose de gastos por tipo
 */
export const obtenerDesgloseGastosPorTipo = (puntoVentaId: string): Record<TipoGasto, number> => {
  const gastos = obtenerGastosFijosPorPDV(puntoVentaId);
  
  const desglose: Partial<Record<TipoGasto, number>> = {};
  
  gastos.forEach(gasto => {
    if (!desglose[gasto.tipo]) {
      desglose[gasto.tipo] = 0;
    }
    desglose[gasto.tipo]! += gasto.importeMensual;
  });
  
  return desglose as Record<TipoGasto, number>;
};

/**
 * Resumen de gastos por PDV
 */
export interface ResumenGastosPDV {
  puntoVentaId: string;
  puntoVentaNombre: string;
  totalMensual: number;
  totalDiario: number;
  desglosePorTipo: Record<TipoGasto, number>;
  numeroConceptos: number;
}

export const obtenerResumenGastosPDV = (puntoVentaId: string): ResumenGastosPDV => {
  const gastos = obtenerGastosFijosPorPDV(puntoVentaId);
  
  if (gastos.length === 0) {
    return {
      puntoVentaId,
      puntoVentaNombre: '',
      totalMensual: 0,
      totalDiario: 0,
      desglosePorTipo: {} as Record<TipoGasto, number>,
      numeroConceptos: 0
    };
  }
  
  return {
    puntoVentaId,
    puntoVentaNombre: gastos[0].puntoVentaNombre,
    totalMensual: calcularTotalGastosMensuales(puntoVentaId),
    totalDiario: calcularTotalGastosDiarios(puntoVentaId),
    desglosePorTipo: obtenerDesgloseGastosPorTipo(puntoVentaId),
    numeroConceptos: gastos.length
  };
};

// ============================================
// DATOS MOCK DE GASTOS VARIABLES (Ejemplo)
// ============================================

export const gastosVariables: GastoVariable[] = [
  {
    id: 'GV-001',
    puntoVentaId: 'PDV-TIANA',
    fecha: '2025-11-25',
    tipo: 'mantenimiento',
    concepto: 'Reparación horno',
    importe: 280.00,
    factura: 'FCT-2025-1125',
    notas: 'Reparación urgente de horno principal'
  },
  {
    id: 'GV-002',
    puntoVentaId: 'PDV-BADALONA',
    fecha: '2025-11-28',
    tipo: 'marketing',
    concepto: 'Campaña Meta Ads',
    importe: 150.00,
    factura: 'META-2025-1128',
    notas: 'Campaña promoción Black Friday'
  }
];