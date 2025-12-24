/**
 * 🔄 SERVICIO DE SINCRONIZACIÓN BIDIRECCIONAL
 * Mantiene sincronizado el stock de ingredientes con productos fabricables
 * 
 * FLUJOS:
 * 1. Stock → Productos: Al recibir materiales, recalcular productos fabricables
 * 2. Productos → Stock: Al vender productos, descontar ingredientes según receta
 */

import type { Producto } from '../contexts/ProductosContext';
import type { ProductoPanaderia } from '../data/productos-panaderia';
import { recetaStockService } from './receta-stock.service';
import { toast } from 'sonner@2.0.3';

// ============================================
// TIPOS
// ============================================

export interface EventoCambioStock {
  tipo: 'ingrediente-actualizado' | 'recepcion-material' | 'venta-producto';
  ingredienteIds: string[];
  timestamp: string;
  origen: string;
}

export interface ResultadoSincronizacion {
  productosActualizados: string[];
  stockAnterior: Map<string, number>;
  stockNuevo: Map<string, number>;
  errores: string[];
}

// ============================================
// LISTENERS Y EVENTOS
// ============================================

type ListenerCallback = (evento: EventoCambioStock) => void;

class StockSyncManager {
  private listeners: ListenerCallback[] = [];
  private ultimaSincronizacion: string = new Date().toISOString();

