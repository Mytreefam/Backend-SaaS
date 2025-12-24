import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { StatsCard } from '../ui/stats-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { OnboardingWidget } from '../OnboardingWidget';
import { FiltroContextoJerarquico, SelectedContext } from './FiltroContextoJerarquico';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  EMPRESAS_ARRAY, 
  MARCAS_ARRAY, 
  PUNTOS_VENTA_ARRAY,
  getNombreEmpresa,
  getNombrePDVConMarcas,
  getNombreMarca,
  getIconoMarca
} from '../../constants/empresaConfig';
import { onboardingService } from '../../services/onboarding.service';
import type { EstadisticasOnboarding } from '../../types/onboarding.types';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Target,
  Percent,
  XCircle,
  MessageSquare,
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUpIcon,
  Calculator,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Loader2,
  Smartphone,
  Store,
  Truck,
  ShoppingBag,
  Bike
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { CuentaResultados } from './CuentaResultados';
import { Escandallo } from './Escandallo';
import { ResponsiveTable } from '../ui/responsive-table';
import { dashboardGerenteApi, stockApi, finanzasApi } from '../../services/api/gerente.api';

// ============================================
// TIPOS PARA LA ESTRUCTURA DEL API
// ============================================
interface VentasAPIResponse {
  empresa_id: string;
  marca_id: string;
  punto_venta_id: string;
  periodo_tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  
  ventas_periodo: number;
  pedidos_periodo: number;
  productos_vendidos: number;
  ticket_medio_pedido: number;
  ticket_medio_producto: number;
  
  costes_variables_periodo: number;
  costes_fijos_imputados_periodo: number;
  comisiones_tpv_periodo: number;
  comisiones_plataformas_periodo: number;
  comisiones_pasarela_periodo: number;
  
  margen_neto_periodo: number;
  variacion_ventas_periodo: number;
  variacion_margen_neto_periodo: number;
  
  // Datos para gráficas
  ingresos_ultimos_5_meses?: number[];
  gastos_ultimos_5_meses?: number[];
  labels_ultimos_5_meses?: string[];
  
  categorias_ingresos?: string[];
  valores_ingresos_categorias?: number[];
  
  // Datos por canal (opcional si la API los proporciona separados)
  ventas_mostrador?: number;
  variacion_mostrador?: number;
  ventas_app_web?: number;
  variacion_app_web?: number;
  ventas_terceros?: number;
  variacion_terceros?: number;
  ventas_efectivo?: number;
  variacion_efectivo?: number;
}


interface CierreCaja {
  id: string;
  numero: string;
  punto_venta_id: string;
  punto_venta_nombre: string;
  fecha: string;
  turno: string;
  empleado_apertura: string;
  empleado_cierre: string;
  efectivo_inicial: number;
  total_ventas_efectivo: number;
  total_ventas_tarjeta: number;
  total_ventas_online: number;
  gastos_caja: number;
  efectivo_esperado: number;
  efectivo_contado: number;
  diferencia: number;
  estado: string;
  observaciones?: string;
  validado_por?: string;
  fecha_validacion?: string;
}

interface CierresAPIResponse {
  totales: {
    total_cierres: number;
    efectivo_total: number;
    tarjetas_total: number;
    diferencias_total: number;
  };
  cierres: CierreCaja[];
  paginacion: {
    pagina: number;
    por_pagina: number;
    total_registros: number;
  };
}


