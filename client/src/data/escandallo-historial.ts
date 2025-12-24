/**
 * HISTORIAL DE PRECIOS Y ESCANDALLO
 * 
 * Este archivo define la estructura de datos para rastrear la evolución
 * de costes de los productos a lo largo del tiempo.
 * 
 * FLUJO DE ACTUALIZACIÓN AUTOMÁTICA:
 * ==================================
 * 
 * 1. REGISTRO DE FACTURA DE COMPRA:
 *    - El gerente registra una factura de compra con artículos de stock
 *    - Sistema detecta qué artículos han cambiado de precio
 * 
 * 2. ACTUALIZACIÓN DE ARTÍCULOS DE STOCK:
 *    - Actualizar precio_compra en articulosStock[]
 *    - Crear entrada en historialPrecios[] del artículo
 *    - Timestamp: fecha de la factura
 *    - Referencia: id_factura
 * 
 * 3. RECÁLCULO DE ESCANDALLOS:
 *    - Buscar todos los productos que usan ese artículo
 *    - Recalcular el coste total del escandallo
 *    - Crear entrada en historialEscandallo[] del producto
 *    - Actualizar margen de beneficio
 * 
 * 4. ALERTAS AUTOMÁTICAS:
 *    - Si el margen cae por debajo del umbral (ej: 60%)
 *    - Notificar al gerente para revisar PVP
 *    - Sugerir acciones: subir precio, buscar proveedor alternativo
 */

export interface CambioHistorialPrecio {
  fecha: string; // ISO date
  precioAnterior: number;
  precioNuevo: number;
  proveedor: string;
  facturaId: string;
  cantidadComprada: number;
  motivoCambio?: string; // "Inflación", "Cambio proveedor", "Negociación", etc.
}

export interface CambioHistorialEscandallo {
  fecha: string; // ISO date
  costeAnterior: number;
  costeNuevo: number;
  articuloAfectado: string; // nombre del artículo que cambió
  articuloId: string;
  facturaId: string;
  impactoMargen: number; // diferencia en %
}

/**
 * Ejemplo de historial de precios para un artículo de stock
 */
export const historialPreciosHarina: CambioHistorialPrecio[] = [
  {
    fecha: '2025-06-15',
    precioAnterior: 2.80,
    precioNuevo: 2.90,
    proveedor: 'Harinas del Norte S.L.',
    facturaId: 'FC-2025-0234',
    cantidadComprada: 500, // kg
    motivoCambio: 'Inflación materias primas'
  },
  {
    fecha: '2025-08-22',
    precioAnterior: 2.90,
    precioNuevo: 3.00,
    proveedor: 'Harinas del Norte S.L.',
    facturaId: 'FC-2025-0654',
    cantidadComprada: 500,
    motivoCambio: 'Incremento costes transporte'
  },
  {
    fecha: '2025-11-24',
    precioAnterior: 3.00,
    precioNuevo: 3.00,
    proveedor: 'Harinas del Norte S.L.',
    facturaId: 'FC-2025-1142',
    cantidadComprada: 500,
    motivoCambio: 'Sin cambios'
  }
];

/**
 * Ejemplo de historial de escandallo para un producto
 */
export const historialEscandalloCroissant: CambioHistorialEscandallo[] = [
  {
    fecha: '2025-06-15',
    costeAnterior: 0.78,
    costeNuevo: 0.80,
    articuloAfectado: 'Harina de trigo T-45',
    articuloId: 'STK-001',
    facturaId: 'FC-2025-0234',
    impactoMargen: -0.8 // margen bajó 0.8%
  },
  {
    fecha: '2025-08-22',
    costeAnterior: 0.80,
    costeNuevo: 0.82,
    articuloAfectado: 'Levadura fresca',
    articuloId: 'STK-003',
    facturaId: 'FC-2025-0654',
    impactoMargen: -0.8
  },
  {
    fecha: '2025-09-08',
    costeAnterior: 0.82,
    costeNuevo: 0.83,
    articuloAfectado: 'Mantequilla francesa AOP',
    articuloId: 'STK-002',
    facturaId: 'FC-2025-0821',
    impactoMargen: -0.4
  },
  {
    fecha: '2025-10-15',
    costeAnterior: 0.83,
    costeNuevo: 0.84,
    articuloAfectado: 'Harina de trigo T-45',
    articuloId: 'STK-001',
    facturaId: 'FC-2025-0987',
    impactoMargen: -0.4
  },
  {
    fecha: '2025-11-24',
    costeAnterior: 0.84,
    costeNuevo: 0.85,
    articuloAfectado: 'Mantequilla francesa AOP',
    articuloId: 'STK-002',
    facturaId: 'FC-2025-1142',
    impactoMargen: -0.4
  }
];

/**
 * Función helper para calcular el escandallo de un producto
 * basándose en sus ingredientes
 */
export function calcularEscandallo(
  ingredientes: Array<{
    articuloId: string;
    cantidad: number; // en la unidad del artículo (g, ml, etc.)
    precioKg: number; // precio por kg/litro
  }>,
  costesIndirectos: {
    manoObra: number;
    energia: number;
    packaging: number;
  }
): number {
  const costeMateriasPrimas = ingredientes.reduce((total, ing) => {
    // Convertir cantidad a kg/litro
    const cantidadEnKg = ing.cantidad / 1000;
    return total + (cantidadEnKg * ing.precioKg);
  }, 0);

  const totalIndirectos = 
    costesIndirectos.manoObra + 
    costesIndirectos.energia + 
    costesIndirectos.packaging;

  return Number((costeMateriasPrimas + totalIndirectos).toFixed(2));
}

/**
 * Función para calcular el margen de beneficio
 */
export function calcularMargen(pvp: number, coste: number): number {
  if (pvp === 0) return 0;
  return Number((((pvp - coste) / pvp) * 100).toFixed(2));
}

/**
 * Función para detectar si el margen está por debajo del umbral
 */
export function necesitaRevisionPrecio(
  pvp: number, 
  coste: number, 
  margenMinimo: number = 60
): boolean {
  const margen = calcularMargen(pvp, coste);
  return margen < margenMinimo;
}
