/**
 * INTEGRACIÓN TRABAJADORES + FICHAJES
 * 
 * Funciones helper para conectar el sistema de fichajes
 * con la gestión de trabajadores y centros de coste
 * 
 * SISTEMA MIXTO:
 * - El gerente puede asignar distribución MANUAL
 * - El sistema calcula distribución automática por FICHAJES
 * - El gerente decide cuál usar (manual override)
 */

import { trabajadores, type Trabajador, type DistribucionCoste } from './trabajadores';
import { 
  calcularDistribucionPorFichajes,
  calcularHorasTrabajadas,
  calcularDiasTrabajados,
  calcularAbsentismo,
  generarResumenFichajes
} from './fichajes';

// ============================================
// FUNCIONES CORE - DISTRIBUCIÓN MIXTA
// ============================================

/**
 * ⭐ CORE: Obtener distribución efectiva de costes
 * Sistema MIXTO: usa manual si está configurado, sino usa calculada de fichajes
 */
export const obtenerDistribucionEfectiva = (
  trabajador: Trabajador,
  año?: number,
  mes?: number
): DistribucionCoste[] => {
  // Si tiene distribución manual Y está activada, usarla
  if (trabajador.usarDistribucionManual && trabajador.distribucionCostesManual) {
    return trabajador.distribucionCostesManual;
  }
  
  // Si tiene distribución calculada (de fichajes), usarla
  if (trabajador.distribucionCostesCalculada) {
    return trabajador.distribucionCostesCalculada;
  }
  
  // Fallback: distribución legacy
  if (trabajador.distribucionCostes) {
    return trabajador.distribucionCostes;
  }
  
  // Fallback final: 100% en PDV principal
  return [{
    puntoVentaId: trabajador.puntoVentaId,
    porcentaje: 100
  }];
};

/**
 * ⭐ Calcular nómina de un PDV usando distribución efectiva
 * Reemplaza la función antigua con sistema mixto
 */
export const calcularNominaPDVConDistribucion = (
  puntoVentaId: string,
  año?: number,
  mes?: number
): number => {
  // Filtrar trabajadores asignados a este PDV
  const trabajadoresPDV = trabajadores.filter(trab => 
    trab.puntoVentaId === puntoVentaId || 
    trab.puntosVentaAsignados?.includes(puntoVentaId)
  );
  
  let nominaTotal = 0;
  
  trabajadoresPDV.forEach(trab => {
    if (!trab.salarioMensual) return;
    
    const distribucion = obtenerDistribucionEfectiva(trab, año, mes);
    const distribucionPDV = distribucion.find(d => d.puntoVentaId === puntoVentaId);
    
    if (distribucionPDV) {
      const costePDV = trab.salarioMensual * (distribucionPDV.porcentaje / 100);
      nominaTotal += costePDV;
    }
  });
  
  return Number(nominaTotal.toFixed(2));
};

/**
 * ⭐ Actualizar distribución calculada de un trabajador desde fichajes
 * Esta función se llama periódicamente (ej: cada noche) para recalcular
 */
export const actualizarDistribucionDesdeFichajes = (
  trabajadorId: string,
  año: number,
  mes: number
): boolean => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return false;
  
  try {
    const distribucionCalculada = calcularDistribucionPorFichajes(trabajadorId, año, mes);
    
    // Actualizar la distribución calculada del trabajador
    trabajador.distribucionCostesCalculada = distribucionCalculada.map(d => ({
      puntoVentaId: d.puntoVentaId,
      porcentaje: d.porcentaje
    }));
    
    trabajador.updatedAt = new Date().toISOString();
    
    return true;
  } catch (error) {
    console.error(`Error actualizando distribución de ${trabajadorId}:`, error);
    return false;
  }
};

/**
 * ⭐ Actualizar estadísticas del mes actual
 */
