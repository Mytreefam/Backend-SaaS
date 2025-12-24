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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Ban,
  CheckCircle,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  AlertCircle,
  History,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { proveedores as proveedoresIniciales, Proveedor } from '../../data/proveedores';
import { pedidosProveedores } from '../../data/pedidos-proveedores';
import { ModalCrearEditarProveedor } from './modales/ModalCrearEditarProveedor';
import { ModalDetalleProveedor } from './modales/ModalDetalleProveedor';

export function GestionProveedores() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('activos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Estados de proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresIniciales);

  // Modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [modalDesactivarAbierto, setModalDesactivarAbierto] = useState(false);
  const [proveedorADesactivar, setProveedorADesactivar] = useState<string | null>(null);

  // Calcular métricas
  const metricas = useMemo(() => {
    const activos = proveedores.filter(p => p.activo);
    const inactivos = proveedores.filter(p => !p.activo);
    
    // Calcular gasto total por proveedor
    const gastoPorProveedor = pedidosProveedores.reduce((acc, pedido) => {
      if (pedido.estado === 'completado') {
        if (!acc[pedido.proveedorId]) {
          acc[pedido.proveedorId] = 0;
        }
        acc[pedido.proveedorId] += pedido.total;
      }
      return acc;
    }, {} as Record<string, number>);

    // Promedio de evaluación
    const promedioEvaluacion = activos.length > 0
      ? activos.reduce((sum, p) => sum + p.evaluacion.puntuacionGeneral, 0) / activos.length
      : 0;

    // Top proveedor
    const topProveedorId = Object.entries(gastoPorProveedor).sort((a, b) => b[1] - a[1])[0];
    const topProveedor = topProveedorId ? proveedores.find(p => p.id === topProveedorId[0]) : null;

    return {
      totalProveedores: proveedores.length,
      activos: activos.length,
      inactivos: inactivos.length,
      promedioEvaluacion: promedioEvaluacion.toFixed(1),
      topProveedor: topProveedor?.nombre || '-'
    };
  }, [proveedores]);

  // Filtrar proveedores
  const proveedoresFiltrados = useMemo(() => {
    let resultado = [...proveedores];

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(
        p =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.contacto.email.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.contacto.telefono.includes(busqueda) ||
          p.categoria.some(c => c.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== 'todos') {
      resultado = resultado.filter(p => p.categoria.includes(filtroCategoria));
    }

    // Filtro por estado
    if (filtroEstado === 'activos') {
      resultado = resultado.filter(p => p.activo);
    } else if (filtroEstado === 'inactivos') {
      resultado = resultado.filter(p => !p.activo);
    }

    return resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [proveedores, busqueda, filtroCategoria, filtroEstado]);

  // Paginación
  const totalPaginas = Math.ceil(proveedoresFiltrados.length / itemsPorPagina);
  const proveedoresPaginados = proveedoresFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleCrearProveedor = (nuevoProveedor: Proveedor) => {
    setProveedores([...proveedores, nuevoProveedor]);
    toast.success('Proveedor creado', {
      description: `${nuevoProveedor.nombre} ha sido añadido correctamente`
    });
    console.log('✅ NUEVO PROVEEDOR:', nuevoProveedor);
  };

  const handleEditarProveedor = (proveedorEditado: Proveedor) => {
    setProveedores(proveedores.map(p => p.id === proveedorEditado.id ? proveedorEditado : p));
    toast.success('Proveedor actualizado', {
      description: `Los datos de ${proveedorEditado.nombre} han sido actualizados`
    });
    console.log('✏️ PROVEEDOR EDITADO:', proveedorEditado);
  };

  const handleAbrirEditar = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setModalEditarAbierto(true);
  };

  const handleVerDetalle = (proveedor: Proveedor) => {
    // Calcular estadísticas del proveedor
    const pedidosProveedor = pedidosProveedores.filter(p => p.proveedorId === proveedor.id);
    const pedidosCompletados = pedidosProveedor.filter(p => p.estado === 'completado');
    const gastoTotal = pedidosCompletados.reduce((sum, p) => sum + p.total, 0);
    
    setProveedorSeleccionado({
      ...proveedor,
      estadisticas: {
        ...proveedor.estadisticas,
        totalPedidos: pedidosProveedor.length,
        pedidosCompletados: pedidosCompletados.length,
        gastoTotal
      }
    });
    setModalDetalleAbierto(true);
  };

  const handleDesactivarProveedor = (proveedorId: string) => {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;

    setProveedores(proveedores.map(p => 
      p.id === proveedorId ? { ...p, activo: !p.activo } : p
    ));

    toast.success(proveedor.activo ? 'Proveedor desactivado' : 'Proveedor reactivado', {
      description: `${proveedor.nombre} ha sido ${proveedor.activo ? 'desactivado' : 'reactivado'} correctamente`
    });

    console.log(proveedor.activo ? '❌ PROVEEDOR DESACTIVADO:' : '✅ PROVEEDOR REACTIVADO:', proveedorId);
    setModalDesactivarAbierto(false);
    setProveedorADesactivar(null);
  };

  const handleVerHistorialCompras = (proveedor: Proveedor) => {
    toast.info('Navegando al historial', {
      description: `Mostrando pedidos de ${proveedor.nombre}`
    });
    console.log('📊 VER HISTORIAL DE COMPRAS:', proveedor.id);
    // Aquí se navegaría a la vista de pedidos filtrada por este proveedor
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(valor);
  };

  const getEstrellas = (puntuacion: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < puntuacion ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCategorias = () => {
    const todasCategorias = proveedores.flatMap(p => p.categoria);
    return Array.from(new Set(todasCategorias)).sort();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Gestión de Proveedores
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra tu red de proveedores y partners
          </p>
        </div>
        <Button
          onClick={() => setModalCrearAbierto(true)}
          className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-teal-700">Total Proveedores</p>
                <p className="text-2xl font-bold text-teal-900">{metricas.totalProveedores}</p>
              </div>
              <Users className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-xs text-teal-700">
              {metricas.activos} activos • {metricas.inactivos} inactivos
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-blue-700">Evaluación Media</p>
                <p className="text-2xl font-bold text-blue-900">{metricas.promedioEvaluacion}</p>
              </div>
              <Star className="w-8 h-8 text-blue-600 fill-blue-600" />
            </div>
            <div className="flex items-center gap-1">
              {getEstrellas(Math.round(parseFloat(metricas.promedioEvaluacion)))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-purple-700">Top Proveedor</p>
                <p className="text-lg font-bold text-purple-900 truncate">{metricas.topProveedor}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-xs text-purple-700">
              Mayor volumen de compra
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-green-700">Proveedores Activos</p>
                <p className="text-2xl font-bold text-green-900">{metricas.activos}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-xs text-green-700">
              Disponibles para pedidos
            </p>
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
                placeholder="Buscar por nombre, email, teléfono o categoría..."
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
              <Select value={filtroCategoria} onValueChange={(val) => {
                setFiltroCategoria(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {getCategorias().map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroEstado} onValueChange={(val) => {
                setFiltroEstado(val);
                setPaginaActual(1);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activos">Activos</SelectItem>
                  <SelectItem value="inactivos">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador */}
            <div className="text-sm text-gray-600">
              Mostrando {proveedoresPaginados.length} de {proveedoresFiltrados.length} proveedores
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Proveedores */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Categorías</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Evaluación</TableHead>
                  <TableHead>Pedido Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proveedoresPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        No hay proveedores
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        {busqueda || filtroCategoria !== 'todos' || filtroEstado !== 'todos'
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Comienza añadiendo tu primer proveedor'}
                      </p>
                      {!busqueda && filtroCategoria === 'todos' && filtroEstado === 'todos' && (
                        <Button
                          onClick={() => setModalCrearAbierto(true)}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Primer Proveedor
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  proveedoresPaginados.map((proveedor) => (
                    <TableRow key={proveedor.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{proveedor.nombre}</p>
                          <p className="text-xs text-gray-500">{proveedor.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {proveedor.categoria.slice(0, 2).map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs capitalize">
                              {cat}
                            </Badge>
                          ))}
                          {proveedor.categoria.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{proveedor.categoria.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            {proveedor.contacto.telefono}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Mail className="w-3 h-3" />
                            {proveedor.contacto.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {proveedor.direccion.ciudad}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {getEstrellas(proveedor.evaluacion.puntuacionGeneral)}
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {proveedor.evaluacion.puntuacionGeneral}/5
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {formatearMoneda(proveedor.condicionesComerciales.pedidoMinimo)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {proveedor.activo ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <Ban className="w-3 h-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
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
                            <DropdownMenuItem onClick={() => handleVerDetalle(proveedor)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAbrirEditar(proveedor)}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVerHistorialCompras(proveedor)}>
                              <History className="w-4 h-4 mr-2" />
                              Historial de Compras
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setProveedorADesactivar(proveedor.id);
                                setModalDesactivarAbierto(true);
                              }}
                              className={proveedor.activo ? 'text-red-600' : 'text-green-600'}
                            >
                              {proveedor.activo ? (
                                <>
                                  <Ban className="w-4 h-4 mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Reactivar
                                </>
                              )}
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

      {/* Modal Crear Proveedor */}
      <ModalCrearEditarProveedor
        isOpen={modalCrearAbierto}
        onClose={() => setModalCrearAbierto(false)}
        onGuardar={handleCrearProveedor}
        modo="crear"
      />

      {/* Modal Editar Proveedor */}
      {proveedorSeleccionado && (
        <ModalCrearEditarProveedor
          isOpen={modalEditarAbierto}
          onClose={() => {
            setModalEditarAbierto(false);
            setProveedorSeleccionado(null);
          }}
          onGuardar={handleEditarProveedor}
          modo="editar"
          proveedorInicial={proveedorSeleccionado}
        />
      )}

      {/* Modal Detalle Proveedor */}
      {proveedorSeleccionado && (
        <ModalDetalleProveedor
          isOpen={modalDetalleAbierto}
          onClose={() => {
            setModalDetalleAbierto(false);
            setProveedorSeleccionado(null);
          }}
          proveedor={proveedorSeleccionado}
        />
      )}

      {/* Alert Dialog Desactivar Proveedor */}
      <AlertDialog open={modalDesactivarAbierto} onOpenChange={setModalDesactivarAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              {proveedorADesactivar && proveedores.find(p => p.id === proveedorADesactivar)?.activo
                ? '¿Desactivar este proveedor?'
                : '¿Reactivar este proveedor?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {proveedorADesactivar && proveedores.find(p => p.id === proveedorADesactivar)?.activo
                ? 'El proveedor será marcado como inactivo. No aparecerá en las opciones de nuevos pedidos hasta que lo reactives.'
                : 'El proveedor volverá a estar activo y disponible para realizar nuevos pedidos.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => proveedorADesactivar && handleDesactivarProveedor(proveedorADesactivar)}
              className={
                proveedorADesactivar && proveedores.find(p => p.id === proveedorADesactivar)?.activo
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {proveedorADesactivar && proveedores.find(p => p.id === proveedorADesactivar)?.activo
                ? 'Sí, desactivar'
                : 'Sí, reactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
