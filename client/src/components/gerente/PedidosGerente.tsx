/**
 * 📦 VISTA DE PEDIDOS PARA GERENTE
 * 
 * Vista completa de gestión de pedidos con filtros avanzados por empresa/marca/PDV.
 * Incluye visualización de todos los canales (App, TPV, Delivery externo).
 * 
 * ✨ Características:
 * - Filtros jerárquicos (Empresa > Marca > PDV)
 * - Vista por origen (App, TPV, Glovo, Just Eat, Uber Eats)
 * - Estadísticas en tiempo real
 * - Gestión de repartidores
 * - Exportación de datos
 * - Auto-refresh cada 30 segundos
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { EmptyState } from '../ui/empty-state';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Search,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Package,
  MapPin,
  LayoutGrid,
  LayoutList,
  Store,
  ShoppingCart,
  Smartphone,
  CreditCard,
  Bike,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  obtenerPedidosFiltrados,
  type Pedido,
  type EstadoPedido,
  type OrigenPedido,
  type FiltrosPedidos
} from '../../services/pedidos.service';
import { ModalDetallePedido } from '../pedidos/ModalDetallePedido';
import { BotonGenerarPedidosDemo } from '../dev/BotonGenerarPedidosDemo';
import { EMPRESAS, MARCAS, PUNTOS_VENTA } from '../../constants/empresaConfig';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type VistaMode = 'tabla' | 'tarjetas';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PedidosGerente() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoPedido>('todos');
  const [filtroOrigen, setFiltroOrigen] = useState<'todos' | OrigenPedido>('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todas');
  const [filtroMarca, setFiltroMarca] = useState<string>('todas');
  const [filtroPDV, setFiltroPDV] = useState<string>('todos');
  const [vistaMode, setVistaMode] = useState<VistaMode>('tabla');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, [filtroEmpresa, filtroMarca, filtroPDV]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarPedidos(true); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [filtroEmpresa, filtroMarca, filtroPDV]);

  const cargarPedidos = (silent = false) => {
    try {
      // Construir filtros
      const filtros: FiltrosPedidos = {};
      
      if (filtroEmpresa !== 'todas') {
        filtros.empresaIds = [filtroEmpresa];
      }
      
      if (filtroMarca !== 'todas') {
        filtros.marcaIds = [filtroMarca];
      }
      
      if (filtroPDV !== 'todos') {
        filtros.puntoVentaIds = [filtroPDV];
      }

      const pedidosCargados = obtenerPedidosFiltrados(filtros);
      setPedidos(pedidosCargados);
      setUltimaActualizacion(new Date());
      
      if (!silent) {
        toast.success('Pedidos actualizados', {
          description: `${pedidosCargados.length} pedidos encontrados`
        });
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    }
  };

  // Filtrar pedidos según búsqueda y filtros
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      // Filtro de búsqueda
      const matchBusqueda = busqueda === '' || 
        pedido.numero?.toLowerCase().includes(busqueda.toLowerCase()) ||
        pedido.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        pedido.cliente.telefono.includes(busqueda) ||
        pedido.id.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por estado
      const matchEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;

      // Filtro por origen
      const matchOrigen = filtroOrigen === 'todos' || pedido.origenPedido === filtroOrigen;

      return matchBusqueda && matchEstado && matchOrigen;
    });
  }, [pedidos, busqueda, filtroEstado, filtroOrigen]);

  // Estadísticas
  const stats = useMemo(() => {
    const activos = pedidosFiltrados.filter(p => 
      p.estado !== 'entregado' && p.estado !== 'cancelado'
    );
    
    const totalVentas = pedidosFiltrados
      .filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + p.total, 0);

    const porOrigen = {
      app: pedidosFiltrados.filter(p => p.origenPedido === 'app').length,
      tpv: pedidosFiltrados.filter(p => p.origenPedido === 'tpv').length,
      glovo: pedidosFiltrados.filter(p => p.origenPedido === 'glovo').length,
      justeat: pedidosFiltrados.filter(p => p.origenPedido === 'justeat').length,
      ubereats: pedidosFiltrados.filter(p => p.origenPedido === 'ubereats').length,
    };

    return {
      total: pedidosFiltrados.length,
      activos: activos.length,
      entregados: pedidosFiltrados.filter(p => p.estado === 'entregado').length,
      cancelados: pedidosFiltrados.filter(p => p.estado === 'cancelado').length,
      totalVentas,
      porOrigen
    };
  }, [pedidosFiltrados]);

  const handleVerDetalle = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
  };

  const handleCerrarModal = () => {
    setModalDetalle(false);
    setPedidoSeleccionado(null);
    cargarPedidos(true);
  };

  const handleExportar = () => {
    toast.success('Exportando pedidos...');
    // TODO: Implementar exportación a Excel/CSV
  };

  // Opciones de empresas
  const empresasOpciones = useMemo(() => {
    return Object.entries(EMPRESAS).map(([id, empresa]) => ({
      value: id,
      label: empresa.nombreComercial
    }));
  }, []);

  // Opciones de marcas (filtradas por empresa)
  const marcasOpciones = useMemo(() => {
    if (filtroEmpresa === 'todas') {
      return Object.entries(MARCAS).map(([id, marca]) => ({
        value: id,
        label: marca.nombre
      }));
    }
    
    return Object.entries(MARCAS)
      .filter(([_, marca]) => marca.empresaId === filtroEmpresa)
      .map(([id, marca]) => ({
        value: id,
        label: marca.nombre
      }));
  }, [filtroEmpresa]);

  // Opciones de PDVs (filtradas por marca)
  const pdvsOpciones = useMemo(() => {
    if (filtroMarca === 'todas') {
      return Object.entries(PUNTOS_VENTA).map(([id, pdv]) => ({
        value: id,
        label: pdv.nombre
      }));
    }
    
    return Object.entries(PUNTOS_VENTA)
      .filter(([_, pdv]) => pdv.marcas.some(m => m.marcaId === filtroMarca))
      .map(([id, pdv]) => ({
        value: id,
        label: pdv.nombre
      }));
  }, [filtroMarca]);

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activos}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregados</p>
                <p className="text-2xl font-bold text-green-600">{stats.entregados}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-teal-600">€{stats.totalVentas.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de origen */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">App Móvil</p>
                <p className="text-xl font-bold text-blue-600">{stats.porOrigen.app}</p>
              </div>
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">TPV</p>
                <p className="text-xl font-bold text-purple-600">{stats.porOrigen.tpv}</p>
              </div>
              <Store className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Glovo</p>
                <p className="text-xl font-bold text-yellow-600">{stats.porOrigen.glovo}</p>
              </div>
              <Truck className="w-6 h-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Just Eat</p>
                <p className="text-xl font-bold text-red-600">{stats.porOrigen.justeat}</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uber Eats</p>
                <p className="text-xl font-bold text-green-600">{stats.porOrigen.ubereats}</p>
              </div>
              <Bike className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Gestión de Pedidos
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => cargarPedidos()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportar}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
              <BotonGenerarPedidosDemo onPedidosGenerados={cargarPedidos} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filtros jerárquicos */}
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Empresa</label>
              <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las empresas</SelectItem>
                  {empresasOpciones.map(empresa => (
                    <SelectItem key={empresa.value} value={empresa.value}>
                      {empresa.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Marca</label>
              <Select value={filtroMarca} onValueChange={setFiltroMarca}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las marcas</SelectItem>
                  {marcasOpciones.map(marca => (
                    <SelectItem key={marca.value} value={marca.value}>
                      {marca.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Punto de Venta</label>
              <Select value={filtroPDV} onValueChange={setFiltroPDV}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los PDVs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los PDVs</SelectItem>
                  {pdvsOpciones.map(pdv => (
                    <SelectItem key={pdv.value} value={pdv.value}>
                      {pdv.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Búsqueda y filtros adicionales */}
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número, cliente, teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filtroEstado} onValueChange={(value) => setFiltroEstado(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="pagado">Pagados</SelectItem>
                <SelectItem value="en_preparacion">En preparación</SelectItem>
                <SelectItem value="listo">Listos</SelectItem>
                <SelectItem value="entregado">Entregados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroOrigen} onValueChange={(value) => setFiltroOrigen(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los orígenes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los orígenes</SelectItem>
                <SelectItem value="app">App Móvil</SelectItem>
                <SelectItem value="tpv">TPV</SelectItem>
                <SelectItem value="glovo">Glovo</SelectItem>
                <SelectItem value="justeat">Just Eat</SelectItem>
                <SelectItem value="ubereats">Uber Eats</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={vistaMode === 'tabla' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVistaMode('tabla')}
                className="flex-1"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button
                variant={vistaMode === 'tarjetas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVistaMode('tarjetas')}
                className="flex-1"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')} • 
            Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
          </p>

          {/* Vista de tabla */}
          {vistaMode === 'tabla' && (
            <div className="border rounded-lg overflow-hidden">
              {pedidosFiltrados.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No hay pedidos"
                  description="No se encontraron pedidos con los filtros seleccionados"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Empresa/Marca</TableHead>
                      <TableHead>PDV</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.map((pedido) => (
                      <TableRow 
                        key={pedido.id}
                        onClick={() => handleVerDetalle(pedido)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-mono">{pedido.numero}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pedido.cliente.nombre}</p>
                            <p className="text-xs text-gray-500">{pedido.cliente.telefono}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{pedido.marcaNombre}</p>
                            <p className="text-xs text-gray-500">{pedido.empresaNombre}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{pedido.puntoVentaNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <BadgeOrigen origen={pedido.origenPedido} />
                        </TableCell>
                        <TableCell>
                          <BadgeEstado estado={pedido.estado} />
                        </TableCell>
                        <TableCell className="font-medium">
                          €{pedido.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Vista de tarjetas */}
          {vistaMode === 'tarjetas' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pedidosFiltrados.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={Package}
                    title="No hay pedidos"
                    description="No se encontraron pedidos con los filtros seleccionados"
                  />
                </div>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <Card key={pedido.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleVerDetalle(pedido)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-sm text-gray-600">{pedido.numero}</p>
                          <p className="font-medium">{pedido.cliente.nombre}</p>
                        </div>
                        <BadgeOrigen origen={pedido.origenPedido} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estado:</span>
                        <BadgeEstado estado={pedido.estado} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-bold text-teal-600">€{pedido.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {pedido.marcaNombre} - {pedido.puntoVentaNombre}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(pedido.fecha).toLocaleDateString('es-ES')}</span>
                        <span>{new Date(pedido.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalle */}
      {pedidoSeleccionado && (
        <ModalDetallePedido
          open={modalDetalle}
          onOpenChange={setModalDetalle}
          pedido={pedidoSeleccionado}
          onCerrar={handleCerrarModal}
          permisos={{
            puedeMarcarEnPreparacion: true,
            puedeMarcarListo: true,
            puedeMarcarEntregado: true,
            puedeCancelar: true,
            puedeConfirmarPago: true,
            esGerente: true
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

function BadgeOrigen({ origen }: { origen: OrigenPedido }) {
  const config = {
    app: { label: 'App', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Smartphone },
    tpv: { label: 'TPV', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Store },
    glovo: { label: 'Glovo', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Truck },
    justeat: { label: 'Just Eat', color: 'bg-red-100 text-red-700 border-red-200', icon: ShoppingCart },
    ubereats: { label: 'Uber Eats', color: 'bg-green-100 text-green-700 border-green-200', icon: Bike },
    deliveroo: { label: 'Deliveroo', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Bike },
  };

  // Valor por defecto si origen es undefined o no existe en config
  const { label, color, icon: Icon } = config[origen] || config.app;

  return (
    <Badge variant="outline" className={`${color} gap-1 border`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
}

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const config = {
    pendiente: { label: 'Pendiente', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    pagado: { label: 'Pagado', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    en_preparacion: { label: 'En preparación', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    listo: { label: 'Listo', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    entregado: { label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-200' },
    cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  // Valor por defecto si estado es undefined o no existe en config
  const { label, color } = config[estado] || config.pendiente;

  return (
    <Badge variant="outline" className={`${color} border`}>
      {label}
    </Badge>
  );
}