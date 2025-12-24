/**
 * 📊 SERVICIO DE REPORTES MULTIEMPRESA
 * 
 * Agrega y analiza datos de ventas por:
 * - Empresa
 * - Marca
 * - Punto de Venta (PDV)
 * 
 * Integrado con:
 * - Sistema de pedidos
 * - Sistema de facturación
 * - Datos financieros (para EBITDA)
 */

import { Pedido, obtenerPedidosFiltrados, FiltrosPedidos } from './pedidos.service';
import { EMPRESAS, MARCAS, PUNTOS_VENTA } from '../constants/empresaConfig';
import { calcularCosteVentas } from './coste-ventas.service';
import { calcularGastosOperativosPeriodo } from '../data/gastos-operativos';

// ============================================================================
// TIPOS
// ============================================================================

export interface ResumenVentas {
  // Identificación
  empresaId?: string;
  empresaNombre?: string;
  marcaId?: string;
  marcaNombre?: string;
  puntoVentaId?: string;
  puntoVentaNombre?: string;
  
  // KPIs de ventas
  ventasTotales: number;          // Total facturado
  numeroPedidos: number;           // Cantidad de pedidos
  ticketMedio: number;             // Promedio por pedido
  
  // Desglose por método de pago
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasBizum: number;
  ventasTransferencia: number;
  
  // Desglose por estado
  pedidosPendientes: number;
  pedidosPagados: number;
  pedidosEntregados: number;
  pedidosCancelados: number;
  
  // Importes
  subtotalSinIVA: number;
  totalIVA: number;
  totalDescuentos: number;
  
  // ⭐ NUEVO: Datos de EBITDA
  costeVentas: number;            // Coste real de productos vendidos
  gastosOperativos: number;       // Gastos fijos del periodo
  margenBruto: number;            // ventasTotales - costeVentas
  ebitda: number;                 // margenBruto - gastosOperativos
  margenPorcentaje: number;       // (ebitda / ventasTotales) * 100
  
  // Periodo
  fechaDesde: string;
  fechaHasta: string;
}

export interface ResumenConsolidado {
  // Totales generales
  resumenGeneral: ResumenVentas;
  
  // Desglose por empresa
  porEmpresa: ResumenVentas[];
  
  // Desglose por marca
  porMarca: ResumenVentas[];
  
  // Desglose por PDV
  porPDV: ResumenVentas[];
  
  // Top productos
  topProductos: {
    productoId: string;
    nombre: string;
    cantidadVendida: number;
    totalVentas: number;
  }[];
  
  // Metadatos
  generadoEn: string;
  totalPedidosAnalizados: number;
}

// ============================================================================
// FUNCIONES DE AGREGACIÓN
// ============================================================================

/**
 * Calcula resumen de ventas a partir de una lista de pedidos
 */
