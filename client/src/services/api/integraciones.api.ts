/**
 * 🔗 API CLIENT - INTEGRACIONES DELIVERY
 * 
 * Servicios para gestión de integraciones con plataformas externas
 * (Glovo, Uber Eats, Just Eat, etc.)
 */

import { API_CONFIG, buildUrl, getAuthToken } from '../../config/api.config';

// ============================================================================
// TIPOS
// ============================================================================

export interface PlataformaDelivery {
  id: number;
  nombre: string;
  codigo: 'glovo' | 'uber_eats' | 'just_eat' | 'deliveroo' | 'otro';
  logo?: string;
  activa: boolean;
  conectada: boolean;
  ultimaSincronizacion?: string;
  errores?: number;
  productosSync?: number;
  pedidosHoy?: number;
  configuracion?: {
    apiKey?: string;
    storeId?: string;
    webhookUrl?: string;
  };
}

export interface HistorialSincronizacion {
  id: number;
  plataformaId: number;
  plataformaNombre: string;
  tipo: 'productos' | 'pedidos' | 'menu' | 'disponibilidad';
  resultado: 'ok' | 'error' | 'parcial';
  elementosSincronizados: number;
  errores?: string[];
  fecha: string;
  duracionMs?: number;
}

export interface PedidoExterno {
  id: number;
  plataformaId: number;
  plataformaNombre: string;
  pedidoExternoId: string;
  estado: 'nuevo' | 'aceptado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  cliente: {
    nombre: string;
    telefono?: string;
    direccion?: string;
  };
  productos: {
    nombre: string;
    cantidad: number;
    precio: number;
    notas?: string;
  }[];
  total: number;
  fechaPedido: string;
  fechaEntregaEstimada?: string;
  notas?: string;
}

export interface EstadisticasIntegraciones {
  plataformasActivas: number;
  plataformasTotales: number;
  pedidosUltimaHora: number;
  tasaExitoSync: number;
  productosSync: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

export const integracionesApi = {
  /**
   * Obtener todas las plataformas configuradas
   */
  async getPlataformas(empresaId?: number): Promise<PlataformaDelivery[]> {
    try {
      let url = '/gerente/integraciones/plataformas';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener plataformas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener plataformas:', error);
      return [];
    }
  },

  /**
   * Activar/desactivar plataforma
   */
  async togglePlataforma(plataformaId: number, activa: boolean): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/gerente/integraciones/plataformas/${plataformaId}/toggle`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ activa }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error al cambiar estado de plataforma:', error);
      return false;
    }
  },

  /**
   * Configurar credenciales de plataforma
   */
  async configurarPlataforma(plataformaId: number, config: {
    apiKey?: string;
    storeId?: string;
    secretKey?: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/gerente/integraciones/plataformas/${plataformaId}`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ configuracion: config }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error al configurar plataforma:', error);
      return false;
    }
  },

  /**
   * Sincronizar productos con plataforma
   */
  async sincronizarProductos(plataformaId?: number, productos?: any[]): Promise<{sincronizados: number; errores: number}> {
    try {
      const url = plataformaId 
        ? `/gerente/integraciones/plataformas/${plataformaId}/sincronizar`
        : '/gerente/integraciones/plataformas/1/sincronizar';
      const response = await fetch(buildUrl(url), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ productos }),
      });

      if (!response.ok) {
        throw new Error('Error al sincronizar productos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al sincronizar productos:', error);
      return { sincronizados: 0, errores: 0 };
    }
  },

  /**
   * Obtener historial de sincronizaciones
   */
  async getHistorial(params?: {
    plataformaId?: number;
    tipo?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<HistorialSincronizacion[]> {
    try {
      let url = '/gerente/integraciones/historial';
      const queryParams = new URLSearchParams();
      if (params?.plataformaId) queryParams.append('plataforma_id', params.plataformaId.toString());
      if (params?.tipo) queryParams.append('tipo', params.tipo);
      if (params?.fechaInicio) queryParams.append('fecha_inicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fecha_fin', params.fechaFin);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener historial');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }
  },

  /**
   * Obtener pedidos externos en tiempo real
   */
  async getPedidosExternos(params?: {
    plataformaId?: number;
    estado?: string;
    fecha?: string;
  }): Promise<PedidoExterno[]> {
    try {
      let url = '/gerente/integraciones/pedidos-externos';
      const queryParams = new URLSearchParams();
      if (params?.plataformaId) queryParams.append('plataforma_id', params.plataformaId.toString());
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.fecha) queryParams.append('fecha', params.fecha);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener pedidos externos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener pedidos externos:', error);
      return [];
    }
  },

  /**
   * Aceptar pedido externo
   */
  async aceptarPedido(pedidoId: number, tiempoEstimado?: number): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/gerente/integraciones/pedidos-externos/${pedidoId}/aceptar`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ tiempoEstimado }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error al aceptar pedido:', error);
      return false;
    }
  },

  /**
   * Rechazar pedido externo
   */
  async rechazarPedido(pedidoId: number, motivo: string): Promise<boolean> {
    try {
      const response = await fetch(buildUrl(`/gerente/integraciones/pedidos-externos/${pedidoId}/rechazar`), {
        method: 'PUT',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ motivo }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error al rechazar pedido:', error);
      return false;
    }
  },

  /**
   * Obtener estadísticas de integraciones
   */
  async getEstadisticas(empresaId?: number): Promise<EstadisticasIntegraciones> {
    try {
      let url = '/gerente/integraciones/estadisticas';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await fetch(buildUrl(url), {
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        plataformasActivas: 0,
        plataformasTotales: 0,
        pedidosUltimaHora: 0,
        tasaExitoSync: 0,
        productosSync: 0,
      };
    }
  },

  /**
   * Probar conexión con plataforma
   */
  async testConexion(plataformaId: number): Promise<{ok: boolean; mensaje: string}> {
    try {
      const response = await fetch(buildUrl(`/gerente/integraciones/plataformas/${plataformaId}/test`), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Error al probar conexión:', error);
      return { ok: false, mensaje: 'Error de conexión' };
    }
  },
};
