/**
 * 🧪 SERVICIO DE RECETAS Y STOCK PRODUCIBLE
 * Calcula cuántos productos se pueden fabricar con el stock disponible
 * Basado en las recetas definidas en cada producto
 */

import type { Producto } from '../contexts/ProductosContext';
import type { ProductoPanaderia, RecetaIngrediente } from '../data/productos-panaderia';
import { stockManager } from '../data/stock-manager';

// ============================================
// TIPOS
// ============================================

export interface ResultadoStockProducible {
  productoId: string;
  stockActual: number;
  stockProducible: number;
  ingredientesCriticos: IngredienteCritico[];
  puedeProducir: boolean;
}

export interface IngredienteCritico {
  ingredienteId: string;
  ingredienteNombre: string;
  stockActual: number;
  stockNecesario: number;
  unidad: string;
  porcentajeDisponible: number; // 0-100
}

export interface ValidacionReceta {
  valida: boolean;
  ingredientesFaltantes: string[];
  ingredientesBajos: string[];
  detalles: IngredienteCritico[];
}

// ============================================
// MAPEO AUTOMÁTICO DE IDs
// ============================================

/**
 * Mapeo de IDs de ingredientes entre sistemas
 * 
 * PROBLEMA: Tenemos 3 sistemas de IDs:
 * - ProductoPanaderia.receta → 'ING-001', 'ING-002'...
 * - StockContext.stock → 'SKU001', 'SKU002'...
 * - stockManager.ingredientes → 'ING-001', 'ING-002'...
 * 
 * SOLUCIÓN: Mapeo centralizado
 */
const MAPEO_IDS_INGREDIENTES: Record<string, string> = {
  // Harinas
  'ING-001': 'ING-001', // Harina de trigo → Ya coincide con stockManager
  'ING-002': 'ING-002', // Harina integral
  
  // Lácteos
  'ING-003': 'ING-003', // Leche
  'ING-004': 'ING-004', // Mantequilla
  'ING-005': 'ING-005', // Nata
  
  // Huevos
  'ING-006': 'ING-006', // Huevos
  
  // Azúcares
  'ING-007': 'ING-007', // Azúcar blanco
  'ING-008': 'ING-008', // Azúcar moreno
  
  // Aceites
  'ING-009': 'ING-009', // Aceite de girasol
  'ING-010': 'ING-010', // Aceite de oliva
  'ING-012': 'ING-012', // Aceite de oliva (alternativo)
  
  // Levaduras y fermentos
  'ING-015': 'ING-015', // Levadura fresca
  'ING-016': 'ING-016', // Levadura seca
  
  // Sal y especias
  'ING-030': 'ING-030', // Sal
  
  // Frutas
  'ING-020': 'ING-020', // Fresas
  'ING-021': 'ING-021', // Chocolate
  
  // Rellenos
  'ING-022': 'ING-022', // Crema pastelera
  'ING-023': 'ING-023', // Mermelada
};

/**
 * Obtener ID normalizado de ingrediente
 */
function normalizarIdIngrediente(ingredienteId: string): string {
  return MAPEO_IDS_INGREDIENTES[ingredienteId] || ingredienteId;
}

// ============================================
// CÁLCULO DE STOCK PRODUCIBLE
// ============================================

/**
 * Calcular cuántas unidades de un producto se pueden fabricar
 * con el stock actual de ingredientes
 */