function calcularResumen(
  pedidos: Pedido[],
  contexto: {
    empresaId?: string;
    marcaId?: string;
    puntoVentaId?: string;
  },
  fechaDesde: Date,
  fechaHasta: Date
): ResumenVentas {
  // Inicializar valores
  const resumen: ResumenVentas = {
    empresaId: contexto.empresaId,
    empresaNombre: contexto.empresaId ? EMPRESAS[contexto.empresaId]?.nombreFiscal : undefined,
    marcaId: contexto.marcaId,
    marcaNombre: contexto.marcaId ? MARCAS[contexto.marcaId]?.nombre : undefined,
    puntoVentaId: contexto.puntoVentaId,
    puntoVentaNombre: contexto.puntoVentaId ? PUNTOS_VENTA[contexto.puntoVentaId]?.nombre : undefined,
    
    ventasTotales: 0,
    numeroPedidos: pedidos.length,
    ticketMedio: 0,
    
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    ventasBizum: 0,
    ventasTransferencia: 0,
    
    pedidosPendientes: 0,
    pedidosPagados: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0,
    
    subtotalSinIVA: 0,
    totalIVA: 0,
    totalDescuentos: 0,
    
    fechaDesde: fechaDesde.toISOString(),
    fechaHasta: fechaHasta.toISOString(),
  };
  
  // Calcular agregados
  pedidos.forEach(pedido => {
    // Ventas totales
    resumen.ventasTotales += pedido.total;
    resumen.subtotalSinIVA += pedido.subtotal;
    resumen.totalIVA += pedido.iva;
    resumen.totalDescuentos += pedido.descuento;
    
    // Por método de pago
    switch (pedido.metodoPago) {
      case 'efectivo':
        resumen.ventasEfectivo += pedido.total;
        break;
      case 'tarjeta':
        resumen.ventasTarjeta += pedido.total;
        break;
      case 'bizum':
        resumen.ventasBizum += pedido.total;
        break;
      case 'transferencia':
        resumen.ventasTransferencia += pedido.total;
        break;
    }
    
    // Por estado
    switch (pedido.estado) {
      case 'pendiente':
        resumen.pedidosPendientes++;
        break;
      case 'pagado':
      case 'en_preparacion':
      case 'listo':
        resumen.pedidosPagados++;
        break;
      case 'entregado':
        resumen.pedidosEntregados++;
        break;
      case 'cancelado':
        resumen.pedidosCancelados++;
        break;
    }
  });
  
  // Calcular ticket medio
  resumen.ticketMedio = resumen.numeroPedidos > 0 
    ? resumen.ventasTotales / resumen.numeroPedidos 
    : 0;
  
  // ⭐ NUEVO: Calcular coste de ventas
  const datosCoste = calcularCosteVentas(pedidos);
  resumen.costeVentas = datosCoste.totalCostes;
  
  // ⭐ NUEVO: Calcular gastos operativos del periodo
  if (contexto.puntoVentaId) {
    resumen.gastosOperativos = calcularGastosOperativosPeriodo(
      contexto.puntoVentaId,
      fechaDesde,
      fechaHasta
    );
  } else {
    // Si no hay PDV específico (agregación por marca o empresa), sumar gastos de todos los PDVs involucrados
    const pdvsUnicos = [...new Set(pedidos.map(p => p.puntoVentaId))];
    resumen.gastosOperativos = pdvsUnicos.reduce((total, pdvId) => {
      return total + calcularGastosOperativosPeriodo(pdvId, fechaDesde, fechaHasta);
    }, 0);
  }
  
  // ⭐ NUEVO: Calcular EBITDA
  resumen.margenBruto = resumen.ventasTotales - resumen.costeVentas;
  resumen.ebitda = resumen.margenBruto - resumen.gastosOperativos;
  resumen.margenPorcentaje = resumen.ventasTotales > 0 
    ? (resumen.ebitda / resumen.ventasTotales) * 100 
    : 0;
  
  // Redondear valores
  resumen.costeVentas = Number(resumen.costeVentas.toFixed(2));
  resumen.gastosOperativos = Number(resumen.gastosOperativos.toFixed(2));
  resumen.margenBruto = Number(resumen.margenBruto.toFixed(2));
  resumen.ebitda = Number(resumen.ebitda.toFixed(2));
  resumen.margenPorcentaje = Number(resumen.margenPorcentaje.toFixed(1));
  
  return resumen;
}

// ============================================================================
// API PÚBLICA
// ============================================================================

/**
 * Obtener resumen de ventas por empresa
 */
export const obtenerResumenPorEmpresa = (
  empresaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): ResumenVentas => {
  const pedidos = obtenerPedidosFiltrados({
    empresaIds: [empresaId],
    fechaDesde,
    fechaHasta,
  });
  
  return calcularResumen(pedidos, { empresaId }, fechaDesde, fechaHasta);
};

/**
 * Obtener resumen de ventas por marca
 */
