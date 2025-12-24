/**
 * 📦 TIPOS DE PRODUCTOS - UDAR EDGE
 * Define los tipos base para productos con vinculación a stock
 */

// ============================================
// TIPOS DE PRODUCTO
// ============================================

export type TipoProducto = 'simple' | 'manufacturado' | 'combo';

// ============================================
// PRODUCTO BASE
// ============================================

export interface ProductoBase {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion: string;
  destacado?: boolean;
  imagen?: string;
  activo?: boolean;
}

// ============================================
// PRODUCTO SIMPLE
// ============================================

/**
 * Producto simple: vendible directamente sin transformación
 * Ejemplos: Coca Cola, agua, producto pre-empaquetado
 */
export interface ProductoSimple extends ProductoBase {
  tipo: 'simple';
  
  /**
   * ID del artículo en el stock (stock-ingredientes.ts)
   * Permite vincular producto de venta con inventario
   */
  articuloStockId?: string;
  
  /**
   * Stock visual para el cliente (puede ser diferente al stock real)
   * Si no se especifica, se usa el stock real del artículo
   */
  stockDisponible?: number;
}

// ============================================
// PRODUCTO MANUFACTURADO
// ============================================

export interface IngredienteReceta {
  ingredienteId: string;  // ID del artículo en stock
  ingredienteNombre: string;
  cantidad: number;       // Cantidad necesaria
  unidad: 'kg' | 'litros' | 'unidades';
}

export interface Receta {
  ingredientes: IngredienteReceta[];
  tiempoPreparacion: number; // minutos
  rendimiento: number;        // cuántas unidades produce
  instrucciones?: string;
}

/**
 * Producto manufacturado: requiere transformación/elaboración
 * Ejemplos: Pizza, croissant, bocadillo
 */
export interface ProductoManufacturado extends ProductoBase {
  tipo: 'manufacturado';
  
  /**
   * Receta con ingredientes necesarios
   * Al vender, se descuentan los ingredientes del stock
   */
  receta: Receta;
  
  /**
   * Stock visual (unidades ya preparadas)
   */
  stockDisponible?: number;
}

// ============================================
// PRODUCTO COMBO
// ============================================

export interface ItemCombo {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  opciones?: string[]; // Opciones del combo (ej: tipo de café)
}

/**
 * Producto combo: agrupa varios productos
 * Ejemplos: Menú desayuno (café + croissant + zumo)
 */
export interface ProductoCombo extends ProductoBase {
  tipo: 'combo';
  
  /**
   * Productos incluidos en el combo
   */
  items: ItemCombo[];
  
  /**
   * Descuento aplicado (opcional)
   */
  descuento?: number;
  
  /**
   * Precio individual de los items (para comparación)
   */
  precioSinCombo?: number;
}

// ============================================
// TIPO UNIFICADO
// ============================================

export type Producto = ProductoSimple | ProductoManufacturado | ProductoCombo;

// ============================================
// HELPERS / UTILIDADES
// ============================================

/**
 * Verificar si un producto es simple
 */
export function esProductoSimple(producto: Producto): producto is ProductoSimple {
  return producto.tipo === 'simple';
}

/**
 * Verificar si un producto es manufacturado
 */
export function esProductoManufacturado(producto: Producto): producto is ProductoManufacturado {
  return producto.tipo === 'manufacturado';
}

/**
 * Verificar si un producto es combo
 */
export function esProductoCombo(producto: Producto): producto is ProductoCombo {
  return producto.tipo === 'combo';
}

/**
 * Obtener stock disponible de un producto
 */
export function obtenerStockDisponible(producto: Producto): number | null {
  if (esProductoSimple(producto) || esProductoManufacturado(producto)) {
    return producto.stockDisponible ?? null;
  }
  return null;
}

/**
 * Verificar si un producto tiene stock suficiente
 */
export function tieneStockSuficiente(producto: Producto, cantidadSolicitada: number): boolean {
  const stockDisponible = obtenerStockDisponible(producto);
  
  if (stockDisponible === null) {
    return true; // Si no tiene control de stock, permitir
  }
  
  return stockDisponible >= cantidadSolicitada;
}
