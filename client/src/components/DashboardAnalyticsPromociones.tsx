import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Percent,
  Tag,
  Clock,
  Award,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  metricasPromociones,
  tendenciaTemporal,
  analisisHorario,
  analisisPorSegmento,
  comparativaPromociones,
  obtenerTopPromociones,
  obtenerPromocionesROIPositivo,
  obtenerPromocionesROINegativo,
  calcularPromedios,
  calcularTotales,
  obtenerMejorHorario,
  obtenerMejorSegmento,
  calcularCrecimiento,
  type MetricaPromocion
} from '../data/analytics-promociones';

export default function DashboardAnalyticsPromociones() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>('14d');
  const [promocionSeleccionada, setPromocionSeleccionada] = useState<string>('todas');

  const promedios = calcularPromedios();
  const totales = calcularTotales();
  const mejorHorario = obtenerMejorHorario();
  const mejorSegmento = obtenerMejorSegmento();
  const crecimiento = calcularCrecimiento();
  const topPromociones = obtenerTopPromociones(5);
  const promocionesROIPositivo = obtenerPromocionesROIPositivo();
  const promocionesROINegativo = obtenerPromocionesROINegativo();

  // Colores para gráficas
  const COLORS = {
    primary: '#14b8a6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    purple: '#a855f7',
    pink: '#ec4899'
  };

  const CHART_COLORS = [
    COLORS.primary,
    COLORS.success,
    COLORS.info,
    COLORS.warning,
    COLORS.purple
  ];

  // Formatear números
  const formatCurrency = (value: number) => `${value.toFixed(2)}€`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString('es-ES');

  // Custom Tooltip para gráficas
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('%') ? formatPercent(entry.value) : 
                            entry.name.includes('€') ? formatCurrency(entry.value) : 
                            formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            Analytics de Promociones
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Análisis completo del rendimiento de tus promociones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="14d">Últimos 14 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <p className="font-medium mt-1">{formatCurrency(totales.ventasTotales)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {crecimiento >= 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-red-600" />
                  )}
                  <span className={`text-xs ${crecimiento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(Math.abs(crecimiento))}
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-teal-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ROI Promedio</p>
                <p className="font-medium mt-1">{formatPercent(promedios.roiPromedio)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-gray-600">
                    {promocionesROIPositivo.length} positivas
                  </span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa Conversión</p>
                <p className="font-medium mt-1">{formatPercent(promedios.conversionPromedio)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-gray-600">
                    {formatNumber(totales.usosTotales)} conversiones
                  </span>
                </div>
              </div>
              <Percent className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Margen Promedio</p>
                <p className="font-medium mt-1">{formatPercent(promedios.margenPromedio)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Award className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-gray-600">
                    {formatCurrency(totales.margenTotal)} bruto
                  </span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-teal-900">Mejor Horario</p>
                <p className="text-xs text-teal-700 mt-1">
                  {mejorHorario.horaLabel} con {mejorHorario.usos} usos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Mejor Segmento</p>
                <p className="text-xs text-blue-700 mt-1">
                  {mejorSegmento.segmento} - {formatCurrency(mejorSegmento.ventasPromedio)} promedio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Top Promoción</p>
                <p className="text-xs text-green-700 mt-1">
                  {topPromociones[0].promocionNombre}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análisis */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="comparativa">Comparativa</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
          <TabsTrigger value="segmentos">Segmentos</TabsTrigger>
        </TabsList>

        {/* Tab General */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ranking de Promociones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600" />
                  Top 5 Promociones por Ventas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPromociones.map((promo, index) => (
                    <div key={promo.promocionId} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{promo.promocionNombre}</p>
                        <p className="text-xs text-gray-500">{promo.vecesUsada} usos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(promo.ventasTotales)}</p>
                        <p className={`text-xs ${promo.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ROI: {formatPercent(promo.roi)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribución por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-600" />
                  Ventas por Tipo de Promoción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={comparativaPromociones}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nombre, ventas }) => `${nombre.split(' ')[0]}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="ventas"
                    >
                      {comparativaPromociones.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalladas */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas Detalladas por Promoción</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm font-medium">Promoción</th>
                      <th className="text-right py-2 px-2 text-sm font-medium">Usos</th>
                      <th className="text-right py-2 px-2 text-sm font-medium">Ventas</th>
                      <th className="text-right py-2 px-2 text-sm font-medium">Descuentos</th>
                      <th className="text-right py-2 px-2 text-sm font-medium">ROI</th>
                      <th className="text-right py-2 px-2 text-sm font-medium">Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricasPromociones.map((promo) => (
                      <tr key={promo.promocionId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-sm">{promo.promocionNombre}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {promo.tipo}
                            </Badge>
                          </div>
                        </td>
                        <td className="text-right py-3 px-2 text-sm">{formatNumber(promo.vecesUsada)}</td>
                        <td className="text-right py-3 px-2 text-sm font-medium">
                          {formatCurrency(promo.ventasTotales)}
                        </td>
                        <td className="text-right py-3 px-2 text-sm text-orange-600">
                          -{formatCurrency(promo.descuentoOtorgado)}
                        </td>
                        <td className={`text-right py-3 px-2 text-sm font-medium ${
                          promo.roi >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercent(promo.roi)}
                        </td>
                        <td className="text-right py-3 px-2 text-sm">
                          {formatPercent(promo.tasaConversion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Comparativa */}
        <TabsContent value="comparativa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de ROI</CardTitle>
              <CardDescription>
                Retorno de inversión por promoción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparativaPromociones}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nombre" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="roi" name="ROI %" fill={COLORS.primary}>
                    {comparativaPromociones.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.roi >= 0 ? COLORS.success : COLORS.danger} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Ventas vs Descuentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricasPromociones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="promocionNombre" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="ventasTotales" name="Ventas €" fill={COLORS.primary} />
                    <Bar dataKey="descuentoOtorgado" name="Descuentos €" fill={COLORS.warning} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasa de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparativaPromociones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="nombre" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="conversion" name="Conversión %" fill={COLORS.info} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Tendencias */}
        <TabsContent value="tendencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ventas (Últimos 15 días)</CardTitle>
              <CardDescription>
                Evolución de ventas, descuentos y márgenes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={tendenciaTemporal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    name="Ventas €" 
                    stackId="1"
                    stroke={COLORS.primary} 
                    fill={COLORS.primary}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="margen" 
                    name="Margen €" 
                    stackId="2"
                    stroke={COLORS.success} 
                    fill={COLORS.success}
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="descuentos" 
                    name="Descuentos €" 
                    stackId="3"
                    stroke={COLORS.warning} 
                    fill={COLORS.warning}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uso de Promociones por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tendenciaTemporal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="usos" 
                    name="Usos" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Horarios */}
        <TabsContent value="horarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Franja Horaria</CardTitle>
              <CardDescription>
                Usos de promociones según la hora del día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analisisHorario}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="horaLabel" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="usos" name="Usos" fill={COLORS.primary} />
                  <Bar yAxisId="right" dataKey="ventas" name="Ventas €" fill={COLORS.success} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Heatmap de Conversión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analisisHorario.map((hora) => {
                    const intensidad = Math.min(100, (hora.conversion / 25) * 100);
                    return (
                      <div key={hora.hora} className="flex items-center gap-3">
                        <span className="text-sm font-medium w-16">{hora.horaLabel}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all"
                            style={{ width: `${intensidad}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                            {formatPercent(hora.conversion)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">{hora.usos} usos</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mejor Horario por Métrica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <p className="font-medium text-teal-900">Más Usos</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-600">{mejorHorario.horaLabel}</p>
                  <p className="text-sm text-teal-700 mt-1">
                    {mejorHorario.usos} usos totales
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <p className="font-medium text-green-900">Más Ventas</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {analisisHorario.reduce((max, h) => h.ventas > max.ventas ? h : max).horaLabel}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {formatCurrency(Math.max(...analisisHorario.map(h => h.ventas)))} en ventas
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <p className="font-medium text-blue-900">Mayor Conversión</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {analisisHorario.reduce((max, h) => h.conversion > max.conversion ? h : max).horaLabel}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {formatPercent(Math.max(...analisisHorario.map(h => h.conversion)))} de conversión
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Segmentos */}
        <TabsContent value="segmentos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Segmento de Cliente</CardTitle>
              <CardDescription>
                Análisis de uso y ventas por tipo de cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analisisPorSegmento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segmento" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="usos" name="Usos" fill={COLORS.primary} />
                  <Bar yAxisId="right" dataKey="ventasPromedio" name="Venta Promedio €" fill={COLORS.success} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasa de Retención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisisPorSegmento.map((segmento) => (
                    <div key={segmento.segmento}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{segmento.segmento}</span>
                        <span className="text-sm text-gray-600">
                          {formatPercent(segmento.tasaRetencion)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div 
                          className="bg-teal-600 h-3 rounded-full transition-all"
                          style={{ width: `${segmento.tasaRetencion}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analisisPorSegmento}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segmento, clientes }) => `${segmento}: ${clientes}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="clientes"
                    >
                      {analisisPorSegmento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