export const actualizarEstadisticasTrabajador = (
  trabajadorId: string,
  año: number,
  mes: number
): boolean => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return false;
  
  try {
    const horasTrabajadas = calcularHorasTrabajadas(trabajadorId, año, mes);
    const diasTrabajados = calcularDiasTrabajados(trabajadorId, año, mes);
    const absentismo = calcularAbsentismo(trabajadorId, año, mes);
    
    trabajador.estadisticasMesActual = {
      horasTrabajadas,
      diasTrabajados,
      diasAbsentismo: absentismo.diasAusencia,
      porcentajeAbsentismo: absentismo.porcentajeAbsentismoHoras,
      horasExtra: Math.max(0, horasTrabajadas - trabajador.horasContrato)
    };
    
    trabajador.horasTrabajadas = horasTrabajadas;
    trabajador.updatedAt = new Date().toISOString();
    
    return true;
  } catch (error) {
    console.error(`Error actualizando estadísticas de ${trabajadorId}:`, error);
    return false;
  }
};

/**
 * ⭐ Actualizar TODO: distribución + estadísticas
 * Ejecutar esta función periódicamente (ej: cron job nocturno)
 */
export const actualizarDatosTrabajador = (
  trabajadorId: string,
  año: number,
  mes: number
): boolean => {
  const distribucionOk = actualizarDistribucionDesdeFichajes(trabajadorId, año, mes);
  const estadisticasOk = actualizarEstadisticasTrabajador(trabajadorId, año, mes);
  
  return distribucionOk && estadisticasOk;
};

/**
 * ⭐ Actualizar TODOS los trabajadores activos
 */
export const actualizarTodosTrabajadores = (
  año: number,
  mes: number
): { exitosos: number; fallidos: number } => {
  const trabajadoresActivos = trabajadores.filter(t => t.estado === 'activo');
  
  let exitosos = 0;
  let fallidos = 0;
  
  trabajadoresActivos.forEach(trabajador => {
    const ok = actualizarDatosTrabajador(trabajador.id, año, mes);
    if (ok) {
      exitosos++;
    } else {
      fallidos++;
    }
  });
  
  return { exitosos, fallidos };
};

// ============================================
// FUNCIONES - COMPARACIÓN Y ANÁLISIS
// ============================================

/**
 * ⭐ Comparar distribución manual vs calculada
 * Útil para que el gerente vea desviaciones
 */
export const compararDistribuciones = (
  trabajadorId: string
): {
  trabajadorNombre: string;
  manual?: DistribucionCoste[];
  calculada?: DistribucionCoste[];
  desviacion?: { puntoVentaId: string; diferencia: number }[];
} | null => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return null;
  
  const manual = trabajador.distribucionCostesManual;
  const calculada = trabajador.distribucionCostesCalculada;
  
  let desviacion: { puntoVentaId: string; diferencia: number }[] | undefined;
  
  if (manual && calculada) {
    // Crear mapa de PDVs únicos
    const pdvsUnicos = new Set([
      ...manual.map(d => d.puntoVentaId),
      ...calculada.map(d => d.puntoVentaId)
    ]);
    
    desviacion = Array.from(pdvsUnicos).map(pdvId => {
      const porcentajeManual = manual.find(d => d.puntoVentaId === pdvId)?.porcentaje || 0;
      const porcentajeCalculado = calculada.find(d => d.puntoVentaId === pdvId)?.porcentaje || 0;
      
      return {
        puntoVentaId: pdvId,
        diferencia: Number((porcentajeCalculado - porcentajeManual).toFixed(2))
      };
    });
  }
  
  return {
    trabajadorNombre: `${trabajador.nombre} ${trabajador.apellidos}`,
    manual,
    calculada,
    desviacion
  };
};

/**
 * ⭐ Obtener trabajadores con desviación significativa (>10%)
 */
