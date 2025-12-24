/**
 * SERVICIO: Reportes y Análisis
 * Generación de reportes, exportación y análisis de datos
 */

interface DatosReporte {
  periodo: {
    fecha_inicio: Date;
    fecha_fin: Date;
  };
  empresa_id?: string;
  marca_id?: string;
  punto_venta_id?: string;
}

/**
 * Generar reporte de ventas en formato JSON
 */
export async function generarReporteVentas(datos: DatosReporte): Promise<any> {
  // TODO: Implementar generación completa de reporte
  return {
    tipo: 'ventas',
    ...datos,
    generado_en: new Date(),
    datos: {
      total_ventas: 0,
      total_pedidos: 0,
      ticket_medio: 0
    }
  };
}

/**
 * Generar reporte de stock en formato JSON
 */
export async function generarReporteStock(datos: DatosReporte): Promise<any> {
  return {
    tipo: 'stock',
    ...datos,
    generado_en: new Date(),
    datos: {
      total_articulos: 0,
      valor_inventario: 0,
      articulos_stock_bajo: 0
    }
  };
}

/**
 * Generar reporte de empleados/RRHH
 */
export async function generarReporteRRHH(datos: DatosReporte): Promise<any> {
  return {
    tipo: 'rrhh',
    ...datos,
    generado_en: new Date(),
    datos: {
      total_empleados: 0,
      horas_trabajadas: 0,
      coste_personal: 0
    }
  };
}

/**
 * Exportar datos a CSV
 */
export function exportarCSV(datos: any[], columnas: string[]): string {
  // Header
  let csv = columnas.join(',') + '\n';

  // Rows
  datos.forEach(row => {
    const values = columnas.map(col => {
      const value = row[col];
      // Escapar comillas y wrap en comillas si contiene coma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv += values.join(',') + '\n';
  });

  return csv;
}

/**
 * Calcular métricas comparativas entre periodos
 */
export function calcularMetricasComparativas(
  periodo_actual: any,
  periodo_anterior: any
): any {
  const calcularVariacion = (actual: number, anterior: number) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return ((actual - anterior) / anterior) * 100;
  };

  return {
    ventas: {
      actual: periodo_actual.ventas,
      anterior: periodo_anterior.ventas,
      variacion: calcularVariacion(periodo_actual.ventas, periodo_anterior.ventas)
    },
    pedidos: {
      actual: periodo_actual.pedidos,
      anterior: periodo_anterior.pedidos,
      variacion: calcularVariacion(periodo_actual.pedidos, periodo_anterior.pedidos)
    },
    ticket_medio: {
      actual: periodo_actual.ticket_medio,
      anterior: periodo_anterior.ticket_medio,
      variacion: calcularVariacion(periodo_actual.ticket_medio, periodo_anterior.ticket_medio)
    }
  };
}

/**
 * Analizar tendencias en serie temporal
 */
export function analizarTendencias(
  datos_temporales: Array<{ fecha: Date; valor: number }>
): {
  tendencia: 'creciente' | 'decreciente' | 'estable';
  promedio: number;
  varianza: number;
} {
  if (datos_temporales.length === 0) {
    return { tendencia: 'estable', promedio: 0, varianza: 0 };
  }

  const valores = datos_temporales.map(d => d.valor);
  const promedio = valores.reduce((sum, v) => sum + v, 0) / valores.length;
  
  const varianza = valores.reduce((sum, v) => sum + Math.pow(v - promedio, 2), 0) / valores.length;

  // Calcular tendencia simple (comparar primera mitad con segunda mitad)
  const mitad = Math.floor(valores.length / 2);
  const promedioPrimeraMetad = valores.slice(0, mitad).reduce((sum, v) => sum + v, 0) / mitad;
  const promedioSegundaMetad = valores.slice(mitad).reduce((sum, v) => sum + v, 0) / (valores.length - mitad);

  let tendencia: 'creciente' | 'decreciente' | 'estable' = 'estable';
  const diferencia = promedioSegundaMetad - promedioPrimeraMetad;
  const umbral = promedio * 0.05; // 5% de variación

  if (diferencia > umbral) {
    tendencia = 'creciente';
  } else if (diferencia < -umbral) {
    tendencia = 'decreciente';
  }

  return {
    tendencia,
    promedio: parseFloat(promedio.toFixed(2)),
    varianza: parseFloat(varianza.toFixed(2))
  };
}

export default {
  generarReporteVentas,
  generarReporteStock,
  generarReporteRRHH,
  exportarCSV,
  calcularMetricasComparativas,
  analizarTendencias
};
