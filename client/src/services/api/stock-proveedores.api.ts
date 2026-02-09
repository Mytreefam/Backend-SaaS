/**
 * 📦 API CLIENT - STOCK Y PROVEEDORES
 * 
 * Servicios para gestión de stock, proveedores y almacenes
 */

import { envelopedFetch } from '../http/envelopedFetch';

// ============================================================================
// TIPOS - PROVEEDORES
// ============================================================================

export interface Proveedor {
  id: number;
  nombre: string;
  cif: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  contacto?: string;
  condicionesPago?: string;
  diasEntrega?: number;
  activo: boolean;
  empresaId: number;
  articulos?: number;
  ultimoPedido?: string;
}

export interface ProveedorCreate {
  nombre: string;
  cif: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  contacto?: string;
  condicionesPago?: string;
  diasEntrega?: number;
  empresaId: number;
}

// ============================================================================
// TIPOS - STOCK
// ============================================================================

export interface ArticuloStock {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  unidad: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo?: number;
  costeUnitario: number;
  proveedorId?: number;
  proveedorNombre?: string;
  almacenId: number;
  almacenNombre: string;
  estado: 'ok' | 'bajo' | 'critico' | 'agotado';
  ultimaEntrada?: string;
  ultimaSalida?: string;
}

export interface MovimientoStock {
  id: number;
  articuloId: number;
  articuloNombre: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia' | 'merma' | 'consumo_propio';
  cantidad: number;
  almacenOrigenId?: number;
  almacenDestinoId?: number;
  motivo?: string;
  usuarioId: number;
  usuarioNombre: string;
  fecha: string;
  documentoRef?: string;
}

export interface Almacen {
  id: number;
  nombre: string;
  puntoVentaId?: number;
  puntoVentaNombre?: string;
  direccion?: string;
  tipo: 'principal' | 'secundario' | 'frigorifico' | 'seco';
  activo: boolean;
}

export interface TransferenciaStock {
  articuloId: number;
  cantidad: number;
  almacenOrigenId: number;
  almacenDestinoId: number;
  motivo?: string;
}

// ============================================================================
// API CLIENT - PROVEEDORES
// ============================================================================

export const proveedoresApi = {
  /**
   * Obtener todos los proveedores
   */
  async getAll(empresaId?: number): Promise<Proveedor[]> {
    try {
      let url = '/gerente/stock/proveedores';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await envelopedFetch<Proveedor[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      return [];
    }
  },

  /**
   * Obtener proveedor por ID
   */
  async getById(id: number): Promise<Proveedor | null> {
    try {
      const response = await envelopedFetch<Proveedor>(`/gerente/stock/proveedores/${id}`, {
        method: 'GET',
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al obtener proveedor:', error);
      return null;
    }
  },

  /**
   * Crear proveedor
   */
  async create(data: ProveedorCreate): Promise<Proveedor | null> {
    try {
      const response = await envelopedFetch<Proveedor>('/gerente/stock/proveedores', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      return null;
    }
  },

  /**
   * Actualizar proveedor
   */
  async update(id: number, data: Partial<ProveedorCreate>): Promise<Proveedor | null> {
    try {
      const response = await envelopedFetch<Proveedor>(`/gerente/stock/proveedores/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      return null;
    }
  },

  /**
   * Eliminar proveedor
   */
  async delete(id: number): Promise<boolean> {
    try {
      await envelopedFetch<unknown>(`/gerente/stock/proveedores/${id}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      return false;
    }
  },
};

// ============================================================================
// API CLIENT - STOCK
// ============================================================================

export const stockApi = {
  /**
   * Obtener artículos de stock
   */
  async getArticulos(params?: {
    empresaId?: number;
    almacenId?: number;
    categoria?: string;
    estado?: string;
    busqueda?: string;
  }): Promise<ArticuloStock[]> {
    try {
      let url = '/gerente/stock/articulos';
      const queryParams = new URLSearchParams();
      if (params?.empresaId) queryParams.append('empresa_id', params.empresaId.toString());
      if (params?.almacenId) queryParams.append('almacen_id', params.almacenId.toString());
      if (params?.categoria) queryParams.append('categoria', params.categoria);
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.busqueda) queryParams.append('busqueda', params.busqueda);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await envelopedFetch<ArticuloStock[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener artículos:', error);
      return [];
    }
  },

  /**
   * Obtener almacenes
   */
  async getAlmacenes(empresaId?: number): Promise<Almacen[]> {
    try {
      let url = '/gerente/stock/almacenes';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await envelopedFetch<Almacen[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener almacenes:', error);
      return [];
    }
  },

  /**
   * Obtener movimientos de stock
   */
  async getMovimientos(params?: {
    articuloId?: number;
    almacenId?: number;
    tipo?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<MovimientoStock[]> {
    try {
      let url = '/gerente/stock/movimientos';
      const queryParams = new URLSearchParams();
      if (params?.articuloId) queryParams.append('articulo_id', params.articuloId.toString());
      if (params?.almacenId) queryParams.append('almacen_id', params.almacenId.toString());
      if (params?.tipo) queryParams.append('tipo', params.tipo);
      if (params?.fechaInicio) queryParams.append('fecha_inicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fecha_fin', params.fechaFin);
      if (queryParams.toString()) url += `?${queryParams.toString()}`;

      const response = await envelopedFetch<MovimientoStock[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      return [];
    }
  },

  /**
   * Registrar entrada de stock
   */
  async registrarEntrada(data: {
    articuloId: number;
    cantidad: number;
    almacenId: number;
    costeUnitario?: number;
    proveedorId?: number;
    documentoRef?: string;
  }): Promise<MovimientoStock | null> {
    try {
      const response = await envelopedFetch<MovimientoStock>('/gerente/stock/entradas', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      return null;
    }
  },

  /**
   * Registrar salida de stock
   */
  async registrarSalida(data: {
    articuloId: number;
    cantidad: number;
    almacenId: number;
    motivo: string;
    tipo?: 'venta' | 'merma' | 'consumo_propio' | 'ajuste';
  }): Promise<MovimientoStock | null> {
    try {
      const response = await envelopedFetch<MovimientoStock>('/gerente/stock/salidas', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al registrar salida:', error);
      return null;
    }
  },

  /**
   * Realizar transferencia entre almacenes
   */
  async transferir(data: TransferenciaStock): Promise<MovimientoStock | null> {
    try {
      const response = await envelopedFetch<MovimientoStock>('/gerente/stock/transferencias', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al realizar transferencia:', error);
      return null;
    }
  },

  /**
   * Obtener alertas de stock
   */
  async getAlertas(empresaId?: number): Promise<ArticuloStock[]> {
    try {
      let url = '/gerente/stock/alertas';
      if (empresaId) url += `?empresa_id=${empresaId}`;

      const response = await envelopedFetch<ArticuloStock[]>(url, { method: 'GET' });
      return response.data.data ?? [];
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }
  },

  /**
   * Realizar inventario/ajuste
   */
  async ajustarInventario(data: {
    articuloId: number;
    almacenId: number;
    stockReal: number;
    motivo: string;
  }): Promise<MovimientoStock | null> {
    try {
      const response = await envelopedFetch<MovimientoStock>(
        `/gerente/stock/articulos/${data.articuloId}/ajustar`,
        {
        method: 'PUT',
        body: JSON.stringify({
          almacenId: data.almacenId,
          stockReal: data.stockReal,
          motivo: data.motivo,
        }),
        },
      );
      return response.data.data ?? null;
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
      return null;
    }
  },
};
