import { useMemo } from 'react';

/**
 * Hook personalizado para cálculos comunes optimizados
 * Proporciona funciones de utilidad memoizadas para todos los componentes
 */

// ============================================
// TIPOS DE UTILIDAD
// ============================================

export interface CalculosBasicos {
  total: number;
  suma: number;
  promedio: number;
  maximo: number;
  minimo: number;
}

export interface CalculosPorcentaje {
  porcentaje: number;
  crecimiento: number;
  decrecimiento: number;
}

export interface CalculosFinancieros {
  margen: number;
  margenPorcentaje: number;
  rentabilidad: number;
  roi: number;
}

// ============================================
// FUNCIONES DE CÁLCULO PURAS
// ============================================

/**
 * Calcula estadísticas básicas de un array de números
 */
export const calcularEstadisticasBasicas = (valores: number[]): CalculosBasicos => {
  if (valores.length === 0) {
    return { total: 0, suma: 0, promedio: 0, maximo: 0, minimo: 0 };
  }

  const suma = valores.reduce((acc, val) => acc + val, 0);
  
  return {
    total: valores.length,
    suma,
    promedio: suma / valores.length,
    maximo: Math.max(...valores),
    minimo: Math.min(...valores)
  };
};

/**
 * Calcula porcentajes de forma segura (evita división por cero)
 */
export const calcularPorcentaje = (parte: number, total: number): number => {
  return total > 0 ? (parte / total) * 100 : 0;
};

/**
 * Calcula el crecimiento porcentual entre dos valores
 */
export const calcularCrecimiento = (valorActual: number, valorAnterior: number): number => {
  if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
  return ((valorActual - valorAnterior) / valorAnterior) * 100;
};

/**
 * Calcula el margen: (PVP - Costo) / PVP × 100
 */
export const calcularMargen = (pvp: number, costo: number): number => {
  return pvp > 0 ? ((pvp - costo) / pvp) * 100 : 0;
};

/**
 * Calcula la rentabilidad: (Ingresos - Gastos) / Gastos × 100
 */
export const calcularRentabilidad = (ingresos: number, gastos: number): number => {
  return gastos > 0 ? ((ingresos - gastos) / gastos) * 100 : 0;
};

/**
 * Calcula el ROI: (Beneficio - Inversión) / Inversión × 100
 */
export const calcularROI = (beneficio: number, inversion: number): number => {
  return inversion > 0 ? ((beneficio - inversion) / inversion) * 100 : 0;
};

/**
 * Agrupa datos por una propiedad y suma valores
 */
