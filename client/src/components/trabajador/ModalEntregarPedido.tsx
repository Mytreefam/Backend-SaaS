/**
 * 📦 MODAL ENTREGAR PEDIDO
 * 
 * Modal para que el trabajador pueda entregar pedidos a clientes.
 * Conectado al servicio central de pedidos (pedidos.service.ts).
 * 
 * ✨ Características:
 * - Filtra pedidos listos para entregar del PDV del trabajador
 * - Separa pedidos de recogida en local vs domicilio
 * - Permite marcar como entregado
 * - Confirma cobro en efectivo si aplica
 * - Diseño responsive y profesional
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Separator } from '../ui/separator';
import { 
  Package, 
  MapPin, 
  Store, 
  User, 
  Clock, 
  Check, 
  Search,
  X,
  Phone,
  Euro,
  TruckIcon,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Smartphone,
  CreditCard,
  Bike
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePuntoVentaActivo } from '../../hooks/usePuntoVentaActivo';
import {
  obtenerPedidosListosEntrega,
  obtenerPedidosPendientesReparto,
  marcarEntregado,
  type Pedido,
  type OrigenPedido
} from '../../services/pedidos.service';

interface ModalEntregarPedidoProps {
  open: boolean;
  onClose: () => void;
}

export function ModalEntregarPedido({ open, onClose }: ModalEntregarPedidoProps) {
  const { puntoVentaId, puntoVentaNombre } = usePuntoVentaActivo();
  const [busqueda, setBusqueda] = useState('');
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>([]);
  const [pedidosDomicilio, setPedidosDomicilio] = useState<Pedido[]>([]);
  const [tab, setTab] = useState<'local' | 'domicilio'>('local');

  useEffect(() => {
    if (open && puntoVentaId) {
      cargarPedidos();
    }
  }, [open, puntoVentaId]);

  const cargarPedidos = () => {
    if (!puntoVentaId) return;

    // Pedidos para entregar en local (recogida)
    const local = obtenerPedidosListosEntrega(puntoVentaId);
    setPedidosLocal(local);

    // Pedidos para domicilio (reparto)
    const domicilio = obtenerPedidosPendientesReparto(puntoVentaId);
    setPedidosDomicilio(domicilio);
  };

  const handleEntregar = (pedido: Pedido) => {
    // Si es pago en efectivo, confirmar cobro
    if (pedido.pagoEnEfectivo) {
      if (!confirm(`¿Confirmas que has cobrado ${pedido.total.toFixed(2)}€ en efectivo?`)) {
        return;
      }
    }

    const resultado = marcarEntregado(pedido.id, 'trabajador-actual'); // TODO: Usar ID real del trabajador
    
    if (resultado) {
      toast.success('Pedido marcado como entregado', {
        description: `Pedido #${pedido.numero} - ${pedido.cliente.nombre}`,
      });
      cargarPedidos();
    } else {
      toast.error('Error al marcar el pedido como entregado');
    }
  };

  const pedidosFiltrados = (lista: Pedido[]) => {
    if (!busqueda) return lista;
    
    const termino = busqueda.toLowerCase();
    return lista.filter(p => 
      p.numero?.toLowerCase().includes(termino) ||
      p.cliente.nombre.toLowerCase().includes(termino) ||
      p.cliente.telefono.includes(termino)
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Entregar Pedidos
          </DialogTitle>
          <DialogDescription>
            {puntoVentaNombre} • Pedidos listos para entregar
          </DialogDescription>
        </DialogHeader>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por pedido, cliente o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setTab('local')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              tab === 'local'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store className="w-4 h-4 inline mr-2" />
            Recogida en Local
            {pedidosLocal.length > 0 && (
              <Badge className="ml-2 bg-teal-600">{pedidosLocal.length}</Badge>
            )}
          </button>
          <button
            onClick={() => setTab('domicilio')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              tab === 'domicilio'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <TruckIcon className="w-4 h-4 inline mr-2" />
            Envío a Domicilio
            {pedidosDomicilio.length > 0 && (
              <Badge className="ml-2 bg-teal-600">{pedidosDomicilio.length}</Badge>
            )}
          </button>
        </div>

        {/* Lista de pedidos */}
        <div className="flex-1 overflow-auto space-y-3">
          <AnimatePresence mode="wait">
            {tab === 'local' ? (
              <ListaPedidos
                key="local"
                pedidos={pedidosFiltrados(pedidosLocal)}
                onEntregar={handleEntregar}
                tipo="local"
              />
            ) : (
              <ListaPedidos
                key="domicilio"
                pedidos={pedidosFiltrados(pedidosDomicilio)}
                onEntregar={handleEntregar}
                tipo="domicilio"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// LISTA DE PEDIDOS
// ============================================================================

interface ListaPedidosProps {
  pedidos: Pedido[];
  onEntregar: (pedido: Pedido) => void;
  tipo: 'local' | 'domicilio';
}

function ListaPedidos({ pedidos, onEntregar, tipo }: ListaPedidosProps) {
  if (pedidos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {tipo === 'local' ? (
            <Store className="w-8 h-8 text-gray-400" />
          ) : (
            <TruckIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <p className="text-gray-600 font-medium">No hay pedidos listos</p>
        <p className="text-sm text-gray-500">
          {tipo === 'local' 
            ? 'No hay pedidos de recogida listos para entregar'
            : 'No hay pedidos de domicilio listos para repartir'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      {pedidos.map((pedido, index) => (
        <motion.div
          key={pedido.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <TarjetaPedido pedido={pedido} onEntregar={onEntregar} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// TARJETA DE PEDIDO
// ============================================================================

function TarjetaPedido({ pedido, onEntregar }: { pedido: Pedido, onEntregar: (p: Pedido) => void }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Info principal */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-lg">#{pedido.numero}</span>
            <BadgeOrigen origen={pedido.origenPedido} />
            {pedido.pagoEnEfectivo && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700">
                <DollarSign className="w-3 h-3 mr-1" />
                Cobrar efectivo: {pedido.total.toFixed(2)}€
              </Badge>
            )}
          </div>

          {/* Cliente */}
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{pedido.cliente.nombre}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            {pedido.cliente.telefono}
          </div>

          {/* Dirección (solo si es domicilio) */}
          {pedido.tipoEntrega === 'domicilio' && pedido.direccionEntrega && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{pedido.direccionEntrega}</span>
            </div>
          )}

          {/* Productos */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-1">
            <div className="text-xs text-gray-500 mb-2">Productos:</div>
            {pedido.items.map((item, idx) => (
              <div key={idx} className="text-sm flex justify-between">
                <span>{item.cantidad}x {item.nombre}</span>
                <span className="text-gray-600">{item.subtotal.toFixed(2)}€</span>
              </div>
            ))}
          </div>

          {/* Observaciones */}
          {pedido.observaciones && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm">
              <strong>Observaciones:</strong> {pedido.observaciones}
            </div>
          )}

          {/* Total y hora */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {new Date(pedido.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xl font-semibold text-teal-600">
              {pedido.total.toFixed(2)}€
            </div>
          </div>
        </div>

        {/* Botón entregar */}
        <Button
          onClick={() => onEntregar(pedido)}
          className="bg-teal-600 hover:bg-teal-700 flex-shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Entregar
        </Button>
      </div>
    </Card>
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
    ubereats: { label: 'Uber Eats', icon: TruckIcon, className: 'bg-green-100 text-green-700' },
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
