/**
 * 🚚 DASHBOARD DEL REPARTIDOR
 * 
 * Vista completa para repartidores de la empresa.
 * Permite escanear QR, ver pedidos asignados y marcar entregas.
 * 
 * ✨ Características:
 * - Escanear QR para tomar pedido
 * - Lista de pedidos asignados
 * - Navegación a destino (preparado para Google Maps)
 * - Marcar como entregado
 * - Confirmar cobro efectivo
 * - KPIs del repartidor
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent } from '../ui/dialog';
import { 
  Truck,
  QrCode,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  DollarSign,
  Navigation,
  Package,
  TrendingUp,
  AlertCircle,
  Home,
  ChevronRight,
  User,
  Smartphone,
  CreditCard,
  Bike
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePuntoVentaActivo } from '../../hooks/usePuntoVentaActivo';
import { EscanerQR } from '../pedidos/EscanerQR';
import { 
  obtenerPedido,
  marcarEnReparto,
  marcarEntregado,
  obtenerPedidosPendientesReparto,
  type Pedido,
  type OrigenPedido
} from '../../services/pedidos.service';

export function RepartidorDashboard() {
  const { puntoVentaId, puntoVentaNombre, fichado } = usePuntoVentaActivo();
  const [pedidosAsignados, setPedidosAsignados] = useState<Pedido[]>([]);
  const [modalEscanear, setModalEscanear] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [modalDetalle, setModalDetalle] = useState(false);

  // ID del repartidor (en producción vendría del usuario logueado)
  const repartidorId = 'REPARTIDOR-001';
  const repartidorNombre = 'Juan Repartidor';

  useEffect(() => {
    if (fichado && puntoVentaId) {
      cargarPedidos();
    }
  }, [fichado, puntoVentaId]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    if (!fichado) return;

    const interval = setInterval(cargarPedidos, 30000);
    return () => clearInterval(interval);
  }, [fichado]);

  const cargarPedidos = () => {
    if (!puntoVentaId) return;

    // Obtener pedidos pendientes de reparto
    const pendientes = obtenerPedidosPendientesReparto(puntoVentaId);
    
    // Filtrar los que están asignados a este repartidor o en camino
    const asignados = pendientes.filter(p => 
      p.repartidorId === repartidorId || p.estadoEntrega === 'en_camino'
    );

    setPedidosAsignados(asignados);
  };

  const handleEscaneoExitoso = (datos: any) => {
    const pedido = obtenerPedido(datos.pedidoId);
    
    if (!pedido) {
      toast.error('Pedido no encontrado');
      setModalEscanear(false);
      return;
    }

    // Verificar que el pedido esté listo para reparto
    if (pedido.estadoEntrega !== 'listo') {
      toast.error('Este pedido no está listo para reparto');
      setModalEscanear(false);
      return;
    }

    // Marcar como en reparto
    const resultado = marcarEnReparto(pedido.id, repartidorId, repartidorNombre);
    
    if (resultado) {
      toast.success('Pedido asignado correctamente', {
        description: `Pedido #${pedido.numero} - ${pedido.cliente.nombre}`,
      });
      setModalEscanear(false);
      cargarPedidos();
    }
  };

  const handleVerDetalle = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setModalDetalle(true);
  };

  const handleNavegar = (pedido: Pedido) => {
    if (!pedido.direccionEntrega) {
      toast.error('El pedido no tiene dirección de entrega');
      return;
    }

    // En producción, abriría Google Maps o navegador nativo
    const direccionEncoded = encodeURIComponent(pedido.direccionEntrega);
    const url = `https://www.google.com/maps/search/?api=1&query=${direccionEncoded}`;
    
    window.open(url, '_blank');
    
    toast.success('Navegación iniciada');
  };

  const handleMarcarEntregado = (pedido: Pedido) => {
    // Si es pago en efectivo, confirmar cobro
    if (pedido.pagoEnEfectivo) {
      const confirmar = window.confirm(
        `¿Confirmas que has cobrado ${pedido.total.toFixed(2)}€ en efectivo?`
      );
      
      if (!confirmar) return;
    }

    const resultado = marcarEntregado(pedido.id, repartidorId);
    
    if (resultado) {
      toast.success('Pedido marcado como entregado', {
        description: `Pedido #${pedido.numero}`,
      });
      cargarPedidos();
      setModalDetalle(false);
      setPedidoSeleccionado(null);
    }
  };

  // Si no está fichado
  if (!fichado) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold">No has fichado</h2>
            <p className="text-gray-600">
              Debes fichar en un punto de venta para comenzar a repartir
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular estadísticas
  const pedidosEnCamino = pedidosAsignados.filter(p => p.estadoEntrega === 'en_camino').length;
  const totalACobrar = pedidosAsignados
    .filter(p => p.pagoEnEfectivo && p.estadoPago === 'pendiente_cobro')
    .reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Panel de Repartidor</h1>
              <p className="text-teal-100">{puntoVentaNombre}</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-sm">En reparto</span>
              </div>
              <div className="text-3xl font-bold">{pedidosEnCamino}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">A cobrar</span>
              </div>
              <div className="text-3xl font-bold">{totalACobrar.toFixed(2)}€</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Botón escanear */}
        <Card className="border-2 border-teal-200 shadow-lg">
          <CardContent className="p-6">
            <Button
              onClick={() => setModalEscanear(true)}
              className="w-full bg-teal-600 hover:bg-teal-700 h-16 text-lg"
            >
              <QrCode className="w-6 h-6 mr-3" />
              Escanear QR para Tomar Pedido
            </Button>
          </CardContent>
        </Card>

        {/* Lista de pedidos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mis Pedidos ({pedidosAsignados.length})</h2>
          
          {pedidosAsignados.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600">No tienes pedidos asignados</p>
                <p className="text-sm text-gray-500 mt-1">
                  Escanea un código QR para tomar un pedido
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pedidosAsignados.map((pedido) => (
                <TarjetaPedidoRepartidor
                  key={pedido.id}
                  pedido={pedido}
                  onVerDetalle={handleVerDetalle}
                  onNavegar={handleNavegar}
                  onMarcarEntregado={handleMarcarEntregado}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Escanear QR */}
      <Dialog open={modalEscanear} onOpenChange={setModalEscanear}>
        <DialogContent className="max-w-lg">
          <EscanerQR
            onEscaneoExitoso={handleEscaneoExitoso}
            onCancelar={() => setModalEscanear(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Detalle Pedido */}
      {modalDetalle && pedidoSeleccionado && (
        <ModalDetallePedidoRepartidor
          pedido={pedidoSeleccionado}
          onClose={() => {
            setModalDetalle(false);
            setPedidoSeleccionado(null);
          }}
          onNavegar={handleNavegar}
          onMarcarEntregado={handleMarcarEntregado}
        />
      )}
    </div>
  );
}

