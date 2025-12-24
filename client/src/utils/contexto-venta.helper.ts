/**
 * 🏢 HELPER: CONTEXTO DE VENTA MULTIEMPRESA
 * 
 * Utilidades para facilitar la obtención del contexto
 * de empresa/marca/PDV en componentes de venta.
 */

import { EMPRESAS, MARCAS, PUNTOS_VENTA, Empresa, Marca, PuntoVenta } from '../constants/empresaConfig';

// ============================================================================
// TIPOS
// ============================================================================

export interface ContextoVenta {
  empresaId: string;
  empresaNombre: string;
  marcaId: string;
  marcaNombre: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
}

export interface DatosCompletosPDV {
  pdv: PuntoVenta;
  empresa: Empresa;
  marcasDisponibles: Marca[];
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Obtiene el contexto completo de venta desde un PDV y una marca
 * 
 * @param puntoVentaId - ID del punto de venta
 * @param marcaId - ID de la marca (opcional, usa primera disponible si no se provee)
 * @returns Contexto completo para crear pedido
 * 
 * @example
 * const contexto = obtenerContextoVenta('PDV-TIANA', 'MRC-001');
 * 
 * crearPedido({
 *   ...contexto,
 *   clienteId: 'CLI-001',
 *   // ... resto de campos
 * });
 */
export function obtenerContextoVenta(
  puntoVentaId: string,
  marcaId?: string
): ContextoVenta {
  const pdv = PUNTOS_VENTA[puntoVentaId];
  
  if (!pdv) {
    throw new Error(`Punto de venta no encontrado: ${puntoVentaId}`);
  }
  
  const empresa = EMPRESAS[pdv.empresaId];
  
  if (!empresa) {
    throw new Error(`Empresa no encontrada: ${pdv.empresaId}`);
  }
  
  // Si no se especifica marca, usar la primera disponible
  const marcaIdFinal = marcaId || pdv.marcasDisponibles[0];
  const marca = MARCAS[marcaIdFinal];
  
  if (!marca) {
    throw new Error(`Marca no encontrada: ${marcaIdFinal}`);
  }
  
  // Verificar que la marca esté disponible en el PDV
  if (!pdv.marcasDisponibles.includes(marcaIdFinal)) {
    console.warn(
      `⚠️ La marca ${marca.nombre} no está disponible en ${pdv.nombre}. ` +
      `Marcas disponibles: ${pdv.marcasDisponibles.map(id => MARCAS[id]?.nombre).join(', ')}`
    );
  }
  
  return {
    empresaId: empresa.id,
    empresaNombre: empresa.nombreFiscal,
    marcaId: marca.id,
    marcaNombre: marca.nombre,
    puntoVentaId: pdv.id,
    puntoVentaNombre: pdv.nombre,
  };
}

/**
 * Obtiene datos completos de un PDV incluyendo empresa y marcas
 * 
 * @param puntoVentaId - ID del punto de venta
 * @returns Datos completos del PDV
 * 
 * @example
 * const { pdv, empresa, marcasDisponibles } = obtenerDatosCompletosPDV('PDV-TIANA');
 * 
 * console.log(pdv.nombre);              // "Tiana"
 * console.log(empresa.nombreFiscal);     // "Disarmink S.L."
 * console.log(marcasDisponibles.length); // 2
 */
export function obtenerDatosCompletosPDV(puntoVentaId: string): DatosCompletosPDV {
  const pdv = PUNTOS_VENTA[puntoVentaId];
  
  if (!pdv) {
    throw new Error(`Punto de venta no encontrado: ${puntoVentaId}`);
  }
  
  const empresa = EMPRESAS[pdv.empresaId];
  
  if (!empresa) {
    throw new Error(`Empresa no encontrada para PDV: ${puntoVentaId}`);
  }
  
  const marcasDisponibles = pdv.marcasDisponibles
    .map(id => MARCAS[id])
    .filter(Boolean);
  
  return {
    pdv,
    empresa,
    marcasDisponibles,
  };
}

/**
 * Verifica si una marca está disponible en un PDV
 * 
 * @param puntoVentaId - ID del punto de venta
 * @param marcaId - ID de la marca
 * @returns true si la marca está disponible
 * 
 * @example
 * if (marcaDisponibleEnPDV('PDV-TIANA', 'MRC-001')) {
 *   // Permitir selección
 * }
 */
export function marcaDisponibleEnPDV(
  puntoVentaId: string,
  marcaId: string
): boolean {
  const pdv = PUNTOS_VENTA[puntoVentaId];
  return pdv ? pdv.marcasDisponibles.includes(marcaId) : false;
}

/**
 * Obtiene el primer PDV disponible (útil para valores por defecto)
 * 
 * @returns ID del primer PDV activo
 * 
 * @example
 * const [pdvSeleccionado, setPdvSeleccionado] = useState(obtenerPrimerPDV());
 */
export function obtenerPrimerPDV(): string {
  const primerPDV = Object.values(PUNTOS_VENTA).find(pdv => pdv.activo);
  
  if (!primerPDV) {
    throw new Error('No hay puntos de venta disponibles');
  }
  
  return primerPDV.id;
}

/**
 * Obtiene todos los PDVs de una empresa específica
 * 
 * @param empresaId - ID de la empresa
 * @returns Array de IDs de PDVs
 * 
 * @example
 * const pdvsDisarmink = obtenerPDVsPorEmpresa('EMP-001');
 */
export function obtenerPDVsPorEmpresa(empresaId: string): string[] {
  const empresa = EMPRESAS[empresaId];
  
  if (!empresa) {
    throw new Error(`Empresa no encontrada: ${empresaId}`);
  }
  
  return empresa.puntosVentaIds.filter(id => PUNTOS_VENTA[id]?.activo);
}

/**
 * Valida que un contexto de venta sea válido
 * 
 * @param contexto - Contexto a validar
 * @returns true si es válido, lanza error si no
 * 
 * @example
 * try {
 *   validarContextoVenta(contexto);
 *   // Proceder con creación de pedido
 * } catch (error) {
 *   alert(error.message);
 * }
 */
export function validarContextoVenta(contexto: ContextoVenta): boolean {
  // Validar empresa
  const empresa = EMPRESAS[contexto.empresaId];
  if (!empresa) {
    throw new Error(`Empresa inválida: ${contexto.empresaId}`);
  }
  
  if (!empresa.activo) {
    throw new Error(`La empresa ${empresa.nombreFiscal} no está activa`);
  }
  
  // Validar marca
  const marca = MARCAS[contexto.marcaId];
  if (!marca) {
    throw new Error(`Marca inválida: ${contexto.marcaId}`);
  }
  
  // Validar PDV
  const pdv = PUNTOS_VENTA[contexto.puntoVentaId];
  if (!pdv) {
    throw new Error(`Punto de venta inválido: ${contexto.puntoVentaId}`);
  }
  
  if (!pdv.activo) {
    throw new Error(`El punto de venta ${pdv.nombre} no está activo`);
  }
  
  // Validar relaciones
  if (pdv.empresaId !== contexto.empresaId) {
    throw new Error(
      `El PDV ${pdv.nombre} no pertenece a la empresa ${empresa.nombreFiscal}`
    );
  }
  
  if (!pdv.marcasDisponibles.includes(contexto.marcaId)) {
    throw new Error(
      `La marca ${marca.nombre} no está disponible en ${pdv.nombre}`
    );
  }
  
  return true;
}

/**
 * Formatea el contexto para mostrar en UI
 * 
 * @param contexto - Contexto de venta
 * @returns String formateado para mostrar
 * 
 * @example
 * const texto = formatearContextoVenta(contexto);
 * // "Disarmink S.L. › Modomio › Tiana"
 */
export function formatearContextoVenta(contexto: ContextoVenta): string {
  return `${contexto.empresaNombre} › ${contexto.marcaNombre} › ${contexto.puntoVentaNombre}`;
}

/**
 * Hook helper para React (usar en componentes)
 * 
 * @example
 * function MiComponente() {
 *   const contextoVenta = useContextoVenta('PDV-TIANA', 'MRC-001');
 *   
 *   return <div>{contextoVenta.puntoVentaNombre}</div>;
 * }
 */
export function useContextoVentaHelper(
  puntoVentaId: string,
  marcaId?: string
): ContextoVenta {
  try {
    return obtenerContextoVenta(puntoVentaId, marcaId);
  } catch (error) {
    console.error('Error obteniendo contexto de venta:', error);
    // Retornar contexto por defecto en caso de error
    return obtenerContextoVenta(obtenerPrimerPDV());
  }
}

// ============================================================================
// HELPERS DE CONVERSIÓN (para migración)
// ============================================================================

/**
 * Convierte un pedido antiguo (sin contexto) a nuevo formato
 * 
 * @param pedidoAntiguo - Pedido sin campos de multiempresa
 * @param puntoVentaId - PDV a asignar (opcional, usa primer PDV si no se provee)
 * @param marcaId - Marca a asignar (opcional, usa primera marca del PDV)
 * @returns Pedido con contexto completo
 */
export function migrarPedidoANuevoFormato(
  pedidoAntiguo: any,
  puntoVentaId?: string,
  marcaId?: string
): any {
  // Si ya tiene contexto, devolverlo tal cual
  if (pedidoAntiguo.empresaId) {
    return pedidoAntiguo;
  }
  
  // Determinar PDV
  const pdvId = puntoVentaId || pedidoAntiguo.puntoVentaId || obtenerPrimerPDV();
  
  // Obtener contexto
  const contexto = obtenerContextoVenta(pdvId, marcaId);
  
  // Retornar pedido migrado
  return {
    ...pedidoAntiguo,
    ...contexto,
  };
}

/**
 * Migra todos los pedidos en localStorage
 * 
 * ⚠️ USAR CON PRECAUCIÓN - Modifica localStorage
 * 
 * @returns Número de pedidos migrados
 */
export function migrarTodosPedidosEnLocalStorage(): number {
  const pedidos = JSON.parse(localStorage.getItem('udar-pedidos') || '[]');
  
  const pedidosMigrados = pedidos.map((pedido: any) => 
    migrarPedidoANuevoFormato(pedido)
  );
  
  localStorage.setItem('udar-pedidos', JSON.stringify(pedidosMigrados));
  
  console.log(`✅ Migrados ${pedidosMigrados.length} pedidos a nuevo formato`);
  
  return pedidosMigrados.length;
}
