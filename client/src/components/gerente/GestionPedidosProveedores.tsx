import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Copy,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  MoreVertical,
  FileText,
  Download,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { pedidosProveedores, PedidoProveedor } from '../../data/pedidos-proveedores';
import { proveedores } from '../../data/proveedores';
import { ModalCrearPedidoProveedor } from './modales/ModalCrearPedidoProveedor';
import { Separator } from '../ui/separator';

export function GestionPedidosProveedores() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroProveedor, setFiltroProveedor] = useState<string>('todos');
  const [filtroPdv, setFiltroPdv] = useState<string>('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoProveedor | null>(null);
  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState<string | null>(null);

  // Datos de pedidos
  const [pedidos, setPedidos] = useState<PedidoProveedor[]>(pedidosProveedores);

  // Calcular métricas
  const metricas = useMemo(() => {
    const pedidosPendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'confirmado');
    const pedidosParciales = pedidos.filter(p => p.estado === 'parcial');
    const pedidosCompletados = pedidos.filter(p => p.estado === 'completado');
    
    const valorTotal = pedidosPendientes.reduce((sum, p) => sum + p.total, 0);
    const valorParcial = pedidosParciales.reduce((sum, p) => sum + p.total, 0);
    
    // Calcular pedidos con retraso
    const hoy = new Date();
    const pedidosRetrasados = pedidosPendientes.filter(p => {
      const fechaEsperada = new Date(p.fechaEsperada);
      return fechaEsperada < hoy;
    });

    return {
      totalPendientes: pedidosPendientes.length,
      valorPendiente: valorTotal,
      pedidosParciales: pedidosParciales.length,
      valorParcial,
      pedidosCompletados: pedidosCompletados.length,
      pedidosRetrasados: pedidosRetrasados.length
    };
  }, [pedidos]);

  // Filtrar pedidos
  const pedidosFiltrados = useMemo(() => {
    let resultado = [...pedidos];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(
        p =>
          p.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.proveedorNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.lineas.some(l => l.articuloNombre.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    // Filtro por proveedor
    if (filtroProveedor !== 'todos') {
      resultado = resultado.filter(p => p.proveedorId === filtroProveedor);
    }

    // Filtro por PDV
    if (filtroPdv !== 'todos') {
      resultado = resultado.filter(p => p.pdvDestino === filtroPdv);
    }

    return resultado.sort((a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
  }, [pedidos, busqueda, filtroEstado, filtroProveedor, filtroPdv]);

  // Paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPorPagina);
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const getBadgeEstado = (estado: PedidoProveedor['estado']) => {
    const configs = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendiente' },
      confirmado: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmado' },
      parcial: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Parcial' },
      completado: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completado' },
      cancelado: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelado' },
    };

    const config = configs[estado];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const calcularDiasRestantes = (fechaEsperada: string) => {
    const hoy = new Date();
    const fechaEntrega = new Date(fechaEsperada);
    const diferencia = Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const getDiasRestantesBadge = (fechaEsperada: string, estado: string) => {
    if (estado === 'completado' || estado === 'cancelado') {
      return null;
    }

    const dias = calcularDiasRestantes(fechaEsperada);
    
    if (dias < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Retrasado {Math.abs(dias)}d
        </Badge>
      );
    } else if (dias === 0) {
      return (
        <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Hoy
        </Badge>
      );
    } else if (dias <= 3) {
      return (
        <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {dias} día{dias !== 1 ? 's' : ''}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-600" variant="outline">
          {dias} días
        </Badge>
      );
    }
  };

  const handleVerDetalle = (pedido: PedidoProveedor) => {
    setPedidoSeleccionado(pedido);
    setModalDetalleAbierto(true);
  };

  const handleEditarPedido = (pedido: PedidoProveedor) => {
    toast.info('Funcionalidad en desarrollo', {
      description: 'La edición de pedidos estará disponible próximamente'
    });
    console.log('📝 EDITAR PEDIDO:', pedido.numero);
  };

  const handleDuplicarPedido = (pedido: PedidoProveedor) => {
    toast.success('Pedido duplicado', {
      description: `Se ha creado una copia del pedido ${pedido.numero}`
    });
    console.log('📋 DUPLICAR PEDIDO:', pedido.numero);
    
    // Aquí se abriría el modal de crear pedido con los datos pre-cargados
    setModalCrearAbierto(true);
  };

  const handleCancelarPedido = (pedidoId: string) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;

    // Actualizar estado
    setPedidos(prevPedidos =>
      prevPedidos.map(p =>
        p.id === pedidoId ? { ...p, estado: 'cancelado' as const } : p
      )
    );

    toast.success('Pedido cancelado', {
      description: `El pedido ${pedido.numero} ha sido cancelado correctamente`
    });

    console.log('❌ PEDIDO CANCELADO:', pedidoId);
    setModalCancelarAbierto(false);
    setPedidoACancelar(null);
  };

  const handleDescargarPDF = (pedido: PedidoProveedor) => {
    toast.info('Descargando PDF...', {
      description: `Generando documento del pedido ${pedido.numero}`
    });
    console.log('📄 DESCARGAR PDF:', pedido.numero);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  };

  const calcularProgresoPedido = (pedido: PedidoProveedor) => {
    if (pedido.estado === 'completado') return 100;
    if (pedido.estado === 'cancelado') return 0;
    
    const totalArticulos = pedido.lineas.reduce((sum, l) => sum + l.cantidad, 0);
    const totalRecibidos = pedido.lineas.reduce((sum, l) => sum + (l.cantidadRecibida || 0), 0);
    
    return totalArticulos > 0 ? (totalRecibidos / totalArticulos) * 100 : 0;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Pedidos a Proveedores
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona y realiza seguimiento de todos tus pedidos
          </p>
        </div>
        <Button
          onClick={() => setModalCrearAbierto(true)}
          className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-blue-700">Pendientes</p>
                <p className="text-2xl font-bold text-blue-900">{metricas.totalPendientes}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-xs text-blue-700">
              {formatearMoneda(metricas.valorPendiente)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-purple-700">Parciales</p>
                <p className="text-2xl font-bold text-purple-900">{metricas.pedidosParciales}</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-700">
              {formatearMoneda(metricas.valorParcial)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-green-700">Completados</p>
                <p className="text-2xl font-bold text-green-900">{metricas.pedidosCompletados}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-700">Este mes</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-red-700">Retrasados</p>
                <p className="text-2xl font-bold text-red-900">{metricas.pedidosRetrasados}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-xs text-red-700">Requieren seguimiento</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            {/* Primera fila: Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, proveedor o artículo..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Segunda fila: Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filtroEstado} onValueChange={(val) => {
                setFiltroEstado(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroProveedor} onValueChange={(val) => {
                setFiltroProveedor(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los proveedores</SelectItem>
                  {proveedores.map(prov => (
                    <SelectItem key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroPdv} onValueChange={(val) => {
                setFiltroPdv(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="PDV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los PDV</SelectItem>
                  <SelectItem value="tiana">Tiana</SelectItem>
                  <SelectItem value="badalona">Badalona</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador */}
            <div className="text-sm text-gray-600">
              Mostrando {pedidosPaginados.length} de {pedidosFiltrados.length} pedidos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Pedidos */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Número</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Fecha Pedido</TableHead>
                  <TableHead>Fecha Entrega</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>PDV</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        No hay pedidos
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        {busqueda || filtroEstado !== 'todos' || filtroProveedor !== 'todos'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Comienza creando tu primer pedido a proveedores'}
                      </p>
                      {!busqueda && filtroEstado === 'todos' && filtroProveedor === 'todos' && (
                        <Button
                          onClick={() => setModalCrearAbierto(true)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Primer Pedido
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  pedidosPaginados.map((pedido) => {
                    const progreso = calcularProgresoPedido(pedido);
                    
                    return (
                      <TableRow key={pedido.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-sm">{pedido.numero}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{pedido.proveedorNombre}</p>
                            <p className="text-xs text-gray-500">
                              {pedido.lineas.length} artículo{pedido.lineas.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatearFecha(pedido.fechaPedido)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm whitespace-nowrap">
                              {formatearFecha(pedido.fechaEsperada)}
                            </span>
                            {getDiasRestantesBadge(pedido.fechaEsperada, pedido.estado)}
                          </div>
                        </TableCell>
                        <TableCell>{getBadgeEstado(pedido.estado)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  progreso === 100 ? 'bg-green-500' :
                                  progreso > 0 ? 'bg-blue-500' :
                                  'bg-gray-300'
                                }`}
                                style={{ width: `${progreso}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-10 text-right">
                              {progreso.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {pedido.pdvDestino}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatearMoneda(pedido.total)}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleVerDetalle(pedido)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalle
                              </DropdownMenuItem>
                              {pedido.estado !== 'completado' && pedido.estado !== 'cancelado' && (
                                <DropdownMenuItem onClick={() => handleEditarPedido(pedido)}>
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDuplicarPedido(pedido)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDescargarPDF(pedido)}>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                              </DropdownMenuItem>
                              {pedido.estado !== 'completado' && pedido.estado !== 'cancelado' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPedidoACancelar(pedido.id);
                                      setModalCancelarAbierto(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar Pedido
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
              <p className="text-sm text-gray-600">
                Página {paginaActual} de {totalPaginas}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let pageNum;
                  if (totalPaginas <= 5) {
                    pageNum = i + 1;
                  } else if (paginaActual <= 3) {
                    pageNum = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    pageNum = totalPaginas - 4 + i;
                  } else {
                    pageNum = paginaActual - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={pageNum === paginaActual ? 'default' : 'outline'}
                      className={pageNum === paginaActual ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPaginaActual(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear Pedido */}
      <ModalCrearPedidoProveedor
        isOpen={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        onCrearPedido={(nuevoPedido) => {
          // Agregar el nuevo pedido a la lista
          setPedidos([nuevoPedido, ...pedidos]);
          toast.success('Pedido creado correctamente', {
            description: `Pedido ${nuevoPedido.numero} registrado en el sistema`
          });
          console.log('✅ NUEVO PEDIDO CREADO:', nuevoPedido);
        }}
      />

      {/* Modal Detalle Pedido */}
      <Dialog open={modalDetalleAbierto} onOpenChange={setModalDetalleAbierto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Detalle del Pedido
            </DialogTitle>
            <DialogDescription>
              Información completa del pedido a proveedor
            </DialogDescription>
          </DialogHeader>

          {pedidoSeleccionado && (
            <div className="space-y-6">
              {/* Header con número y estado */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{pedidoSeleccionado.numero}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Pedido realizado el {formatearFecha(pedidoSeleccionado.fechaPedido)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getBadgeEstado(pedidoSeleccionado.estado)}
                  {getDiasRestantesBadge(pedidoSeleccionado.fechaEsperada, pedidoSeleccionado.estado)}
                </div>
              </div>

              {/* Información del Proveedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Proveedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-gray-900">{pedidoSeleccionado.proveedorNombre}</p>
                    {(() => {
                      const prov = proveedores.find(p => p.id === pedidoSeleccionado.proveedorId);
                      return prov ? (
                        <>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {prov.contacto.telefono}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {prov.contacto.email}
                          </div>
                        </>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">
                        <span className="text-gray-600">Fecha esperada:</span>{' '}
                        <span className="font-semibold">{formatearFecha(pedidoSeleccionado.fechaEsperada)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">
                        <span className="text-gray-600">Destino:</span>{' '}
                        <span className="font-semibold capitalize">{pedidoSeleccionado.pdvDestino}</span>
                      </span>
                    </div>
                    {pedidoSeleccionado.fechaRecepcion && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">
                          <span className="text-gray-600">Recibido:</span>{' '}
                          <span className="font-semibold">{formatearFecha(pedidoSeleccionado.fechaRecepcion.toString())}</span>
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Líneas del Pedido */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Artículos del Pedido</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Artículo</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Recibido</TableHead>
                        <TableHead className="text-right">Precio Unit.</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidoSeleccionado.lineas.map((linea) => (
                        <TableRow key={linea.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{linea.articuloNombre}</p>
                              <p className="text-xs text-gray-500">{linea.articuloId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {linea.cantidad} {linea.unidad}
                          </TableCell>
                          <TableCell className="text-right">
                            {linea.cantidadRecibida ? (
                              <span className={
                                linea.cantidadRecibida >= linea.cantidad
                                  ? 'text-green-600 font-semibold'
                                  : 'text-amber-600 font-semibold'
                              }>
                                {linea.cantidadRecibida} {linea.unidad}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatearMoneda(linea.precioUnitario)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatearMoneda(linea.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatearMoneda(pedidoSeleccionado.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA ({pedidoSeleccionado.iva}%):</span>
                  <span className="font-semibold">
                    {formatearMoneda(pedidoSeleccionado.total - pedidoSeleccionado.subtotal)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-teal-600">
                    {formatearMoneda(pedidoSeleccionado.total)}
                  </span>
                </div>
              </div>

              {/* Observaciones */}
              {pedidoSeleccionado.observaciones && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Observaciones</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {pedidoSeleccionado.observaciones}
                  </p>
                </div>
              )}

              {/* Progreso del Pedido */}
              {pedidoSeleccionado.estado !== 'cancelado' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Progreso de Recepción</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {pedidoSeleccionado.lineas.reduce((sum, l) => sum + (l.cantidadRecibida || 0), 0)} de{' '}
                        {pedidoSeleccionado.lineas.reduce((sum, l) => sum + l.cantidad, 0)} unidades recibidas
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {calcularProgresoPedido(pedidoSeleccionado).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          calcularProgresoPedido(pedidoSeleccionado) === 100
                            ? 'bg-green-500'
                            : calcularProgresoPedido(pedidoSeleccionado) > 0
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${calcularProgresoPedido(pedidoSeleccionado)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleDescargarPDF(pedidoSeleccionado)}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
                {pedidoSeleccionado.estado !== 'completado' && pedidoSeleccionado.estado !== 'cancelado' && (
                  <Button
                    onClick={() => handleDuplicarPedido(pedidoSeleccionado)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar Pedido
                  </Button>
                )}
                <Button
                  onClick={() => setModalDetalleAbierto(false)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Cancelar Pedido */}
      <AlertDialog open={modalCancelarAbierto} onOpenChange={setModalCancelarAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              ¿Cancelar este pedido?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El pedido será marcado como cancelado y no se podrá
              recibir material asociado a él.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener pedido</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pedidoACancelar && handleCancelarPedido(pedidoACancelar)}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, cancelar pedido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
