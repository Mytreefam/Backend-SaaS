// Servicio de Cálculo de Coste de Ventas - Sistema Udar Edge
// Calcula el coste real de productos vendidos para EBITDA

import { productosPanaderia, type ProductoPanaderia } from '../data/productos-panaderia';
import { buscarIngrediente } from '../data/stock-ingredientes';
import type { Pedido, ItemPedido } from './pedidos.service';

// ============================================
// INTERFACES
// ============================================

export interface DetalleCosteItem {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioVenta: number;
  precioCoste: number;
  costeTotal: number;
  margenBruto: number;
  margenPorcentaje: number;
  tipoProducto?: 'simple' | 'manufacturado' | 'combo';
}

export interface ResumenCosteVenta {
  // Totales
  totalVenta: number;
  totalCoste: number;
  margenBruto: number;
  margenPorcentaje: number;
  
  // Desglose por items
  items: DetalleCosteItem[];
  
  // Metadatos
  numeroItems: number;
  pedidoId: string;
  fecha: string;
}

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

/**
 * Buscar producto por ID
 */
export const buscarProducto = (productoId: string): ProductoPanaderia | undefined => {
  return productosPanaderia.find(p => p.id === productoId);
};

// ============================================
// CÁLCULO DE COSTES
// ============================================

/**
 * Calcular coste de un producto individual
 * 
 * @param producto - Producto a calcular
 * @returns Coste unitario del producto
 */
export const calcularCosteProducto = (producto: ProductoPanaderia): number => {
  // Si ya tiene precioCoste definido, usarlo directamente
  if (producto.precioCoste && producto.precioCoste > 0) {
    return producto.precioCoste;
  }
  
  // Si tiene receta, calcular coste de ingredientes
  if (producto.receta && producto.receta.length > 0) {
    const costeReceta = producto.receta.reduce((total, ingrediente) => {
      return total + (ingrediente.cantidad * ingrediente.coste);
    }, 0);
    return Number(costeReceta.toFixed(2));
  }
  
  // Si no tiene ni coste ni receta, estimar (40% del precio de venta)
  console.warn(`Producto ${producto.id} sin coste definido. Usando estimación.`);
  return Number((producto.precio * 0.40).toFixed(2));
};

/**
 * Calcular coste de un item del pedido
 * 
 * @param item - Item del pedido
 * @returns Detalle del coste del item
 */
export const calcularCosteItem = (item: ItemPedido): DetalleCosteItem => {
  const producto = buscarProducto(item.productoId);
  
  if (!producto) {
    console.error(`Producto no encontrado: ${item.productoId}`);
    
    // Retornar estimación conservadora
    const costeEstimado = item.precio * 0.50; // 50% del precio de venta
    const costeTotal = costeEstimado * item.cantidad;
    
    return {
      productoId: item.productoId,
      productoNombre: item.nombre || 'Producto desconocido',
      cantidad: item.cantidad,
      precioVenta: item.precio,
      precioCoste: costeEstimado,
      costeTotal: Number(costeTotal.toFixed(2)),
      margenBruto: (item.precio - costeEstimado) * item.cantidad,
      margenPorcentaje: 50.0
    };
  }
  
  // Calcular coste unitario
  const costeUnitario = calcularCosteProducto(producto);
  const costeTotal = costeUnitario * item.cantidad;
  
  // Calcular márgenes
  const margenUnitario = item.precio - costeUnitario;
  const margenBruto = margenUnitario * item.cantidad;
  const margenPorcentaje = (margenUnitario / item.precio) * 100;
  
  return {
    productoId: producto.id,
    productoNombre: producto.nombre,
    cantidad: item.cantidad,
    precioVenta: item.precio,
    precioCoste: costeUnitario,
    costeTotal: Number(costeTotal.toFixed(2)),
    margenBruto: Number(margenBruto.toFixed(2)),
    margenPorcentaje: Number(margenPorcentaje.toFixed(1)),
    tipoProducto: producto.tipoProducto
  };
};

/**
 * Calcular coste total de una venta/pedido
 * 
 * @param pedido - Pedido completo
 * @returns Resumen detallado del coste de la venta
 */
export const calcularCosteVenta = (pedido: Pedido): ResumenCosteVenta => {
  // Calcular coste de cada item
  const itemsConCoste = pedido.items.map(item => calcularCosteItem(item));
  
  // Sumar totales
  const totalVenta = pedido.total;
  const totalCoste = itemsConCoste.reduce((sum, item) => sum + item.costeTotal, 0);
  const margenBruto = totalVenta - totalCoste;
  const margenPorcentaje = totalVenta > 0 ? (margenBruto / totalVenta) * 100 : 0;
  
  return {
    totalVenta: Number(totalVenta.toFixed(2)),
    totalCoste: Number(totalCoste.toFixed(2)),
    margenBruto: Number(margenBruto.toFixed(2)),
    margenPorcentaje: Number(margenPorcentaje.toFixed(1)),
    items: itemsConCoste,
    numeroItems: itemsConCoste.length,
    pedidoId: pedido.id,
    fecha: pedido.fecha
  };
};

