/**
 * SERVICIO: Cálculos Financieros
 * Funciones auxiliares para cálculos de costes, márgenes y rentabilidad
 */

/**
 * Calcular margen bruto
 */
export function calcularMargenBruto(
  precio_venta: number,
  coste: number
): { margen: number; porcentaje: number } {
  const margen = precio_venta - coste;
  const porcentaje = precio_venta > 0 ? (margen / precio_venta) * 100 : 0;

  return {
    margen: parseFloat(margen.toFixed(2)),
    porcentaje: parseFloat(porcentaje.toFixed(2))
  };
}

/**
 * Calcular coste de un producto manufacturado desde escandallo
 */
export function calcularCosteDesdeEscandallo(
  ingredientes: Array<{ precio_kg: number; cantidad_kg: number }>,
  envases: Array<{ precio_unidad: number; cantidad: number }>
): number {
  const costeIngredientes = ingredientes.reduce(
    (sum, ing) => sum + ing.precio_kg * ing.cantidad_kg,
    0
  );

  const costeEnvases = envases.reduce(
    (sum, env) => sum + env.precio_unidad * env.cantidad,
    0
  );

  return parseFloat((costeIngredientes + costeEnvases).toFixed(2));
}

/**
 * Calcular ticket medio
 */
export function calcularTicketMedio(
  total_ventas: number,
  numero_pedidos: number
): number {
  if (numero_pedidos === 0) return 0;
  return parseFloat((total_ventas / numero_pedidos).toFixed(2));
}

/**
 * Calcular variación porcentual entre dos periodos
 */
export function calcularVariacion(
  valor_actual: number,
  valor_anterior: number
): number {
  if (valor_anterior === 0) return valor_actual > 0 ? 100 : 0;
  return parseFloat((((valor_actual - valor_anterior) / valor_anterior) * 100).toFixed(2));
}

/**
 * Calcular ROI (Return on Investment)
 */
export function calcularROI(
  ganancia: number,
  inversion: number
): number {
  if (inversion === 0) return 0;
  return parseFloat(((ganancia / inversion) * 100).toFixed(2));
}

/**
 * Calcular EBITDA simplificado
 */
export function calcularEBITDA(
  ingresos: number,
  costes_variables: number,
  costes_fijos: number,
  depreciacion: number = 0,
  amortizacion: number = 0
): number {
  const ebitda = ingresos - costes_variables - costes_fijos + depreciacion + amortizacion;
  return parseFloat(ebitda.toFixed(2));
}

/**
 * Calcular punto de equilibrio (break-even)
 */
export function calcularPuntoEquilibrio(
  costes_fijos: number,
  precio_venta_unitario: number,
  coste_variable_unitario: number
): number {
  const margen_contribucion = precio_venta_unitario - coste_variable_unitario;
  if (margen_contribucion <= 0) return Infinity;
  
  return Math.ceil(costes_fijos / margen_contribucion);
}

/**
 * Calcular flujo de caja (cash flow)
 */
export function calcularFlujoCaja(
  ingresos_efectivo: number,
  gastos_efectivo: number,
  saldo_inicial: number
): { flujo_neto: number; saldo_final: number } {
  const flujo_neto = ingresos_efectivo - gastos_efectivo;
  const saldo_final = saldo_inicial + flujo_neto;

  return {
    flujo_neto: parseFloat(flujo_neto.toFixed(2)),
    saldo_final: parseFloat(saldo_final.toFixed(2))
  };
}

export default {
  calcularMargenBruto,
  calcularCosteDesdeEscandallo,
  calcularTicketMedio,
  calcularVariacion,
  calcularROI,
  calcularEBITDA,
  calcularPuntoEquilibrio,
  calcularFlujoCaja
};
