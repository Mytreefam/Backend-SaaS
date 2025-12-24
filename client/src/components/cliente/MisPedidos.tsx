/**
 * 📦 MIS PEDIDOS - VISTA CLIENTE
 * 
 * Muestra el historial de pedidos del cliente
 * con opción de ver detalles, descargar factura, etc.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EmptyState } from '../ui/empty-state';
import { 
  Package,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  FileText,
  Download,
  Eye,
  ChevronRight,
  AlertCircle,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { type Pedido, type EstadoPedido } from '../../services/pedidos.service';
import { useQuery } from '../../hooks/useApi';
import { clientesApi } from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MisPedidosProps {
  clienteId: string;
}

export function MisPedidos({ clienteId }: MisPedidosProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoPedido>('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  // ✅ Obtener pedidos del cliente desde API real
  const { data: pedidosApi, loading, error, refetch } = useQuery(
    () => clientesApi.getPedidos(clienteId),
    {
      showErrorToast: false, // Manejamos el error manualmente
    }
  );

  // Mapear pedidos de API al formato esperado por el componente
  const pedidos: Pedido[] = useMemo(() => {
    if (!pedidosApi || !Array.isArray(pedidosApi)) return [];
    
    return pedidosApi.map((p: any) => ({
      id: String(p.id),
      numero: p.numero || `PED-${String(p.id).padStart(4, '0')}`,
      fecha: p.fecha,
      empresaId: p.empresaId || '1',
      empresaNombre: p.empresaNombre || 'Empresa',
      marcaId: p.marcaId || '1',
      marcaNombre: p.marcaNombre || 'Marca',
      puntoVentaId: p.puntoVentaId || '1',
      puntoVentaNombre: p.puntoVentaNombre || 'Punto de Venta',
      origenPedido: p.origenPedido || 'app',
      cliente: p.cliente ? {
        id: String(p.cliente.id),
        nombre: p.cliente.nombre,
        email: p.cliente.email,
        telefono: p.cliente.telefono || '',
        direccion: p.cliente.direccion || ''
      } : {
        id: clienteId,
        nombre: '',
        email: '',
        telefono: '',
      },
      items: (p.items || []).map((item: any) => ({
        id: String(item.id),
        productoId: String(item.productoId),
        nombre: item.producto?.nombre || item.nombre || 'Producto',
        cantidad: item.cantidad,
        precioUnitario: item.precio || item.precioUnitario || 0,
        subtotal: (item.precio || item.precioUnitario || 0) * item.cantidad,
        imagen: item.producto?.imagen || '',
      })),
      subtotal: p.subtotal || p.total || 0,
      descuento: p.descuento || 0,
      iva: p.iva || (p.total * 0.10) || 0,
      total: p.total || 0,
      metodoPago: p.metodoPago || 'tarjeta',
      estadoPago: p.estadoPago || 'pagado',
      pagoEnEfectivo: p.pagoEnEfectivo || false,
      tipoEntrega: p.tipoEntrega || 'recogida',
      direccionEntrega: p.direccionEntrega || '',
      estado: p.estado || 'pendiente',
      estadoEntrega: p.estadoEntrega || 'pendiente',
      tiempoPreparacion: p.tiempoPreparacion,
      facturaId: p.facturaId,
    }));
  }, [pedidosApi, clienteId]);

  // Filtrar pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter(pedido => {
      // Filtro por búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchNumero = pedido.numero?.toLowerCase().includes(query);
        const matchId = pedido.id.toLowerCase().includes(query);
        const matchItems = pedido.items.some(item => 
          item.nombre.toLowerCase().includes(query)
        );
        
        if (!matchNumero && !matchId && !matchItems) {
          return false;
        }
      }

      // Filtro por estado
      if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) {
        return false;
      }

      return true;
    });
  }, [pedidos, searchQuery, filtroEstado]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: pedidos.length,
      pendientes: pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en_preparacion').length,
      completados: pedidos.filter(p => p.estado === 'entregado').length,
      cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
    };
  }, [pedidos]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getEstadoBadge = (estado: EstadoPedido) => {
    const badges = {
      pendiente: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock, label: 'Pendiente' },
      pagado: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2, label: 'Pagado' },
      en_preparacion: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Loader2, label: 'En preparación' },
      listo: { color: 'bg-green-100 text-green-800 border-green-200', icon: Package, label: 'Listo' },
      entregado: { color: 'bg-teal-100 text-teal-800 border-teal-200', icon: CheckCircle2, label: 'Entregado' },
      cancelado: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Cancelado' },
    };

    const badge = badges[estado] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock, label: estado || 'Desconocido' };
    const Icon = badge.icon || Clock;

    return (
      <Badge className={`${badge.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "d 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return fecha;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Mostrar loading
  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-gray-900 mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mis Pedidos
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Consulta el estado y el historial de tus pedidos
          </p>
        </div>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
            <p className="text-gray-600">Cargando pedidos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-gray-900 mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Mis Pedidos
          </h1>
        </div>
        <Card>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-gray-900 font-medium mb-2">Error al cargar pedidos</p>
            <p className="text-gray-600 text-sm mb-4">{error.message}</p>
            <Button onClick={() => refetch()} variant="outline">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-1 sm:mb-2 text-lg sm:text-xl md:text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Mis Pedidos
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Consulta el estado y el historial de tus pedidos
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-3 sm:p-4 md:pt-6">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar pedido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 sm:h-10"
              />
            </div>

            {/* Filtro por estado */}
            <Tabs value={filtroEstado} onValueChange={(v) => setFiltroEstado(v as any)} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-3 md:w-[400px] h-11 sm:h-10">
                <TabsTrigger value="todos" className="text-xs sm:text-sm">Todos</TabsTrigger>
                <TabsTrigger value="pendiente" className="text-xs sm:text-sm">Activos</TabsTrigger>
                <TabsTrigger value="entregado" className="text-xs sm:text-sm">Completos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={searchQuery || filtroEstado !== 'todos' 
            ? 'No se encontraron pedidos con esos filtros'
            : 'Aún no has realizado ningún pedido'
          }
          description="Tus pedidos aparecerán aquí una vez que realices una compra"
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {pedidosFiltrados.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-md transition-all active:scale-[0.99]">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                  {/* Info principal */}
                  <div className="flex-1 space-y-2 sm:space-y-3">
                    {/* Header del pedido */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 sm:mb-1 flex-wrap">
                          <h3 className="text-sm sm:text-base truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Pedido {pedido.numero}
                          </h3>
                          {getEstadoBadge(pedido.estado)}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{formatFecha(pedido.fecha)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Items del pedido */}
                    <div className="text-xs sm:text-sm text-gray-600">
                      <p className="mb-1 text-[11px] sm:text-sm">Productos:</p>
                      <div className="space-y-0.5 sm:space-y-1">
                        {pedido.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-[11px] sm:text-sm truncate">
                            • {item.nombre} × {item.cantidad}
                          </p>
                        ))}
                        {pedido.items.length > 2 && (
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            + {pedido.items.length - 2} productos más
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tipo de entrega */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                      {pedido.tipoEntrega === 'recogida' ? (
                        <>
                          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span>Recogida en tienda</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>Entrega a domicilio</span>
                        </>
                      )}
                    </div>

                    {/* Tiempo estimado (si aplica) */}
                    {(pedido.estado === 'en_preparacion' || pedido.estado === 'listo') && pedido.tiempoPreparacion && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-1.5 sm:p-2 w-fit">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate">Listo en {pedido.tiempoPreparacion} min</span>
                      </div>
                    )}
                  </div>

                  {/* Total y acciones */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1">Total</p>
                      <p className="text-lg sm:text-xl md:text-2xl text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        €{pedido.total.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-1.5 sm:gap-2">
                      {pedido.facturaId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[40px] sm:min-h-[36px] text-xs touch-manipulation active:scale-95"
                          onClick={() => {
                            console.log('Descargar factura:', pedido.facturaId);
                          }}
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1 shrink-0" />
                          <span className="hidden sm:inline">Factura</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px] sm:min-h-[36px] text-xs touch-manipulation active:scale-95"
                        onClick={() => setPedidoSeleccionado(pedido)}
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" />
                        <span className="hidden sm:inline">Ver detalles</span>
                        <span className="sm:hidden">Detalles</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalles del pedido */}
      {pedidoSeleccionado && (
        <DetallePedidoModal
          pedido={pedidoSeleccionado}
          isOpen={!!pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// MODAL DE DETALLE DEL PEDIDO
// ============================================================================

interface DetallePedidoModalProps {
  pedido: Pedido;
  isOpen: boolean;
  onClose: () => void;
}

function DetallePedidoModal({ pedido, isOpen, onClose }: DetallePedidoModalProps) {
  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    } catch {
      return fecha;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 max-w-2xl w-full">
        <Card
          className="max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b">
            <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Detalle del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Información general */}
            <div>
              <h3 className="font-medium mb-3">Información General</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Número de Pedido</p>
                  <p className="font-medium">{pedido.numero}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Fecha</p>
                  <p className="font-medium">{formatFecha(pedido.fecha)}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Estado</p>
                  <p className="font-medium capitalize">{pedido.estado.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Método de Pago</p>
                  <p className="font-medium capitalize">{pedido.metodoPago}</p>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h3 className="font-medium mb-3">Productos</h3>
              <div className="space-y-3">
                {pedido.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.nombre}</p>
                      {item.opciones && Object.keys(item.opciones).length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          {JSON.stringify(item.opciones)}
                        </p>
                      )}
                      {item.observaciones && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          "{item.observaciones}"
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600">× {item.cantidad}</p>
                      <p className="font-medium">€{item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div>
              <h3 className="font-medium mb-3">Resumen de Pago</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>€{pedido.subtotal.toFixed(2)}</span>
                </div>
                {pedido.descuento > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento {pedido.cuponAplicado && `(${pedido.cuponAplicado})`}</span>
                    <span>-€{pedido.descuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>IVA (21%)</span>
                  <span>€{pedido.iva.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    €{pedido.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {pedido.observaciones && (
              <div>
                <h3 className="font-medium mb-2">Observaciones</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {pedido.observaciones}
                </p>
              </div>
            )}

            {/* Factura */}
            {pedido.facturaId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Factura disponible</p>
                      <p className="text-xs text-gray-600">{pedido.facturaId}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            )}

            {/* Botón cerrar */}
            <Button onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}