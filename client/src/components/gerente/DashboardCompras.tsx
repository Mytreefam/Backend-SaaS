import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Truck,
  Star,
  BarChart3
} from 'lucide-react';
import { pedidosProveedores } from '../../data/pedidos-proveedores';
import { proveedores } from '../../data/proveedores';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardCompras() {
  const [periodo, setPeriodo] = useState('mes');

  // Calcular métricas
  const metricas = useMemo(() => {
    const pedidosActivos = pedidosProveedores.filter(
      p => p.estado === 'pendiente' || p.estado === 'confirmado' || p.estado === 'parcial'
    );
    const pedidosCompletados = pedidosProveedores.filter(p => p.estado === 'completado');
    const pedidosRetrasados = pedidosProveedores.filter(p => {
      if (p.estado === 'completado' || p.estado === 'cancelado') return false;
      const hoy = new Date();
      const fechaEsperada = new Date(p.fechaEsperada);
      return fechaEsperada < hoy;
    });

    const gastoTotal = pedidosCompletados.reduce((sum, p) => sum + p.total, 0);
    const gastoMesAnterior = gastoTotal * 0.85; // Mock
    const variacionGasto = ((gastoTotal - gastoMesAnterior) / gastoMesAnterior) * 100;

    const valorPendiente = pedidosActivos.reduce((sum, p) => sum + p.total, 0);

    // Calcular tiempo promedio de entrega
    const tiemposEntrega = pedidosCompletados
      .filter(p => p.fechaRecepcion)
      .map(p => {
        const fechaPedido = new Date(p.fechaPedido);
        const fechaRecepcion = new Date(p.fechaRecepcion!);
        return Math.ceil((fechaRecepcion.getTime() - fechaPedido.getTime()) / (1000 * 60 * 60 * 24));
      });
    const tiempoPromedioEntrega = tiemposEntrega.length > 0
      ? tiemposEntrega.reduce((sum, t) => sum + t, 0) / tiemposEntrega.length
      : 0;

    // Calcular tasa de cumplimiento
    const totalLineas = pedidosCompletados.reduce((sum, p) => sum + p.lineas.length, 0);
    const lineasCompletas = pedidosCompletados.reduce((sum, p) => {
      return sum + p.lineas.filter(l => l.cantidadRecibida && l.cantidadRecibida >= l.cantidad).length;
    }, 0);
    const tasaCumplimiento = totalLineas > 0 ? (lineasCompletas / totalLineas) * 100 : 0;

    return {
      gastoTotal,
      variacionGasto,
      pedidosActivos: pedidosActivos.length,
      valorPendiente,
      pedidosCompletados: pedidosCompletados.length,
      pedidosRetrasados: pedidosRetrasados.length,
      tiempoPromedioEntrega: tiempoPromedioEntrega.toFixed(1),
      tasaCumplimiento: tasaCumplimiento.toFixed(1)
    };
  }, []);

  // Datos para gráfica de gastos por mes
  const datosGastosMensuales = [
    { mes: 'Jun', gasto: 2840, pedidos: 8 },
    { mes: 'Jul', gasto: 3120, pedidos: 10 },
    { mes: 'Ago', gasto: 2950, pedidos: 9 },
    { mes: 'Sep', gasto: 3450, pedidos: 12 },
    { mes: 'Oct', gasto: 3280, pedidos: 11 },
    { mes: 'Nov', gasto: 3890, pedidos: 14 }
  ];

  // Top 5 proveedores por volumen
  const topProveedores = useMemo(() => {
    const gastoPorProveedor = pedidosProveedores.reduce((acc, pedido) => {
      if (pedido.estado === 'completado') {
        if (!acc[pedido.proveedorId]) {
          acc[pedido.proveedorId] = {
            id: pedido.proveedorId,
            nombre: pedido.proveedorNombre,
            gasto: 0,
            pedidos: 0
          };
        }
        acc[pedido.proveedorId].gasto += pedido.total;
        acc[pedido.proveedorId].pedidos += 1;
      }
      return acc;
    }, {} as Record<string, { id: string; nombre: string; gasto: number; pedidos: number }>);

    return Object.values(gastoPorProveedor)
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 5);
  }, []);

  // Distribución de categorías
  const datosCategor ias = [
    { nombre: 'Harinas', valor: 1250, color: '#0ea5e9' },
    { nombre: 'Lácteos', valor: 890, color: '#8b5cf6' },
    { nombre: 'Frutas', valor: 620, color: '#f59e0b' },
    { nombre: 'Carnes', valor: 780, color: '#ef4444' },
    { nombre: 'Bebidas', valor: 350, color: '#10b981' }
  ];

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Dashboard de Compras
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Métricas y análisis de tus compras a proveedores
          </p>
        </div>
        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Última semana</SelectItem>
            <SelectItem value="mes">Último mes</SelectItem>
            <SelectItem value="trimestre">Último trimestre</SelectItem>
            <SelectItem value="año">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-blue-700 mb-1">Gasto Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatearMoneda(metricas.gastoTotal)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {metricas.variacionGasto >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-semibold ${
                metricas.variacionGasto >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metricas.variacionGasto >= 0 ? '+' : ''}{metricas.variacionGasto.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-600 ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-purple-700 mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-purple-900">
                  {metricas.pedidosActivos}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-xs text-purple-700">
              Valor: {formatearMoneda(metricas.valorPendiente)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-green-700 mb-1">Tasa Cumplimiento</p>
                <p className="text-2xl font-bold text-green-900">
                  {metricas.tasaCumplimiento}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-xs text-green-700">
              {metricas.pedidosCompletados} pedidos completos
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-amber-700 mb-1">Tiempo Entrega</p>
                <p className="text-2xl font-bold text-amber-900">
                  {metricas.tiempoPromedioEntrega}d
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="text-xs text-amber-700">
              Promedio de entrega
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {metricas.pedidosRetrasados > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  {metricas.pedidosRetrasados} pedido{metricas.pedidosRetrasados !== 1 ? 's' : ''} retrasado{metricas.pedidosRetrasados !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-700">
                  Algunos pedidos han superado su fecha de entrega esperada. Revisa el estado con los proveedores.
                </p>
              </div>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                Ver Pedidos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Evolución de Gastos */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              Evolución de Gastos
            </CardTitle>
            <CardDescription>Gasto mensual en compras a proveedores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={datosGastosMensuales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                  formatter={(value: number) => formatearMoneda(value)}
                />
                <Bar dataKey="gasto" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Categoría */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              Distribución por Categoría
            </CardTitle>
            <CardDescription>Gasto por tipo de producto</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={datosCategorias}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.nombre} (${formatearMoneda(entry.valor)})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {datosCategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatearMoneda(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Proveedores */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-teal-600" />
            Top 5 Proveedores
          </CardTitle>
          <CardDescription>
            Proveedores con mayor volumen de compra este período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProveedores.map((prov, index) => {
              const proveedor = proveedores.find(p => p.id === prov.id);
              const maxGasto = topProveedores[0].gasto;
              const porcentaje = (prov.gasto / maxGasto) * 100;

              return (
                <div key={prov.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-teal-700">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{prov.nombre}</p>
                        <p className="text-xs text-gray-600">{prov.pedidos} pedido{prov.pedidos !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatearMoneda(prov.gasto)}</p>
                      {proveedor && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600">
                            {proveedor.evaluacion.puntuacionGeneral}/5
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Pendientes de Recibir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metricas.pedidosActivos}
            </p>
            <p className="text-sm text-gray-600">
              Valor total: {formatearMoneda(metricas.valorPendiente)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metricas.pedidosCompletados}
            </p>
            <p className="text-sm text-gray-600">
              Este {periodo === 'mes' ? 'mes' : 'período'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Retrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {metricas.pedidosRetrasados}
            </p>
            <p className="text-sm text-gray-600">
              Requieren seguimiento
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