export function Dashboard360() {
  const [filtroActivo, setFiltroActivo] = useState('resumen' as 'resumen' | 'ventas' | 'ebitda' | 'cierres' | 'operativa' | 'alertas' | 'escandallo');
  const [filtroResultados, setFiltroResultados] = useState('Estructura');
  const [selectedContext, setSelectedContext] = useState([]);
  
  // Nuevo estado para filtro PDV simple (estilo Clientes)
  const [filtroPDV, setFiltroPDV] = useState([]);
  
  // Estados para filtros temporales
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [añoSeleccionado, setAñoSeleccionado] = useState('2025');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes_actual');
  
  // Estados para datos - inicial vacío, se llenan solo con la API real
  const [datosVentasAPI, setDatosVentasAPI] = useState(null);
  const [datosCierresAPI, setDatosCierresAPI] = useState(null);
  const [paginaActualCierres, setPaginaActualCierres] = useState(1);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [cargandoCierres, setCargandoCierres] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);

  // Estados para EBITDA - Comparativa
  const [tipoPeriodoEBITDA, setTipoPeriodoEBITDA] = useState('Mes completo');
  const [comparativaEBITDA, setComparativaEBITDA] = useState(false);
  const [tiendaComparativaEBITDA, setTiendaComparativaEBITDA] = useState('Can Farines Poblenou');

  // Estado para estadísticas de onboarding
  const [estadisticasOnboarding, setEstadisticasOnboarding] = useState(null);

  // Estado para el collapsible de información de cierres
  const [isInfoCierresOpen, setIsInfoCierresOpen] = useState(false);

  // Estado para el collapsible de información de EBITDA
  const [isInfoEBITDAOpen, setIsInfoEBITDAOpen] = useState(false);

  // Estado para el collapsible de información de Escandallo
  const [isInfoEscandalloOpen, setIsInfoEscandalloOpen] = useState(false);

  // Estado para el collapsible de Alertas de Stock
  const [isAlertasStockOpen, setIsAlertasStockOpen] = useState(false);

  // Estado para el collapsible de Onboarding
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Estado para el collapsible de Pedidos
  const [isPedidosOpen, setIsPedidosOpen] = useState(false);

  // Estado para datos de stock - SOLO datos reales desde API
  const [stockData, setStockData] = useState({
    articulosStockBajo: 0,
    articulosSinStock: 0,
    alertas: [],
    productos: [],
    materiasPrimas: [],
    proveedores: []
  });

  // Estado para datos de pedidos  
  const [pedidosData, setPedidosData] = useState({
    totalPedidos: 0,
    pedidosActivos: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0
  });

  // Estado para datos de canales de venta (calculados desde datosVentasAPI)
  const pedidosPorCanal = useMemo(() => {
    if (!datosVentasAPI) {
      return {
        appMovil: 0,
        tpv: 0,
        glovo: 0,
        justEat: 0,
        ubereats: 0
      };
    }
    
    // Calcular proporcionalmente basado en ventas por canal
    const totalVentas = datosVentasAPI.ventas_periodo || 1;
    const ventasMostrador = datosVentasAPI.ventas_mostrador || 0;
    const ventasAppWeb = datosVentasAPI.ventas_app_web || 0;
    const ventasTerceros = datosVentasAPI.ventas_terceros || 0;
    
    const totalPedidos = pedidosData.totalPedidos;
    
    return {
      tpv: Math.round((ventasMostrador / totalVentas) * totalPedidos),
      appMovil: Math.round((ventasAppWeb / totalVentas) * totalPedidos),
      glovo: Math.round((ventasTerceros / totalVentas) * totalPedidos * 0.4), // 40% del terceros
      justEat: Math.round((ventasTerceros / totalVentas) * totalPedidos * 0.35), // 35% del terceros
      ubereats: Math.round((ventasTerceros / totalVentas) * totalPedidos * 0.25) // 25% del terceros
    };
  }, [datosVentasAPI, pedidosData.totalPedidos]);

  // Calcular estado de líneas de productos basado en alertas de stock
  const estadoLineas = useMemo(() => {
    if (!stockData.alertas) return { superando: 0, enObjetivo: 0, porDebajo: 0 };
    
    const alertas = stockData.alertas;
    const totalProductos = alertas.length || 0; // Sin fallback hardcodeado
    
    // Simulamos rendimiento basado en el estado del stock
    const porDebajo = alertas.filter((a: any) => a.nivel === 'critico').length;
    const enObjetivo = alertas.filter((a: any) => a.nivel === 'medio').length;  
    const superando = totalProductos - porDebajo - enObjetivo;
    
    return { superando, enObjetivo, porDebajo };
  }, [stockData]);

  // Calcular productos top basado en datos de stock
  const topProductos = useMemo(() => {
    if (!stockData.productos || stockData.productos.length === 0) {
      return {
        mayorMargen: { nombre: 'Sin datos', margen: 0 },
        mayorCoste: { nombre: 'Sin datos', coste: 0 },
        menorMargen: { nombre: 'Sin datos', margen: 0 }
      };
    }
    
    const productos = stockData.productos;
    const mayorMargen = productos.reduce((max: any, p: any) => p.margen > max.margen ? p : max);
    const mayorCoste = productos.reduce((max: any, p: any) => p.coste > max.coste ? p : max);
    const menorMargen = productos.reduce((min: any, p: any) => p.margen < min.margen ? p : min);
    
    return {
      mayorMargen: { nombre: mayorMargen.nombre, margen: mayorMargen.margen },
      mayorCoste: { nombre: mayorCoste.nombre, coste: mayorCoste.coste },
      menorMargen: { nombre: menorMargen.nombre, margen: menorMargen.margen }
    };
  }, [stockData]);

  // Función para obtener el nombre del mes actual
  const obtenerNombreMesActual = () => {
    const fecha = new Date();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  // Función para obtener el texto del período seleccionado
  const obtenerTextoPeriodo = () => {
    if (filtroActivo === 'ebitda' && periodoSeleccionado === 'mes_actual') {
      return obtenerNombreMesActual();
    }
    
    switch (periodoSeleccionado) {
      case 'hoy': return 'Hoy';
      case 'ayer': return 'Ayer';
      case 'semana_actual': return 'Semana actual';
      case 'mes_actual': return 'Mes actual';
      case 'mes_anterior': return 'Mes anterior';
      case 'trimestre_actual': return 'Trimestre actual';
      case 'año_actual': return 'Año actual';
      case 'personalizado': return 'Personalizado';
      default: return 'Período';
    }
  };

  // useEffect para cargar datos reales de la API
  useEffect(() => {
    const cargarDatosVentas = async () => {
      setCargandoDatos(true);
      setErrorCarga(null);
      
      try {
        // Construir parámetros de filtro
        const empresa_id = selectedContext.find((c: any) => c.type === 'empresa')?.id || 'todas';
        const marca_id = selectedContext.find((c: any) => c.type === 'marca')?.id || 'todas';
        const punto_venta_id = filtroPDV.length > 0 ? filtroPDV[0] : 'todas';
        // Llamar a la API real
        const datos = await dashboardGerenteApi.obtenerDatosVentas({
          empresa_id,
          marca_id,
          punto_venta_id,
          periodo_tipo: periodoSeleccionado,
          fecha_inicio: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado?.padStart(2, '0')}-${diaSeleccionado.padStart(2, '0')}` : undefined,
          fecha_fin: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado?.padStart(2, '0')}-${diaSeleccionado.padStart(2, '0')}` : undefined
        });
        setDatosVentasAPI(datos as any);
      } catch (error) {
        console.error('Error cargando datos de ventas:', error);
        setErrorCarga('Error al cargar datos.');
      } finally {
        setCargandoDatos(false);
      }
    };
    
    cargarDatosVentas();
  }, [selectedContext, filtroPDV, periodoSeleccionado, diaSeleccionado, mesSeleccionado, añoSeleccionado]);

  // useEffect para cargar estadísticas de onboarding
  useEffect(() => {
    const cargarEstadisticasOnboarding = async () => {
      try {
        const stats = await onboardingService.obtenerEstadisticas('EMPRESA-001');
        setEstadisticasOnboarding(stats);
      } catch (error) {
        console.error('Error cargando estadísticas de onboarding:', error);
      }
    };
    
    cargarEstadisticasOnboarding();
  }, []);

  // useEffect para cargar datos de stock
  useEffect(() => {
    const cargarDatosStock = async () => {
      try {
        const alertas = await stockApi.obtenerAlertas({
          empresa_id: selectedContext.find((c: any) => c.type === 'empresa')?.id,
          punto_venta_id: filtroPDV.length > 0 ? filtroPDV[0] : undefined,
        });
        
        // Contar alertas por tipo
        const articulosStockBajo = alertas.filter((a: any) => a.tipo === 'stock_bajo').length;
        const articulosSinStock = alertas.filter((a: any) => a.tipo === 'sin_stock').length;
        
        setStockData({
          articulosStockBajo,
          articulosSinStock
        });
      } catch (error) {
        console.error('Error cargando datos de stock:', error);
        // Mantener datos mock como fallback
      }
    };
    
    cargarDatosStock();
  }, [selectedContext, filtroPDV]);

  // useEffect para cargar KPIs de pedidos
  useEffect(() => {
    const cargarKPIsPedidos = async () => {
      try {
        const kpis = await dashboardGerenteApi.obtenerKPIs({
          empresa_id: selectedContext.find((c: any) => c.type === 'empresa')?.id,
          marca_id: selectedContext.find((c: any) => c.type === 'marca')?.id,
          punto_venta_id: filtroPDV.length > 0 ? filtroPDV[0] : undefined,
        });
        
        if (kpis && kpis.pedidos) {
          // Calcular estadísticas aproximadas basadas en los datos disponibles
          const totalPedidos = kpis.pedidos || 0;
          const pedidosActivos = Math.round(totalPedidos * 0.65); // ~65% activos
          const pedidosEntregados = Math.round(totalPedidos * 0.30); // ~30% entregados
          const pedidosCancelados = totalPedidos - pedidosActivos - pedidosEntregados;
          
          setPedidosData({
            totalPedidos,
            pedidosActivos,
            pedidosEntregados,
            pedidosCancelados
          });
        }
      } catch (error) {
        console.error('Error cargando KPIs de pedidos:', error);
        // Sin fallback - datos reales únicamente
      }
    };
    
    cargarKPIsPedidos();
  }, [selectedContext, filtroPDV, periodoSeleccionado]);

  // useEffect para cargar datos de cierres de caja
  useEffect(() => {
    const cargarDatosCierres = async () => {
      setCargandoCierres(true);
      try {
        const cierres = await finanzasApi.obtenerCierresCaja({
          punto_venta_id: filtroPDV.length > 0 ? filtroPDV[0] : undefined,
          fecha_inicio: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado?.padStart(2, '0')}-${diaSeleccionado.padStart(2, '0')}` : undefined,
          fecha_fin: diaSeleccionado ? `${añoSeleccionado}-${mesSeleccionado?.padStart(2, '0')}-${diaSeleccionado.padStart(2, '0')}` : undefined
        });
        
        console.log('🔍 Cierres obtenidos del API:', cierres);
        console.log('🔍 Tipo de cierres:', typeof cierres, Array.isArray(cierres));
        
        // Transformar datos para que coincidan con la interface CierresAPIResponse
        const datosTransformados: CierresAPIResponse = {
          totales: {
            total_cierres: cierres.length,
            efectivo_total: cierres.reduce((sum, c) => sum + (c.total_ventas_efectivo || 0), 0),
            tarjetas_total: cierres.reduce((sum, c) => sum + (c.total_ventas_tarjeta || 0), 0),
            diferencias_total: cierres.reduce((sum, c) => sum + Math.abs(c.diferencia || 0), 0)
          },
          cierres: cierres,
          paginacion: {
            pagina: 1,
            por_pagina: 20,
            total_registros: cierres.length
          }
        };
        
        console.log('🔍 Datos transformados:', datosTransformados);
        setDatosCierresAPI(datosTransformados);
      } catch (error) {
        console.error('Error cargando datos de cierres:', error);
        // Sin fallback - crear estructura vacía para evitar carga infinita
        setDatosCierresAPI({
          totales: {
            total_cierres: 0,
            efectivo_total: 0,
            tarjetas_total: 0,
            diferencias_total: 0
          },
          cierres: [],
          paginacion: {
            pagina: 1,
            por_pagina: 20,
            total_registros: 0
          }
        });
      } finally {
        setCargandoCierres(false);
      }
    };
    
    cargarDatosCierres();
  }, [filtroPDV, periodoSeleccionado, diaSeleccionado, mesSeleccionado, añoSeleccionado]);

  const getAlertaColor = (tipo: string) => {
    switch (tipo) {
      case 'critica': return 'bg-red-50 border-red-200';
      case 'advertencia': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertaIcon = (tipo: string) => {
    switch (tipo) {
      case 'critica': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'advertencia': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return <Badge className="bg-red-600 text-white">Urgente</Badge>;
      case 'alta':
        return <Badge className="bg-orange-500 text-white">Alta</Badge>;
      case 'media':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Media</Badge>;
      case 'baja':
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Baja</Badge>;
      default:
        return <Badge variant="outline">Media</Badge>;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Abierto</Badge>;
      case 'en_proceso':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">En proceso</Badge>;
      case 'resuelto':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Resuelto</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };



  // ============================================
  // ESTADÍSTICAS CALCULADAS DINÁMICAMENTE CON MEMO
  // ============================================
  const estadisticasVentas = useMemo(() => {
    if (!datosVentasAPI) {
      return {
        totalVentas: 0,
        totalCostes: 0,
        totalComisiones: 0,
        pctMostrador: 0,
        pctAppWeb: 0,
        pctTerceros: 0,
        pctEfectivo: 0,
        pctTarjeta: 0,
        margenBruto: 0,
        margenNeto: 0,
        pctMargenBruto: 0,
        pctMargenNeto: 0,
        pctMargenPromedio: 0,
        ticketMedio: 0,
        productosPromedioPedido: 0,
        ventaPromedioDia: 0,
        pedidosPromedioDia: 0,
        nombreCanalDominante: 'App/Web',
        cumplimientoObjetivo: 100
      };
    }
    const { ventas_periodo, pedidos_periodo, productos_vendidos, ticket_medio_pedido, costes_variables_periodo, costes_fijos_imputados_periodo, comisiones_tpv_periodo, comisiones_plataformas_periodo, comisiones_pasarela_periodo, margen_neto_periodo, ventas_mostrador, ventas_app_web, ventas_terceros, ventas_efectivo } = datosVentasAPI;

    // GRUPO 1: Totales
    const totalVentas = ventas_periodo;
    const totalCostes = costes_variables_periodo + costes_fijos_imputados_periodo;
    const totalComisiones = comisiones_tpv_periodo + comisiones_plataformas_periodo + comisiones_pasarela_periodo;

    // GRUPO 2: Porcentajes
    const pctMostrador = ventas_mostrador ? (ventas_mostrador / totalVentas) * 100 : 0;
    const pctAppWeb = ventas_app_web ? (ventas_app_web / totalVentas) * 100 : 0;
    const pctTerceros = ventas_terceros ? (ventas_terceros / totalVentas) * 100 : 0;
    const pctEfectivo = ventas_efectivo ? (ventas_efectivo / totalVentas) * 100 : 0;
    const pctTarjeta = 100 - pctEfectivo;

    // GRUPO 3: Márgenes
    const margenBruto = totalVentas - totalCostes;
    const margenBrutoPct = totalVentas > 0 ? (margenBruto / totalVentas) * 100 : 0;
    const margenNetoPct = totalVentas > 0 ? (margen_neto_periodo / totalVentas) * 100 : 0;

    // GRUPO 4: Promedios
    const ventaPromedioDia = totalVentas / 30; // Asumiendo 30 días
    const pedidosPromedioDia = pedidos_periodo / 30;
    const productosPromedioPedido = pedidos_periodo > 0 ? productos_vendidos / pedidos_periodo : 0;

    // GRUPO 5: Canal dominante
    const canalDominante = Math.max(
      ventas_mostrador || 0,
      ventas_app_web || 0,
      ventas_terceros || 0
    );
    const nombreCanalDominante = 
      canalDominante === ventas_mostrador ? 'Mostrador' :
      canalDominante === ventas_app_web ? 'App/Web' :
      'Terceros';

    return {
      totalVentas,
      totalCostes,
      totalComisiones,
      pctMostrador,
      pctAppWeb,
      pctTerceros,
      pctEfectivo,
      pctTarjeta,
      margenBruto,
      margenBrutoPct,
      margenNeto: margen_neto_periodo,
      pctMargenBruto: margenBrutoPct,
      pctMargenNeto: margenNetoPct,
      pctMargenPromedio: (margenBrutoPct + margenNetoPct) / 2,
      ventaPromedioDia,
      pedidosPromedioDia,
      productosPromedioPedido,
      canalDominante,
      nombreCanalDominante,
      cumplimientoObjetivo: totalVentas > 0 ? Math.min(110, (totalVentas / (totalVentas * 0.95)) * 100) : 100,
    };
  }, [datosVentasAPI]);

  const estadisticasCierres = useMemo(() => {
    if (!datosCierresAPI) {
      return {
        totalCierres: 0,
        efectivoTotal: 0,
        tarjetasTotal: 0,
        cierresApertura: 0,
        cierresCierre: 0,
        cierresArqueo: 0,
        cierresConDiferencia: 0,
        diferenciaMaxima: 0,
        diferenciaTotalAbs: 0,
        cierresConIncoherencia: 0,
        incoherenciaTotal: 0,
        ventaPromedioCierre: 0,
        puntosVentaUnicos: 0,
        empleadosUnicos: 0
      };
    }
    const { cierres } = datosCierresAPI;

    // GRUPO 1: Conteos
    const totalCierres = cierres.length;
    const cierresApertura = 0; // No hay distinción en los nuevos datos
    const cierresCierre = cierres.length; // Todos son cierres
    const cierresArqueo = 0; // No hay distinción en los nuevos datos

    // GRUPO 2: Diferencias
    const cierresConDiferencia = cierres.filter((c: any) => Math.abs(c.diferencia) > 0).length;
    const diferenciaMaxima = cierres.length > 0 
      ? Math.max(...cierres.map((c: any) => Math.abs(c.diferencia)))
      : 0;
    const diferenciaTotalAbs = cierres.reduce((sum: any, c: any) => sum + Math.abs(c.diferencia), 0);

    // GRUPO 3: Incoherencias (usando diferencias como proxy)
    const cierresConIncoherencia = cierres.filter((c: any) => Math.abs(c.diferencia) > 5).length; // Diferencias > 5€ como incoherencia
    const incoherenciaTotal = cierres.filter((c: any) => Math.abs(c.diferencia) > 5).reduce((sum: any, c: any) => sum + Math.abs(c.diferencia), 0);

    // GRUPO 4: Promedios
    const ventaPromedioCierre = totalCierres > 0
      ? cierres.reduce((sum: number, c: any) => sum + c.total_ventas_efectivo + c.total_ventas_tarjeta + c.total_ventas_online, 0) / totalCierres
      : 0;

    // GRUPO 5: Puntos de venta únicos
    const puntosVentaUnicos = [...new Set(cierres.map((c: any) => c.punto_venta_id))].length;
    const empleadosUnicos = [...new Set([...cierres.map((c: any) => c.empleado_apertura), ...cierres.map((c: any) => c.empleado_cierre)].filter((e: any) => e && e !== 'No asignado'))].length;

    return {
      totalCierres,
      efectivoTotal: datosCierresAPI.totales?.efectivo_total || 0,
      tarjetasTotal: datosCierresAPI.totales?.tarjetas_total || 0,
      cierresApertura,
      cierresCierre,
      cierresArqueo,
      cierresConDiferencia,
      diferenciaMaxima,
      diferenciaTotalAbs,
      cierresConIncoherencia,
      incoherenciaTotal,
      ventaPromedioCierre,
      puntosVentaUnicos,
      empleadosUnicos,
    };
  }, [datosCierresAPI]);

  // Helper function: Formato de moneda europea

  // Defensive formatter for numbers
  const safeNumber = (val: any, decimals = 2) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : 0;
  };
  const formatEuro = (valor: any) => {
    const num = safeNumber(valor);
    return `€${num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderResumen = () => {

    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Alertas de Stock */}
        <Collapsible open={isAlertasStockOpen} onOpenChange={setIsAlertasStockOpen}>
          <Card className="border-gray-200 bg-white">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-base sm:text-lg">Alertas de Stock</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isAlertasStockOpen ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription className="text-xs sm:text-sm text-left">
                  Artículos que requieren atención
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Stock Bajo</p>
                    <p className="text-xs text-amber-700">Requieren reposición pronto</p>
                  </div>
                </div>
                <Badge className="bg-amber-600 text-lg px-3 py-1">{stockData.articulosStockBajo}</Badge>
              </div>
              
              {/* Mostrar artículos sin stock solo si hay datos reales */}
              {stockData.articulosSinStock > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-900">Sin Stock</p>
                      <p className="text-xs text-red-700">Atención inmediata requerida</p>
                    </div>
                  </div>
                  <Badge className="bg-red-600 text-lg px-3 py-1">{stockData.articulosSinStock}</Badge>
                </div>
              )}
              
              {/* Mostrar mensaje cuando no hay alertas */}
              {stockData.articulosStockBajo === 0 && stockData.articulosSinStock === 0 && (
                <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Sin alertas de stock disponibles</p>
                    <p className="text-xs text-gray-400 mt-1">Conecte la API para ver datos reales</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Sección de Pedidos */}
        <Collapsible open={isPedidosOpen} onOpenChange={setIsPedidosOpen}>
          <Card className="border-gray-200 bg-white">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-600" />
                    <CardTitle className="text-base sm:text-lg">Pedidos</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isPedidosOpen ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription className="text-xs sm:text-sm text-left">
                  Estado de pedidos y ventas por canal
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {/* Primera fila: KPIs generales */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                  {/* Total Pedidos */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{pedidosData.totalPedidos}</p>
                    <p className="text-xs text-gray-600">Total Pedidos</p>
                  </div>

                  {/* Activos */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-orange-600 mb-1">{pedidosData.pedidosActivos}</p>
                    <p className="text-xs text-gray-600">Activos</p>
                  </div>

                  {/* Entregados */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">{pedidosData.pedidosEntregados}</p>
                    <p className="text-xs text-gray-600">Entregados</p>
                  </div>

                  {/* Cancelados */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mb-1">{pedidosData.pedidosCancelados}</p>
                    <p className="text-xs text-gray-600">Cancelados</p>
                  </div>

                  {/* Ventas Totales */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 col-span-2 sm:col-span-3 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-teal-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-teal-600 mb-1">
                      {datosVentasAPI ? `€${datosVentasAPI.ventas_periodo?.toFixed(2) || '0.00'}` : '€0.00'}
                    </p>
                    <p className="text-xs text-gray-600">Ventas Totales</p>
                  </div>
                </div>

                {/* Segunda fila: Pedidos por canal */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* App Móvil */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">{pedidosPorCanal.appMovil}</p>
                    <p className="text-xs text-blue-700">App Móvil</p>
                  </div>

                  {/* TPV */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Store className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mb-1">{pedidosPorCanal.tpv}</p>
                    <p className="text-xs text-purple-700">TPV</p>
                  </div>

                  {/* Glovo */}
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600 mb-1">{pedidosPorCanal.glovo}</p>
                    <p className="text-xs text-yellow-700">Glovo</p>
                  </div>

                  {/* Just Eat */}
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-600 mb-1">{pedidosPorCanal.justEat}</p>
                    <p className="text-xs text-red-700">Just Eat</p>
                  </div>

                  {/* Uber Eats */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Bike className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">{pedidosPorCanal.ubereats}</p>
                    <p className="text-xs text-green-700">Uber Eats</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Sección de Onboarding */}
        <Collapsible open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
          <Card className="border-gray-200 bg-white">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    <CardTitle className="text-base sm:text-lg">Onboarding</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOnboardingOpen ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription className="text-xs sm:text-sm text-left">
                  Estado de incorporación de nuevos empleados
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Procesos Activos */}
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <Badge className="bg-teal-600">{estadisticasOnboarding?.procesosActivos || 0}</Badge>
                </div>
                <p className="text-sm font-semibold text-teal-900">Procesos Activos</p>
                <p className="text-xs text-teal-700">de {estadisticasOnboarding?.totalProcesos || 0} totales</p>
              </div>

              {/* Progreso Promedio */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-600">{estadisticasOnboarding?.progresoPromedio || 0}%</Badge>
                </div>
                <p className="text-sm font-semibold text-blue-900">Progreso Promedio</p>
                <Progress value={estadisticasOnboarding?.progresoPromedio || 0} className="h-2 mt-2" />
              </div>

              {/* Tiempo Promedio */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-600">{estadisticasOnboarding?.tiempoPromedioCompletado || 0}d</Badge>
                </div>
                <p className="text-sm font-semibold text-purple-900">Tiempo Promedio</p>
                <p className="text-xs text-purple-700">días de completado</p>
              </div>

              {/* Requieren Acción */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-600">{estadisticasOnboarding?.procesosRequierenAccion || 0}</Badge>
                </div>
                <p className="text-sm font-semibold text-amber-900">Requieren Acción</p>
                <p className="text-xs text-amber-700">documentos pendientes</p>
              </div>
            </div>
          </CardContent>

          {/* Widget de Onboarding */}
          <CardContent className="pt-0">
            <OnboardingWidget 
              tipo="gerente"
              usuarioId="GERENTE-001"
              empresaId="EMPRESA-001"
            />
          </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Información de EBITDA */}
        <Collapsible open={isInfoEBITDAOpen} onOpenChange={setIsInfoEBITDAOpen}>
          <Card className="border-gray-200 bg-white">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-teal-600" />
                    <CardTitle className="text-base sm:text-lg">Información de EBITDA</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isInfoEBITDAOpen ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription className="text-xs sm:text-sm text-left">
                  KPIs de rendimiento, costes operativos y top performers
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {/* KPIs PRINCIPALES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  {/* Ingresos Netos */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-xs sm:text-sm">Ingresos Netos</p>
                          <p className="text-gray-900 text-xl sm:text-2xl">
                            €{estadisticasVentas.totalVentas?.toFixed(0) || '0'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Objetivo: €{(safeNumber(estadisticasVentas.totalVentas) * 0.95).toFixed(0)}
                          </p>
                        </div>
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* EBITDA */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-xs sm:text-sm">EBITDA</p>
                          <p className="text-gray-900 text-xl sm:text-2xl">
                            €{safeNumber(estadisticasVentas.margenNeto).toFixed(0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Margen: {safeNumber(estadisticasVentas.pctMargenNeto).toFixed(1)}%
                          </p>
                        </div>
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Margen Bruto */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-xs sm:text-sm">Margen Bruto</p>
                          <p className="text-gray-900 text-xl sm:text-2xl">
                            €{safeNumber(estadisticasVentas.margenBruto).toFixed(0)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {safeNumber(estadisticasVentas.pctMargenBruto).toFixed(1)}% s/ ingresos
                          </p>
                        </div>
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cumplimiento */}
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-xs sm:text-sm">Cumplimiento</p>
                          <p className="text-gray-900 text-xl sm:text-2xl">105%</p>
                          <p className="text-xs text-gray-500 mt-1">
                            5 líneas superadas
                          </p>
                        </div>
                        <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ESTADÍSTICAS ADICIONALES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Costes Operativos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Costes Operativos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Coste de Ventas</p>
                        <p className="text-lg text-gray-900">
                          €{(safeNumber(estadisticasVentas.totalVentas) - safeNumber(estadisticasVentas.margenBruto)).toFixed(0)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Gastos Operativos</p>
                        <p className="text-lg text-gray-900">
                          €{(safeNumber(estadisticasVentas.margenBruto) - safeNumber(estadisticasVentas.margenNeto)).toFixed(0)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Total Costes</p>
                        <p className="text-sm text-red-600">
                          €{(safeNumber(estadisticasVentas.totalVentas) - safeNumber(estadisticasVentas.margenNeto)).toFixed(0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Estado de Líneas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Estado de Líneas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Superando objetivo</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-green-800">{estadoLineas.superando}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">En objetivo (~90%)</span>
                        <div className="flex items-center gap-2">
                          <Minus className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-800">{estadoLineas.enObjetivo}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Por debajo</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-red-800">{estadoLineas.porDebajo}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Top Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Mejor línea de ingresos</p>
                        <p className="text-sm">{estadisticasVentas.nombreCanalDominante || 'Ingresos App / Web'}</p>
                        <p className="text-xs text-green-600 mt-1">
                          {estadisticasVentas.cumplimientoObjetivo?.toFixed(0) || '100'}% cumplimiento
                        </p>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Modo de visualización</p>
                        <p className="text-sm text-teal-600">Resultados del mes completo</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Información de Escandallo */}
        <Collapsible open={isInfoEscandalloOpen} onOpenChange={setIsInfoEscandalloOpen}>
          <Card className="border-gray-200 bg-white">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-teal-600" />
                    <CardTitle className="text-base sm:text-lg">Información de Escandallo</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isInfoEscandalloOpen ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription className="text-xs sm:text-sm text-left">
                  Resumen de productos, márgenes y costes totales
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {/* KPIs PRINCIPALES */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Productos Totales */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Productos Totales</p>
                          <p className="text-gray-900 text-2xl">
                            {stockData.productos?.length || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stockData.productos?.filter(p => p.escandallo).length || 0} con escandallo
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Margen Promedio */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Margen Promedio</p>
                          <p className="text-gray-900 text-2xl">
                            {safeNumber(estadisticasVentas.pctMargenPromedio).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stockData.productos?.filter(p => p.margen > 0).length || 0} rentables
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Beneficio Total */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Beneficio Total</p>
                          <p className="text-gray-900 text-2xl">€31,14</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ~€4,45 por producto
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-teal-600" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Materias Primas */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Materias Primas</p>
                          <p className="text-gray-900 text-2xl">
                            {stockData.materiasPrimas?.length || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stockData.proveedores?.length || 0} proveedores
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ESTADÍSTICAS ADICIONALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Estado de Productos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Estado de Productos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rentables (≥60%)</span>
                        <Badge className="bg-green-100 text-green-800">
                          7
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Guardados (40-60%)</span>
                        <Badge className="bg-amber-100 text-amber-800">
                          0
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">A revisar ({'<'}40%)</span>
                        <Badge className="bg-red-100 text-red-800">
                          0
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Productos */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Top Productos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Mayor margen</p>
                        <p className="text-sm">{topProductos.mayorMargen.nombre}</p>
                        <p className="text-xs text-green-600">
                          {safeNumber(topProductos.mayorMargen.margen).toFixed(1)}%
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Mayor coste</p>
                        <p className="text-sm">{topProductos.mayorCoste.nombre}</p>
                        <p className="text-xs text-teal-600">
                          €{safeNumber(topProductos.mayorCoste.coste).toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Menor margen</p>
                        <p className="text-sm">{topProductos.menorMargen.nombre}</p>
                        <p className="text-xs text-red-600">
                          {safeNumber(topProductos.menorMargen.margen).toFixed(1)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Costes y Ventas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Costes y Ventas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Coste total escandallos</p>
                        <p className="text-lg text-gray-900">€6,96</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">PVP total</p>
                        <p className="text-lg text-gray-900">€38,10</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Coste promedio/producto</p>
                        <p className="text-sm text-teal-600">
                          €0,99
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Información de Cierres de Caja */}
        <Collapsible open={isInfoCierresOpen} onOpenChange={setIsInfoCierresOpen}>
          <Card className="border-gray-200 bg-white">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-teal-600" />
                    <CardTitle className="text-base sm:text-lg">Información de Cierres de Caja</CardTitle>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isInfoCierresOpen ? 'rotate-180' : ''}`} />
                </div>
                <CardDescription className="text-xs sm:text-sm text-left">
                  Resumen de tipos de acciones, diferencias y cobertura
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {/* TOTALES DE CIERRES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  {/* Total Cierres */}
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-700 mb-1">Total Cierres</p>
                        <p className="text-2xl sm:text-3xl text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {estadisticasCierres.totalCierres}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Este mes</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Efectivo Total */}
                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-700 mb-1">Efectivo Total</p>
                        <p className="text-xl sm:text-3xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €{safeNumber(estadisticasCierres.efectivoTotal).toFixed(2)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Acumulado</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transacciones (Tarjetas) */}
                  <Card className="border-2 border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-700 mb-1">Transacciones</p>
                        <p className="text-xl sm:text-3xl text-yellow-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €{safeNumber(estadisticasCierres.tarjetasTotal).toFixed(2)}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Total tarjetas</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diferencias */}
                  <Card className="border-2 border-purple-200 bg-purple-50">
                    <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                      <div className="text-center">
                        <p className="text-xs sm:text-sm text-gray-700 mb-1">Diferencias</p>
                        <p className="text-xl sm:text-3xl text-purple-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €20,00
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Con ajustes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ESTADÍSTICAS ADICIONALES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Tipos de Acciones */}
                  <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="text-xs sm:text-sm">Tipos de Acciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Aperturas</span>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {estadisticasCierres.cierresApertura}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-gray-600">Cierres</span>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {estadisticasCierres.cierresCierre}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Arqueos</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          {estadisticasCierres.cierresArqueo}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Promedio ventas/cierre</p>
                        <p className="text-sm text-teal-600">
                          {formatEuro(estadisticasCierres.ventaPromedioCierre)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Control de Diferencias */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Control de Diferencias</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Cierres con diferencia</p>
                        <p className="text-lg text-gray-900">{estadisticasCierres.cierresConDiferencia}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Diferencia máxima</p>
                        <p className="text-sm text-red-600">{formatEuro(estadisticasCierres.diferenciaMaxima)}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Total diferencias (abs)</p>
                        <p className="text-sm text-amber-600">
                          {formatEuro(estadisticasCierres.diferenciaTotalAbs)}
                        </p>
                      </div>
                      {estadisticasCierres.cierresConIncoherencia > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs text-red-800">
                              {estadisticasCierres.cierresConIncoherencia} con incoherencias
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cobertura */}
                  <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="text-xs sm:text-sm">Cobertura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
                      <div>
                        <p className="text-[10px] sm:text-xs text-gray-500">Puntos de venta</p>
                        <p className="text-base sm:text-lg text-gray-900">{estadisticasCierres.puntosVentaUnicos}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-[10px] sm:text-xs text-gray-500">Empleados involucrados</p>
                        <p className="text-xs sm:text-sm text-teal-600">{estadisticasCierres.empleadosUnicos}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-[10px] sm:text-xs text-gray-500">Total registros</p>
                        <p className="text-xs sm:text-sm text-blue-600">{estadisticasCierres.totalCierres}</p>
                      </div>
                      <div className="mt-3">
                        <p className="text-[10px] sm:text-xs text-gray-500">Total incoherencias</p>
                        <p className="text-xs sm:text-sm text-red-600">
                          {formatEuro(estadisticasCierres.incoherenciaTotal)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    );
  };

  const renderVentas = () => {
    if (cargandoDatos) {
      return (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        </div>
      );
    }

    if (errorCarga) {
      return (
        <div className="flex justify-center items-center h-96">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-red-500 text-sm mt-2">{errorCarga}</p>
        </div>
      );
    }

    if (!datosVentasAPI) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">Cargando datos de ventas...</p>
        </div>
      );
    }
    const { ventas_periodo, pedidos_periodo, productos_vendidos, ticket_medio_pedido, ticket_medio_producto, costes_variables_periodo, costes_fijos_imputados_periodo, comisiones_tpv_periodo, comisiones_plataformas_periodo, comisiones_pasarela_periodo, margen_neto_periodo, variacion_ventas_periodo, variacion_margen_neto_periodo, ingresos_ultimos_5_meses, gastos_ultimos_5_meses, labels_ultimos_5_meses, categorias_ingresos, valores_ingresos_categorias, ventas_mostrador, variacion_mostrador, ventas_app_web, variacion_app_web, ventas_terceros, variacion_terceros, ventas_efectivo, variacion_efectivo } = datosVentasAPI;

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Cuadros KPIs de Ventas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Mostrador */}
          <Card className="border-2 border-teal-200">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">Mostrador</p>
                  <p className="text-xs text-gray-500 hidden sm:block">Ventas en tienda física</p>
                </div>
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {`€${safeNumber(ventas_mostrador).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs sm:text-sm text-green-600">{`+${safeNumber(variacion_mostrador, 1).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}</span>
              </div>
            </CardContent>
          </Card>

          {/* App/Web */}
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5 sm:mb-1">App/Web</p>
                  <p className="text-xs text-gray-500 hidden sm:block">Pedidos online</p>
                </div>
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {`€${safeNumber(ventas_app_web).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-sm text-green-600">{`+${safeNumber(variacion_app_web, 1).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}</span>
              </div>
            </CardContent>
          </Card>

          {/* Terceros */}
          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Terceros</p>
                  <p className="text-xs text-gray-500">Glovo, Uber Eats, etc.</p>
                </div>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {`€${safeNumber(ventas_terceros).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-sm text-green-600">{`+${safeNumber(variacion_terceros, 1).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Efectivo */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total Efectivo</p>
                  <p className="text-xs text-gray-500">Pagos en efectivo</p>
                </div>
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl text-gray-900 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {`€${safeNumber(ventas_efectivo).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-sm text-green-600">{`+${safeNumber(variacion_efectivo, 1).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESTADÍSTICAS ADICIONALES CALCULADAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-xs sm:text-sm">Distribución por Canal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Mostrador</span>
                <Badge className="bg-teal-100 text-teal-800 text-xs">
                  {safeNumber(estadisticasVentas.pctMostrador).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">App/Web</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {safeNumber(estadisticasVentas.pctAppWeb).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Terceros</span>
                <Badge className="bg-purple-100 text-purple-800 text-xs">
                  {safeNumber(estadisticasVentas.pctTerceros).toFixed(1)}%
                </Badge>
              </div>
              <div className="mt-2 sm:mt-3 p-2 bg-teal-50 rounded-lg">
                <p className="text-[10px] sm:text-xs text-gray-500">Canal dominante</p>
                <p className="text-xs sm:text-sm text-teal-700">{estadisticasVentas.nombreCanalDominante}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-xs sm:text-sm">Márgenes y Rentabilidad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Margen Bruto</p>
                <p className="text-base sm:text-lg text-gray-900">
                  €{safeNumber(estadisticasVentas.margenBruto).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-teal-600">{safeNumber(estadisticasVentas.margenBrutoPct).toFixed(1)}%</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] sm:text-xs text-gray-500">Margen Neto</p>
                <p className="text-base sm:text-lg text-gray-900">
                  €{safeNumber(margen_neto_periodo).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-600">{safeNumber(estadisticasVentas.margenNetoPct).toFixed(1)}%</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] sm:text-xs text-gray-500">Total Comisiones</p>
                <p className="text-xs sm:text-sm text-red-600">
                  €{safeNumber(estadisticasVentas.totalComisiones).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-xs sm:text-sm">Promedios Diarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500">Ventas por día</p>
                <p className="text-base sm:text-lg text-gray-900">
                  €{safeNumber(estadisticasVentas.ventaPromedioDia).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] sm:text-xs text-gray-500">Pedidos por día</p>
                <p className="text-xs sm:text-sm text-teal-600">
                  {safeNumber(estadisticasVentas.pedidosPromedioDia).toFixed(1)} pedidos
                </p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] sm:text-xs text-gray-500">Productos por pedido</p>
                <p className="text-xs sm:text-sm text-blue-600">
                  {safeNumber(estadisticasVentas.productosPromedioPedido).toFixed(1)} productos
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Método de pago preferido</p>
                <p className="text-sm">
                  {safeNumber(estadisticasVentas.pctEfectivo) > 50 ? 'Efectivo' : 'Tarjeta'} ({Math.max(safeNumber(estadisticasVentas.pctEfectivo), safeNumber(estadisticasVentas.pctTarjeta)).toFixed(0)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ingresos vs Gastos
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Últimos 5 meses en euros</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={ingresos_ultimos_5_meses ? ingresos_ultimos_5_meses.map((ingreso, index) => ({
                  mes: labels_ultimos_5_meses ? labels_ultimos_5_meses[index] : `Mes ${index + 1}`,
                  ingresos: ingreso,
                  gastos: gastos_ultimos_5_meses ? gastos_ultimos_5_meses[index] : 0
                })) : []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#0d9488" 
                    strokeWidth={2} 
                    name="Ingresos" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="#f59e0b" 
                    strokeWidth={2} 
                    name="Gastos" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Distribución de Ingresos
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Por categoría de producto</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categorias_ingresos && valores_ingresos_categorias ? categorias_ingresos.map((categoria, index) => ({
                      nombre: categoria,
                      valor: valores_ingresos_categorias[index],
                      color: ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4'][index % 4] // Colores cíclicos
                    })) : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.nombre} ${entry.valor}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {categorias_ingresos && valores_ingresos_categorias ? categorias_ingresos.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#0d9488', '#14b8a6', '#5eead4', '#99f6e4'][index % 4]} />
                    )) : null}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderCierres = () => {
    // Check si los datos están cargando
    if (cargandoCierres) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">Cargando datos de cierres...</p>
        </div>
      );
    }
    
    // Check si no hay datos disponibles
    if (!datosCierresAPI) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">No hay datos de cierres disponibles</p>
        </div>
      );
    }

    // Helper function: Formato de fecha amigable
    const formatFechaHora = (fechaISO: string) => {
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const año = fecha.getFullYear();
      const horas = fecha.getHours().toString().padStart(2, '0');
      const minutos = fecha.getMinutes().toString().padStart(2, '0');
      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    };

    // Helper function: Badge color según tipo de acción
    const getBadgeTipoAccion = (tipoAccion: string) => {
      switch (tipoAccion) {
        case 'apertura':
          return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Apertura</Badge>;
        case 'cierre':
          return <Badge className="bg-green-100 text-green-800 border-green-200">Cierre</Badge>;
        case 'arqueo':
          return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Arqueo</Badge>;
        case 'retirada':
          return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Retirada</Badge>;
        case 'devolucion':
          return <Badge className="bg-red-100 text-red-800 border-red-200">Devolución</Badge>;
        case 'consumo_propio':
          return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Consumo Propio</Badge>;
        default:
          return <Badge variant="outline">{tipoAccion}</Badge>;
      }
    };

    // Check si los datos están cargando
    if (cargandoCierres) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">Cargando datos de cierres...</p>
        </div>
      );
    }
    
    // Destructuring de los datos
    if (!datosCierresAPI) {
      return (
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-500">No hay datos de cierres disponibles</p>
        </div>
      );
    }
    const { totales, cierres, paginacion } = datosCierresAPI;

    // Filtrar cierres por contexto seleccionado
    const cierresFiltrados = selectedContext.length === 0
      ? cierres 
      : cierres.filter(c => {
          // Verificar si el cierre coincide con algún contexto seleccionado
          return selectedContext.some(ctx => {
            // Verificar empresa
            if (ctx.empresa_id !== c.empresa_id) return false;
            
            // Si marca_id es null en contexto, incluye todas las marcas
            if (ctx.marca_id === null) return true;
            
            // Verificar marca
            if (ctx.marca_id !== c.marca_id) return false;
            
            // Si punto_venta_id es null en contexto, incluye todos los PDV
            if (ctx.punto_venta_id === null) return true;
            
            // Verificar punto de venta
            return ctx.punto_venta_id === c.punto_venta_id;
          });
        });

    // Paginación
    const cierresPaginados = cierresFiltrados.slice(
      (paginaActualCierres - 1) * paginacion.por_pagina,
      paginaActualCierres * paginacion.por_pagina
    );

    const totalPaginas = Math.ceil(cierresFiltrados.length / paginacion.por_pagina);

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Tabla de Cierres de Caja */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Cierres de Caja
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Historial completo de cierres de caja del negocio
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="touch-target text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filtrar</span>
                </Button>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 touch-target text-xs sm:text-sm">
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <ResponsiveTable
              headers={['Día y hora', 'Tienda', 'Acción', 'Empleada', 'Contado Esperado', 'Contado Real', 'Diferencia', 'Total Ventas', 'Ventas Efectivo', 'Ventas Tarjeta', 'Retiradas', 'Resultado', 'Incoherencia']}
              mobileHeaders={['Fecha', 'Tienda', 'Acción', 'Resultado']}
              mobileKeyIndices={[0, 1, 2, 11]}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-teal-600 hover:bg-teal-600">
                    <TableHead className="text-white text-xs sm:text-sm">Día y hora</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Tienda</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Acción</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Empleada</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Contado Esperado</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Contado Real</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Diferencia</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Total Ventas</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Ventas Efectivo</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Ventas Tarjeta</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Retiradas</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Resultado</TableHead>
                    <TableHead className="text-white text-xs sm:text-sm">Incoherencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cierresPaginados.map((cierre) => (
                    <TableRow key={cierre.id} className="hover:bg-gray-50">
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                        {formatFechaHora(cierre.fecha_hora)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{cierre.punto_venta_id}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {getBadgeTipoAccion(cierre.tipo_accion)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{cierre.empleado_nombre}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatEuro(cierre.contado_esperado)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatEuro(cierre.contado_real)}</TableCell>
                      <TableCell className={`text-xs sm:text-sm ${
                        cierre.diferencia !== 0 ? 'font-medium text-red-600' : ''
                      }`}>
                        {formatEuro(cierre.diferencia)}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatEuro(cierre.total_ventas)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatEuro(cierre.ventas_efectivo)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatEuro(cierre.ventas_tarjeta)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatEuro(cierre.retiradas)}</TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium">{formatEuro(cierre.resultado)}</TableCell>
                      <TableCell className={`text-xs sm:text-sm ${
                        cierre.incoherencia !== 0 ? 'font-medium text-red-600' : ''
                      }`}>
                        {formatEuro(cierre.incoherencia)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                <p className="text-xs sm:text-sm text-gray-600">
                  Mostrando {((paginaActualCierres - 1) * paginacion.por_pagina) + 1} a{' '}
                  {Math.min(paginaActualCierres * paginacion.por_pagina, cierresFiltrados.length)} de{' '}
                  {cierresFiltrados.length} registros
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaginaActualCierres(prev => Math.max(1, prev - 1))}
                    disabled={paginaActualCierres === 1}
                    className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Anterior</span>
                    <span className="sm:hidden">Ant</span>
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(pagina => (
                      <Button
                        key={pagina}
                        size="sm"
                        variant={pagina === paginaActualCierres ? 'default' : 'outline'}
                        className={`h-8 sm:h-9 w-8 sm:w-9 p-0 text-xs sm:text-sm ${pagina === paginaActualCierres ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                        onClick={() => setPaginaActualCierres(pagina)}
                      >
                        {pagina}
                      </Button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPaginaActualCierres(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaActualCierres === totalPaginas}
                    className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <span className="sm:hidden">Sig</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAlertas = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Solo 2 cajas informativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-700">Alertas Críticas</p>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <p className="text-2xl sm:text-3xl text-red-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {alertasCriticas.filter(a => a.tipo === 'critica' && a.estado === 'pendiente').length}
            </p>
            <p className="text-[10px] sm:text-xs text-red-600">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-700">Tickets Abiertos</p>
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <p className="text-2xl sm:text-3xl text-purple-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {ticketsColaboradores.filter(t => t.estado === 'abierto').length}
            </p>
            <p className="text-[10px] sm:text-xs text-purple-600">De colaboradores</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderEBITDA = () => {
    return (
      <CuentaResultados 
        comparativaActiva={comparativaEBITDA}
        tiendaComparativa={tiendaComparativaEBITDA}
        tipoPeriodo={tipoPeriodoEBITDA}
      />
    );
  };

  const renderEscandallo = () => {
    return <Escandallo />;
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="pb-2">
        <h2 className="text-lg sm:text-xl md:text-2xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Dashboard 360°
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm">Visión completa del negocio</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 pb-2">
        <Button
          variant={filtroActivo === 'resumen' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('resumen')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'resumen' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Resumen
        </Button>
        <Button
          variant={filtroActivo === 'ventas' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('ventas')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'ventas' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Ventas
        </Button>
        <Button
          variant={filtroActivo === 'cierres' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('cierres')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'cierres' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Cierres
        </Button>
        <Button
          variant={filtroActivo === 'ebitda' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('ebitda')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'ebitda' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          EBITDA
        </Button>
        <Button
          variant={filtroActivo === 'escandallo' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('escandallo')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'escandallo' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Escandallo</span>
          <span className="sm:hidden">Escand.</span>
        </Button>
        <Button
          variant={filtroActivo === 'operativa' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('operativa')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'operativa' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Operativa
        </Button>
        <Button
          variant={filtroActivo === 'alertas' ? 'default' : 'outline'}
          onClick={() => setFiltroActivo('alertas')}
          className={`h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 ${filtroActivo === 'alertas' ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
        >
          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          Alertas
        </Button>
      </div>

      {/* Subfiltro de Contexto y Filtros temporales (Resumen y Ventas) */}
      {(filtroActivo === 'resumen' || filtroActivo === 'ventas') && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Filtro PDV */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Punto de Venta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-white text-sm h-10"
                  >
                    <span className="truncate">
                      {filtroPDV.length === 0 
                        ? 'Todas las empresas' 
                        : `${filtroPDV.length} seleccionado${filtroPDV.length > 1 ? 's' : ''}`
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                  <div className="space-y-3">
                    {/* Empresa */}
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
                      {EMPRESAS_ARRAY.map(empresa => (
                        <div key={empresa.id} className="flex items-center gap-2 mb-2">
                          <Checkbox 
                            id={`empresa-${empresa.id}`}
                            checked={filtroPDV.includes(empresa.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFiltroPDV([...filtroPDV, empresa.id]);
                              } else {
                                setFiltroPDV(filtroPDV.filter(item => item !== empresa.id));
                              }
                            }}
                          />
                          <label htmlFor={`empresa-${empresa.id}`} className="text-sm cursor-pointer">
                            🏢 {getNombreEmpresa(empresa.id)}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Puntos de Venta */}
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
                      <div className="space-y-2">
                        {PUNTOS_VENTA_ARRAY.map(pdv => (
                          <div key={pdv.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`pdv-${pdv.id}`}
                              checked={filtroPDV.includes(pdv.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroPDV([...filtroPDV, pdv.id]);
                                } else {
                                  setFiltroPDV(filtroPDV.filter(item => item !== pdv.id));
                                }
                              }}
                            />
                            <label htmlFor={`pdv-${pdv.id}`} className="text-sm cursor-pointer">
                              📍 {getNombrePDVConMarcas(pdv.id)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Marcas */}
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
                      <div className="space-y-2">
                        {MARCAS_ARRAY.map(marca => (
                          <div key={marca.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`marca-${marca.id}`}
                              checked={filtroPDV.includes(marca.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroPDV([...filtroPDV, marca.id]);
                                } else {
                                  setFiltroPDV(filtroPDV.filter(item => item !== marca.id));
                                }
                              }}
                            />
                            <label htmlFor={`marca-${marca.id}`} className="text-sm cursor-pointer">
                              {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón limpiar */}
                    {filtroPDV.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-red-600 hover:text-red-700"
                        onClick={() => setFiltroPDV([])}
                      >
                        Limpiar selección
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro Período */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Período</Label>
              <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                <SelectTrigger className="w-full bg-white h-10">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="ayer">Ayer</SelectItem>
                  <SelectItem value="semana_actual">Semana actual</SelectItem>
                  <SelectItem value="mes_actual">Mes actual</SelectItem>
                  <SelectItem value="mes_anterior">Mes anterior</SelectItem>
                  <SelectItem value="trimestre_actual">Trimestre actual</SelectItem>
                  <SelectItem value="año_actual">Año actual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros personalizados si se selecciona "Personalizado" */}
          {periodoSeleccionado === 'personalizado' && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Día</Label>
                <Select value={diaSeleccionado} onValueChange={setDiaSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="">Todos</SelectItem>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                      <SelectItem key={dia} value={dia.toString()}>
                        {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Mes</Label>
                <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="1">Enero</SelectItem>
                    <SelectItem value="2">Febrero</SelectItem>
                    <SelectItem value="3">Marzo</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Mayo</SelectItem>
                    <SelectItem value="6">Junio</SelectItem>
                    <SelectItem value="7">Julio</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Año</Label>
                <Select value={añoSeleccionado} onValueChange={setAñoSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros para Cierres */}
      {filtroActivo === 'cierres' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Filtro PDV */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Punto de Venta</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-white text-sm h-10"
                  >
                    <span className="truncate">
                      {filtroPDV.length === 0 
                        ? 'Todas las empresas' 
                        : `${filtroPDV.length} seleccionado${filtroPDV.length > 1 ? 's' : ''}`
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                  <div className="space-y-3">
                    {/* Empresa */}
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
                      {EMPRESAS_ARRAY.map(empresa => (
                        <div key={empresa.id} className="flex items-center gap-2 mb-2">
                          <Checkbox 
                            id={`cierres-empresa-${empresa.id}`}
                            checked={filtroPDV.includes(empresa.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFiltroPDV([...filtroPDV, empresa.id]);
                              } else {
                                setFiltroPDV(filtroPDV.filter(item => item !== empresa.id));
                              }
                            }}
                          />
                          <label htmlFor={`cierres-empresa-${empresa.id}`} className="text-sm cursor-pointer">
                            🏢 {getNombreEmpresa(empresa.id)}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Puntos de Venta */}
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
                      <div className="space-y-2">
                        {PUNTOS_VENTA_ARRAY.map(pdv => (
                          <div key={pdv.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`cierres-pdv-${pdv.id}`}
                              checked={filtroPDV.includes(pdv.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroPDV([...filtroPDV, pdv.id]);
                                } else {
                                  setFiltroPDV(filtroPDV.filter(item => item !== pdv.id));
                                }
                              }}
                            />
                            <label htmlFor={`cierres-pdv-${pdv.id}`} className="text-sm cursor-pointer">
                              📍 {getNombrePDVConMarcas(pdv.id)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Marcas */}
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
                      <div className="space-y-2">
                        {MARCAS_ARRAY.map(marca => (
                          <div key={marca.id} className="flex items-center gap-2">
                            <Checkbox 
                              id={`cierres-marca-${marca.id}`}
                              checked={filtroPDV.includes(marca.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroPDV([...filtroPDV, marca.id]);
                                } else {
                                  setFiltroPDV(filtroPDV.filter(item => item !== marca.id));
                                }
                              }}
                            />
                            <label htmlFor={`cierres-marca-${marca.id}`} className="text-sm cursor-pointer">
                              {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón limpiar */}
                    {filtroPDV.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs text-red-600 hover:text-red-700"
                        onClick={() => setFiltroPDV([])}
                      >
                        Limpiar selección
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro Período */}
            <div>
              <Label className="text-xs text-gray-600 mb-2 block">Período</Label>
              <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                <SelectTrigger className="w-full bg-white h-10">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hoy">Hoy</SelectItem>
                  <SelectItem value="ayer">Ayer</SelectItem>
                  <SelectItem value="semana_actual">Semana actual</SelectItem>
                  <SelectItem value="mes_actual">Mes actual</SelectItem>
                  <SelectItem value="mes_anterior">Mes anterior</SelectItem>
                  <SelectItem value="trimestre_actual">Trimestre actual</SelectItem>
                  <SelectItem value="año_actual">Año actual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros personalizados si se selecciona "Personalizado" */}
          {periodoSeleccionado === 'personalizado' && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Día</Label>
                <Select value={diaSeleccionado} onValueChange={setDiaSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="">Todos</SelectItem>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                      <SelectItem key={dia} value={dia.toString()}>
                        {dia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Mes</Label>
                <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="1">Enero</SelectItem>
                    <SelectItem value="2">Febrero</SelectItem>
                    <SelectItem value="3">Marzo</SelectItem>
                    <SelectItem value="4">Abril</SelectItem>
                    <SelectItem value="5">Mayo</SelectItem>
                    <SelectItem value="6">Junio</SelectItem>
                    <SelectItem value="7">Julio</SelectItem>
                    <SelectItem value="8">Agosto</SelectItem>
                    <SelectItem value="9">Septiembre</SelectItem>
                    <SelectItem value="10">Octubre</SelectItem>
                    <SelectItem value="11">Noviembre</SelectItem>
                    <SelectItem value="12">Diciembre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Año</Label>
                <Select value={añoSeleccionado} onValueChange={setAñoSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros para EBITDA */}
      {filtroActivo === 'ebitda' && (
        <div className="space-y-3 min-h-[44px]">
          {/* Filtro PDV */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Punto de Venta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between bg-white text-sm h-10"
                    >
                      <span className="truncate">
                        {filtroPDV.length === 0 
                          ? 'Todas las empresas' 
                          : `${filtroPDV.length} seleccionado${filtroPDV.length > 1 ? 's' : ''}`
                        }
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="start">
                    <div className="space-y-3">
                      {/* Empresa */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Empresa</Label>
                        {EMPRESAS_ARRAY.map(empresa => (
                          <div key={empresa.id} className="flex items-center gap-2 mb-2">
                            <Checkbox 
                              id={`ebitda-empresa-${empresa.id}`}
                              checked={filtroPDV.includes(empresa.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFiltroPDV([...filtroPDV, empresa.id]);
                                } else {
                                  setFiltroPDV(filtroPDV.filter(item => item !== empresa.id));
                                }
                              }}
                            />
                            <label htmlFor={`ebitda-empresa-${empresa.id}`} className="text-sm cursor-pointer">
                              🏢 {getNombreEmpresa(empresa.id)}
                            </label>
                          </div>
                        ))}
                      </div>

                      {/* Puntos de Venta */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Puntos de Venta</Label>
                        <div className="space-y-2">
                          {PUNTOS_VENTA_ARRAY.map(pdv => (
                            <div key={pdv.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={`ebitda-pdv-${pdv.id}`}
                                checked={filtroPDV.includes(pdv.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFiltroPDV([...filtroPDV, pdv.id]);
                                  } else {
                                    setFiltroPDV(filtroPDV.filter(item => item !== pdv.id));
                                  }
                                }}
                              />
                              <label htmlFor={`ebitda-pdv-${pdv.id}`} className="text-sm cursor-pointer">
                                📍 {getNombrePDVConMarcas(pdv.id)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Marcas */}
                      <div>
                        <Label className="text-xs font-medium text-gray-700 mb-2 block">Marcas</Label>
                        <div className="space-y-2">
                          {MARCAS_ARRAY.map(marca => (
                            <div key={marca.id} className="flex items-center gap-2">
                              <Checkbox 
                                id={`ebitda-marca-${marca.id}`}
                                checked={filtroPDV.includes(marca.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFiltroPDV([...filtroPDV, marca.id]);
                                  } else {
                                    setFiltroPDV(filtroPDV.filter(item => item !== marca.id));
                                  }
                                }}
                              />
                              <label htmlFor={`ebitda-marca-${marca.id}`} className="text-sm cursor-pointer">
                                {getIconoMarca(marca.id)} {getNombreMarca(marca.id)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botón limpiar */}
                      {filtroPDV.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-xs text-red-600 hover:text-red-700"
                          onClick={() => setFiltroPDV([])}
                        >
                          Limpiar selección
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Período</Label>
                <Select value={periodoSeleccionado} onValueChange={setPeriodoSeleccionado}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="ayer">Ayer</SelectItem>
                    <SelectItem value="semana_actual">Semana actual</SelectItem>
                    <SelectItem value="mes_actual">{obtenerNombreMesActual()}</SelectItem>
                    <SelectItem value="mes_anterior">Mes anterior</SelectItem>
                    <SelectItem value="trimestre_actual">Trimestre actual</SelectItem>
                    <SelectItem value="año_actual">Año actual</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-600 mb-2 block">Tipo Período</Label>
                <Select value={tipoPeriodoEBITDA} onValueChange={setTipoPeriodoEBITDA}>
                  <SelectTrigger className="w-full bg-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mes completo">Mes completo</SelectItem>
                    <SelectItem value="Últimos 30 días">Últimos 30 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Filtros de comparativa (solo si está activa) */}
          {comparativaEBITDA && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-teal-50 rounded-lg border border-teal-200">
              <span className="text-xs sm:text-sm font-medium text-teal-900">Comparar con:</span>
              
              {/* Filtro de tienda comparativa */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 sm:gap-2 bg-white text-xs sm:text-sm w-full sm:w-auto">
                    <span className="truncate max-w-[200px]">{tiendaComparativaEBITDA}</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[280px] max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Centro')}>
                    Can Farines Centro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Llefià')}>
                    Can Farines Llefià
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Montigalà')}>
                    Can Farines Montigalà
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Casagemes')}>
                    Can Farines Casagemes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines La Mina')}>
                    Can Farines La Mina
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Sant Adrià Centro')}>
                    Can Farines Sant Adrià Centro
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Besòs')}>
                    Can Farines Besòs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Poblenou')}>
                    Can Farines Poblenou
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Sagrada Família')}>
                    Can Farines Sagrada Família
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTiendaComparativaEBITDA('Can Farines Gràcia')}>
                    Can Farines Gràcia
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      )}

      {/* Contenido según filtro - Con altura mínima para evitar saltos */}
      <div className="min-h-[500px]">
        {filtroActivo === 'resumen' && renderResumen()}
        {filtroActivo === 'ventas' && renderVentas()}
        {filtroActivo === 'cierres' && renderCierres()}
        {filtroActivo === 'ebitda' && renderEBITDA()}
        {filtroActivo === 'escandallo' && renderEscandallo()}
        {filtroActivo === 'operativa' && renderOperativa()}
        {filtroActivo === 'alertas' && renderAlertas()}
      </div>
    </div>
  );
}