  /**
   * Suscribirse a eventos de cambio de stock
   */
  subscribe(callback: ListenerCallback): () => void {
    this.listeners.push(callback);
    
    // Retornar función de cleanup
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emitir evento de cambio de stock
   */
  emit(evento: EventoCambioStock): void {
    this.ultimaSincronizacion = evento.timestamp;
    
    this.listeners.forEach(listener => {
      try {
        listener(evento);
      } catch (error) {
        console.error('❌ Error en listener de stock:', error);
      }
    });
  }

  /**
   * Obtener timestamp de última sincronización
   */
  getUltimaSincronizacion(): string {
    return this.ultimaSincronizacion;
  }
}

// Instancia singleton
const syncManager = new StockSyncManager();

// ============================================
// SINCRONIZACIÓN: STOCK → PRODUCTOS
// ============================================

/**
 * Recalcular stock de productos cuando cambian ingredientes
 */
export function sincronizarStockAProductos(
  productos: (Producto | ProductoPanaderia)[],
  ingredientesAfectados?: string[]
): ResultadoSincronizacion {
  const stockAnterior = new Map<string, number>();
  const stockNuevo = new Map<string, number>();
  const productosActualizados: string[] = [];
  const errores: string[] = [];

  try {
    // Filtrar productos afectados si se especifican ingredientes
    let productosAProcesar = productos;
    
    if (ingredientesAfectados && ingredientesAfectados.length > 0) {
      productosAProcesar = ingredientesAfectados.flatMap(ingredienteId =>
        recetaStockService.encontrarProductosQueUsanIngrediente(ingredienteId, productos)
      );
      
      // Eliminar duplicados
      productosAProcesar = Array.from(new Set(productosAProcesar));
    }

    // Recalcular stock producible para cada producto
    productosAProcesar.forEach(producto => {
      try {
        const productoConReceta = producto as ProductoPanaderia;
        
        // Solo productos manufacturados
        if (
          productoConReceta.tipoProducto !== 'manufacturado' || 
          !productoConReceta.receta
        ) {
          return;
        }

        // Guardar stock anterior
        stockAnterior.set(producto.id, producto.stock || 0);

        // Calcular nuevo stock producible
        const resultado = recetaStockService.calcularStockProducible(producto);
        
        // Actualizar stock (esto se hará en el contexto, aquí solo calculamos)
        stockNuevo.set(producto.id, resultado.stockProducible);
        
        // Si hay cambio, registrar
        if (stockAnterior.get(producto.id) !== resultado.stockProducible) {
          productosActualizados.push(producto.id);
          
          console.log(`🔄 Stock actualizado: ${producto.nombre}`, {
            anterior: stockAnterior.get(producto.id),
            nuevo: resultado.stockProducible,
            ingredientesCriticos: resultado.ingredientesCriticos.length
          });
        }
      } catch (error: any) {
        errores.push(`Error procesando ${producto.nombre}: ${error.message}`);
        console.error(`❌ Error sincronizando producto ${producto.id}:`, error);
      }
    });

  } catch (error: any) {
    errores.push(`Error general en sincronización: ${error.message}`);
    console.error('❌ Error en sincronizarStockAProductos:', error);
  }

  return {
    productosActualizados,
    stockAnterior,
    stockNuevo,
    errores
  };
}

/**
 * Notificar cambio en ingredientes y recalcular productos afectados
 */
export function notificarCambioIngredientes(
  ingredienteIds: string[],
  origen: string = 'Sistema'
): void {
  const evento: EventoCambioStock = {
    tipo: 'ingrediente-actualizado',
    ingredienteIds,
    timestamp: new Date().toISOString(),
    origen
  };

  syncManager.emit(evento);
  
  console.log('📢 Evento de cambio de stock emitido:', {
    ingredientes: ingredienteIds.length,
    origen,
    timestamp: evento.timestamp
  });
}

/**
 * Notificar recepción de materiales
 */
export function notificarRecepcionMaterial(
  ingredienteIds: string[],
  responsable: string
): void {
  const evento: EventoCambioStock = {
    tipo: 'recepcion-material',
    ingredienteIds,
    timestamp: new Date().toISOString(),
    origen: `Recepción por ${responsable}`
  };

  syncManager.emit(evento);
  
  // Toast informativo
  toast.success('📦 Stock de ingredientes actualizado', {
    description: `${ingredienteIds.length} ingrediente(s) recibido(s). Recalculando productos...`
  });
}

/**
 * Notificar venta de producto
 */
export function notificarVentaProducto(
  ingredienteIds: string[],
  numeroVenta: string
): void {
  const evento: EventoCambioStock = {
    tipo: 'venta-producto',
    ingredienteIds,
    timestamp: new Date().toISOString(),
    origen: `Venta ${numeroVenta}`
  };

  syncManager.emit(evento);
}

// ============================================
// ALERTAS AUTOMÁTICAS
// ============================================

/**
 * Generar alertas de stock crítico
 */
export interface AlertaStock {
  tipo: 'critico' | 'bajo' | 'advertencia';
  mensaje: string;
  ingredienteId?: string;
  productoId?: string;
  accionSugerida: string;
}

export function generarAlertasStock(
  productos: (Producto | ProductoPanaderia)[]
): AlertaStock[] {
  const alertas: AlertaStock[] = [];

  productos.forEach(producto => {
    const resultado = recetaStockService.calcularStockProducible(producto);
    
    // Alerta crítica: No se puede producir
    if (!resultado.puedeProducir && resultado.ingredientesCriticos.length > 0) {
      const ingredientesFaltantes = resultado.ingredientesCriticos
        .filter(ing => ing.porcentajeDisponible < 100)
        .map(ing => ing.ingredienteNombre);
      
      alertas.push({
        tipo: 'critico',
        mensaje: `❌ "${producto.nombre}" NO fabricable`,
        productoId: producto.id,
        accionSugerida: `Reponer: ${ingredientesFaltantes.join(', ')}`
      });
    }
    // Alerta baja: Menos de 10 unidades
    else if (resultado.stockProducible < 10 && resultado.stockProducible > 0) {
      const ingredienteCritico = resultado.ingredientesCriticos[0];
      
      alertas.push({
        tipo: 'bajo',
        mensaje: `⚠️ "${producto.nombre}" stock bajo (${resultado.stockProducible} uds)`,
        productoId: producto.id,
        ingredienteId: ingredienteCritico?.ingredienteId,
        accionSugerida: `Revisar ${ingredienteCritico?.ingredienteNombre || 'ingredientes'}`
      });
    }
  });

  return alertas;
}

/**
 * Mostrar alertas en UI (toast)
 */
export function mostrarAlertasStock(alertas: AlertaStock[]): void {
  const alertasCriticas = alertas.filter(a => a.tipo === 'critico');
  const alertasBajas = alertas.filter(a => a.tipo === 'bajo');

  if (alertasCriticas.length > 0) {
    toast.error('Stock Crítico', {
      description: `${alertasCriticas.length} producto(s) no fabricables. Revisa inventario.`,
      duration: 5000
    });
  }

  if (alertasBajas.length > 0 && alertasCriticas.length === 0) {
    toast.warning('Stock Bajo', {
      description: `${alertasBajas.length} producto(s) con stock bajo.`,
      duration: 4000
    });
  }
}

// ============================================
// ANÁLISIS Y REPORTES
// ============================================

/**
 * Generar reporte de sincronización
 */
export interface ReporteSincronizacion {
  timestamp: string;
  totalProductos: number;
  productosManufacturados: number;
  productosFabricables: number;
  productosNoFabricables: number;
  ingredientesCriticos: string[];
  alertas: AlertaStock[];
}

export function generarReporteSincronizacion(
  productos: (Producto | ProductoPanaderia)[]
): ReporteSincronizacion {
  const productosManufacturados = productos.filter(p => {
    const pc = p as ProductoPanaderia;
    return pc.tipoProducto === 'manufacturado' && pc.receta;
  });

  const resultados = productosManufacturados.map(p => 
    recetaStockService.calcularStockProducible(p)
  );

  const fabricables = resultados.filter(r => r.puedeProducir);
  const noFabricables = resultados.filter(r => !r.puedeProducir);

  // Ingredientes que bloquean productos
  const ingredientesCriticos = new Set<string>();
  noFabricables.forEach(resultado => {
    resultado.ingredientesCriticos
      .filter(ing => ing.porcentajeDisponible < 100)
      .forEach(ing => ingredientesCriticos.add(ing.ingredienteNombre));
  });

  const alertas = generarAlertasStock(productos);

  return {
    timestamp: new Date().toISOString(),
    totalProductos: productos.length,
    productosManufacturados: productosManufacturados.length,
    productosFabricables: fabricables.length,
    productosNoFabricables: noFabricables.length,
    ingredientesCriticos: Array.from(ingredientesCriticos),
    alertas
  };
}

// ============================================
// EXPORTAR
// ============================================

export const stockSyncService = {
  // Sincronización
  sincronizarStockAProductos,
  notificarCambioIngredientes,
  notificarRecepcionMaterial,
  notificarVentaProducto,
  
  // Alertas
  generarAlertasStock,
  mostrarAlertasStock,
  
  // Reportes
  generarReporteSincronizacion,
  
  // Manager
  subscribe: syncManager.subscribe.bind(syncManager),
  emit: syncManager.emit.bind(syncManager),
  getUltimaSincronizacion: syncManager.getUltimaSincronizacion.bind(syncManager)
};