export function calcularStockProducible(
  producto: Producto | ProductoPanaderia
): ResultadoStockProducible {
  const productoId = producto.id;
  const stockActual = producto.stock || 0;
  
  // Si no es manufacturado o no tiene receta, devolver stock actual
  const productoConReceta = producto as ProductoPanaderia;
  if (
    !productoConReceta.tipoProducto || 
    productoConReceta.tipoProducto !== 'manufacturado' || 
    !productoConReceta.receta ||
    productoConReceta.receta.length === 0
  ) {
    return {
      productoId,
      stockActual,
      stockProducible: stockActual,
      ingredientesCriticos: [],
      puedeProducir: true
    };
  }

  const receta = productoConReceta.receta;
  const ingredientesCriticos: IngredienteCritico[] = [];
  const stocksPosibles: number[] = [];

  // Para cada ingrediente de la receta
  receta.forEach((ingredienteReceta: RecetaIngrediente) => {
    const ingredienteId = normalizarIdIngrediente(ingredienteReceta.ingredienteId);
    
    // Obtener ingrediente del stock
    const ingrediente = stockManager.getStock().get(ingredienteId);
    
    if (!ingrediente) {
      // Ingrediente no encontrado en stock → 0 unidades producibles
      ingredientesCriticos.push({
        ingredienteId: ingredienteReceta.ingredienteId,
        ingredienteNombre: ingredienteReceta.ingredienteNombre,
        stockActual: 0,
        stockNecesario: ingredienteReceta.cantidad,
        unidad: 'unidad',
        porcentajeDisponible: 0
      });
      stocksPosibles.push(0);
      return;
    }

    // Calcular cuántas unidades puedo hacer con este ingrediente
    const stockDisponible = ingrediente.stock;
    const cantidadPorUnidad = ingredienteReceta.cantidad;
    const unidadesProducibles = Math.floor(stockDisponible / cantidadPorUnidad);
    
    stocksPosibles.push(unidadesProducibles);

    // Calcular porcentaje disponible
    const porcentaje = cantidadPorUnidad > 0 
      ? Math.min(100, (stockDisponible / cantidadPorUnidad) * 100)
      : 100;

    ingredientesCriticos.push({
      ingredienteId: ingrediente.id,
      ingredienteNombre: ingrediente.nombre,
      stockActual: stockDisponible,
      stockNecesario: cantidadPorUnidad,
      unidad: ingrediente.unidad,
      porcentajeDisponible: porcentaje
    });
  });

  // El stock producible es el MÍNIMO de todos los ingredientes (cuello de botella)
  const stockProducible = stocksPosibles.length > 0 
    ? Math.min(...stocksPosibles)
    : 0;

  return {
    productoId,
    stockActual,
    stockProducible,
    ingredientesCriticos: ingredientesCriticos.sort((a, b) => 
      a.porcentajeDisponible - b.porcentajeDisponible
    ),
    puedeProducir: stockProducible > 0
  };
}

/**
 * Calcular stock producible para múltiples productos
 */
export function calcularStockProducibleLote(
  productos: (Producto | ProductoPanaderia)[]
): Map<string, ResultadoStockProducible> {
  const resultados = new Map<string, ResultadoStockProducible>();
  
  productos.forEach(producto => {
    const resultado = calcularStockProducible(producto);
    resultados.set(producto.id, resultado);
  });
  
  return resultados;
}

// ============================================
// VALIDACIÓN DE RECETAS
// ============================================

/**
 * Validar si hay suficiente stock para producir una cantidad específica
 */
export function validarRecetaCompleta(
  producto: Producto | ProductoPanaderia,
  cantidad: number = 1
): ValidacionReceta {
  const productoConReceta = producto as ProductoPanaderia;
  
  // Productos sin receta siempre son válidos
  if (
    !productoConReceta.tipoProducto || 
    productoConReceta.tipoProducto !== 'manufacturado' || 
    !productoConReceta.receta
  ) {
    return {
      valida: true,
      ingredientesFaltantes: [],
      ingredientesBajos: [],
      detalles: []
    };
  }

  const receta = productoConReceta.receta;
  const ingredientesFaltantes: string[] = [];
  const ingredientesBajos: string[] = [];
  const detalles: IngredienteCritico[] = [];

  receta.forEach((ingredienteReceta: RecetaIngrediente) => {
    const ingredienteId = normalizarIdIngrediente(ingredienteReceta.ingredienteId);
    const ingrediente = stockManager.getStock().get(ingredienteId);
    
    const cantidadNecesaria = ingredienteReceta.cantidad * cantidad;
    
    if (!ingrediente) {
      ingredientesFaltantes.push(ingredienteReceta.ingredienteNombre);
      detalles.push({
        ingredienteId: ingredienteReceta.ingredienteId,
        ingredienteNombre: ingredienteReceta.ingredienteNombre,
        stockActual: 0,
        stockNecesario: cantidadNecesaria,
        unidad: 'unidad',
        porcentajeDisponible: 0
      });
      return;
    }

    const stockDisponible = ingrediente.stock;
    const porcentaje = (stockDisponible / cantidadNecesaria) * 100;

    // Ingrediente faltante
    if (stockDisponible < cantidadNecesaria) {
      ingredientesFaltantes.push(
        `${ingredienteReceta.ingredienteNombre} (necesario: ${cantidadNecesaria.toFixed(2)} ${ingrediente.unidad}, disponible: ${stockDisponible.toFixed(2)} ${ingrediente.unidad})`
      );
    }
    // Ingrediente bajo (menos del 20% extra)
    else if (stockDisponible < cantidadNecesaria * 1.2) {
      ingredientesBajos.push(
        `${ingredienteReceta.ingredienteNombre} (${stockDisponible.toFixed(2)} ${ingrediente.unidad} disponibles)`
      );
    }

    detalles.push({
      ingredienteId: ingrediente.id,
      ingredienteNombre: ingrediente.nombre,
      stockActual: stockDisponible,
      stockNecesario: cantidadNecesaria,
      unidad: ingrediente.unidad,
      porcentajeDisponible: porcentaje
    });
  });

  return {
    valida: ingredientesFaltantes.length === 0,
    ingredientesFaltantes,
    ingredientesBajos,
    detalles: detalles.sort((a, b) => a.porcentajeDisponible - b.porcentajeDisponible)
  };
}

