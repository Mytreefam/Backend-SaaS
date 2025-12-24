/**
 * 🔄 SERVICIO DE INTEGRACIÓN STOCK
 * Conecta pedidos con inventario para descuento automático
 * 
 * ✨ MEJORADO: Ahora soporta descuento por recetas completas
 */

import { toast } from 'sonner@2.0.3';

import { stockManager } from '../data/stock-manager';
import type { Pedido, ItemPedido } from './pedidos.service';
import type { Producto } from '../types/producto.types';
import type { ProductoPanaderia, RecetaIngrediente } from '../data/productos-panaderia';
import { recetaStockService } from './receta-stock.service';
import { stockSyncService } from './stock-sync.service';

// ============================================
// TIPOS
// ============================================

export interface ResultadoValidacionStock {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

export interface ResultadoDescontar {
  exito: boolean;
  errores: string[];
  movimientosRegistrados: string[];
  ingredientesAfectados?: string[]; // ✨ NUEVO: Para sincronización
}

// ============================================
// MAPEO PRODUCTOS → STOCK (LEGACY - Mantener compatibilidad)
// ============================================

/**
 * Mapeo manual de productos a artículos de stock
 * ⚠️ LEGACY: Se mantiene para productos sin receta
 */
const MAPEO_PRODUCTOS_STOCK: Record<string, string> = {
  // Refrescos y bebidas (productos simples)
  'PROD-020': 'ING-010', // Coca Cola → Stock de Coca Cola
  'PROD-021': 'ING-011', // Fanta Naranja
  'PROD-022': 'ING-012', // Sprite
  'PROD-023': 'ING-013', // Nestea
  'PROD-024': 'ING-014', // Aquarius
  
  // Aguas
  'PROD-025': 'ING-015', // Agua Mineral
  'PROD-026': 'ING-016', // Agua con Gas
  
  // Zumos
  'PROD-027': 'ING-017', // Zumo de Naranja
  'PROD-028': 'ING-018', // Zumo de Manzana
  
  // Café (granos de café en stock)
  'PROD-029': 'ING-019', // Café Espresso
  'PROD-030': 'ING-019', // Café Americano (mismo grano)
  'PROD-031': 'ING-019', // Café con Leche (grano + leche)
  
  // Pan (harina en stock - productos manufacturados usarían recetas)
  // Por ahora simplificamos con mapeo directo
  'PROD-001': 'ING-001', // Pan Masa Madre → Harina
  'PROD-002': 'ING-001', // Baguette → Harina
  'PROD-003': 'ING-001', // Pan Integral → Harina
  
  // Bollería (harina + mantequilla - simplificado)
  'PROD-010': 'ING-001', // Croissant → Harina
  'PROD-011': 'ING-001', // Napolitana → Harina
};

/**
 * Obtener ID de artículo en stock para un producto (LEGACY)
 */
function obtenerArticuloStock(productoId: string): string | null {
  return MAPEO_PRODUCTOS_STOCK[productoId] || null;
}

/**
 * Obtener cantidad a descontar del stock (LEGACY)
 */
function obtenerCantidadADescontar(
  productoId: string, 
  cantidadVendida: number
): number {
  return cantidadVendida;
}

// ============================================
// ✨ NUEVAS FUNCIONES CON SOPORTE RECETAS
// ============================================

/**
 * ✨ NUEVO: Validar stock usando recetas completas
 */
export function validarStockConReceta(
  producto: Producto | ProductoPanaderia,
  cantidad: number = 1
): ResultadoValidacionStock {
  const errores: string[] = [];
  const advertencias: string[] = [];
  
  const productoConReceta = producto as ProductoPanaderia;
  
  // Si tiene receta definida, validar todos los ingredientes
  if (
    productoConReceta.tipoProducto === 'manufacturado' &&
    productoConReceta.receta &&
    productoConReceta.receta.length > 0
  ) {
    const validacion = recetaStockService.validarRecetaCompleta(producto, cantidad);
    
    return {
      valido: validacion.valida,
      errores: validacion.ingredientesFaltantes,
      advertencias: validacion.ingredientesBajos
    };
  }
  
  // Fallback: usar mapeo legacy
  const articuloStockId = obtenerArticuloStock(producto.id);
  
  if (!articuloStockId) {
    advertencias.push(`Producto "${producto.nombre}" sin control de stock`);
    return { valido: true, errores, advertencias };
  }
  
  const articulo = stockManager.getStock().get(articuloStockId);
  
  if (!articulo) {
    errores.push(`Artículo de stock no encontrado para "${producto.nombre}"`);
    return { valido: false, errores, advertencias };
  }
  
  const cantidadNecesaria = cantidad;
  
  if (articulo.stock < cantidadNecesaria) {
    errores.push(
      `Stock insuficiente de "${producto.nombre}". ` +
      `Disponible: ${articulo.stock} ${articulo.unidad}, ` +
      `Necesario: ${cantidadNecesaria} ${articulo.unidad}`
    );
  }
  
  if (articulo.stock < cantidadNecesaria * 2 && articulo.stock >= cantidadNecesaria) {
    advertencias.push(`Stock bajo de "${producto.nombre}" (${articulo.stock} ${articulo.unidad})`);
  }
  
  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}

/**
 * ✨ NUEVO: Descontar stock usando recetas completas
 * Descuenta TODOS los ingredientes de un producto manufacturado
 */
export function descontarStockPorReceta(
  producto: Producto | ProductoPanaderia,
  cantidad: number,
  pedidoNumero: string,
  pedidoId: string,
  usuario: string = 'Sistema',
  pdv: string = 'online'
): ResultadoDescontar {
  const errores: string[] = [];
  const movimientosRegistrados: string[] = [];
  const ingredientesAfectados: string[] = [];
  
  const productoConReceta = producto as ProductoPanaderia;
  
  // 1. Si tiene receta, usar receta
  if (
    productoConReceta.tipoProducto === 'manufacturado' &&
    productoConReceta.receta &&
    productoConReceta.receta.length > 0
  ) {
    console.log(`📋 Descontando por receta: ${producto.nombre} (${cantidad} uds)`);
    
    // Validar primero
    const validacion = recetaStockService.validarRecetaCompleta(producto, cantidad);
    
    if (!validacion.valida) {
      return {
        exito: false,
        errores: validacion.ingredientesFaltantes,
        movimientosRegistrados: [],
        ingredientesAfectados: []
      };
    }
    
    // Descontar cada ingrediente de la receta
    productoConReceta.receta.forEach((ingredienteReceta: RecetaIngrediente) => {
      const ingredienteId = recetaStockService.normalizarIdIngrediente(ingredienteReceta.ingredienteId);
      const ingrediente = stockManager.getStock().get(ingredienteId);
      
      if (!ingrediente) {
        errores.push(`Ingrediente no encontrado: ${ingredienteReceta.ingredienteNombre}`);
        return;
      }
      
      // Calcular cantidad a descontar
      const cantidadDescontar = -(ingredienteReceta.cantidad * cantidad);
      
      try {
        stockManager.registrarMovimiento({
          tipo: 'venta',
          articuloId: ingredienteId,
          articuloNombre: ingrediente.nombre,
          cantidad: cantidadDescontar,
          unidad: ingrediente.unidad,
          pdv,
          usuario,
          motivo: `Venta pedido ${pedidoNumero}`,
          referencia: pedidoId,
          observaciones: `${cantidad}x ${producto.nombre} (${ingredienteReceta.cantidad} ${ingrediente.unidad}/ud)`
        });
        
        movimientosRegistrados.push(
          `${ingrediente.nombre}: ${Math.abs(cantidadDescontar).toFixed(3)} ${ingrediente.unidad}`
        );
        
        ingredientesAfectados.push(ingredienteId);
        
        console.log(`  ✓ ${ingrediente.nombre}: -${Math.abs(cantidadDescontar).toFixed(3)} ${ingrediente.unidad}`);
        
      } catch (error: any) {
        errores.push(`Error al descontar ${ingredienteReceta.ingredienteNombre}: ${error.message}`);
        console.error(`❌ Error:`, error);
      }
    });
    
    // Notificar cambio de ingredientes
    if (ingredientesAfectados.length > 0) {
      stockSyncService.notificarVentaProducto(ingredientesAfectados, pedidoNumero);
    }
    
    return {
      exito: errores.length === 0,
      errores,
      movimientosRegistrados,
      ingredientesAfectados
    };
  }
  
  // 2. Fallback: usar mapeo legacy
  console.log(`📦 Descontando por mapeo legacy: ${producto.nombre}`);
  
  const articuloStockId = obtenerArticuloStock(producto.id);
  
  if (!articuloStockId) {
    // Sin control de stock
    return {
      exito: true,
      errores: [],
      movimientosRegistrados: [`${producto.nombre}: Sin control de stock`],
      ingredientesAfectados: []
    };
  }
  
  const articulo = stockManager.getStock().get(articuloStockId);
  
  if (!articulo) {
    return {
      exito: false,
      errores: [`Artículo de stock no encontrado para "${producto.nombre}"`],
      movimientosRegistrados: [],
      ingredientesAfectados: []
    };
  }
  
  const cantidadDescontar = -cantidad;
  
  try {
    stockManager.registrarMovimiento({
      tipo: 'venta',
      articuloId: articuloStockId,
      articuloNombre: articulo.nombre,
      cantidad: cantidadDescontar,
      unidad: articulo.unidad,
      pdv,
      usuario,
      motivo: `Venta pedido ${pedidoNumero}`,
      referencia: pedidoId,
      observaciones: `${cantidad}x ${producto.nombre}`
    });
    
    movimientosRegistrados.push(
      `${producto.nombre}: ${Math.abs(cantidadDescontar)} ${articulo.unidad}`
    );
    
    ingredientesAfectados.push(articuloStockId);
    
    // Notificar cambio
    stockSyncService.notificarVentaProducto([articuloStockId], pedidoNumero);
    
    console.log(`✅ Stock descontado (legacy): ${producto.nombre} (-${Math.abs(cantidadDescontar)} ${articulo.unidad})`);
    
  } catch (error: any) {
    return {
      exito: false,
      errores: [`Error al descontar "${producto.nombre}": ${error.message}`],
      movimientosRegistrados: [],
      ingredientesAfectados: []
    };
  }
  
  return {
    exito: true,
    errores: [],
    movimientosRegistrados,
    ingredientesAfectados
  };
}

// ============================================
// LEGACY: VALIDACIÓN Y DESCUENTO ORIGINAL
// (Mantener para compatibilidad)
// ============================================

/**
 * Validar si hay stock suficiente para un pedido (LEGACY)
 * ⚠️ Usar validarStockConReceta() para soporte completo
 */
export function validarStockDisponible(items: ItemPedido[]): ResultadoValidacionStock {
  const errores: string[] = [];
  const advertencias: string[] = [];
  
  if (!items || !Array.isArray(items)) {
    return { valido: true, errores: [], advertencias: ['No hay items para validar stock'] };
  }
  
  items.forEach(item => {
    const articuloStockId = obtenerArticuloStock(item.productoId);
    
    if (!articuloStockId) {
      advertencias.push(`Producto "${item.nombre}" sin control de stock`);
      return;
    }
    
    const articulo = stockManager.getStock().get(articuloStockId);
    
    if (!articulo) {
      errores.push(`Artículo de stock no encontrado para "${item.nombre}"`);
      return;
    }
    
    const cantidadNecesaria = obtenerCantidadADescontar(item.productoId, item.cantidad);
    
    if (articulo.stock < cantidadNecesaria) {
      errores.push(
        `Stock insuficiente de "${item.nombre}". ` +
        `Disponible: ${articulo.stock} ${articulo.unidad}, ` +
        `Necesario: ${cantidadNecesaria} ${articulo.unidad}`
      );
    }
    
    if (articulo.stock < cantidadNecesaria * 2 && articulo.stock >= cantidadNecesaria) {
      advertencias.push(`Stock bajo de "${item.nombre}" (${articulo.stock} ${articulo.unidad})`);
    }
  });
  
  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}

/**
 * Descontar stock por un pedido (LEGACY)
 * ⚠️ Usar descontarStockPorReceta() para soporte completo
 */
export function descontarStockPorPedido(
  pedido: Pedido,
  usuario: string = 'Sistema'
): ResultadoDescontar {
  const errores: string[] = [];
  const movimientosRegistrados: string[] = [];
  
  // Validar que el pedido tenga items
  if (!pedido || !pedido.items || !Array.isArray(pedido.items)) {
    return {
      exito: false,
      errores: ['Pedido sin items válidos'],
      movimientosRegistrados: []
    };
  }
  
  const validacion = validarStockDisponible(pedido.items);
  
  if (!validacion.valido) {
    return {
      exito: false,
      errores: validacion.errores,
      movimientosRegistrados: []
    };
  }
  
  pedido.items.forEach(item => {
    const articuloStockId = obtenerArticuloStock(item.productoId);
    
    if (!articuloStockId) {
      return;
    }
    
    const articulo = stockManager.getStock().get(articuloStockId);
    
    if (!articulo) {
      errores.push(`No se pudo encontrar artículo para "${item.nombre}"`);
      return;
    }
    
    const cantidadDescontar = -obtenerCantidadADescontar(item.productoId, item.cantidad);
    
    try {
      stockManager.registrarMovimiento({
        tipo: 'venta',
        articuloId: articuloStockId,
        articuloNombre: articulo.nombre,
        cantidad: cantidadDescontar,
        unidad: articulo.unidad,
        pdv: pedido.puntoVentaId || 'online',
        usuario,
        motivo: `Venta pedido ${pedido.numero}`,
        referencia: pedido.id,
        observaciones: `${item.cantidad}x ${item.nombre}`
      });
      
      movimientosRegistrados.push(
        `${item.nombre}: ${Math.abs(cantidadDescontar)} ${articulo.unidad}`
      );
      
      console.log(`✅ Stock descontado: ${item.nombre} (-${Math.abs(cantidadDescontar)} ${articulo.unidad})`);
      
    } catch (error: any) {
      errores.push(`Error al descontar "${item.nombre}": ${error.message}`);
      console.error(`❌ Error descontando stock:`, error);
    }
  });
  
  return {
    exito: errores.length === 0,
    errores,
    movimientosRegistrados
  };
}

/**
 * Revertir descuento de stock (cuando se cancela un pedido)
 */
export function revertirDescontar(
  pedido: Pedido,
  usuario: string = 'Sistema'
): ResultadoDescontar {
  const errores: string[] = [];
  const movimientosRegistrados: string[] = [];
  
  pedido.items.forEach(item => {
    const articuloStockId = obtenerArticuloStock(item.productoId);
    
    if (!articuloStockId) {
      return;
    }
    
    const articulo = stockManager.getStock().get(articuloStockId);
    
    if (!articulo) {
      errores.push(`No se pudo encontrar artículo para "${item.nombre}"`);
      return;
    }
    
    const cantidadDevolver = obtenerCantidadADescontar(item.productoId, item.cantidad);
    
    try {
      stockManager.registrarMovimiento({
        tipo: 'ajuste',
        articuloId: articuloStockId,
        articuloNombre: articulo.nombre,
        cantidad: cantidadDevolver,
        unidad: articulo.unidad,
        pdv: pedido.puntoVentaId || 'online',
        usuario,
        motivo: `Cancelación pedido ${pedido.numero}`,
        referencia: pedido.id,
        observaciones: `Devolución: ${item.cantidad}x ${item.nombre}`
      });
      
      movimientosRegistrados.push(
        `${item.nombre}: +${cantidadDevolver} ${articulo.unidad}`
      );
      
      console.log(`↩️ Stock devuelto: ${item.nombre} (+${cantidadDevolver} ${articulo.unidad})`);
      
    } catch (error: any) {
      errores.push(`Error al devolver "${item.nombre}": ${error.message}`);
    }
  });
  
  return {
    exito: errores.length === 0,
    errores,
    movimientosRegistrados
  };
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtener stock real de un producto (para mostrar al cliente)
 * ✨ MEJORADO: Calcula stock producible si tiene receta
 */
export function obtenerStockProducto(producto: Producto | ProductoPanaderia | string): number | null {
  // Si recibe string (ID), usar mapeo legacy
  if (typeof producto === 'string') {
    const articuloStockId = obtenerArticuloStock(producto);
    
    if (!articuloStockId) {
      return null;
    }
    
    const articulo = stockManager.getStock().get(articuloStockId);
    return articulo ? articulo.stock : null;
  }
  
  // Si es producto con receta, calcular stock producible
  const productoConReceta = producto as ProductoPanaderia;
  
  if (
    productoConReceta.tipoProducto === 'manufacturado' &&
    productoConReceta.receta &&
    productoConReceta.receta.length > 0
  ) {
    const resultado = recetaStockService.calcularStockProducible(producto);
    return resultado.stockProducible;
  }
  
  // Fallback: mapeo legacy
  const articuloStockId = obtenerArticuloStock(producto.id);
  
  if (!articuloStockId) {
    return null;
  }
  
  const articulo = stockManager.getStock().get(articuloStockId);
  return articulo ? articulo.stock : null;
}

/**
 * Verificar si un producto está disponible
 */
export function estaDisponible(productoId: string, cantidad: number = 1): boolean {
  const stock = obtenerStockProducto(productoId);
  
  if (stock === null) {
    return true;
  }
  
  return stock >= cantidad;
}

/**
 * Obtener mensaje de estado de stock
 */
export function obtenerMensajeStock(productoId: string): string {
  const stock = obtenerStockProducto(productoId);
  
  if (stock === null) {
    return 'Disponible';
  }
  
  if (stock === 0) {
    return 'Agotado';
  }
  
  if (stock < 5) {
    return `Últimas ${stock} unidades`;
  }
  
  if (stock < 10) {
    return 'Pocas unidades';
  }
  
  return 'Disponible';
}

// ============================================
// EXPORTAR
// ============================================

export const stockIntegrationService = {
  // ✨ NUEVAS FUNCIONES CON RECETAS
  validarStockConReceta,
  descontarStockPorReceta,
  
  // LEGACY (mantener compatibilidad)
  validarStockDisponible,
  descontarStockPorPedido,
  revertirDescontar,
  
  // HELPERS
  obtenerStockProducto,
  estaDisponible,
  obtenerMensajeStock
};