export const obtenerTrabajadoresConDesviacion = (
  umbral: number = 10
): {
  trabajadorId: string;
  trabajadorNombre: string;
  desviacionMaxima: number;
}[] => {
  return trabajadores
    .filter(t => t.distribucionCostesManual && t.distribucionCostesCalculada)
    .map(t => {
      const comparacion = compararDistribuciones(t.id);
      if (!comparacion || !comparacion.desviacion) return null;
      
      const desviacionMaxima = Math.max(
        ...comparacion.desviacion.map(d => Math.abs(d.diferencia))
      );
      
      return {
        trabajadorId: t.id,
        trabajadorNombre: comparacion.trabajadorNombre,
        desviacionMaxima: Number(desviacionMaxima.toFixed(2))
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null && t.desviacionMaxima >= umbral)
    .sort((a, b) => b.desviacionMaxima - a.desviacionMaxima);
};

// ============================================
// FUNCIONES - GESTIÓN POR GERENTE
// ============================================

/**
 * ⭐ Establecer distribución manual (acción del gerente)
 */
export const establecerDistribucionManual = (
  trabajadorId: string,
  distribucion: DistribucionCoste[]
): boolean => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return false;
  
  // Validar que los porcentajes sumen 100
  const total = distribucion.reduce((sum, d) => sum + d.porcentaje, 0);
  if (Math.abs(total - 100) > 0.01) {
    console.error('Los porcentajes deben sumar 100');
    return false;
  }
  
  trabajador.distribucionCostesManual = distribucion;
  trabajador.usarDistribucionManual = true;
  trabajador.updatedAt = new Date().toISOString();
  
  return true;
};

/**
 * ⭐ Activar/desactivar distribución manual
 */
export const toggleDistribucionManual = (
  trabajadorId: string,
  usar: boolean
): boolean => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return false;
  
  if (usar && !trabajador.distribucionCostesManual) {
    console.error('No hay distribución manual configurada');
    return false;
  }
  
  trabajador.usarDistribucionManual = usar;
  trabajador.updatedAt = new Date().toISOString();
  
  return true;
};

/**
 * ⭐ Obtener resumen completo de un trabajador
 */
export const obtenerResumenCompletgetTrabajador = (
  trabajadorId: string,
  año: number,
  mes: number
): {
  trabajador: Trabajador;
  resumenFichajes: ReturnType<typeof generarResumenFichajes>;
  distribucionEfectiva: DistribucionCoste[];
  comparacion: ReturnType<typeof compararDistribuciones>;
} | null => {
  const trabajador = trabajadores.find(t => t.id === trabajadorId);
  if (!trabajador) return null;
  
  return {
    trabajador,
    resumenFichajes: generarResumenFichajes(trabajadorId, año, mes),
    distribucionEfectiva: obtenerDistribucionEfectiva(trabajador, año, mes),
    comparacion: compararDistribuciones(trabajadorId)
  };
};

// ============================================
// FUNCIONES - REPORTES CONSOLIDADOS
// ============================================

/**
 * ⭐ Generar reporte de nóminas por PDV (con distribución real)
 */
export const generarReporteNominasPDV = (
  año: number,
  mes: number
): {
  puntoVentaId: string;
  nominaTotal: number;
  trabajadores: {
    trabajadorId: string;
    trabajadorNombre: string;
    salarioTotal: number;
    porcentajeAsignado: number;
    costoParaPDV: number;
  }[];
}[] => {
  const pdvsUnicos = new Set(trabajadores.map(t => t.puntoVentaId));
  
  return Array.from(pdvsUnicos).map(pdvId => {
    const trabajadoresPDV = trabajadores.filter(t => 
      t.puntoVentaId === pdvId || 
      t.puntosVentaAsignados?.includes(pdvId)
    );
    
    const detalles = trabajadoresPDV.map(t => {
      const distribucion = obtenerDistribucionEfectiva(t, año, mes);
      const distPDV = distribucion.find(d => d.puntoVentaId === pdvId);
      const porcentaje = distPDV?.porcentaje || 0;
      const salarioTotal = t.salarioMensual || 0;
      const costo = salarioTotal * (porcentaje / 100);
      
      return {
        trabajadorId: t.id,
        trabajadorNombre: `${t.nombre} ${t.apellidos}`,
        salarioTotal,
        porcentajeAsignado: porcentaje,
        costoParaPDV: Number(costo.toFixed(2))
      };
    }).filter(d => d.costoParaPDV > 0);
    
    const nominaTotal = detalles.reduce((sum, d) => sum + d.costoParaPDV, 0);
    
    return {
      puntoVentaId: pdvId,
      nominaTotal: Number(nominaTotal.toFixed(2)),
      trabajadores: detalles
    };
  });
};