export const obtenerResumenPorMarca = (
  marcaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): ResumenVentas => {
  const pedidos = obtenerPedidosFiltrados({
    marcaIds: [marcaId],
    fechaDesde,
    fechaHasta,
  });
  
  return calcularResumen(pedidos, { marcaId }, fechaDesde, fechaHasta);
};

/**
 * Obtener resumen de ventas por punto de venta
 */
export const obtenerResumenPorPDV = (
  puntoVentaId: string,
  fechaDesde: Date,
  fechaHasta: Date
): ResumenVentas => {
  const pedidos = obtenerPedidosFiltrados({
    puntoVentaIds: [puntoVentaId],
    fechaDesde,
    fechaHasta,
  });
  
  return calcularResumen(pedidos, { puntoVentaId }, fechaDesde, fechaHasta);
};

/**
 * Obtener resumen consolidado con todos los desgloses
 */
export const obtenerResumenConsolidado = (
  filtros: FiltrosPedidos
): ResumenConsolidado => {
  const ahora = new Date();
  const fechaDesde = filtros.fechaDesde || new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const fechaHasta = filtros.fechaHasta || ahora;
  
  // Obtener todos los pedidos filtrados
  const pedidosFiltrados = obtenerPedidosFiltrados({
    ...filtros,
    fechaDesde,
    fechaHasta,
  });
  
  // Resumen general
  const resumenGeneral = calcularResumen(
    pedidosFiltrados,
    {},
    fechaDesde,
    fechaHasta
  );
  
  // Desglose por empresa
  const empresasUnicas = [...new Set(pedidosFiltrados.map(p => p.empresaId))];
  const porEmpresa = empresasUnicas.map(empresaId => {
    const pedidosEmpresa = pedidosFiltrados.filter(p => p.empresaId === empresaId);
    return calcularResumen(pedidosEmpresa, { empresaId }, fechaDesde, fechaHasta);
  });
  
  // Desglose por marca
  const marcasUnicas = [...new Set(pedidosFiltrados.map(p => p.marcaId))];
  const porMarca = marcasUnicas.map(marcaId => {
    const pedidosMarca = pedidosFiltrados.filter(p => p.marcaId === marcaId);
    return calcularResumen(pedidosMarca, { marcaId }, fechaDesde, fechaHasta);
  });
  
  // Desglose por PDV
  const pdvsUnicos = [...new Set(pedidosFiltrados.map(p => p.puntoVentaId))];
  const porPDV = pdvsUnicos.map(puntoVentaId => {
    const pedidosPDV = pedidosFiltrados.filter(p => p.puntoVentaId === puntoVentaId);
    return calcularResumen(pedidosPDV, { puntoVentaId }, fechaDesde, fechaHasta);
  });
  
  // Top productos
  const productosMap = new Map<string, { nombre: string; cantidad: number; total: number }>();
  
  pedidosFiltrados.forEach(pedido => {
    pedido.items.forEach(item => {
      const actual = productosMap.get(item.productoId) || {
        nombre: item.nombre,
        cantidad: 0,
        total: 0,
      };
      
      actual.cantidad += item.cantidad;
      actual.total += item.subtotal;
      
      productosMap.set(item.productoId, actual);
    });
  });
  
  const topProductos = Array.from(productosMap.entries())
    .map(([productoId, data]) => ({
      productoId,
      nombre: data.nombre,
      cantidadVendida: data.cantidad,
      totalVentas: data.total,
    }))
    .sort((a, b) => b.totalVentas - a.totalVentas)
    .slice(0, 10); // Top 10
  
  return {
    resumenGeneral,
    porEmpresa,
    porMarca,
    porPDV,
    topProductos,
    generadoEn: new Date().toISOString(),
    totalPedidosAnalizados: pedidosFiltrados.length,
  };
};

/**
 * Comparar rendimiento entre PDVs
 */
export const compararPDVs = (
  puntoVentaIds: string[],
  fechaDesde: Date,
  fechaHasta: Date
): ResumenVentas[] => {
  return puntoVentaIds.map(pdvId => 
    obtenerResumenPorPDV(pdvId, fechaDesde, fechaHasta)
  ).sort((a, b) => b.ventasTotales - a.ventasTotales);
};

