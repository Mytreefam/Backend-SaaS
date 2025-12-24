import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Package,
  Search,
  Filter,
  MoreVertical,
  FileText,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PackagePlus,
  History,
  Undo2,
  Receipt,
  Eye,
  Euro,
  Send,
  ArrowRightLeft,
  TrendingUp,
  DollarSign,
  Truck
} from 'lucide-react';
import { AñadirMaterialModal } from './AñadirMaterialModal';
import { RecepcionMaterialModal } from './RecepcionMaterialModal';
import { productosPanaderia } from '../../data/productos-panaderia';
import { toast } from 'sonner@2.0.3';
import { useStock } from '../../contexts/StockContext';

interface Material {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  minimo: number;
  ubicacion: string;
  estado: 'disponible' | 'bajo' | 'agotado';
  lote?: string;
  precio?: number;
}

interface Movimiento {
  id: string;
  tipo: 'ot' | 'venta_directa' | 'correccion';
  fecha: string;
  material: string;
  codigo: string;
  cantidad: number;
  ot?: string;
  cliente?: string;
  total?: number;
  metodoPago?: string;
  tipoDocumento?: 'ticket' | 'factura';
}

interface PedidoPendiente {
  id: string;
  proveedor: string;
  fechaSolicitud: string;
  fechaEsperada: string;
  estado: 'pendiente' | 'parcial' | 'retrasado';
  productos: {
    nombre: string;
    codigo: string;
    cantidadSolicitada: number;
    cantidadRecibida: number;
  }[];
  total: number;
}

