/**
 * 📊 EBITDA INTERACTIVO - Dashboard Gerente
 * 
 * Sistema EBITDA mejorado con:
 * - Gráficas interactivas
 * - Comparativas temporales
 * - Tooltips informativos
 * - Exportación avanzada
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { StatsCard } from '../ui/stats-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  FileSpreadsheet,
  Target,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { ebitdaApi } from '../../services/api';

type DatosEbitdaUi = {
  mesActual: {
    ingresos: number;
    costesDirectos: number;
    margenBruto: number;
    gastosOperativos: number;
    ebitda: number;
    ebitdaMargen: number;
  };
  mesAnterior: {
    ingresos: number;
    costesDirectos: number;
    margenBruto: number;
    gastosOperativos: number;
    ebitda: number;
    ebitdaMargen: number;
  };
  historico: { mes: string; ingresos: number; costes: number; ebitda: number; margen: number }[];
  desglose: {
    costesDirectos: { concepto: string; valor: number; pct: number }[];
    gastosOperativos: { concepto: string; valor: number; pct: number }[];
  };
};

const emptyDatos: DatosEbitdaUi = {
  mesActual: { ingresos: 0, costesDirectos: 0, margenBruto: 0, gastosOperativos: 0, ebitda: 0, ebitdaMargen: 0 },
  mesAnterior: { ingresos: 0, costesDirectos: 0, margenBruto: 0, gastosOperativos: 0, ebitda: 0, ebitdaMargen: 0 },
  historico: [],
  desglose: { costesDirectos: [], gastosOperativos: [] },
};

export function EBITDAInteractivo() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'mes' | 'trimestre' | 'año'>('mes');
  const [vistaActiva, setVistaActiva] = useState<'resumen' | 'tendencia' | 'desglose'>('resumen');
  const [_cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState<DatosEbitdaUi>(emptyDatos);

  // Cargar datos desde API
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const año = hoy.getFullYear();
        const prevDate = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        const prevMes = prevDate.getMonth() + 1;
        const prevAño = prevDate.getFullYear();

        const [cuentaActual, ebitdaActual, ebitdaAnterior, historico] = await Promise.all([
          ebitdaApi.getCuentaResultados(),
          ebitdaApi.getEBITDA({ mes, año }),
          ebitdaApi.getEBITDA({ mes: prevMes, año: prevAño }),
          ebitdaApi.getHistoricoEBITDA({ meses: 6 }),
        ]);

        const cuenta = cuentaActual;

        const desgloseCostes = cuenta?.desglose?.costes || [];
        const desgloseGastos = cuenta?.desglose?.gastos || [];
        const totalCostes = desgloseCostes.reduce((s, x) => s + (Number(x.importe) || 0), 0);
        const totalGastos = desgloseGastos.reduce((s, x) => s + (Number(x.importe) || 0), 0);

        setDatos({
          mesActual: {
            ingresos: Number(cuenta?.ingresosNetos || ebitdaActual.ingresos || 0),
            costesDirectos: Number(cuenta?.costeVentas || 0),
            margenBruto: Number(cuenta?.margenBruto || 0),
            gastosOperativos: Number(cuenta?.gastosOperativos || 0),
            ebitda: Number(cuenta?.ebitda || ebitdaActual.ebitda || 0),
            ebitdaMargen: Number(cuenta?.margenEbitda || ebitdaActual.margen || 0),
          },
          mesAnterior: {
            ingresos: Number(ebitdaAnterior.ingresos || 0),
            costesDirectos: 0,
            margenBruto: 0,
            gastosOperativos: 0,
            ebitda: Number(ebitdaAnterior.ebitda || 0),
            ebitdaMargen: Number(ebitdaAnterior.margen || 0),
          },
          historico: (historico || []).map((h) => ({
            mes: h.mes,
            ingresos: 0,
            costes: 0,
            ebitda: Number(h.ebitda || 0),
            margen: Number(h.margen || 0),
          })),
          desglose: {
            costesDirectos: desgloseCostes.map((c) => ({
              concepto: c.concepto,
              valor: Number(c.importe || 0),
              pct: totalCostes > 0 ? (Number(c.importe || 0) / totalCostes) * 100 : 0,
            })),
            gastosOperativos: desgloseGastos.map((g) => ({
              concepto: g.concepto,
              valor: Number(g.importe || 0),
              pct: totalGastos > 0 ? (Number(g.importe || 0) / totalGastos) * 100 : 0,
            })),
          },
        });
      } catch (error) {
        console.warn('Error cargando EBITDA desde API:', error);
        toast.error('No se pudo cargar EBITDA desde el backend');
        setDatos(emptyDatos);
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, [periodoSeleccionado]);

  const { mesActual, mesAnterior, historico, desglose } = datos;

  // Cálculos de variación
  const variacionIngresos = ((mesActual.ingresos - mesAnterior.ingresos) / mesAnterior.ingresos) * 100;
  const variacionEBITDA = ((mesActual.ebitda - mesAnterior.ebitda) / mesAnterior.ebitda) * 100;
  const variacionMargen = mesActual.ebitdaMargen - mesAnterior.ebitdaMargen;

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: €{entry.value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExportar = (formato: 'pdf' | 'excel') => {
    toast.success(`Exportando EBITDA en formato ${formato.toUpperCase()}...`, {
      description: 'La descarga comenzará en unos segundos'
    });
    // Aquí iría la lógica de exportación real
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
            EBITDA Interactivo
          </h2>
          <p className="text-gray-600 text-sm">
            Análisis de rentabilidad operativa con comparativas
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={periodoSeleccionado} onValueChange={(v: any) => setPeriodoSeleccionado(v)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="año">Año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => handleExportar('excel')}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleExportar('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ingresos Totales"
          value={`€${mesActual.ingresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend={{
            value: variacionIngresos,
            label: 'vs mes anterior'
          }}
          variant="gradient"
          iconColor="#4DB8BA"
        />

        <StatsCard
          title="Margen Bruto"
          value={`€${mesActual.margenBruto.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend={{
            value: ((mesActual.margenBruto - mesAnterior.margenBruto) / mesAnterior.margenBruto) * 100,
            label: 'vs mes anterior'
          }}
          variant="gradient"
          iconColor="#10B981"
        />

        <StatsCard
          title="EBITDA"
          value={`€${mesActual.ebitda.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
          icon={Activity}
          trend={{
            value: variacionEBITDA,
            label: 'vs mes anterior'
          }}
          variant="gradient"
          iconColor="#3B82F6"
        />

        <StatsCard
          title="Margen EBITDA"
          value={`${mesActual.ebitdaMargen.toFixed(1)}%`}
          icon={Target}
          trend={{
            value: variacionMargen,
            label: 'puntos vs mes anterior'
          }}
          variant="gradient"
          iconColor="#A855F7"
        />
      </div>

      {/* Tabs de Vistas */}
      <Tabs value={vistaActiva} onValueChange={(v: any) => setVistaActiva(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="tendencia">Tendencia</TabsTrigger>
          <TabsTrigger value="desglose">Desglose</TabsTrigger>
        </TabsList>

        {/* Vista Resumen */}
        <TabsContent value="resumen" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual</CardTitle>
              <CardDescription>Últimos 5 meses - Ingresos vs EBITDA</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={historico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="ingresos" 
                    fill="#4DB8BA" 
                    name="Ingresos"
                    radius={[8, 8, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ebitda" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="EBITDA"
                    dot={{ fill: '#3B82F6', r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparativa Mes Actual vs Anterior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mes Actual</CardTitle>
                <CardDescription>Noviembre 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ingresos</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    €{mesActual.ingresos.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Costes Directos</span>
                  <span className="font-semibold text-red-700 dark:text-red-400">
                    €{mesActual.costesDirectos.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Margen Bruto</span>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">
                    €{mesActual.margenBruto.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Gastos Operativos</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">
                    €{mesActual.gastosOperativos.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-2 border-teal-200">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">EBITDA</span>
                  <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                    €{mesActual.ebitda.toLocaleString('es-ES')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mes Anterior</CardTitle>
                <CardDescription>Octubre 2025</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ingresos</span>
                  <span className="font-semibold">
                    €{mesAnterior.ingresos.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Costes Directos</span>
                  <span className="font-semibold">
                    €{mesAnterior.costesDirectos.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Margen Bruto</span>
                  <span className="font-semibold">
                    €{mesAnterior.margenBruto.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Gastos Operativos</span>
                  <span className="font-semibold">
                    €{mesAnterior.gastosOperativos.toLocaleString('es-ES')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">EBITDA</span>
                  <span className="text-lg font-bold">
                    €{mesAnterior.ebitda.toLocaleString('es-ES')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vista Tendencia */}
        <TabsContent value="tendencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Margen EBITDA - Evolución</CardTitle>
              <CardDescription>Tendencia de rentabilidad operativa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={historico}>
                  <defs>
                    <linearGradient id="colorMargen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4DB8BA" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4DB8BA" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="margen" 
                    stroke="#4DB8BA" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorMargen)"
                    name="Margen %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista Desglose */}
        <TabsContent value="desglose" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Costes Directos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Costes Directos</CardTitle>
                <CardDescription>
                  Total: €{mesActual.costesDirectos.toLocaleString('es-ES')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {desglose.costesDirectos.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.concepto}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.pct.toFixed(1)}%
                          </Badge>
                          <span className="text-sm font-semibold">
                            €{item.valor.toLocaleString('es-ES')}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gastos Operativos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gastos Operativos</CardTitle>
                <CardDescription>
                  Total: €{mesActual.gastosOperativos.toLocaleString('es-ES')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {desglose.gastosOperativos.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item.concepto}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.pct.toFixed(1)}%
                          </Badge>
                          <span className="text-sm font-semibold">
                            €{item.valor.toLocaleString('es-ES')}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