// ============================================================================
// TARJETA DE PEDIDO
// ============================================================================

interface TarjetaPedidoRepartidorProps {
  pedido: Pedido;
  onVerDetalle: (p: Pedido) => void;
  onNavegar: (p: Pedido) => void;
  onMarcarEntregado: (p: Pedido) => void;
}

function TarjetaPedidoRepartidor({ 
  pedido, 
  onVerDetalle, 
  onNavegar, 
  onMarcarEntregado 
}: TarjetaPedidoRepartidorProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Info principal */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold">#{pedido.numero}</span>
              <BadgeOrigen origen={pedido.origenPedido} />
              {pedido.pagoEnEfectivo && (
                <Badge className="bg-amber-500">
                  <DollarSign className="w-3 h-3 mr-1" />
                  Cobrar: {pedido.total.toFixed(2)}€
                </Badge>
              )}
            </div>

            {/* Cliente */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-gray-400" />
                {pedido.cliente.nombre}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                {pedido.cliente.telefono}
              </div>
            </div>

            {/* Dirección */}
            {pedido.direccionEntrega && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{pedido.direccionEntrega}</span>
              </div>
            )}

            {/* Items */}
            <div className="bg-slate-50 rounded-lg p-3 text-sm">
              <div className="font-medium mb-1">Productos:</div>
              {pedido.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span className="text-gray-600">{item.subtotal.toFixed(2)}€</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                <span>Total:</span>
                <span className="text-teal-600">{pedido.total.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onNavegar(pedido)}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navegar
            </Button>
            
            <Button
              onClick={() => onMarcarEntregado(pedido)}
              className="bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Entregado
            </Button>

            <Button
              onClick={() => onVerDetalle(pedido)}
              variant="outline"
              size="sm"
            >
              Ver más
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MODAL DETALLE
// ============================================================================

interface ModalDetallePedidoRepartidorProps {
  pedido: Pedido;
  onClose: () => void;
  onNavegar: (p: Pedido) => void;
  onMarcarEntregado: (p: Pedido) => void;
}

function ModalDetallePedidoRepartidor({ 
  pedido, 
  onClose, 
  onNavegar, 
  onMarcarEntregado 
}: ModalDetallePedidoRepartidorProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Pedido #{pedido.numero}</h2>
            <Button onClick={onClose} variant="ghost" size="sm">✕</Button>
          </div>

          <div className="space-y-4">
            <div>
              <strong>Cliente:</strong> {pedido.cliente.nombre}
            </div>
            <div>
              <strong>Teléfono:</strong> {pedido.cliente.telefono}
            </div>
            {pedido.direccionEntrega && (
              <div>
                <strong>Dirección:</strong> {pedido.direccionEntrega}
              </div>
            )}
            
            {pedido.observaciones && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <strong>Observaciones:</strong> {pedido.observaciones}
              </div>
            )}

            <div>
              <strong>Productos:</strong>
              <ul className="list-disc list-inside ml-4 mt-2">
                {pedido.items.map((item, idx) => (
                  <li key={idx}>
                    {item.cantidad}x {item.nombre} - {item.subtotal.toFixed(2)}€
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-2xl font-bold">
              Total: {pedido.total.toFixed(2)}€
            </div>

            {pedido.pagoEnEfectivo && (
              <div className="bg-amber-100 border-2 border-amber-400 rounded p-3 text-center font-bold">
                ⚠️ COBRAR EN EFECTIVO: {pedido.total.toFixed(2)}€
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => onNavegar(pedido)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navegar
            </Button>
            <Button
              onClick={() => onMarcarEntregado(pedido)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Marcar Entregado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BADGE ORIGEN
// ============================================================================

function BadgeOrigen({ origen }: { origen: OrigenPedido }) {
  const config = {
    app: { label: 'App', icon: Smartphone, className: 'bg-blue-100 text-blue-700' },
    tpv: { label: 'TPV', icon: CreditCard, className: 'bg-purple-100 text-purple-700' },
    glovo: { label: 'Glovo', icon: Bike, className: 'bg-yellow-100 text-yellow-700' },
    justeat: { label: 'Just Eat', icon: Package, className: 'bg-orange-100 text-orange-700' },
    ubereats: { label: 'Uber Eats', icon: Truck, className: 'bg-green-100 text-green-700' },
    deliveroo: { label: 'Deliveroo', icon: Bike, className: 'bg-teal-100 text-teal-700' },
  };

  const { label, icon: Icon, className } = config[origen] || config.app;

  return (
    <Badge variant="outline" className={className}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