/**
 * Calcular coste de múltiples ventas
 * 
 * @param pedidos - Array de pedidos
 * @returns Totales consolidados
 */
export const calcularCosteVentas = (pedidos: Pedido[]): {
  totalVentas: number;
  totalCostes: number;
  margenBruto: number;
  margenPorcentaje: number;
  numeroPedidos: number;
  numeroItems: number;
} => {
  const resumenes = pedidos.map(pedido => calcularCosteVenta(pedido));
  
  const totalVentas = resumenes.reduce((sum, r) => sum + r.totalVenta, 0);
  const totalCostes = resumenes.reduce((sum, r) => sum + r.totalCoste, 0);
  const margenBruto = totalVentas - totalCostes;
  const margenPorcentaje = totalVentas > 0 ? (margenBruto / totalVentas) * 100 : 0;
  const numeroItems = resumenes.reduce((sum, r) => sum + r.numeroItems, 0);
  
  return {
    totalVentas: Number(totalVentas.toFixed(2)),
    totalCostes: Number(totalCostes.toFixed(2)),
    margenBruto: Number(margenBruto.toFixed(2)),
    margenPorcentaje: Number(margenPorcentaje.toFixed(1)),
    numeroPedidos: pedidos.length,
    numeroItems
  };
};

// ============================================
// ANÁLISIS Y REPORTES
// ============================================

/**
 * Obtener productos con margen bajo
 * 
 * @param umbral - Porcentaje mínimo de margen (default: 50%)
 * @returns Productos con margen por debajo del umbral
 */
export const obtenerProductosBajoMargen = (umbral: number = 50): ProductoPanaderia[] => {
  return productosPanaderia.filter(producto => {
    const coste = calcularCosteProducto(producto);
    const margen = ((producto.precio - coste) / producto.precio) * 100;
    return margen < umbral;
  });
};

/**
 * Obtener productos con mayor margen
 * 
 * @param limite - Número de productos a retornar (default: 10)
 * @returns Top productos por margen
 */
export const obtenerTopProductosMejorMargen = (limite: number = 10): Array<{
  producto: ProductoPanaderia;
  coste: number;
  margen: number;
  margenPorcentaje: number;
}> => {
  const productosConMargen = productosPanaderia.map(producto => {
    const coste = calcularCosteProducto(producto);
    const margen = producto.precio - coste;
    const margenPorcentaje = (margen / producto.precio) * 100;
    
    return {
      producto,
      coste,
      margen,
      margenPorcentaje
    };
  });
  
  return productosConMargen
    .sort((a, b) => b.margenPorcentaje - a.margenPorcentaje)
    .slice(0, limite);
};

/**
 * Calcular coste promedio por categoría
 */
export const obtenerCostePromedioPorCategoria = (): Record<string, {
  numeroProductos: number;
  costePromedio: number;
  precioPromedio: number;
  margenPromedio: number;
}> => {
  const categorias: Record<string, {
    numeroProductos: number;
    costeTotal: number;
    precioTotal: number;
    margenTotal: number;
  }> = {};
  
  productosPanaderia.forEach(producto => {
    if (!categorias[producto.categoria]) {
      categorias[producto.categoria] = {
        numeroProductos: 0,
        costeTotal: 0,
        precioTotal: 0,
        margenTotal: 0
      };
    }
    
    const coste = calcularCosteProducto(producto);
    const margen = ((producto.precio - coste) / producto.precio) * 100;
    
    categorias[producto.categoria].numeroProductos++;
    categorias[producto.categoria].costeTotal += coste;
    categorias[producto.categoria].precioTotal += producto.precio;
    categorias[producto.categoria].margenTotal += margen;
  });
  
  // Calcular promedios
  const resultado: Record<string, any> = {};
  
  Object.entries(categorias).forEach(([categoria, datos]) => {
    resultado[categoria] = {
      numeroProductos: datos.numeroProductos,
      costePromedio: Number((datos.costeTotal / datos.numeroProductos).toFixed(2)),
      precioPromedio: Number((datos.precioTotal / datos.numeroProductos).toFixed(2)),
      margenPromedio: Number((datos.margenTotal / datos.numeroProductos).toFixed(1))
    };
  });
  
  return resultado;
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  calcularCosteProducto,
  calcularCosteItem,
  calcularCosteVenta,
  calcularCosteVentas,
  buscarProducto,
  obtenerProductosBajoMargen,
  obtenerTopProductosMejorMargen,
  obtenerCostePromedioPorCategoria
};
