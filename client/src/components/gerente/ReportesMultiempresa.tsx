/**
 * 📊 COMPONENTE DE REPORTES MULTIEMPRESA
 * 
 * Visualiza ventas agregadas por:
 * - Empresa
 * - Marca
 * - Punto de Venta (PDV)
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Building2,
  Store,
  MapPin,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import {
  obtenerResumenConsolidado,
  compararPDVs,
  compararMarcas,
  descargarResumenCSV,
  ResumenConsolidado,
  ResumenVentas,
} from '../../services/reportes-multiempresa.service';
import { EMPRESAS_ARRAY, MARCAS_ARRAY, PUNTOS_VENTA_ARRAY } from '../../constants/empresaConfig';

export function ReportesMultiempresa() {
  const [resumenConsolidado, setResumenConsolidado] = useState<ResumenConsolidado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [vistaActual, setVistaActual] = useState<'consolidado' | 'empresas' | 'marcas' | 'pdvs'>('consolidado');
  
  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState(() => {
    const fecha = new Date();
    fecha.setDate(1); // Primer día del mes
    return fecha.toISOString().split('T')[0];
  });
  
  const [fechaHasta, setFechaHasta] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    
    try {
      const resumen = obtenerResumenConsolidado({
        fechaDesde: new Date(fechaDesde),
        fechaHasta: new Date(fechaHasta + 'T23:59:59'),
      });
      
      setResumenConsolidado(resumen);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatEuro = (cantidad: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(cantidad);
  };

  const formatNumero = (num: number): string => {
    return new Intl.NumberFormat('es-ES').format(num);
  };

  if (!resumenConsolidado) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  const { resumenGeneral, porEmpresa, porMarca, porPDV, topProductos } = resumenConsolidado;

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes Multiempresa</h2>
          <p className="text-gray-500">
            Análisis consolidado de ventas por empresa, marca y punto de venta
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => descargarResumenCSV(resumenGeneral, 'reporte-consolidado.csv')}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium">Desde:</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-1 border rounded"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Hasta:</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-1 border rounded"
              />
            </div>
            
            <Button onClick={cargarDatos} size="sm">
              Aplicar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ventas Totales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ventas Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatEuro(resumenGeneral.ventasTotales)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {resumenGeneral.numeroPedidos} pedidos
            </p>
          </CardContent>
        </Card>

        {/* Ticket Medio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Ticket Medio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEuro(resumenGeneral.ticketMedio)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        {/* Total IVA */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              IVA Recaudado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatEuro(resumenGeneral.totalIVA)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Base: {formatEuro(resumenGeneral.subtotalSinIVA)}
            </p>
          </CardContent>
        </Card>

        {/* Descuentos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Descuentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatEuro(resumenGeneral.totalDescuentos)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Aplicados en el periodo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ⭐ NUEVO: KPIs de EBITDA */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Ventas */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">
              Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-700">
              {formatEuro(resumenGeneral.ventasTotales)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Ingresos totales
            </p>
          </CardContent>
        </Card>

        {/* Coste de Ventas */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700">
              Coste Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-700">
              -{formatEuro(resumenGeneral.costeVentas)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Productos vendidos
            </p>
          </CardContent>
        </Card>

        {/* Gastos Operativos */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700">
              Gastos Operativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-700">
              -{formatEuro(resumenGeneral.gastosOperativos)}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Gastos fijos
            </p>
          </CardContent>
        </Card>

        {/* EBITDA */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              EBITDA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              resumenGeneral.ebitda >= 0 ? 'text-blue-700' : 'text-red-700'
            }`}>
              {formatEuro(resumenGeneral.ebitda)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Margen: {resumenGeneral.margenPorcentaje.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Margen Bruto */}
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-teal-700">
              Margen Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-teal-700">
              {formatEuro(resumenGeneral.margenBruto)}
            </div>
            <p className="text-xs text-teal-600 mt-1">
              {((resumenGeneral.margenBruto / resumenGeneral.ventasTotales) * 100).toFixed(1)}% de ventas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navegación de vistas */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setVistaActual('consolidado')}
          className={`px-4 py-2 font-medium ${
            vistaActual === 'consolidado'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Vista Consolidada
        </button>
        <button
          onClick={() => setVistaActual('empresas')}
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            vistaActual === 'empresas'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Por Empresa
        </button>
        <button
          onClick={() => setVistaActual('marcas')}
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            vistaActual === 'marcas'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Store className="w-4 h-4" />
          Por Marca
        </button>
        <button
          onClick={() => setVistaActual('pdvs')}
          className={`px-4 py-2 font-medium flex items-center gap-2 ${
            vistaActual === 'pdvs'
              ? 'border-b-2 border-teal-600 text-teal-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Por PDV
        </button>
      </div>

      {/* Contenido según vista */}
      {vistaActual === 'consolidado' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Métodos de pago */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💳 Tarjeta</span>
                  <span className="font-semibold">{formatEuro(resumenGeneral.ventasTarjeta)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💵 Efectivo</span>
                  <span className="font-semibold">{formatEuro(resumenGeneral.ventasEfectivo)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">📱 Bizum</span>
                  <span className="font-semibold">{formatEuro(resumenGeneral.ventasBizum)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">🏦 Transferencia</span>
                  <span className="font-semibold">{formatEuro(resumenGeneral.ventasTransferencia)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estados de pedidos */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">✅ Entregados</span>
                  <span className="font-semibold text-green-600">
                    {resumenGeneral.pedidosEntregados}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">💰 Pagados</span>
                  <span className="font-semibold text-blue-600">
                    {resumenGeneral.pedidosPagados}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">⏳ Pendientes</span>
                  <span className="font-semibold text-orange-600">
                    {resumenGeneral.pedidosPendientes}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">❌ Cancelados</span>
                  <span className="font-semibold text-red-600">
                    {resumenGeneral.pedidosCancelados}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top productos */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">#</th>
                      <th className="text-left py-2">Producto</th>
                      <th className="text-right py-2">Cantidad</th>
                      <th className="text-right py-2">Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProductos.map((producto, index) => (
                      <tr key={producto.productoId} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          <span className="text-gray-500">{index + 1}</span>
                        </td>
                        <td className="py-2 font-medium">{producto.nombre}</td>
                        <td className="text-right py-2">
                          {formatNumero(producto.cantidadVendida)}
                        </td>
                        <td className="text-right py-2 font-semibold text-green-600">
                          {formatEuro(producto.totalVentas)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {vistaActual === 'empresas' && (
        <TablaResumenes
          resumenes={porEmpresa}
          titulo="Ventas por Empresa"
          icono={<Building2 className="w-5 h-5" />}
          formatEuro={formatEuro}
        />
      )}

      {vistaActual === 'marcas' && (
        <TablaResumenes
          resumenes={porMarca}
          titulo="Ventas por Marca"
          icono={<Store className="w-5 h-5" />}
          formatEuro={formatEuro}
        />
      )}

      {vistaActual === 'pdvs' && (
        <TablaResumenes
          resumenes={porPDV}
          titulo="Ventas por Punto de Venta"
          icono={<MapPin className="w-5 h-5" />}
          formatEuro={formatEuro}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE AUXILIAR: TABLA DE RESÚMENES
// ============================================================================

interface TablaResumenesProps {
  resumenes: ResumenVentas[];
  titulo: string;
  icono: React.ReactNode;
  formatEuro: (num: number) => string;
}

function TablaResumenes({ resumenes, titulo, icono, formatEuro }: TablaResumenesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icono}
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-2">Nombre</th>
                <th className="text-right py-3 px-2">Ventas</th>
                <th className="text-right py-3 px-2">Pedidos</th>
                <th className="text-right py-3 px-2">Ticket</th>
                <th className="text-right py-3 px-2 text-red-700">Coste</th>
                <th className="text-right py-3 px-2 text-orange-700">Gastos</th>
                <th className="text-right py-3 px-2 text-blue-700">EBITDA</th>
                <th className="text-right py-3 px-2 text-blue-700">Margen %</th>
              </tr>
            </thead>
            <tbody>
              {resumenes.map((resumen, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">
                    {resumen.empresaNombre || resumen.marcaNombre || resumen.puntoVentaNombre}
                  </td>
                  <td className="text-right py-3 px-2 font-semibold text-green-600">
                    {formatEuro(resumen.ventasTotales)}
                  </td>
                  <td className="text-right py-3 px-2">
                    {resumen.numeroPedidos}
                  </td>
                  <td className="text-right py-3 px-2">
                    {formatEuro(resumen.ticketMedio)}
                  </td>
                  <td className="text-right py-3 px-2 text-red-600">
                    -{formatEuro(resumen.costeVentas)}
                  </td>
                  <td className="text-right py-3 px-2 text-orange-600">
                    -{formatEuro(resumen.gastosOperativos)}
                  </td>
                  <td className={`text-right py-3 px-2 font-bold ${
                    resumen.ebitda >= 0 ? 'text-blue-700' : 'text-red-700'
                  }`}>
                    {formatEuro(resumen.ebitda)}
                  </td>
                  <td className={`text-right py-3 px-2 font-semibold ${
                    resumen.margenPorcentaje >= 15 ? 'text-green-600' : 
                    resumen.margenPorcentaje >= 5 ? 'text-orange-600' : 
                    'text-red-600'
                  }`}>
                    {resumen.margenPorcentaje.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 font-bold bg-gray-50">
                <td className="py-3 px-2">TOTAL</td>
                <td className="text-right py-3 px-2 text-green-600">
                  {formatEuro(resumenes.reduce((sum, r) => sum + r.ventasTotales, 0))}
                </td>
                <td className="text-right py-3 px-2">
                  {resumenes.reduce((sum, r) => sum + r.numeroPedidos, 0)}
                </td>
                <td className="text-right py-3 px-2">-</td>
                <td className="text-right py-3 px-2 text-red-600">
                  -{formatEuro(resumenes.reduce((sum, r) => sum + r.costeVentas, 0))}
                </td>
                <td className="text-right py-3 px-2 text-orange-600">
                  -{formatEuro(resumenes.reduce((sum, r) => sum + r.gastosOperativos, 0))}
                </td>
                <td className="text-right py-3 px-2 text-blue-700">
                  {formatEuro(resumenes.reduce((sum, r) => sum + r.ebitda, 0))}
                </td>
                <td className="text-right py-3 px-2 text-blue-700">
                  {(() => {
                    const totalVentas = resumenes.reduce((sum, r) => sum + r.ventasTotales, 0);
                    const totalEbitda = resumenes.reduce((sum, r) => sum + r.ebitda, 0);
                    return totalVentas > 0 ? ((totalEbitda / totalVentas) * 100).toFixed(1) : '0.0';
                  })()}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
