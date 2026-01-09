/**
 * 📊 API CLIENT - DASHBOARD GERENTE
 * 
 * Servicios para el panel de control del gerente
 * KPIs, ventas, alertas y métricas del negocio
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

// ============================================================================
// TIPOS
// ============================================================================

export interface KPIsGlobales {
  ventasTotales: number;
  variacionVentas: number;
  pedidosHoy: number;
  pedidosPendientes: number;
  ticketMedio: number;
  clientesActivos: number;
  empleadosFichados: number;
  citasHoy: number;
}

export interface VentasPorCanal {
  mostrador: number;
  app: number;
  web: number;
  glovo: number;
  uberEats: number;
  justEat: number;
  efectivo: number;
  tarjeta: number;
  total: number;
}

export interface AlertaCritica {
  id: number;
  tipo: 'stock' | 'pedido' | 'incidencia' | 'financiera' | 'operativa';
  titulo: string;
  mensaje: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  puntoVentaId?: number;
  puntoVentaNombre?: string;
  fechaCreacion: string;
  resuelta: boolean;
}

export interface DatosVentas {
  periodo: string;
  ventas: number;
  pedidos: number;
  ticketMedio: number;
}

export interface ResumenDashboard {
  kpis: KPIsGlobales;
  ventasPorCanal: VentasPorCanal;
  alertas: AlertaCritica[];
  ventasHistorico: DatosVentas[];
}

// ============================================================================
// API CLIENT
// ============================================================================

export const dashboardApi = {
  /**
   * Obtener KPIs globales del negocio
   */
  async getKPIs(empresaId?: number, puntoVentaId?: number): Promise<KPIsGlobales> {
    try {
      let url = '/gerente/dashboard/kpis';
      const params = new URLSearchParams();
      if (empresaId) params.append('empresa_id', empresaId.toString());
      if (puntoVentaId) params.append('punto_venta_id', puntoVentaId.toString());
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener KPIs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener KPIs:', error);
      // Fallback con valores por defecto
      return {
        ventasTotales: 0,
        variacionVentas: 0,
        pedidosHoy: 0,
        pedidosPendientes: 0,
        ticketMedio: 0,
        clientesActivos: 0,
        empleadosFichados: 0,
        citasHoy: 0,
      };
    }
  },

  /**
   * Obtener datos de ventas por periodo
   */
  async getVentas(params?: {
    empresaId?: number;
    puntoVentaId?: number;
    fechaInicio?: string;
    fechaFin?: string;
    agrupacion?: 'dia' | 'semana' | 'mes';
  }): Promise<DatosVentas[]> {
    try {
      let url = '/gerente/dashboard/ventas';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.puntoVentaId) queryParams.append('punto_venta_id', params.puntoVentaId.toString());
      if (params?.fechaInicio) queryParams.append('fecha_inicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fecha_fin', params.fechaFin);
      if (params?.agrupacion) queryParams.append('agrupacion', params.agrupacion);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener ventas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return [];
    }
  },

  /**
   * Obtener ventas por canal
   */
  async getVentasPorCanal(params?: {
    empresaId?: number;
    puntoVentaId?: number;
    fecha?: string;
  }): Promise<VentasPorCanal> {
    try {
      let url = '/gerente/dashboard/ventas/canales';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.puntoVentaId) queryParams.append('punto_venta_id', params.puntoVentaId.toString());
      if (params?.fecha) queryParams.append('fecha', params.fecha);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener ventas por canal');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener ventas por canal:', error);
      return {
        mostrador: 0,
        app: 0,
        web: 0,
        glovo: 0,
        uberEats: 0,
        justEat: 0,
        efectivo: 0,
        tarjeta: 0,
        total: 0,
      };
    }
  },

  /**
   * Obtener alertas críticas
   */
  async getAlertas(params?: {
    empresaId?: number;
    puntoVentaId?: number;
    tipo?: string;
    soloNoResueltas?: boolean;
  }): Promise<AlertaCritica[]> {
    try {
      let url = '/gerente/dashboard/alertas';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.puntoVentaId) queryParams.append('punto_venta_id', params.puntoVentaId.toString());
      if (params?.tipo) queryParams.append('tipo', params.tipo);
      if (params?.soloNoResueltas) queryParams.append('solo_no_resueltas', 'true');
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener alertas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }
  },

  /**
   * Marcar alerta como resuelta
   */
  async resolverAlerta(alertaId: number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/gerente/dashboard/alertas/${alertaId}/resolver`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error al resolver alerta:', error);
      return false;
    }
  },

  /**
   * Obtener resumen completo del dashboard
   */
  async getResumen(empresaId?: number, puntoVentaId?: number): Promise<ResumenDashboard> {
    const [kpis, ventasPorCanal, alertas, ventasHistorico] = await Promise.all([
      this.getKPIs(empresaId, puntoVentaId),
      this.getVentasPorCanal({ empresaId, puntoVentaId }),
      this.getAlertas({ empresaId, puntoVentaId, soloNoResueltas: true }),
      this.getVentas({ empresaId, puntoVentaId, agrupacion: 'dia' }),
    ]);

    return {
      kpis,
      ventasPorCanal,
      alertas,
      ventasHistorico,
    };
  },
};