// ============================================
// DETECCIÓN AUTOMÁTICA DE INGREDIENTES
// ============================================

/**
 * Extraer todos los ingredientes únicos de una lista de productos
 */
export function extraerIngredientesDeProductos(
  productos: (Producto | ProductoPanaderia)[]
): Set<string> {
  const ingredientes = new Set<string>();
  
  productos.forEach(producto => {
    const productoConReceta = producto as ProductoPanaderia;
    
    if (
      productoConReceta.tipoProducto === 'manufacturado' && 
      productoConReceta.receta
    ) {
      productoConReceta.receta.forEach((ingrediente: RecetaIngrediente) => {
        const idNormalizado = normalizarIdIngrediente(ingrediente.ingredienteId);
        ingredientes.add(idNormalizado);
      });
    }
  });
  
  return ingredientes;
}

/**
 * Encontrar productos que usan un ingrediente específico
 */
export function encontrarProductosQueUsanIngrediente(
  ingredienteId: string,
  productos: (Producto | ProductoPanaderia)[]
): (Producto | ProductoPanaderia)[] {
  const idNormalizado = normalizarIdIngrediente(ingredienteId);
  
  return productos.filter(producto => {
    const productoConReceta = producto as ProductoPanaderia;
    
    if (
      !productoConReceta.tipoProducto || 
      productoConReceta.tipoProducto !== 'manufacturado' || 
      !productoConReceta.receta
    ) {
      return false;
    }
    
    return productoConReceta.receta.some((ing: RecetaIngrediente) => 
      normalizarIdIngrediente(ing.ingredienteId) === idNormalizado
    );
  });
}

// ============================================
// PREDICCIÓN DE STOCK
// ============================================

/**
 * Predecir cuándo se agotará un ingrediente
 * basándose en consumo histórico
 */
export interface PrediccionAgotamiento {
  ingredienteId: string;
  ingredienteNombre: string;
  stockActual: number;
  consumoDiario: number; // Promedio
  diasRestantes: number;
  fechaAgotamientoEstimada: string;
  critico: boolean; // Menos de 3 días
}

export function predecirAgotamientoIngrediente(
  ingredienteId: string,
  consumoDiarioPromedio: number
): PrediccionAgotamiento | null {
  const idNormalizado = normalizarIdIngrediente(ingredienteId);
  const ingrediente = stockManager.getStock().get(idNormalizado);
  
  if (!ingrediente) {
    return null;
  }
  
  const stockActual = ingrediente.stock;
  const diasRestantes = consumoDiarioPromedio > 0 
    ? Math.floor(stockActual / consumoDiarioPromedio)
    : 999;
  
  const fechaAgotamiento = new Date();
  fechaAgotamiento.setDate(fechaAgotamiento.getDate() + diasRestantes);
  
  return {
    ingredienteId: ingrediente.id,
    ingredienteNombre: ingrediente.nombre,
    stockActual,
    consumoDiario: consumoDiarioPromedio,
    diasRestantes,
    fechaAgotamientoEstimada: fechaAgotamiento.toISOString().split('T')[0],
    critico: diasRestantes < 3
  };
}

// ============================================
// EXPORTAR
// ============================================

export const recetaStockService = {
  calcularStockProducible,
  calcularStockProducibleLote,
  validarRecetaCompleta,
  extraerIngredientesDeProductos,
  encontrarProductosQueUsanIngrediente,
  predecirAgotamientoIngrediente,
  normalizarIdIngrediente
};
