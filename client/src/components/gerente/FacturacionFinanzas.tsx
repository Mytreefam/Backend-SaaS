import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Download,
  Package,
  Truck,
  ShoppingCart,
  Eye,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Receipt,
  Activity,
  Plus,
  ScanLine,
  Upload,
  Edit
} from 'lucide-react';
import { finanzasApi } from '../../services/api/gerente.api';
import { toast } from 'sonner@2.0.3';

interface Proveedor {
  id: string;
  nombre: string;
  segmento: 'Materia prima' | 'Servicios';
  numeroPedidos: number;
  totalCompras: number;
  fechaUltimoPedido: string;
  estado: 'Activo' | 'Pendiente' | 'Inactivo';
}

interface CobroImpago {
  id: string;
  cliente: string;
  factura: string;
  importe: number;
  fechaEmision: string;
  diasVencido: number;
  estado: 'Vencido' | 'Próximo a vencer' | 'En gestión';
}

interface PreviscionDia {
  fecha: string;
  objetivoVentas: number;
  ventasRealizadas: number;
  diferencia: number;
  acumulado: number;
}

export function FacturacionFinanzas() {
  const [periodoImpagos, setPeriodoImpagos] = useState('mes');
  const [periodoPrevision, setPeriodoPrevision] = useState('mes');
  const [dialogAñadirFactura, setDialogAñadirFactura] = useState(false);
  
  // Estados para carga de datos
  const [cargandoFinanzas, setCargandoFinanzas] = useState(true);
  const [resumenFinanciero, setResumenFinanciero] = useState<any>(null);

  // Cargar datos financieros desde la API
  useEffect(() => {
    const cargarDatosFinanzas = async () => {
      setCargandoFinanzas(true);
      try {
        const resumen = await finanzasApi.obtenerResumen({
          empresa_id: undefined, // Se puede filtrar por empresa
          fecha_inicio: undefined,
          fecha_fin: undefined
        });
        setResumenFinanciero(resumen);
      } catch (error) {
        console.error('Error cargando datos financieros:', error);
        toast.error('Error cargando finanzas. Mostrando datos locales.');
      } finally {
        setCargandoFinanzas(false);
      }
    };

    cargarDatosFinanzas();
  }, []);

  // Proveedores ordenados del más reciente al más antiguo
  const proveedores: Proveedor[] = [
    {
      id: 'PROV-015',
      nombre: 'Distribuciones Alimentarias Del Sur',
      segmento: 'Materia prima',
      numeroPedidos: 3,
      totalCompras: 2850.50,
      fechaUltimoPedido: '2025-11-14T09:30:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-014',
      nombre: 'Lácteos Premium S.L.',
      segmento: 'Materia prima',
      numeroPedidos: 8,
      totalCompras: 4320.80,
      fechaUltimoPedido: '2025-11-13T14:20:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-013',
      nombre: 'Mantenimiento Industrial ProTech',
      segmento: 'Servicios',
      numeroPedidos: 2,
      totalCompras: 1580.00,
      fechaUltimoPedido: '2025-11-12T11:00:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-012',
      nombre: 'Carnes y Embutidos La Granja',
      segmento: 'Materia prima',
      numeroPedidos: 12,
      totalCompras: 8945.60,
      fechaUltimoPedido: '2025-11-12T08:15:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-011',
      nombre: 'Verduras Frescas Huerta Verde',
      segmento: 'Materia prima',
      numeroPedidos: 15,
      totalCompras: 5670.30,
      fechaUltimoPedido: '2025-11-11T10:45:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-010',
      nombre: 'Limpieza y Desinfección Total',
      segmento: 'Servicios',
      numeroPedidos: 4,
      totalCompras: 2240.00,
      fechaUltimoPedido: '2025-11-10T16:30:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-009',
      nombre: 'Bebidas y Refrescos Distribuciones',
      segmento: 'Materia prima',
      numeroPedidos: 18,
      totalCompras: 7825.40,
      fechaUltimoPedido: '2025-11-09T13:00:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-008',
      nombre: 'Harinas y Masas Artesanales',
      segmento: 'Materia prima',
      numeroPedidos: 22,
      totalCompras: 6540.90,
      fechaUltimoPedido: '2025-11-08T09:30:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-007',
      nombre: 'Servicio Técnico Hostelería',
      segmento: 'Servicios',
      numeroPedidos: 5,
      totalCompras: 3150.00,
      fechaUltimoPedido: '2025-11-07T15:20:00',
      estado: 'Pendiente'
    },
    {
      id: 'PROV-006',
      nombre: 'Aceites y Especias Mediterráneas',
      segmento: 'Materia prima',
      numeroPedidos: 10,
      totalCompras: 3890.70,
      fechaUltimoPedido: '2025-11-06T12:00:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-005',
      nombre: 'Envases y Embalajes EcoPackaging',
      segmento: 'Materia prima',
      numeroPedidos: 7,
      totalCompras: 1950.40,
      fechaUltimoPedido: '2025-11-05T10:15:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-004',
      nombre: 'Consultoría y Asesoría Legal Food',
      segmento: 'Servicios',
      numeroPedidos: 1,
      totalCompras: 1200.00,
      fechaUltimoPedido: '2025-11-03T14:30:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-003',
      nombre: 'Salsas y Condimentos Gourmet',
      segmento: 'Materia prima',
      numeroPedidos: 14,
      totalCompras: 4560.80,
      fechaUltimoPedido: '2025-11-02T11:45:00',
      estado: 'Activo'
    },
    {
      id: 'PROV-002',
      nombre: 'Formación y Capacitación Food Safety',
      segmento: 'Servicios',
      numeroPedidos: 2,
      totalCompras: 980.00,
      fechaUltimoPedido: '2025-10-28T09:00:00',
      estado: 'Inactivo'
    },
    {
      id: 'PROV-001',
      nombre: 'Quesos y Derivados Lácteos Selectos',
      segmento: 'Materia prima',
      numeroPedidos: 20,
      totalCompras: 9340.50,
      fechaUltimoPedido: '2025-10-25T13:20:00',
      estado: 'Activo'
    }
  ];

  // Cobros impagados
  const cobrosImpagos: CobroImpago[] = [
    {
      id: 'IMP-001',
      cliente: 'Restaurante El Buen Sabor',
      factura: 'FACT-2024-1145',
      importe: 2850.50,
      fechaEmision: '2025-10-15',
      diasVencido: 30,
      estado: 'Vencido'
    },
    {
      id: 'IMP-002',
      cliente: 'Pizzería Don Giovanni',
      factura: 'FACT-2024-1168',
      importe: 1320.00,
      fechaEmision: '2025-10-28',
      diasVencido: 17,
      estado: 'Vencido'
    },
    {
      id: 'IMP-003',
      cliente: 'Cafetería Central',
      factura: 'FACT-2024-1189',
      importe: 890.40,
      fechaEmision: '2025-11-01',
      diasVencido: 13,
      estado: 'Vencido'
    },
    {
      id: 'IMP-004',
      cliente: 'Bar Los Amigos',
      factura: 'FACT-2024-1203',
      importe: 645.00,
      fechaEmision: '2025-11-08',
      diasVencido: 6,
      estado: 'Próximo a vencer'
    },
    {
      id: 'IMP-005',
      cliente: 'Hotel Vista Mar',
      factura: 'FACT-2024-1215',
      importe: 3744.60,
      fechaEmision: '2025-11-10',
      diasVencido: 4,
      estado: 'Próximo a vencer'
    }
  ];

  // Previsión de ventas por día
  const previsionDias: PreviscionDia[] = [
    { fecha: '2025-11-01', objetivoVentas: 1200, ventasRealizadas: 1350, diferencia: 150, acumulado: 1350 },
    { fecha: '2025-11-02', objetivoVentas: 1200, ventasRealizadas: 1180, diferencia: -20, acumulado: 2530 },
    { fecha: '2025-11-03', objetivoVentas: 1400, ventasRealizadas: 1520, diferencia: 120, acumulado: 4050 },
    { fecha: '2025-11-04', objetivoVentas: 1200, ventasRealizadas: 1290, diferencia: 90, acumulado: 5340 },
    { fecha: '2025-11-05', objetivoVentas: 1200, ventasRealizadas: 1150, diferencia: -50, acumulado: 6490 },
    { fecha: '2025-11-06', objetivoVentas: 1200, ventasRealizadas: 1240, diferencia: 40, acumulado: 7730 },
    { fecha: '2025-11-07', objetivoVentas: 1200, ventasRealizadas: 1310, diferencia: 110, acumulado: 9040 },
    { fecha: '2025-11-08', objetivoVentas: 1600, ventasRealizadas: 1780, diferencia: 180, acumulado: 10820 },
    { fecha: '2025-11-09', objetivoVentas: 1600, ventasRealizadas: 1590, diferencia: -10, acumulado: 12410 },
    { fecha: '2025-11-10', objetivoVentas: 1400, ventasRealizadas: 1480, diferencia: 80, acumulado: 13890 },
    { fecha: '2025-11-11', objetivoVentas: 1200, ventasRealizadas: 1210, diferencia: 10, acumulado: 15100 },
    { fecha: '2025-11-12', objetivoVentas: 1200, ventasRealizadas: 1160, diferencia: -40, acumulado: 16260 },
    { fecha: '2025-11-13', objetivoVentas: 1200, ventasRealizadas: 1270, diferencia: 70, acumulado: 17530 },
    { fecha: '2025-11-14', objetivoVentas: 1200, ventasRealizadas: 1340, diferencia: 140, acumulado: 18870 },
  ];

  const getSegmentoBadge = (segmento: string) => {
    return segmento === 'Materia prima' ? (
      <Badge className="bg-teal-600 text-white">
        <Package className="w-3 h-3 mr-1" />
        Materia prima
      </Badge>
    ) : (
      <Badge className="bg-purple-600 text-white">
        <Truck className="w-3 h-3 mr-1" />
        Servicios
      </Badge>
    );
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'Pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'Inactivo':
        return <Badge className="bg-gray-100 text-gray-600">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getEstadoImpagoBadge = (estado: string) => {
    switch (estado) {
      case 'Vencido':
        return <Badge className="bg-red-600 text-white">Vencido</Badge>;
      case 'Próximo a vencer':
        return <Badge className="bg-orange-500 text-white">Próximo a vencer</Badge>;
      case 'En gestión':
        return <Badge className="bg-blue-600 text-white">En gestión</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFechaDia = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  // ============================================
  // CÁLCULOS DINÁMICOS CON useMemo - FINANZAS
  // ============================================
  
  const estadisticas = useMemo(() => {
    // GRUPO 1: PROVEEDORES - TOTALES Y SEGMENTACIÓN
    const totalProveedores = proveedores.length;
    const proveedoresActivos = proveedores.filter(p => p.estado === 'Activo').length;
    const proveedoresPendientes = proveedores.filter(p => p.estado === 'Pendiente').length;
    const proveedoresInactivos = proveedores.filter(p => p.estado === 'Inactivo').length;
    const proveedoresMateriaPrima = proveedores.filter(p => p.segmento === 'Materia prima').length;
    const proveedoresServicios = proveedores.filter(p => p.segmento === 'Servicios').length;
    const porcentajeProveedoresActivos = totalProveedores > 0 
      ? (proveedoresActivos / totalProveedores) * 100 
      : 0;
    const porcentajeMateriaPrima = totalProveedores > 0
      ? (proveedoresMateriaPrima / totalProveedores) * 100
      : 0;
    
    // GRUPO 2: PEDIDOS Y COMPRAS
    const totalPedidos = proveedores.reduce((acc, p) => acc + p.numeroPedidos, 0);
    const totalCompras = proveedores.reduce((acc, p) => acc + p.totalCompras, 0);
    const compraMediaPorProveedor = totalProveedores > 0 
      ? totalCompras / totalProveedores 
      : 0;
    const pedidoMedioPorProveedor = totalProveedores > 0 
      ? totalPedidos / totalProveedores 
      : 0;
    const ticketMedioPedido = totalPedidos > 0
      ? totalCompras / totalPedidos
      : 0;
    
    // Compras por segmento
    const comprasMateriaPrima = proveedores
      .filter(p => p.segmento === 'Materia prima')
      .reduce((acc, p) => acc + p.totalCompras, 0);
    const comprasServicios = proveedores
      .filter(p => p.segmento === 'Servicios')
      .reduce((acc, p) => acc + p.totalCompras, 0);
    const porcentajeComprasMateriaPrima = totalCompras > 0
      ? (comprasMateriaPrima / totalCompras) * 100
      : 0;
    const porcentajeComprasServicios = totalCompras > 0
      ? (comprasServicios / totalCompras) * 100
      : 0;
    
    // GRUPO 3: COBROS E IMPAGOS
    const totalRegistrosImpagos = cobrosImpagos.length;
    const totalImpagos = cobrosImpagos.reduce((acc, c) => acc + c.importe, 0);
    const impagosVencidos = cobrosImpagos.filter(c => c.estado === 'Vencido').length;
    const impagosProximosVencer = cobrosImpagos.filter(c => c.estado === 'Próximo a vencer').length;
    const impagosEnGestion = cobrosImpagos.filter(c => c.estado === 'En gestión').length;
    const porcentajeImpagosVencidos = totalRegistrosImpagos > 0
      ? (impagosVencidos / totalRegistrosImpagos) * 100
      : 0;
    
    // Importes por estado
    const importeVencido = cobrosImpagos
      .filter(c => c.estado === 'Vencido')
      .reduce((acc, c) => acc + c.importe, 0);
    const importeProximoVencer = cobrosImpagos
      .filter(c => c.estado === 'Próximo a vencer')
      .reduce((acc, c) => acc + c.importe, 0);
    const importeEnGestion = cobrosImpagos
      .filter(c => c.estado === 'En gestión')
      .reduce((acc, c) => acc + c.importe, 0);
    const importePromedioImpago = totalRegistrosImpagos > 0
      ? totalImpagos / totalRegistrosImpagos
      : 0;
    
    // Días de vencimiento promedio
    const diasVencidoPromedio = cobrosImpagos.length > 0
      ? cobrosImpagos.reduce((acc, c) => acc + c.diasVencido, 0) / cobrosImpagos.length
      : 0;
    const diasVencidoMaximo = cobrosImpagos.length > 0
      ? Math.max(...cobrosImpagos.map(c => c.diasVencido))
      : 0;
    
    // GRUPO 4: PREVISIÓN DE VENTAS
    const totalObjetivoMes = previsionDias.reduce((acc, p) => acc + p.objetivoVentas, 0);
    const totalVentasRealizadas = previsionDias.reduce((acc, p) => acc + p.ventasRealizadas, 0);
    const totalDiferencia = totalVentasRealizadas - totalObjetivoMes;
    const porcentajeCumplimiento = totalObjetivoMes > 0
      ? (totalVentasRealizadas / totalObjetivoMes) * 100
      : 0;
    const desviacionAbsoluta = Math.abs(totalDiferencia);
    const porcentajeDesviacion = totalObjetivoMes > 0
      ? (totalDiferencia / totalObjetivoMes) * 100
      : 0;
    
    // Días superando objetivo
    const diasSuperandoObjetivo = previsionDias.filter(p => p.diferencia > 0).length;
    const diasDebajObjetivo = previsionDias.filter(p => p.diferencia < 0).length;
    const diasCumpliendoObjetivo = previsionDias.filter(p => p.diferencia === 0).length;
    const totalDias = previsionDias.length;
    const porcentajeDiasSuperando = totalDias > 0
      ? (diasSuperandoObjetivo / totalDias) * 100
      : 0;
    
    // Venta promedio diaria
    const ventaPromedioDiaria = previsionDias.length > 0
      ? totalVentasRealizadas / previsionDias.length
      : 0;
    const objetivoPromedioDiario = previsionDias.length > 0
      ? totalObjetivoMes / previsionDias.length
      : 0;
    const diferenciaPromedioDiaria = ventaPromedioDiaria - objetivoPromedioDiario;
    
    // GRUPO 5: ANÁLISIS FINANCIERO GENERAL
    const balanceGlobal = totalVentasRealizadas - totalCompras;
    const margenGlobal = totalVentasRealizadas > 0
      ? ((totalVentasRealizadas - totalCompras) / totalVentasRealizadas) * 100
      : 0;
    const margenBruto = totalVentasRealizadas - totalCompras;
    const rentabilidad = totalCompras > 0
      ? (margenBruto / totalCompras) * 100
      : 0;
    
    // Ratio de morosidad
    const ratioMorosidad = totalVentasRealizadas > 0
      ? (totalImpagos / totalVentasRealizadas) * 100
      : 0;
    
    // GRUPO 6: EFICIENCIA OPERATIVA
    const ebitdaAproximado = margenBruto - totalImpagos;
    const facturacionNeta = totalVentasRealizadas - totalImpagos;
    const porcentajeGastos = totalVentasRealizadas > 0
      ? (totalCompras / totalVentasRealizadas) * 100
      : 0;
    
    return {
      // Grupo 1: Proveedores
      totalProveedores,
      proveedoresActivos,
      proveedoresPendientes,
      proveedoresInactivos,
      proveedoresMateriaPrima,
      proveedoresServicios,
      porcentajeProveedoresActivos,
      porcentajeMateriaPrima,
      
      // Grupo 2: Compras
      totalPedidos,
      totalCompras,
      compraMediaPorProveedor,
      pedidoMedioPorProveedor,
      ticketMedioPedido,
      comprasMateriaPrima,
      comprasServicios,
      porcentajeComprasMateriaPrima,
      porcentajeComprasServicios,
      
      // Grupo 3: Impagos
      totalRegistrosImpagos,
      totalImpagos,
      impagosVencidos,
      impagosProximosVencer,
      impagosEnGestion,
      porcentajeImpagosVencidos,
      importeVencido,
      importeProximoVencer,
      importeEnGestion,
      importePromedioImpago,
      diasVencidoPromedio,
      diasVencidoMaximo,
      
      // Grupo 4: Previsión
      totalObjetivoMes,
      totalVentasRealizadas,
      totalDiferencia,
      porcentajeCumplimiento,
      desviacionAbsoluta,
      porcentajeDesviacion,
      diasSuperandoObjetivo,
      diasDebajObjetivo,
      diasCumpliendoObjetivo,
      porcentajeDiasSuperando,
      ventaPromedioDiaria,
      objetivoPromedioDiario,
      diferenciaPromedioDiaria,
      
      // Grupo 5: Financiero general
      balanceGlobal,
      margenGlobal,
      margenBruto,
      rentabilidad,
      ratioMorosidad,
      
      // Grupo 6: Eficiencia
      ebitdaAproximado,
      facturacionNeta,
      porcentajeGastos
    };
  }, [proveedores, cobrosImpagos, previsionDias]);
  
  // Extraer variables para uso en el componente
  const {
    totalProveedores,
    proveedoresActivos,
    proveedoresPendientes,
    proveedoresInactivos,
    proveedoresMateriaPrima,
    proveedoresServicios,
    totalPedidos,
    totalCompras,
    compraMediaPorProveedor,
    pedidoMedioPorProveedor,
    comprasMateriaPrima,
    comprasServicios,
    totalImpagos,
    impagosVencidos,
    impagosProximosVencer,
    impagosEnGestion,
    importeVencido,
    importeProximoVencer,
    importeEnGestion,
    diasVencidoPromedio,
    totalObjetivoMes,
    totalVentasRealizadas,
    totalDiferencia,
    porcentajeCumplimiento,
    diasSuperandoObjetivo,
    diasDebajObjetivo,
    diasCumpliendoObjetivo,
    ventaPromedioDiaria,
    objetivoPromedioDiario,
    balanceGlobal,
    margenGlobal,
    ratioMorosidad
  } = estadisticas;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <span className="hidden sm:inline">Facturación y Finanzas</span>
            <span className="sm:hidden">Finanzas</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="hidden sm:inline">Control financiero y gestión de proveedores</span>
            <span className="sm:hidden">Control financiero</span>
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-auto">
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Exportar Reporte</span>
          <span className="sm:hidden">Exportar</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="facturas">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm">
          <TabsTrigger value="facturas" className="truncate">
            <span className="hidden sm:inline">Facturas / Proveedores</span>
            <span className="sm:hidden">Facturas</span>
          </TabsTrigger>
          <TabsTrigger value="cobros" className="truncate">
            <span className="hidden sm:inline">Cobros/Impagos</span>
            <span className="sm:hidden">Cobros</span>
          </TabsTrigger>
          <TabsTrigger value="tesoreria" className="truncate">Tesorería</TabsTrigger>
          <TabsTrigger value="prevision" className="truncate">Previsión</TabsTrigger>
        </TabsList>

        {/* Tab: Facturas / Proveedores */}
        <TabsContent value="facturas" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* KPIs de Proveedores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-2 border-teal-200">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    <span className="hidden sm:inline">Total Proveedores</span>
                    <span className="sm:hidden">Proveedores</span>
                  </p>
                  <p className="text-2xl sm:text-3xl text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {totalProveedores}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{proveedoresActivos} activos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    <span className="hidden sm:inline">Materia Prima</span>
                    <span className="sm:hidden">Mat. Prima</span>
                  </p>
                  <p className="text-2xl sm:text-3xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {proveedoresMateriaPrima}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">proveedores</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Servicios</p>
                  <p className="text-2xl sm:text-3xl text-purple-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {proveedoresServicios}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">proveedores</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">
                    <span className="hidden sm:inline">Total Compras</span>
                    <span className="sm:hidden">Compras</span>
                  </p>
                  <p className="text-lg sm:text-2xl text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    €{totalCompras.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{totalPedidos} pedidos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Proveedores */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Listado de Proveedores de Alimentación
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ordenados del más reciente al más antiguo • {proveedores.length} proveedores totales
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Proveedor</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Segmento</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Nº Pedidos</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Total Compras</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Último Pedido</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Estado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">
                        <div className="flex flex-col items-center gap-2">
                          <Button 
                            size="sm" 
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => setDialogAñadirFactura(true)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Añadir Factura
                          </Button>
                          <span>Acciones</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {proveedores.map((proveedor) => (
                      <tr 
                        key={proveedor.id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        {/* Proveedor (Nombre + ID) */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{proveedor.nombre}</p>
                            <p className="text-xs text-gray-500">{proveedor.id}</p>
                          </div>
                        </td>

                        {/* Segmento */}
                        <td className="py-4 px-4 text-center">
                          {getSegmentoBadge(proveedor.segmento)}
                        </td>

                        {/* Número de Pedidos */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingCart className="w-3 h-3 text-gray-400" />
                            <span className="font-medium text-gray-900">{proveedor.numeroPedidos}</span>
                          </div>
                        </td>

                        {/* Total Compras */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-teal-600">
                            €{proveedor.totalCompras.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Fecha Último Pedido */}
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm text-gray-600">
                            {formatFecha(proveedor.fechaUltimoPedido)}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 text-center">
                          {getEstadoBadge(proveedor.estado)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-center">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cobros/Impagos */}
        <TabsContent value="cobros" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Gestión de Cobros e Impagos
                  </CardTitle>
                  <CardDescription>
                    Control de pagos pendientes y recuperación • {cobrosImpagos.length} facturas impagadas
                  </CardDescription>
                </div>

                {/* Selector de periodo */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Periodo:</span>
                  <Select value={periodoImpagos} onValueChange={setPeriodoImpagos}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Este mes</SelectItem>
                      <SelectItem value="trimestre">Este trimestre</SelectItem>
                      <SelectItem value="anio">Este año</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Estadísticas de impagos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Impagado</p>
                        <p className="text-2xl text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €{totalImpagos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Receipt className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Facturas Vencidas</p>
                        <p className="text-2xl text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {impagosVencidos}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Facturas</p>
                        <p className="text-2xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {cobrosImpagos.length}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de impagos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Factura</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Importe</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Fecha Emisión</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Días Vencido</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Estado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobrosImpagos.map((cobro) => (
                      <tr 
                        key={cobro.id} 
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        {/* Cliente */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{cobro.cliente}</p>
                            <p className="text-xs text-gray-500">{cobro.id}</p>
                          </div>
                        </td>

                        {/* Factura */}
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-900">{cobro.factura}</span>
                        </td>

                        {/* Importe */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-red-600">
                            €{cobro.importe.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Fecha Emisión */}
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm text-gray-600">
                            {formatFecha(cobro.fechaEmision)}
                          </span>
                        </td>

                        {/* Días Vencido */}
                        <td className="py-4 px-4 text-center">
                          <Badge className={cobro.diasVencido > 15 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                            {cobro.diasVencido} días
                          </Badge>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-4 text-center">
                          {getEstadoImpagoBadge(cobro.estado)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              Ver
                            </Button>
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs">
                              Gestionar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Tesorería */}
        <TabsContent value="tesoreria" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estado de Tesorería
                </CardTitle>
                <CardDescription>
                  Flujo de caja y saldo actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Saldo actual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Saldo Actual</p>
                          <p className="text-3xl text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            €42,580
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Actualizado hoy</p>
                        </div>
                        <Wallet className="w-10 h-10 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
                          <p className="text-2xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            €18,870
                          </p>
                          <p className="text-xs text-green-600 mt-1">+8.5% vs mes anterior</p>
                        </div>
                        <ArrowUpCircle className="w-10 h-10 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Gastos del Mes</p>
                          <p className="text-2xl text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            €12,340
                          </p>
                          <p className="text-xs text-red-600 mt-1">+3.2% vs mes anterior</p>
                        </div>
                        <ArrowDownCircle className="w-10 h-10 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detalles de tesorería */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cuentas bancarias */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-gray-900 font-medium">Cuentas Bancarias</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Banco Santander</p>
                            <p className="text-xs text-gray-500">ES89 0049 ****  **** 1234</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">€28,450</p>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">BBVA</p>
                            <p className="text-xs text-gray-500">ES21 0182 ****  **** 5678</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">€14,130</p>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <PiggyBank className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Caja Registradora</p>
                            <p className="text-xs text-gray-500">Efectivo disponible</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900">€2,800</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Próximos pagos */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-gray-900 font-medium">Próximos Pagos</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg border-orange-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nóminas Noviembre</p>
                          <p className="text-xs text-gray-500">Vence: 30 Nov 2025</p>
                        </div>
                        <p className="font-semibold text-orange-600">€8,500</p>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg border-orange-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Proveedores</p>
                          <p className="text-xs text-gray-500">Vence: 20 Nov 2025</p>
                        </div>
                        <p className="font-semibold text-orange-600">€4,250</p>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg border-blue-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Alquiler Local</p>
                          <p className="text-xs text-gray-500">Vence: 1 Dic 2025</p>
                        </div>
                        <p className="font-semibold text-blue-600">€2,800</p>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg border-blue-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Suministros</p>
                          <p className="text-xs text-gray-500">Vence: 25 Nov 2025</p>
                        </div>
                        <p className="font-semibold text-blue-600">€890</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Flujo de caja mensual */}
                <Card>
                  <CardHeader>
                    <h3 className="text-gray-900 font-medium flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" />
                      Resumen de Flujo de Caja
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Total Ingresos Noviembre</p>
                        <p className="text-xl font-semibold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €18,870
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900">Total Gastos Noviembre</p>
                        <p className="text-xl font-semibold text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €12,340
                        </p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                        <p className="text-sm font-medium text-gray-900">Beneficio Neto Mensual</p>
                        <p className="text-2xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          €6,530
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Previsión */}
        <TabsContent value="prevision" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Previsión de Ventas
                  </CardTitle>
                  <CardDescription>
                    Objetivos vs Ventas Realizadas • Análisis diario
                  </CardDescription>
                </div>

                {/* Selector de periodo */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Periodo:</span>
                  <Select value={periodoPrevision} onValueChange={setPeriodoPrevision}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dia">Hoy</SelectItem>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Mes en curso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* KPIs de previsión - CALCULADOS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Objetivo Acumulado</p>
                      <p className="text-2xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        €{totalObjetivoMes.toLocaleString('es-ES')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        €{objetivoPromedioDiario.toFixed(0)}/día
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Ventas Realizadas</p>
                      <p className="text-2xl text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        €{totalVentasRealizadas.toLocaleString('es-ES')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        €{ventaPromedioDiaria.toFixed(0)}/día
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-teal-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Diferencia Total</p>
                      <p className={`text-2xl ${totalDiferencia >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {totalDiferencia >= 0 ? '+' : ''}€{totalDiferencia.toLocaleString('es-ES')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {diasSuperandoObjetivo} días sobre objetivo
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">% Cumplimiento</p>
                      <p className={`text-2xl ${porcentajeCumplimiento >= 100 ? 'text-green-600' : 'text-orange-600'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {porcentajeCumplimiento.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {porcentajeCumplimiento >= 100 ? '✓ Superado' : '⚠ Por debajo'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabla de previsión por días */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Fecha</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Objetivo Ventas</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Ventas Realizadas</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Diferencia</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">Acumulado</th>
                      <th className="text-center py-3 px-4 text-sm text-gray-600">% Día</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previsionDias.map((dia, index) => {
                      const porcentajeDia = Math.round((dia.ventasRealizadas / dia.objetivoVentas) * 100);
                      const cumplido = dia.diferencia >= 0;

                      return (
                        <tr 
                          key={index} 
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          {/* Fecha */}
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{formatFechaDia(dia.fecha)}</p>
                              <p className="text-xs text-gray-500">{formatFecha(dia.fecha)}</p>
                            </div>
                          </td>

                          {/* Objetivo Ventas */}
                          <td className="py-4 px-4 text-center">
                            <span className="text-sm text-gray-900 font-medium">
                              €{dia.objetivoVentas.toLocaleString('es-ES')}
                            </span>
                          </td>

                          {/* Ventas Realizadas */}
                          <td className="py-4 px-4 text-center">
                            <span className="text-sm text-teal-600 font-semibold">
                              €{dia.ventasRealizadas.toLocaleString('es-ES')}
                            </span>
                          </td>

                          {/* Diferencia */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {cumplido ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              )}
                              <span className={`font-semibold ${cumplido ? 'text-green-600' : 'text-red-600'}`}>
                                {cumplido ? '+' : ''}€{dia.diferencia.toLocaleString('es-ES')}
                              </span>
                            </div>
                          </td>

                          {/* Acumulado */}
                          <td className="py-4 px-4 text-center">
                            <span className="text-sm text-blue-600 font-semibold">
                              €{dia.acumulado.toLocaleString('es-ES')}
                            </span>
                          </td>

                          {/* % Día */}
                          <td className="py-4 px-4 text-center">
                            <Badge className={
                              porcentajeDia >= 100 
                                ? 'bg-green-100 text-green-800' 
                                : porcentajeDia >= 90 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }>
                              {porcentajeDia}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Añadir Factura */}
      <Dialog open={dialogAñadirFactura} onOpenChange={setDialogAñadirFactura}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Añadir Nueva Factura
            </DialogTitle>
            <DialogDescription>
              Selecciona cómo deseas añadir la factura
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            {/* Opción OCR */}
            <Button 
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              onClick={() => {
                setDialogAñadirFactura(false);
                // Aquí iría la lógica de OCR
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-white/20 rounded-lg">
                  <ScanLine className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Escanear con OCR</p>
                  <p className="text-xs opacity-90">Usa la cámara para escanear la factura</p>
                </div>
              </div>
            </Button>

            {/* Opción Adjuntar */}
            <Button 
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
              onClick={() => {
                setDialogAñadirFactura(false);
                // Aquí iría la lógica de adjuntar archivo
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Adjuntar desde PC/Móvil</p>
                  <p className="text-xs opacity-90">Sube una imagen o PDF de la factura</p>
                </div>
              </div>
            </Button>

            {/* Opción Manual */}
            <Button 
              className="w-full justify-start h-auto p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              onClick={() => {
                setDialogAñadirFactura(false);
                // Aquí iría la lógica de formulario manual
              }}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Edit className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Añadir a Mano</p>
                  <p className="text-xs opacity-90">Completa los datos manualmente</p>
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}