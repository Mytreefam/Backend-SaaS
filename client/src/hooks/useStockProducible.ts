/**
 * 🪝 HOOK: useStockProducible
 * Hook que calcula automáticamente el stock producible de productos
 * Se actualiza cuando cambia el stock de ingredientes
 */

import { useState, useEffect, useCallback } from 'react';
import type { Producto } from '../contexts/ProductosContext';
import type { ProductoPanaderia } from '../data/productos-panaderia';
import { 
  recetaStockService, 
  type ResultadoStockProducible 
} from '../services/receta-stock.service';
import { 
  stockSyncService,
  type EventoCambioStock 
} from '../services/stock-sync.service';

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useStockProducible(
  productos: (Producto | ProductoPanaderia)[]
) {
  const [stockProducible, setStockProducible] = useState<Map<string, ResultadoStockProducible>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string>(
    new Date().toISOString()
  );

  /**
   * Calcular stock producible de todos los productos
   */
  const calcularTodos = useCallback(() => {
    setLoading(true);
    
    try {
      const resultados = recetaStockService.calcularStockProducibleLote(productos);
      setStockProducible(resultados);
      setUltimaActualizacion(new Date().toISOString());
      
      console.log('✅ Stock producible calculado:', {
        productos: resultados.size,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error calculando stock producible:', error);
    } finally {
      setLoading(false);
    }
  }, [productos]);

  /**
   * Recalcular solo productos afectados por cambios en ingredientes
   */
  const recalcularAfectados = useCallback((ingredienteIds: string[]) => {
    const productosAfectados = ingredienteIds.flatMap(ingredienteId =>
      recetaStockService.encontrarProductosQueUsanIngrediente(ingredienteId, productos)
    );

    // Eliminar duplicados
    const productosUnicos = Array.from(new Set(productosAfectados));

    if (productosUnicos.length === 0) {
      return;
    }

    // Recalcular solo productos afectados
    const nuevosResultados = new Map(stockProducible);
    
    productosUnicos.forEach(producto => {
      const resultado = recetaStockService.calcularStockProducible(producto);
      nuevosResultados.set(producto.id, resultado);
    });

    setStockProducible(nuevosResultados);
    setUltimaActualizacion(new Date().toISOString());

    console.log(`🔄 Stock producible actualizado para ${productosUnicos.length} producto(s)`);
  }, [productos, stockProducible]);

  /**
   * Listener de eventos de cambio de stock
   */
  useEffect(() => {
    const handleCambioStock = (evento: EventoCambioStock) => {
      console.log('📢 Evento de stock recibido en hook:', evento.tipo);
      
      // Recalcular productos afectados
      recalcularAfectados(evento.ingredienteIds);
    };

    // Suscribirse a eventos
    const unsubscribe = stockSyncService.subscribe(handleCambioStock);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [recalcularAfectados]);

  /**
   * Calcular al montar y cuando cambian productos
   */
  useEffect(() => {
    calcularTodos();
  }, [calcularTodos]);

  /**
   * Obtener stock producible de un producto específico
   */
  const getStockProducible = useCallback((productoId: string): number => {
    const resultado = stockProducible.get(productoId);
    return resultado?.stockProducible ?? 0;
  }, [stockProducible]);

  /**
   * Verificar si un producto puede producirse
   */
  const puedeProducir = useCallback((productoId: string): boolean => {
    const resultado = stockProducible.get(productoId);
    return resultado?.puedeProducir ?? true;
  }, [stockProducible]);

  /**
   * Obtener ingredientes críticos de un producto
   */
  const getIngredientesCriticos = useCallback((productoId: string) => {
    const resultado = stockProducible.get(productoId);
    return resultado?.ingredientesCriticos ?? [];
  }, [stockProducible]);

  return {
    stockProducible,
    loading,
    ultimaActualizacion,
    getStockProducible,
    puedeProducir,
    getIngredientesCriticos,
    recalcular: calcularTodos,
    recalcularAfectados
  };
}

// ============================================
// HOOK PARA PRODUCTO INDIVIDUAL
// ============================================

export function useStockProducibleProducto(
  producto: Producto | ProductoPanaderia | null
) {
  const [resultado, setResultado] = useState<ResultadoStockProducible | null>(null);
  const [loading, setLoading] = useState(false);

  const calcular = useCallback(() => {
    if (!producto) {
      setResultado(null);
      return;
    }

    setLoading(true);
    try {
      const res = recetaStockService.calcularStockProducible(producto);
      setResultado(res);
    } catch (error) {
      console.error('❌ Error calculando stock producible:', error);
      setResultado(null);
    } finally {
      setLoading(false);
    }
  }, [producto]);

  useEffect(() => {
    calcular();
  }, [calcular]);

  // Listener de cambios de stock
  useEffect(() => {
    if (!producto) return;

    const handleCambioStock = (evento: EventoCambioStock) => {
      // Solo recalcular si este producto usa alguno de los ingredientes afectados
      const productoConReceta = producto as ProductoPanaderia;
      
      if (
        !productoConReceta.receta ||
        productoConReceta.tipoProducto !== 'manufacturado'
      ) {
        return;
      }

      const ingredientesProducto = productoConReceta.receta.map(ing => 
        recetaStockService.normalizarIdIngrediente(ing.ingredienteId)
      );

      const afectado = evento.ingredienteIds.some(id => 
        ingredientesProducto.includes(recetaStockService.normalizarIdIngrediente(id))
      );

      if (afectado) {
        calcular();
      }
    };

    const unsubscribe = stockSyncService.subscribe(handleCambioStock);
    return () => unsubscribe();
  }, [producto, calcular]);

  return {
    resultado,
    loading,
    stockProducible: resultado?.stockProducible ?? 0,
    puedeProducir: resultado?.puedeProducir ?? true,
    ingredientesCriticos: resultado?.ingredientesCriticos ?? [],
    recalcular: calcular
  };
}

// ============================================
// HOOK PARA VALIDACIÓN DE CANTIDAD
// ============================================

export function useValidacionStock(
  producto: Producto | ProductoPanaderia | null,
  cantidad: number = 1
) {
  const [validacion, setValidacion] = useState<{
    valida: boolean;
    mensaje?: string;
    ingredientesFaltantes: string[];
  }>({
    valida: true,
    ingredientesFaltantes: []
  });

  useEffect(() => {
    if (!producto) {
      setValidacion({ valida: true, ingredientesFaltantes: [] });
      return;
    }

    const resultado = recetaStockService.validarRecetaCompleta(producto, cantidad);
    
    if (!resultado.valida) {
      setValidacion({
        valida: false,
        mensaje: `Ingredientes insuficientes: ${resultado.ingredientesFaltantes.join(', ')}`,
        ingredientesFaltantes: resultado.ingredientesFaltantes
      });
    } else if (resultado.ingredientesBajos.length > 0) {
      setValidacion({
        valida: true,
        mensaje: `⚠️ Stock bajo: ${resultado.ingredientesBajos.join(', ')}`,
        ingredientesFaltantes: []
      });
    } else {
      setValidacion({
        valida: true,
        ingredientesFaltantes: []
      });
    }
  }, [producto, cantidad]);

  return validacion;
}