export function MaterialTrabajador() {
  // ✅ HOOK DE STOCKCONTEXT - Sincronización en tiempo real
  const {
    stock: stockFromContext,
    pedidosProveedores: pedidosFromContext,
    puntoVentaActivo,
    getPedidosPorPuntoVenta,
    registrarRecepcion,
    movimientos: movimientosFromContext,
  } = useStock();

  const [vistaActual, setVistaActual] = useState<'recepcion' | 'stock' | 'movimientos'>('recepcion');
  
  // Stock
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [ubicacionFiltro, setUbicacionFiltro] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  
  // Movimientos
  const [busquedaMovimiento, setBusquedaMovimiento] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [fechaFiltro, setFechaFiltro] = useState('todos');
  
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState<Material | null>(null);
  const [recepcionModalOpen, setRecepcionModalOpen] = useState(false);
  const [modoVentaDirecta, setModoVentaDirecta] = useState(false);
  const [pedidoSeleccionadoRecepcion, setPedidoSeleccionadoRecepcion] = useState<string | null>(null);

  // ✅ DATOS DE PEDIDOS DEL CONTEXTO - Sincronizados en tiempo real con el gerente
  const pedidosDelContexto = getPedidosPorPuntoVenta(
    'Disarmink SL - Hoy Pecamos',
    puntoVentaActivo || 'Tiana'
  ).filter(p => p.estado !== 'entregado' && p.estado !== 'anulado');

  // Convertir pedidos del contexto al formato esperado
  const pedidosPendientesFromContext: PedidoPendiente[] = pedidosDelContexto.map(pedido => ({
    id: pedido.id,
    proveedor: pedido.proveedorNombre,
    fechaSolicitud: pedido.fechaSolicitud,
    fechaEsperada: pedido.fechaEstimadaEntrega || '',
    estado: pedido.estado as 'pendiente' | 'parcial' | 'retrasado',
    productos: pedido.articulos.map(art => ({
      nombre: art.nombre,
      codigo: art.codigo,
      cantidadSolicitada: art.cantidad,
      cantidadRecibida: art.cantidadRecibida || 0
    })),
    total: pedido.total
  }));

  // Usar datos del contexto si existen, sino usar mock local
  const pedidosPendientes: PedidoPendiente[] = pedidosDelContexto.length > 0 
    ? pedidosPendientesFromContext 
    : [
    {
      id: 'PED-2025-011',
      proveedor: 'Harinas Molino del Sur',
      fechaSolicitud: '2025-11-18',
      fechaEsperada: '2025-11-22',
      estado: 'pendiente',
      productos: [
        { nombre: 'Harina Panadera T55', codigo: 'HAR-T55', cantidadSolicitada: 100, cantidadRecibida: 0 },
        { nombre: 'Harina Integral', codigo: 'HAR-INT', cantidadSolicitada: 50, cantidadRecibida: 0 },
        { nombre: 'Levadura Fresca', codigo: 'LEV-FRS', cantidadSolicitada: 20, cantidadRecibida: 0 }
      ],
      total: 285.50
    },
    {
      id: 'PED-2025-010',
      proveedor: 'Lácteos Menorca',
      fechaSolicitud: '2025-11-15',
      fechaEsperada: '2025-11-20',
      estado: 'retrasado',
      productos: [
        { nombre: 'Mantequilla Premium', codigo: 'MANT-PRE', cantidadSolicitada: 30, cantidadRecibida: 0 },
        { nombre: 'Leche Entera', codigo: 'LEC-ENT', cantidadSolicitada: 40, cantidadRecibida: 0 },
        { nombre: 'Nata para Montar', codigo: 'NAT-MON', cantidadSolicitada: 25, cantidadRecibida: 0 }
      ],
      total: 198.75
    },
    {
      id: 'PED-2025-009',
      proveedor: 'Azúcares Iberia',
      fechaSolicitud: '2025-11-14',
      fechaEsperada: '2025-11-21',
      estado: 'parcial',
      productos: [
        { nombre: 'Azúcar Blanco', codigo: 'AZU-BLA', cantidadSolicitada: 80, cantidadRecibida: 50 },
        { nombre: 'Azúcar Glas', codigo: 'AZU-GLA', cantidadSolicitada: 30, cantidadRecibida: 30 },
        { nombre: 'Chocolate Cobertura', codigo: 'CHO-COB', cantidadSolicitada: 40, cantidadRecibida: 0 }
      ],
      total: 342.00
    }
  ];

  // Convertir productos de panadería CORE a formato de material
  const materiales: Material[] = productosPanaderia.map((producto, index) => {
    // Determinar estado según el stock
    let estado: 'disponible' | 'bajo' | 'agotado' = 'disponible';
    const minimo = 10; // Stock mínimo recomendado para cafés
    
    if (producto.stock === 0) {
      estado = 'agotado';
    } else if (producto.stock < minimo) {
      estado = 'bajo';
    }

    return {
      id: producto.id,
      codigo: producto.id,
      nombre: producto.nombre,
      categoria: producto.categoria,
      stock: producto.stock,
      minimo: minimo,
      ubicacion: 'PDV', // Punto de venta
      estado: estado,
      precio: producto.precio
    };
  });

  const movimientos: Movimiento[] = [
    {
      id: 'MOV001',
      tipo: 'ot',
      fecha: '2025-11-11T10:30:00',
      material: 'Barras de Pan Artesanal',
      codigo: 'PAN001',
      cantidad: 15,
      ot: 'PED-2025-001',
      cliente: 'Juan Pérez'
    },
    {
      id: 'MOV002',
      tipo: 'venta_directa',
      fecha: '2025-11-11T11:15:00',
      material: 'Croissants Mantequilla',
      codigo: 'CRSNT001',
      cantidad: 12,
      cliente: 'María García',
      total: 30.00,
      metodoPago: 'tarjeta',
      tipoDocumento: 'ticket'
    },
    {
      id: 'MOV003',
      tipo: 'correccion',
      fecha: '2025-11-11T12:00:00',
      material: 'Ensaimadas',
      codigo: 'ENSA001',
      cantidad: 8,
      ot: 'PED-2025-003',
      cliente: 'Pedro López'
    },
    {
      id: 'MOV004',
      tipo: 'ot',
      fecha: '2025-11-10T15:45:00',
      material: 'Coca-Cola 33cl',
      codigo: 'BEBIDA001',
      cantidad: 8,
      ot: 'PED-2025-002',
      cliente: 'Ana Martín'
    },
    {
      id: 'MOV005',
      tipo: 'venta_directa',
      fecha: '2025-11-10T09:20:00',
      material: 'Baguettes Francesas',
      codigo: 'BAG001',
      cantidad: 6,
      cliente: 'Venta mostrador',
      total: 18.00,
      metodoPago: 'efectivo',
      tipoDocumento: 'factura'
    },
  ];

  const categorias = ['todas', ...Array.from(new Set(materiales.map(m => m.categoria)))];
  const ubicaciones = ['todas', ...Array.from(new Set(materiales.map(m => m.ubicacion)))];

  const materialesFiltrados = materiales.filter(material => {
    const matchBusqueda = material.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         material.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' || material.categoria === categoriaFiltro;
    const matchUbicacion = ubicacionFiltro === 'todas' || material.ubicacion === ubicacionFiltro;
    const matchEstado = estadoFiltro === 'todos' || material.estado === estadoFiltro;

    return matchBusqueda && matchCategoria && matchUbicacion && matchEstado;
  });

  const movimientosFiltrados = movimientos.filter(mov => {
    const matchBusqueda = mov.material.toLowerCase().includes(busquedaMovimiento.toLowerCase()) ||
                         mov.codigo.toLowerCase().includes(busquedaMovimiento.toLowerCase()) ||
                         mov.ot?.toLowerCase().includes(busquedaMovimiento.toLowerCase()) ||
                         mov.cliente?.toLowerCase().includes(busquedaMovimiento.toLowerCase());
    const matchTipo = tipoFiltro === 'todos' || mov.tipo === tipoFiltro;
    
    let matchFecha = true;
    if (fechaFiltro === 'hoy') {
      const hoy = new Date().toDateString();
      const fechaMov = new Date(mov.fecha).toDateString();
      matchFecha = hoy === fechaMov;
    } else if (fechaFiltro === 'semana') {
      const hace7dias = new Date();
      hace7dias.setDate(hace7dias.getDate() - 7);
      matchFecha = new Date(mov.fecha) >= hace7dias;
    }

    return matchBusqueda && matchTipo && matchFecha;
  });

  const handleRegistrarConsumo = (material: Material) => {
    setMaterialSeleccionado(material);
    setModoVentaDirecta(false);
    setMaterialModalOpen(true);
  };

  const handleVentaDirecta = (material: Material) => {
    setMaterialSeleccionado(material);
    setModoVentaDirecta(true);
    setMaterialModalOpen(true);
  };

  const handleSolicitar = (material: Material) => {
    toast.success(`Solicitud de "${material.nombre}" enviada al Gerente`);
    console.log('[NOTIFICACIÓN GERENTE] Nueva solicitud de material:', {
      material: material.nombre,
      codigo: material.codigo,
      stockActual: material.stock,
      minimo: material.minimo,
      solicitante: 'Colaborador'
    });
  };

  const handleVerFicha = (material: Material) => {
    toast.info(`Abriendo ficha de ${material.nombre}...`);
  };

  const handleMaterialRegistrado = (consumo: any) => {
    console.log('Material registrado:', consumo);
    setMaterialSeleccionado(null);
  };

  const handleDevolver = (movimiento: Movimiento) => {
    toast.info(`Procesando devolución de ${movimiento.material}...`);
    console.log('[DEVOLUCIÓN] Crear movimiento de ajuste:', {
      movimientoOriginal: movimiento.id,
      material: movimiento.material,
      cantidad: movimiento.cantidad,
      tipo: 'devolucion'
    });
  };

  const handleVerTicketFactura = (movimiento: Movimiento) => {
    if (movimiento.tipo === 'venta_directa') {
      toast.success(`Abriendo ${movimiento.tipoDocumento || 'documento'}...`);
      console.log(`[PDF] Visualizar ${movimiento.tipoDocumento}:`, movimiento);
    } else {
      toast.error('Solo disponible para ventas directas');
    }
  };

  const handleVerOT = (movimiento: Movimiento) => {
    if (movimiento.ot) {
      toast.info(`Abriendo ${movimiento.ot}...`);
      console.log('[NAVEGACIÓN] Ir a OT:', movimiento.ot);
    } else {
      toast.error('No tiene OT asociada');
    }
  };

  const getEstadoBadge = (material: Material) => {
    if (material.estado === 'agotado') {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Sin stock
        </Badge>
      );
    } else if (material.estado === 'bajo') {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Stock bajo
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Disponible
        </Badge>
      );
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'ot':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">OT</Badge>;
      case 'venta_directa':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Venta directa</Badge>;
      case 'correccion':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Corrección</Badge>;
      default:
        return <Badge variant="outline">Otro</Badge>;
    }
  };

  const getEstadoPedidoBadge = (estado: 'pendiente' | 'parcial' | 'retrasado') => {
    switch (estado) {
      case 'pendiente':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Pendiente</Badge>;
      case 'parcial':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">Parcial</Badge>;
      case 'retrasado':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Retrasado</Badge>;
      default:
        return <Badge variant="outline">Otro</Badge>;
    }
  };

  // ============= ESTADÍSTICAS CALCULADAS DINÁMICAMENTE =============

  const estadisticas = useMemo(() => {
    // GRUPO 1: Stock general
    const totalMateriales = materiales.length;
    const materialesDisponibles = materiales.filter(m => m.estado === 'disponible').length;
    const materialesBajo = materiales.filter(m => m.estado === 'bajo').length;
    const materialesAgotados = materiales.filter(m => m.estado === 'agotado').length;
    const stockTotal = materiales.reduce((sum, m) => sum + m.stock, 0);
    
    // GRUPO 2: Alertas
    const materialesConAlerta = materialesBajo + materialesAgotados;
    const porcentajeAlertas = totalMateriales > 0 ? (materialesConAlerta / totalMateriales) * 100 : 0;

    // GRUPO 3: Movimientos
    const totalMovimientos = movimientos.length;
    const movimientosOT = movimientos.filter(m => m.tipo === 'ot').length;
    const movimientosVentaDirecta = movimientos.filter(m => m.tipo === 'venta_directa').length;
    const movimientosCorreccion = movimientos.filter(m => m.tipo === 'correccion').length;
    
    // GRUPO 4: Cantidades de movimientos
    const cantidadTotalMovida = movimientos.reduce((sum, m) => sum + m.cantidad, 0);
    const promedioMovimiento = totalMovimientos > 0 ? cantidadTotalMovida / totalMovimientos : 0;

    // GRUPO 5: Ventas directas
    const ventasDirectas = movimientos.filter(m => m.tipo === 'venta_directa');
    const totalVentasDirectas = ventasDirectas.reduce((sum, m) => sum + (m.total || 0), 0);
    
    // GRUPO 6: Pedidos pendientes
    const totalPedidosPendientes = pedidosPendientes.length;
    const pedidosRetrasados = pedidosPendientes.filter(p => p.estado === 'retrasado').length;
    const pedidosParciales = pedidosPendientes.filter(p => p.estado === 'parcial').length;
    const pedidosPendientesLimpios = pedidosPendientes.filter(p => p.estado === 'pendiente').length;
    const valorTotalPedidos = pedidosPendientes.reduce((sum, p) => sum + p.total, 0);

    // GRUPO 7: Proveedores únicos
    const proveedoresUnicos = [...new Set(pedidosPendientes.map(p => p.proveedor))].length;

    // GRUPO 8: Categorías de material
    const categoriasUnicas = [...new Set(materiales.map(m => m.categoria))].length;
    const categoriaMasMateriales = materiales.reduce((acc, m) => {
      acc[m.categoria] = (acc[m.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const categoriaDominante = Object.entries(categoriaMasMateriales).sort((a, b) => b[1] - a[1])[0];

    return {
      totalMateriales,
      materialesDisponibles,
      materialesBajo,
      materialesAgotados,
      stockTotal,
      materialesConAlerta,
      porcentajeAlertas,
      totalMovimientos,
      movimientosOT,
      movimientosVentaDirecta,
      movimientosCorreccion,
      cantidadTotalMovida,
      promedioMovimiento,
      totalVentasDirectas,
      totalPedidosPendientes,
      pedidosRetrasados,
      pedidosParciales,
      pedidosPendientesLimpios,
      valorTotalPedidos,
      proveedoresUnicos,
      categoriasUnicas,
      categoriaDominante: categoriaDominante ? categoriaDominante[0] : 'N/A',
      cantidadCategoriaDominante: categoriaDominante ? categoriaDominante[1] : 0,
    };
  }, [materiales, movimientos, pedidosPendientes]);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* KPIs CALCULADOS DINÁMICAMENTE */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Materiales</p>
                  <p className="text-gray-900 text-2xl">{estadisticas.totalMateriales}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.stockTotal} unidades
                  </p>
                </div>
                <Package className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Stock Disponible</p>
                  <p className="text-gray-900 text-2xl">{estadisticas.materialesDisponibles}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.materialesBajo} bajos
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Alertas</p>
                  <p className="text-gray-900 text-2xl">{estadisticas.materialesConAlerta}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.materialesAgotados} agotados
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Movimientos</p>
                  <p className="text-gray-900 text-2xl">{estadisticas.totalMovimientos}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.cantidadTotalMovida} unidades
                  </p>
                </div>
                <History className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESTADÍSTICAS ADICIONALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader>
              <p className="text-sm">Estado de Stock</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Disponibles</span>
                <Badge className="bg-green-100 text-green-800">
                  {estadisticas.materialesDisponibles}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stock bajo</span>
                <Badge className="bg-orange-100 text-orange-800">
                  {estadisticas.materialesBajo}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agotados</span>
                <Badge className="bg-red-100 text-red-800">
                  {estadisticas.materialesAgotados}
                </Badge>
              </div>
              {estadisticas.porcentajeAlertas > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-800">
                    {estadisticas.porcentajeAlertas.toFixed(0)}% con alertas
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm">Movimientos Recientes</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Órdenes de trabajo</p>
                <p className="text-sm text-gray-900">{estadisticas.movimientosOT} movimientos</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Ventas directas</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900">{estadisticas.movimientosVentaDirecta}</p>
                  <span className="text-xs text-green-600">
                    €{estadisticas.totalVentasDirectas.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Correcciones</p>
                <p className="text-sm text-gray-900">{estadisticas.movimientosCorreccion}</p>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500">Promedio por movimiento</p>
                <p className="text-sm text-teal-600">
                  {estadisticas.promedioMovimiento.toFixed(1)} unidades
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <p className="text-sm">Pedidos Pendientes</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Total pedidos</p>
                <p className="text-lg text-gray-900">{estadisticas.totalPedidosPendientes}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Retrasados</span>
                <Badge className="bg-red-100 text-red-800">
                  {estadisticas.pedidosRetrasados}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Parciales</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {estadisticas.pedidosParciales}
                </Badge>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Valor total</p>
                <p className="text-sm text-green-600">
                  €{estadisticas.valorTotalPedidos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Proveedores activos</p>
                <p className="text-sm text-blue-600">{estadisticas.proveedoresUnicos}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Stock / Consumos y Ventas */}
        <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as 'recepcion' | 'stock' | 'movimientos')}>
          <TabsList className="grid w-full md:w-auto grid-cols-3 h-11 sm:h-10">
            <TabsTrigger value="recepcion" className="text-xs sm:text-sm">
              <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
              Recepción
            </TabsTrigger>
            <TabsTrigger value="stock">
              <Package className="w-4 h-4 mr-2" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="movimientos">
              <History className="w-4 h-4 mr-2" />
              Consumos y Ventas
            </TabsTrigger>
          </TabsList>

          {/* ===== RECEPCIÓN ===== */}
          <TabsContent value="recepcion" className="space-y-4 mt-4">
            {/* Botones rápidos */}
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => {
                  toast.info('Abriendo transferencia de material...');
                  console.log('[TRANSFERIR] Transferir material entre almacenes');
                }}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Transferir material
              </Button>

              <Button
                onClick={() => setRecepcionModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <PackagePlus className="w-4 h-4 mr-2" />
                Recibir material
              </Button>

              <Button
                onClick={() => {
                  toast.info('Abriendo registro de merma...');
                  console.log('[MERMA] Registrar pérdida de productos');
                }}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Merma
              </Button>
            </div>

            {/* Tabla de pedidos pendientes */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Fecha Solicitud</TableHead>
                        <TableHead>Fecha Esperada</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosPendientes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No hay pedidos pendientes de recibir
                          </TableCell>
                        </TableRow>
                      ) : (
                        pedidosPendientes.map((pedido) => (
                          <TableRow key={pedido.id}>
                            <TableCell className="font-medium">{pedido.id}</TableCell>
                            <TableCell>
                              <p className="font-medium text-gray-900">{pedido.proveedor}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {new Date(pedido.fechaSolicitud).toLocaleDateString('es-ES')}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {new Date(pedido.fechaEsperada).toLocaleDateString('es-ES')}
                              </p>
                            </TableCell>
                            <TableCell>{getEstadoPedidoBadge(pedido.estado)}</TableCell>
                            <TableCell>
                              <p className="text-sm text-gray-600">
                                {pedido.productos.length} producto{pedido.productos.length !== 1 ? 's' : ''}
                              </p>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {pedido.total.toFixed(2)} €
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPedidoSeleccionadoRecepcion(pedido.id);
                                  setRecepcionModalOpen(true);
                                }}
                              >
                                Recibir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== INVENTARIO ===== */}
          <TabsContent value="stock" className="space-y-4 mt-4">
            {/* Filtros */}
            <Card>
              <CardHeader className="space-y-4">
                {/* Primera línea: Búsqueda y botones de acción */}
                <div className="flex items-center gap-3">
                  {/* Botón Filtros y Búsqueda */}
                  <Button variant="outline" className="flex items-center gap-2 border-gray-300">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </Button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por código o nombre..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Botones de acción a la derecha */}
                  <Button
                    onClick={() => {
                      toast.info('Abriendo transferencia de material...');
                      console.log('[TRANSFERIR] Transferir material entre almacenes');
                    }}
                    variant="outline"
                    className="whitespace-nowrap border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    Transferir material
                  </Button>

                  <Button
                    onClick={() => {
                      toast.info('Iniciando sesión de inventario...');
                      console.log('[INVENTARIO] Realizar inventario físico');
                    }}
                    variant="outline"
                    className="whitespace-nowrap border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Realizar Inventario
                  </Button>

                  <Button
                    onClick={() => setRecepcionModalOpen(true)}
                    className="whitespace-nowrap bg-green-600 hover:bg-green-700"
                  >
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Recibir material
                  </Button>

                  <Button
                    onClick={() => {
                      toast.info('Abriendo registro de merma...');
                      console.log('[MERMA] Registrar pérdida de productos');
                    }}
                    variant="outline"
                    className="whitespace-nowrap border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Merma
                  </Button>
                </div>

                {/* Segunda línea: Filtros de categoría, ubicación y estado */}
                <div className="flex gap-2 flex-wrap">
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat === 'todas' ? 'Todas las categorías' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={ubicacionFiltro} onValueChange={setUbicacionFiltro}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {ubicaciones.map(ubi => (
                        <SelectItem key={ubi} value={ubi}>
                          {ubi === 'todas' ? 'Todas' : ubi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="disponible">Disponible</SelectItem>
                      <SelectItem value="bajo">Stock bajo</SelectItem>
                      <SelectItem value="agotado">Agotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Tabla de materiales */}
            
            {/* Vista Móvil - Cards */}
            <div className="lg:hidden space-y-3">
              {materialesFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No se encontraron materiales</p>
                  </CardContent>
                </Card>
              ) : (
                materialesFiltrados.map((material) => (
                  <Card key={material.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 mb-1">{material.nombre}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {material.codigo}
                              </Badge>
                              {material.lote && (
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  Lote: {material.lote}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {getEstadoBadge(material)}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                          <div>
                            <p className="text-gray-500 text-xs mb-0.5">Categoría</p>
                            <p className="text-gray-900">{material.categoria}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-0.5">Ubicación</p>
                            <Badge variant="outline" className="bg-gray-50 text-xs">
                              {material.ubicacion}
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500 text-xs mb-0.5">Stock Actual / Mínimo</p>
                            <p className={`font-medium ${
                              material.stock === 0 ? 'text-red-600' :
                              material.stock < material.minimo ? 'text-orange-600' :
                              'text-gray-900'
                            }`}>
                              {material.stock} / {material.minimo} unidades
                            </p>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegistrarConsumo(material)}
                            disabled={material.stock === 0}
                            className="text-xs h-8"
                          >
                            <Package className="w-3 h-3 mr-1" />
                            Consumo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVentaDirecta(material)}
                            className="text-xs h-8"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Venta
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSolicitar(material)}
                            className="text-xs h-8"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Solicitar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerFicha(material)}
                            className="text-xs h-8"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Ver Ficha
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Vista Desktop/Tablet - Tabla */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materialesFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No se encontraron materiales
                          </TableCell>
                        </TableRow>
                      ) : (
                        materialesFiltrados.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">{material.codigo}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">{material.nombre}</p>
                                {material.lote && (
                                  <p className="text-xs text-gray-500">Lote: {material.lote}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{material.categoria}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-medium ${
                                material.stock === 0 ? 'text-red-600' :
                                material.stock < material.minimo ? 'text-orange-600' :
                                'text-gray-900'
                              }`}>
                                {material.stock}
                              </span>
                              <span className="text-gray-400 text-sm"> / {material.minimo}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-gray-50">
                                {material.ubicacion}
                              </Badge>
                            </TableCell>
                            <TableCell>{getEstadoBadge(material)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="touch-target p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleRegistrarConsumo(material)}
                                    disabled={material.stock === 0}
                                  >
                                    <Package className="w-4 h-4 mr-2" />
                                    Registrar consumo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleVentaDirecta(material)}>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Venta directa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSolicitar(material)}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Solicitar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleVerFicha(material)}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Ver ficha
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== CONSUMOS Y VENTAS ===== */}
          <TabsContent value="movimientos" className="space-y-4 mt-4">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Búsqueda */}
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por material, OT o cliente..."
                        value={busquedaMovimiento}
                        onChange={(e) => setBusquedaMovimiento(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-wrap">
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ot">Con OT</SelectItem>
                      <SelectItem value="venta_directa">Venta directa</SelectItem>
                      <SelectItem value="correccion">Corrección</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={fechaFiltro} onValueChange={setFechaFiltro}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="semana">Última semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Tabla de movimientos */}
            
            {/* Vista Móvil - Cards */}
            <div className="lg:hidden space-y-3">
              {movimientosFiltrados.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No se encontraron movimientos</p>
                  </CardContent>
                </Card>
              ) : (
                movimientosFiltrados.map((movimiento) => (
                  <Card key={movimiento.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 mb-1">{movimiento.material}</p>
                            <p className="text-xs text-gray-500">{movimiento.codigo}</p>
                          </div>
                          {getTipoBadge(movimiento.tipo)}
                        </div>

                        {/* Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                          <div>
                            <p className="text-gray-500 text-xs mb-0.5">Fecha</p>
                            <p className="text-gray-900 text-xs">
                              {new Date(movimiento.fecha).toLocaleDateString('es-ES')}
                            </p>
                            <p className="text-gray-500 text-[10px]">
                              {new Date(movimiento.fecha).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-0.5">Cantidad</p>
                            <p className="text-gray-900 font-medium">{movimiento.cantidad}</p>
                          </div>
                          {movimiento.ot && (
                            <div>
                              <p className="text-gray-500 text-xs mb-0.5">OT</p>
                              <p className="text-blue-600 font-medium text-xs">{movimiento.ot}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500 text-xs mb-0.5">Cliente</p>
                            <p className="text-gray-900 text-xs truncate">{movimiento.cliente}</p>
                          </div>
                          {movimiento.total && (
                            <div className="col-span-2">
                              <p className="text-gray-500 text-xs mb-0.5">Total</p>
                              <p className="text-gray-900 font-medium">{movimiento.total.toFixed(2)} €</p>
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDevolver(movimiento)}
                            className="flex-1 text-xs h-8"
                          >
                            <Undo2 className="w-3 h-3 mr-1" />
                            Devolver
                          </Button>
                          {movimiento.tipo === 'venta_directa' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerTicketFactura(movimiento)}
                              className="flex-1 text-xs h-8"
                            >
                              <Receipt className="w-3 h-3 mr-1" />
                              Ver Doc
                            </Button>
                          )}
                          {movimiento.ot && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerOT(movimiento)}
                              className="flex-1 text-xs h-8"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver OT
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Vista Desktop/Tablet - Tabla */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead>OT / Cliente</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[120px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimientosFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No se encontraron movimientos
                          </TableCell>
                        </TableRow>
                      ) : (
                        movimientosFiltrados.map((movimiento) => (
                          <TableRow key={movimiento.id}>
                            <TableCell>
                              <div>
                                <p className="text-sm">
                                  {new Date(movimiento.fecha).toLocaleDateString('es-ES')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(movimiento.fecha).toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{getTipoBadge(movimiento.tipo)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{movimiento.material}</p>
                                <p className="text-xs text-gray-500">{movimiento.codigo}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {movimiento.cantidad}
                            </TableCell>
                            <TableCell>
                              <div>
                                {movimiento.ot && (
                                  <p className="text-sm font-medium text-blue-600">{movimiento.ot}</p>
                                )}
                                <p className="text-sm text-gray-600">{movimiento.cliente}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {movimiento.total ? `${movimiento.total.toFixed(2)} €` : '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="touch-target p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDevolver(movimiento)}>
                                    <Undo2 className="w-4 h-4 mr-2" />
                                    Devolver
                                  </DropdownMenuItem>
                                  {movimiento.tipo === 'venta_directa' && (
                                    <DropdownMenuItem onClick={() => handleVerTicketFactura(movimiento)}>
                                      <Receipt className="w-4 h-4 mr-2" />
                                      Ver {movimiento.tipoDocumento}
                                    </DropdownMenuItem>
                                  )}
                                  {movimiento.ot && (
                                    <DropdownMenuItem onClick={() => handleVerOT(movimiento)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Ver OT
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de añadir material */}
      <AñadirMaterialModal
        isOpen={materialModalOpen}
        onOpenChange={setMaterialModalOpen}
        onMaterialRegistrado={handleMaterialRegistrado}
        modoVentaDirecta={modoVentaDirecta}
      />

      {/* Modal de recepción de material */}
      <RecepcionMaterialModal
        isOpen={recepcionModalOpen}
        onOpenChange={setRecepcionModalOpen}
        onRecepcionCompletada={() => {
          toast.success('Material recibido y añadido al stock');
        }}
      />
    </>
  );
}