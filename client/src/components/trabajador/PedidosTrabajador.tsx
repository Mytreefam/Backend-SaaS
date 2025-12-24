/**
 * 📦 VISTA DE PEDIDOS PARA TRABAJADORES
 * 
 * Muestra pedidos del punto de venta donde el trabajador ha fichado.
 * Conectado al servicio central de pedidos (pedidos.service.ts).
 * 
 * ✨ Características:
 * - Filtrado automático por PDV del trabajador fichado
 * - Vista de tabla y tarjetas responsive
 * - Filtros por estado, fecha, origen
 * - Búsqueda en tiempo real
 * - Badges de origen (App, TPV, Glovo, etc.)
 * - Modal de detalle de pedido
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
  Phone,
  MapPin,
  LayoutGrid,
  LayoutList,
  Store,
  ShoppingCart,
  AlertCircle,
  ChefHat,
  Smartphone,
  CreditCard,
  DollarSign,
  Bike,
  CheckCircle2,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePuntoVentaActivo } from '../../hooks/usePuntoVentaActivo';
import { 
  obtenerPedidosActivosPDV,
  marcarEnPreparacion,
  marcarComoListo,
  cancelarPedido,
  type Pedido,
  type EstadoPedido,
  type OrigenPedido 
} from '../../services/pedidos.service';
import { ModalDetallePedido } from '../pedidos/ModalDetallePedido';
import { BotonGenerarPedidosDemo } from '../dev/BotonGenerarPedidosDemo';

type VistaMode = 'tabla' | 'tarjetas';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PedidosTrabajador() {
  const { puntoVentaId, puntoVentaNombre, fichado } = usePuntoVentaActivo();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | EstadoPedido>('todos');
  const [filtroOrigen, setFiltroOrigen] = useState<'todos' | OrigenPedido>('todos');
  const [vistaMode, setVistaMode] = useState<VistaMode>('tabla');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // Cargar pedidos cuando cambia el PDV
  useEffect(() => {
    if (puntoVentaId) {
      cargarPedidos();
    }
  }, [puntoVentaId]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!puntoVentaId) return;
    
    const interval = setInterval(() => {
      cargarPedidos();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [puntoVentaId]);

  const cargarPedidos = () => {
    if (!puntoVentaId) return;
    
    const pedidosActivos = obtenerPedidosActivosPDV(puntoVentaId);
    setPedidos(pedidosActivos);
  };

  // Filtrar pedidos - MOVER ANTES DEL RETURN EARLY
  const pedidosFiltrados = useMemo(() => {
    let resultado = [...pedidos];

    // Filtro por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.numero?.toLowerCase().includes(termino) ||
        p.cliente.nombre.toLowerCase().includes(termino) ||
        p.cliente.telefono.includes(termino) ||
        p.id.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(p => p.estado === filtroEstado);
    }

    // Filtro por origen
    if (filtroOrigen !== 'todos') {
      resultado = resultado.filter(p => p.origenPedido === filtroOrigen);
    }

    return resultado;
  }, [pedidos, busqueda, filtroEstado, filtroOrigen]);

  // Si no está fichado, mostrar mensaje
  if (!fichado || !puntoVentaId) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="No has fichado"
          description="Debes fichar en un punto de venta para ver los pedidos"
        />
      </div>
    );
  }

  // Abrir modal de detalle
  const handleVerDetalle = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gray-900">Gestión de Pedidos</h1>
            <p className="text-sm text-gray-500 mt-1">
              <Store className="w-4 h-4 inline mr-1" />
              {puntoVentaNombre} • {pedidosFiltrados.length} pedidos activos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setVistaMode('tabla')}
              variant={vistaMode === 'tabla' ? 'default' : 'outline'}
              size="sm"
            >
              <LayoutList className="w-4 h-4 mr-2" />
              Tabla
            </Button>
            <Button
              onClick={() => setVistaMode('tarjetas')}
              variant={vistaMode === 'tarjetas' ? 'default' : 'outline'}
              size="sm"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Tarjetas
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por pedido, cliente, teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="en_preparacion">En preparación</option>
            <option value="listo">Listo</option>
          </select>

          {/* Filtro Origen */}
          <select
            value={filtroOrigen}
            onChange={(e) => setFiltroOrigen(e.target.value as typeof filtroOrigen)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="todos">Todos los orígenes</option>
            <option value="app">📱 App</option>
            <option value="tpv">💳 TPV</option>
            <option value="glovo">🛵 Glovo</option>
            <option value="justeat">🍔 Just Eat</option>
            <option value="ubereats">🚗 Uber Eats</option>
          </select>

          <Button
            onClick={cargarPedidos}
            variant="outline"
            size="sm"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6">
        {pedidosFiltrados.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No hay pedidos"
            description={busqueda || filtroEstado !== 'todos' || filtroOrigen !== 'todos' 
              ? "No se encontraron pedidos con los filtros aplicados" 
              : "No hay pedidos activos en este momento"}
          />
        ) : vistaMode === 'tabla' ? (
          <VistTabla pedidos={pedidosFiltrados} onVerDetalle={handleVerDetalle} />
        ) : (
          <VistaTarjetas pedidos={pedidosFiltrados} onVerDetalle={handleVerDetalle} />
        )}
      </div>

      {/* Modal Detalle (placeholder - puedes usar el existente) */}
      {modalDetalle && pedidoSeleccionado && (
        <ModalDetallePedido
          open={modalDetalle}
          pedido={pedidoSeleccionado}
          onClose={() => setModalDetalle(false)}
          onActualizar={cargarPedidos}
        />
      )}

      {/* Botón de desarrollo para generar pedidos demo */}
      <BotonGenerarPedidosDemo />
    </div>
  );
}

