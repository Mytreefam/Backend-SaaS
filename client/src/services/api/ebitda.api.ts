/**
 * 💰 API CLIENT - EBITDA / CUENTA DE RESULTADOS
 * 
 * Servicios para gestión financiera y cálculo de EBITDA
 */

import { envelopedFetch } from '../http/envelopedFetch';

// ============================================================================
// TIPOS
// ============================================================================

export interface LineaResultado {
  concepto: string;
  importe: number;
  porcentaje?: number;
  variacion?: number;
  desglose?: LineaResultado[];
}

export interface CuentaResultados {
  periodo: string;
  fechaInicio: string;
  fechaFin: string;
  ingresosNetos: number;
  costeVentas: number;
  margenBruto: number;
  gastosOperativos: number;
  ebitda: number;
  margenEbitda: number;
  desglose: {
    ingresos: LineaResultado[];
    costes: LineaResultado[];
    gastos: LineaResultado[];
  };
}

export interface ComparativaEBITDA {
  periodoActual: CuentaResultados;
  periodoAnterior: CuentaResultados;
  variacionIngresos: number;
  variacionEbitda: number;
  variacionMargen: number;
}

export interface IndicadorFinanciero {
  nombre: string;
  valor: number;
  unidad: string;
  tendencia: 'positiva' | 'negativa' | 'neutral';
  variacion: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const ebitdaApi = {
  /**
   * Obtener cuenta de resultados
   */
  async getCuentaResultados(params?: {
    empresaId?: string;
    puntoVentaId?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<CuentaResultados | null> {
    try {
      let url = '/gerente/finanzas/cuenta-resultados';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.puntoVentaId) queryParams.append('punto_venta_id', params.puntoVentaId.toString());
      if (params?.fechaInicio) queryParams.append('fecha_inicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fecha_fin', params.fechaFin);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await envelopedFetch<CuentaResultados>(url, { method: 'GET' });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al obtener cuenta de resultados:', error);
      return null;
    }
  },

  /**
   * Obtener EBITDA del periodo
   */
  async getEBITDA(params?: {
    empresaId?: string;
    puntoVentaId?: string;
    mes?: number;
    año?: number;
  }): Promise<{ebitda: number; margen: number; ingresos: number; gastos: number}> {
    try {
      let url = '/gerente/finanzas/ebitda';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.puntoVentaId) queryParams.append('punto_venta_id', params.puntoVentaId.toString());
      if (params?.mes) queryParams.append('mes', params.mes.toString());
      if (params?.año) queryParams.append('año', params.año.toString());
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await envelopedFetch<{ ebitda: number; margen: number; ingresos: number; gastos: number }>(
        url,
        { method: 'GET' },
      );
      return response.data.data ?? { ebitda: 0, margen: 0, ingresos: 0, gastos: 0 };
    } catch (error) {
      console.error('Error al obtener EBITDA:', error);
      return { ebitda: 0, margen: 0, ingresos: 0, gastos: 0 };
    }
  },

  /**
   * Obtener comparativa entre periodos
   */
  async getComparativa(params: {
    empresaId?: string;
    puntoVentaId?: string;
    periodoActual: { inicio: string; fin: string };
    periodoAnterior: { inicio: string; fin: string };
  }): Promise<ComparativaEBITDA | null> {
    try {
      const [actual, anterior] = await Promise.all([
        this.getCuentaResultados({
          empresaId: params.empresaId,
          puntoVentaId: params.puntoVentaId,
          fechaInicio: params.periodoActual.inicio,
          fechaFin: params.periodoActual.fin,
        }),
        this.getCuentaResultados({
          empresaId: params.empresaId,
          puntoVentaId: params.puntoVentaId,
          fechaInicio: params.periodoAnterior.inicio,
          fechaFin: params.periodoAnterior.fin,
        }),
      ]);

      if (!actual || !anterior) return null;

      return {
        periodoActual: actual,
        periodoAnterior: anterior,
        variacionIngresos: anterior.ingresosNetos > 0 
          ? ((actual.ingresosNetos - anterior.ingresosNetos) / anterior.ingresosNetos) * 100 
          : 0,
        variacionEbitda: anterior.ebitda > 0 
          ? ((actual.ebitda - anterior.ebitda) / anterior.ebitda) * 100 
          : 0,
        variacionMargen: actual.margenEbitda - anterior.margenEbitda,
      };
    } catch (error) {
      console.error('Error al obtener comparativa:', error);
      return null;
    }
  },

  /**
   * Obtener indicadores financieros clave
   */
  async getIndicadores(empresaId?: number, puntoVentaId?: number): Promise<IndicadorFinanciero[]> {
    try {
      let url = '/gerente/finanzas/indicadores';
      const params = new URLSearchParams();
      if (empresaId) params.append('empresa_id', empresaId.toString());
      if (puntoVentaId) params.append('punto_venta_id', puntoVentaId.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const response = await envelopedFetch<IndicadorFinanciero[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener indicadores:', error);
      return [];
    }
  },

  /**
   * Obtener histórico de EBITDA
   */
  async getHistoricoEBITDA(params?: {
    empresaId?: string;
    puntoVentaId?: string;
    meses?: number;
  }): Promise<{mes: string; ebitda: number; margen: number}[]> {
    try {
      let url = '/gerente/finanzas/ebitda/historico';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.puntoVentaId) queryParams.append('punto_venta_id', params.puntoVentaId.toString());
      if (params?.meses) queryParams.append('meses', params.meses.toString());
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await envelopedFetch<{ mes: string; ebitda: number; margen: number }[]>(url, {
        method: 'GET',
      });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener histórico EBITDA:', error);
      return [];
    }
  },
};