export const agruparPorPropiedad = <T>(
  datos: T[],
  propertyKey: keyof T,
  valueKey: keyof T
): Record<string, number> => {
  return datos.reduce((acc, item) => {
    const key = String(item[propertyKey]);
    const value = Number(item[valueKey]) || 0;
    acc[key] = (acc[key] || 0) + value;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Calcula promedios ponderados
 */
export const calcularPromedioPonderado = (
  valores: number[],
  pesos: number[]
): number => {
  if (valores.length !== pesos.length || valores.length === 0) return 0;
  
  const sumaPonderada = valores.reduce((acc, val, idx) => acc + val * pesos[idx], 0);
  const sumaPesos = pesos.reduce((acc, peso) => acc + peso, 0);
  
  return sumaPesos > 0 ? sumaPonderada / sumaPesos : 0;
};

/**
 * Filtra y cuenta elementos por condición
 */
export const contarPorCondicion = <T>(
  datos: T[],
  condicion: (item: T) => boolean
): number => {
  return datos.filter(condicion).length;
};

/**
 * Calcula ticket medio: Total / Número de transacciones
 */
export const calcularTicketMedio = (totalVentas: number, numeroTransacciones: number): number => {
  return numeroTransacciones > 0 ? totalVentas / numeroTransacciones : 0;
};

/**
 * Calcula días entre dos fechas
 */
export const calcularDiasEntreFechas = (fecha1: Date | string, fecha2: Date | string): number => {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);
  const diferencia = Math.abs(f2.getTime() - f1.getTime());
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

/**
 * Calcula el percentil de un array de números
 */
export const calcularPercentil = (valores: number[], percentil: number): number => {
  if (valores.length === 0) return 0;
  
  const sorted = [...valores].sort((a, b) => a - b);
  const index = (percentil / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) return sorted[lower];
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
};

/**
 * Calcula desviación estándar
 */
export const calcularDesviacionEstandar = (valores: number[]): number => {
  if (valores.length === 0) return 0;
  
  const promedio = valores.reduce((acc, val) => acc + val, 0) / valores.length;
  const varianza = valores.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) / valores.length;
  
  return Math.sqrt(varianza);
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook personalizado que proporciona funciones de cálculo memoizadas
 */
export const useCalculos = () => {
  return useMemo(() => ({
    // Funciones básicas
    calcularEstadisticasBasicas,
    calcularPorcentaje,
    calcularCrecimiento,
    
    // Funciones financieras
    calcularMargen,
    calcularRentabilidad,
    calcularROI,
    calcularTicketMedio,
    
    // Funciones de agregación
    agruparPorPropiedad,
    calcularPromedioPonderado,
    contarPorCondicion,
    
    // Funciones de tiempo
    calcularDiasEntreFechas,
    
    // Funciones estadísticas
    calcularPercentil,
    calcularDesviacionEstandar
  }), []);
};

// ============================================
// HOOK PARA CÁLCULOS DE ARRAY
// ============================================

/**
 * Hook para calcular estadísticas de un array de datos
 * Se recalcula solo cuando el array cambia
 */
export const useEstadisticasArray = <T>(
  datos: T[],
  extractorValor: (item: T) => number
) => {
  return useMemo(() => {
    const valores = datos.map(extractorValor);
    return calcularEstadisticasBasicas(valores);
  }, [datos, extractorValor]);
};

// ============================================
// HOOK PARA FILTROS Y CONTEOS
// ============================================

/**
 * Hook para contar elementos que cumplen múltiples condiciones
 */
export const useConteosPorCondiciones = <T>(
  datos: T[],
  condiciones: Record<string, (item: T) => boolean>
) => {
  return useMemo(() => {
    const conteos: Record<string, number> = {};
    
    for (const [key, condicion] of Object.entries(condiciones)) {
      conteos[key] = contarPorCondicion(datos, condicion);
    }
    
    return conteos;
  }, [datos, condiciones]);
};

// ============================================
// HOOK PARA ANÁLISIS TEMPORAL
// ============================================

/**
 * Hook para análisis de tendencias temporales
 */
export const useTendencias = <T>(
  datos: T[],
  extractorValorActual: (item: T) => number,
  extractorValorAnterior: (item: T) => number
) => {
  return useMemo(() => {
    const conCrecimiento = datos.filter(
      item => extractorValorActual(item) > extractorValorAnterior(item)
    ).length;
    
    const conDecrecimiento = datos.filter(
      item => extractorValorActual(item) < extractorValorAnterior(item)
    ).length;
    
    const estables = datos.length - conCrecimiento - conDecrecimiento;
    
    const crecimientoPromedio = datos.length > 0
      ? datos.reduce((acc, item) => {
          return acc + calcularCrecimiento(
            extractorValorActual(item),
            extractorValorAnterior(item)
          );
        }, 0) / datos.length
      : 0;
    
    return {
      conCrecimiento,
      conDecrecimiento,
      estables,
      crecimientoPromedio,
      porcentajeConCrecimiento: calcularPorcentaje(conCrecimiento, datos.length),
      porcentajeConDecrecimiento: calcularPorcentaje(conDecrecimiento, datos.length)
    };
  }, [datos, extractorValorActual, extractorValorAnterior]);
};

// ============================================
// HOOK PARA DISTRIBUCIONES
// ============================================

/**
 * Hook para calcular distribución de datos por categorías
 */
export const useDistribucion = <T>(
  datos: T[],
  extractorCategoria: (item: T) => string,
  extractorValor?: (item: T) => number
) => {
  return useMemo(() => {
    const distribucion: Record<string, { cantidad: number; valor: number }> = {};
    
    for (const item of datos) {
      const categoria = extractorCategoria(item);
      
      if (!distribucion[categoria]) {
        distribucion[categoria] = { cantidad: 0, valor: 0 };
      }
      
      distribucion[categoria].cantidad++;
      
      if (extractorValor) {
        distribucion[categoria].valor += extractorValor(item);
      }
    }
    
    // Ordenar por valor o cantidad
    const ordenado = Object.entries(distribucion)
      .sort((a, b) => b[1].valor - a[1].valor || b[1].cantidad - a[1].cantidad);
    
    return {
      distribucion,
      categorias: ordenado.map(([cat]) => cat),
      categoriaTop: ordenado[0]?.[0],
      totalCategorias: Object.keys(distribucion).length
    };
  }, [datos, extractorCategoria, extractorValor]);
};

// ============================================
// EXPORTAR TODO
// ============================================

export default useCalculos;