/**
 * Comparar rendimiento entre marcas
 */
export const compararMarcas = (
  marcaIds: string[],
  fechaDesde: Date,
  fechaHasta: Date
): ResumenVentas[] => {
  return marcaIds.map(marcaId => 
    obtenerResumenPorMarca(marcaId, fechaDesde, fechaHasta)
  ).sort((a, b) => b.ventasTotales - a.ventasTotales);
};

/**
 * Obtener tendencias diarias
 */
export interface TendenciaDiaria {
  fecha: string;
  ventasTotales: number;
  numeroPedidos: number;
  ticketMedio: number;
}

export const obtenerTendenciasDiarias = (
  filtros: FiltrosPedidos
): TendenciaDiaria[] => {
  const pedidos = obtenerPedidosFiltrados(filtros);
  
  // Agrupar por día
  const porDia = new Map<string, Pedido[]>();
  
  pedidos.forEach(pedido => {
    const fecha = pedido.fecha.split('T')[0]; // YYYY-MM-DD
    const pedidosDia = porDia.get(fecha) || [];
    pedidosDia.push(pedido);
    porDia.set(fecha, pedidosDia);
  });
  
  // Calcular tendencias
  return Array.from(porDia.entries())
    .map(([fecha, pedidosDia]) => {
      const ventasTotales = pedidosDia.reduce((sum, p) => sum + p.total, 0);
      const numeroPedidos = pedidosDia.length;
      
      return {
        fecha,
        ventasTotales,
        numeroPedidos,
        ticketMedio: numeroPedidos > 0 ? ventasTotales / numeroPedidos : 0,
      };
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
};

// ============================================================================
// EXPORTAR CSV/EXCEL
// ============================================================================

/**
 * Exportar resumen a CSV
 */
export const exportarResumenCSV = (resumen: ResumenVentas): string => {
  const lineas = [
    'Métrica,Valor',
    `Empresa,${resumen.empresaNombre || 'N/A'}`,
    `Marca,${resumen.marcaNombre || 'N/A'}`,
    `Punto de Venta,${resumen.puntoVentaNombre || 'N/A'}`,
    '',
    `Ventas Totales,${resumen.ventasTotales.toFixed(2)}`,
    `Número de Pedidos,${resumen.numeroPedidos}`,
    `Ticket Medio,${resumen.ticketMedio.toFixed(2)}`,
    '',
    'DESGLOSE POR MÉTODO DE PAGO',
    `Efectivo,${resumen.ventasEfectivo.toFixed(2)}`,
    `Tarjeta,${resumen.ventasTarjeta.toFixed(2)}`,
    `Bizum,${resumen.ventasBizum.toFixed(2)}`,
    `Transferencia,${resumen.ventasTransferencia.toFixed(2)}`,
    '',
    'DESGLOSE POR ESTADO',
    `Pendientes,${resumen.pedidosPendientes}`,
    `Pagados,${resumen.pedidosPagados}`,
    `Entregados,${resumen.pedidosEntregados}`,
    `Cancelados,${resumen.pedidosCancelados}`,
    '',
    'IMPORTES',
    `Subtotal sin IVA,${resumen.subtotalSinIVA.toFixed(2)}`,
    `Total IVA,${resumen.totalIVA.toFixed(2)}`,
    `Total Descuentos,${resumen.totalDescuentos.toFixed(2)}`,
    '',
    `Periodo Desde,${resumen.fechaDesde}`,
    `Periodo Hasta,${resumen.fechaHasta}`,
  ];
  
  return lineas.join('\n');
};

/**
 * Descargar CSV
 */
export const descargarResumenCSV = (resumen: ResumenVentas, nombreArchivo?: string): void => {
  const csv = exportarResumenCSV(resumen);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo || `resumen-ventas-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  
  URL.revokeObjectURL(url);
};