// ============================================================================
// VISTA TABLA
// ============================================================================

function VistTabla({ pedidos, onVerDetalle }: { pedidos: Pedido[], onVerDetalle: (p: Pedido) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Hora</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((pedido) => (
              <TableRow 
                key={pedido.id}
                onClick={() => onVerDetalle(pedido)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-medium">#{pedido.numero}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{pedido.cliente.nombre}</div>
                    <div className="text-xs text-gray-500">{pedido.cliente.telefono}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <BadgeOrigen origen={pedido.origenPedido} />
                </TableCell>
                <TableCell>
                  <BadgeTipoEntrega tipo={pedido.tipoEntrega} />
                </TableCell>
                <TableCell>
                  <BadgeEstado estado={pedido.estado} />
                </TableCell>
                <TableCell className="font-medium">{pedido.total.toFixed(2)}€</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(pedido.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// VISTA TARJETAS
// ============================================================================

function VistaTarjetas({ pedidos, onVerDetalle }: { pedidos: Pedido[], onVerDetalle: (p: Pedido) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pedidos.map((pedido) => (
        <Card 
          key={pedido.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onVerDetalle(pedido)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Pedido #{pedido.numero}</div>
              <BadgeOrigen origen={pedido.origenPedido} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{pedido.cliente.nombre}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {pedido.cliente.telefono}
            </div>

            {pedido.tipoEntrega === 'domicilio' && pedido.direccionEntrega && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{pedido.direccionEntrega}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <BadgeEstado estado={pedido.estado} />
                <BadgeTipoEntrega tipo={pedido.tipoEntrega} className="ml-2" />
              </div>
              <div className="font-semibold text-lg">{pedido.total.toFixed(2)}€</div>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(pedido.fecha).toLocaleString('es-ES')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// BADGES
// ============================================================================

function BadgeOrigen({ origen }: { origen: OrigenPedido }) {
  const config = {
    app: { label: 'App', icon: Smartphone, className: 'bg-blue-100 text-blue-700' },
    tpv: { label: 'TPV', icon: CreditCard, className: 'bg-purple-100 text-purple-700' },
    glovo: { label: 'Glovo', icon: Bike, className: 'bg-yellow-100 text-yellow-700' },
    justeat: { label: 'Just Eat', icon: ChefHat, className: 'bg-orange-100 text-orange-700' },
    ubereats: { label: 'Uber Eats', icon: ShoppingCart, className: 'bg-green-100 text-green-700' },
    deliveroo: { label: 'Deliveroo', icon: Truck, className: 'bg-teal-100 text-teal-700' },
  };

  const { label, icon: Icon, className } = config[origen] || config.app;

  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const config = {
    pendiente: { label: 'Pendiente', className: 'bg-gray-100 text-gray-700' },
    pagado: { label: 'Pagado', className: 'bg-green-100 text-green-700' },
    en_preparacion: { label: 'En preparación', className: 'bg-blue-100 text-blue-700' },
    listo: { label: 'Listo', className: 'bg-teal-100 text-teal-700' },
    entregado: { label: 'Entregado', className: 'bg-gray-100 text-gray-500' },
    cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  };

  const { label, className } = config[estado] || config.pendiente;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function BadgeTipoEntrega({ tipo, className = '' }: { tipo: 'recogida' | 'domicilio', className?: string }) {
  const config = {
    recogida: { label: 'Recogida', icon: Store, className: 'bg-slate-100 text-slate-700' },
    domicilio: { label: 'Domicilio', icon: Truck, className: 'bg-indigo-100 text-indigo-700' },
  };

  // Valor por defecto si tipo es undefined o no existe en config
  const { label, icon: Icon, className: baseClass } = config[tipo] || config.recogida;

  return (
    <Badge variant="outline" className={`${baseClass} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}