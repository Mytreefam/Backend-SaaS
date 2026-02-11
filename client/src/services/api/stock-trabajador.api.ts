/**
 * 📦 API CLIENT - STOCK / MATERIAL (TRABAJADOR)
 *
 * Fuente de verdad: endpoints /trabajador/stock/*
 */

import { envelopedFetch } from '../http/envelopedFetch';

export interface ArticuloStockApi {
  id: number;
  codigoInterno: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  empresaId: string;
  puntoVentaId: string;
  ubicacionAlmacen?: string | null;
  precioUltimaCompra?: number | null;
  alertaStockBajo: boolean;
  proveedor?: { id: number; nombre: string } | null;
}

export interface MovimientoStockApi {
  id: number;
  articuloId: number;
  articuloNombre: string;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockPosterior: number;
  motivo?: string | null;
  observaciones?: string | null;
  usuarioId?: number | null;
  usuarioNombre?: string | null;
  pedidoProveedorId?: number | null;
  fecha: string;
}

export interface PedidoProveedorApi {
  id: number;
  numero: string;
  proveedorId: number;
  puntoVentaId: string;
  empresaId: string;
  estado: string;
  fechaPedido: string;
  fechaEntregaEstimada?: string | null;
  fechaRecepcion?: string | null;
  subtotal: number;
  iva: number;
  total: number;
  observaciones?: string | null;
  proveedor?: { id: number; nombre: string } | null;
  items: Array<{
    id: number;
    pedidoProveedorId: number;
    articuloId: number;
    nombreArticulo: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    cantidadRecibida?: number | null;
    observaciones?: string | null;
  }>;
}

export const stockTrabajadorApi = {
  async listArticulos(params: { puntoVentaId: string; empresaId?: string }): Promise<ArticuloStockApi[]> {
    try {
      const qs = new URLSearchParams();
      qs.set('puntoVentaId', params.puntoVentaId);
      if (params.empresaId) qs.set('empresaId', params.empresaId);
      const res = await envelopedFetch<ArticuloStockApi[]>(`/trabajador/stock/articulos?${qs.toString()}`, { method: 'GET' });
      return res.data.data ?? [];
    } catch (error) {
      console.error('Error listando artículos de stock:', error);
      return [];
    }
  },

  async listMovimientos(params: { puntoVentaId: string }): Promise<MovimientoStockApi[]> {
    try {
      const qs = new URLSearchParams();
      qs.set('puntoVentaId', params.puntoVentaId);
      const res = await envelopedFetch<MovimientoStockApi[]>(`/trabajador/stock/movimientos?${qs.toString()}`, { method: 'GET' });
      return res.data.data ?? [];
    } catch (error) {
      console.error('Error listando movimientos:', error);
      return [];
    }
  },

  async listPedidosProveedor(params: { puntoVentaId: string; empresaId?: string; estado?: string }): Promise<PedidoProveedorApi[]> {
    try {
      const qs = new URLSearchParams();
      qs.set('puntoVentaId', params.puntoVentaId);
      if (params.empresaId) qs.set('empresaId', params.empresaId);
      if (params.estado) qs.set('estado', params.estado);
      const res = await envelopedFetch<PedidoProveedorApi[]>(`/trabajador/stock/pedidos-proveedor?${qs.toString()}`, { method: 'GET' });
      return res.data.data ?? [];
    } catch (error) {
      console.error('Error listando pedidos proveedor:', error);
      return [];
    }
  },

  async recibirPedidoProveedor(params: {
    pedidoId: number;
    observaciones?: string;
    items?: Array<{ articuloId?: number; itemId?: number; cantidadRecibida?: number; cantidad?: number }>;
  }): Promise<PedidoProveedorApi | null> {
    try {
      const res = await envelopedFetch<PedidoProveedorApi>(`/trabajador/stock/pedidos-proveedor/${params.pedidoId}/recibir`, {
        method: 'POST',
        body: JSON.stringify({ observaciones: params.observaciones, items: params.items }),
      });
      return res.data.data ?? null;
    } catch (error) {
      console.error('Error recibiendo pedido proveedor:', error);
      return null;
    }
  },

  async ajustarArticulo(params: {
    articuloId: number;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'merma' | 'consumo_propio';
    cantidad: number;
    motivo?: string;
    observaciones?: string;
  }): Promise<{ articulo: ArticuloStockApi; movimiento: MovimientoStockApi } | null> {
    try {
      const res = await envelopedFetch<{ articulo: ArticuloStockApi; movimiento: MovimientoStockApi }>(
        `/trabajador/stock/articulos/${params.articuloId}/ajustar`,
        {
          method: 'POST',
          body: JSON.stringify({
            tipo: params.tipo,
            cantidad: params.cantidad,
            motivo: params.motivo,
            observaciones: params.observaciones,
          }),
        },
      );
      return res.data.data ?? null;
    } catch (error) {
      console.error('Error ajustando artículo:', error);
      return null;
    }
  },
};

