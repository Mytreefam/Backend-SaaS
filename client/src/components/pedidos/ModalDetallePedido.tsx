/**
 * 📦 MODAL DETALLE DE PEDIDO - VERSIÓN COMPLETA
 * 
 * Modal completo para gestionar pedidos con todas las acciones:
 * - Cambio de estados (preparación, listo, entregado, cancelado)
 * - Ver y generar código QR
 * - Imprimir ticket
 * - Actualizar observaciones
 * - Historial de estados
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Clock,
  CheckCircle,
  Truck,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  Package,
  Store,
  ChefHat,
  X,
  QrCode,
  Printer,
  Edit3,
  AlertTriangle,
  DollarSign,
  Bike
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  marcarEnPreparacion,
  marcarComoListo,
  marcarEntregado,
  cancelarPedido,
  confirmarPago,
  actualizarObservaciones,
  type Pedido,
  type EstadoPedido
} from '../../services/pedidos.service';
import { GeneradorQR } from './GeneradorQR';
import { TicketPedido } from './TicketPedido';

// ============================================================================
// INTERFACES
// ============================================================================

interface ModalDetallePedidoProps {
  open: boolean;
  onClose: () => void;
  pedido: Pedido;
  onActualizar: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function ModalDetallePedido({ 
  open, 
  onClose, 
  pedido,
  onActualizar 
}: ModalDetallePedidoProps) {
  const [mostrarQR, setMostrarQR] = useState(false);
  const [mostrarTicket, setMostrarTicket] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [observaciones, setObservaciones] = useState(pedido.observaciones || '');
  const [editandoObservaciones, setEditandoObservaciones] = useState(false);

  // ============================================================================
  // ACCIONES DE CAMBIO DE ESTADO
  // ============================================================================

  const handleIniciarPreparacion = () => {
    const resultado = marcarEnPreparacion(pedido.id);
    if (resultado) {
      toast.success('Pedido en preparación', {
        description: 'La cocina ha iniciado la preparación'
      });
      onActualizar();
      onClose();
    } else {
      toast.error('No se pudo cambiar el estado');
    }
  };

  const handleMarcarListo = () => {
    const resultado = marcarComoListo(pedido.id);
    if (resultado) {
      toast.success('¡Pedido listo!', {
        description: 'El cliente será notificado'
      });
      onActualizar();
      onClose();
    } else {
      toast.error('El pedido debe estar en preparación primero');
    }
  };

  const handleMarcarEntregado = () => {
    // Si es efectivo, confirmar cobro
    if (pedido.pagoEnEfectivo && pedido.estadoPago !== 'pagado') {
      const confirmar = window.confirm(
        `¿Confirmas que has cobrado ${pedido.total.toFixed(2)}€ en efectivo?`
      );
      if (!confirmar) return;
    }

    const resultado = marcarEntregado(pedido.id, 'TRABAJADOR-001');
    if (resultado) {
      toast.success('Pedido entregado correctamente', {
        description: pedido.pagoEnEfectivo ? 'Pago en efectivo confirmado' : undefined
      });
      onActualizar();
      onClose();
    } else {
      toast.error('No se pudo marcar como entregado');
    }
  };

  const handleCancelar = () => {
    if (!motivoCancelacion.trim()) {
      toast.error('Debes indicar el motivo de cancelación');
      return;
    }

    const resultado = cancelarPedido(pedido.id, motivoCancelacion, 'TRABAJADOR-001');
    if (resultado) {
      toast.success('Pedido cancelado', {
        description: 'El cliente será notificado'
      });
      setModalCancelar(false);
      setMotivoCancelacion('');
      onActualizar();
      onClose();
    } else {
      toast.error('No se pudo cancelar el pedido');
    }
  };

  const handleConfirmarPago = () => {
    const resultado = confirmarPago(pedido.id, 'efectivo');
    if (resultado) {
      toast.success('Pago confirmado');
      onActualizar();
    } else {
      toast.error('No se pudo confirmar el pago');
    }
  };

  const handleGuardarObservaciones = () => {
    const resultado = actualizarObservaciones(pedido.id, observaciones);
    if (resultado) {
      toast.success('Observaciones actualizadas');
      setEditandoObservaciones(false);
      onActualizar();
    } else {
      toast.error('No se pudieron guardar las observaciones');
    }
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBadgeEstado = (estado: EstadoPedido) => {
    const config = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendiente', icon: Clock },
      pagado: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Pagado', icon: CheckCircle },
      en_preparacion: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'En Preparación', icon: ChefHat },
      listo: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Listo', icon: Package },
      entregado: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Entregado', icon: CheckCircle2 },
      cancelado: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelado', icon: X }
    };

    const { color, label, icon: Icon } = config[estado];
    return (
      <Badge className={`${color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getBadgeOrigen = (origen: string) => {
    const config = {
      app: { emoji: '📱', label: 'App', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      tpv: { emoji: '💳', label: 'TPV', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      glovo: { emoji: '🛵', label: 'Glovo', color: 'bg-orange-50 text-orange-700 border-orange-200' },
      justeat: { emoji: '🍔', label: 'Just Eat', color: 'bg-red-50 text-red-700 border-red-200' },
      ubereats: { emoji: '🚗', label: 'Uber Eats', color: 'bg-green-50 text-green-700 border-green-200' }
    };

    const cfg = config[origen as keyof typeof config] || { emoji: '📦', label: origen, color: 'bg-gray-50 text-gray-700 border-gray-200' };
    return (
      <Badge className={`${cfg.color} border`}>
        <span className="mr-1">{cfg.emoji}</span>
        {cfg.label}
      </Badge>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6 text-teal-600" />
              Pedido #{pedido.numero || pedido.id.slice(-8)}
            </DialogTitle>
            <DialogDescription>
              Gestión completa del pedido y cambio de estados
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 py-4">
            {/* ========== COLUMNA IZQUIERDA: INFORMACIÓN ========== */}
            <div className="space-y-4">
              {/* Estado y Origen */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Estado Actual</span>
                  {getBadgeEstado(pedido.estado)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Origen</span>
                  {getBadgeOrigen(pedido.origenPedido)}
                </div>
              </div>

              {/* Cliente */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  Cliente
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{pedido.cliente.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{pedido.cliente.telefono}</span>
                  </div>
                  {pedido.direccionEntrega && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm">{pedido.direccionEntrega}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pago */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  Pago
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Método:</span>
                    <Badge variant="outline" className={
                      pedido.metodoPago === 'efectivo' 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                      {pedido.metodoPago === 'efectivo' ? (
                        <><Banknote className="w-3 h-3 mr-1" /> Efectivo</>
                      ) : (
                        <><CreditCard className="w-3 h-3 mr-1" /> {pedido.metodoPago}</>
                      )}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado Pago:</span>
                    <Badge variant={pedido.estadoPago === 'pagado' ? 'default' : 'outline'}>
                      {pedido.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente de Cobro'}
                    </Badge>
                  </div>
                  {pedido.pagoEnEfectivo && pedido.estadoPago !== 'pagado' && (
                    <Button
                      onClick={handleConfirmarPago}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 mt-2"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Confirmar Cobro en Efectivo
                    </Button>
                  )}
                </div>
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-semibold mb-2">Productos</h3>
                <div className="space-y-2">
                  {pedido.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between bg-gray-50 p-2 rounded text-sm">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span className="font-medium">{item.subtotal.toFixed(2)}€</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between pt-2 font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-teal-600">{pedido.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Observaciones</h3>
                  {!editandoObservaciones && (
                    <Button
                      onClick={() => setEditandoObservaciones(true)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {editandoObservaciones ? (
                  <div className="space-y-2">
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                      rows={3}
                      placeholder="Añadir observaciones..."
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleGuardarObservaciones}
                        size="sm"
                        className="flex-1"
                      >
                        Guardar
                      </Button>
                      <Button
                        onClick={() => {
                          setObservaciones(pedido.observaciones || '');
                          setEditandoObservaciones(false);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-gray-700">
                      {pedido.observaciones || 'Sin observaciones'}
                    </p>
                  </div>
                )}
              </div>

              {/* Info adicional */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>📅 Creado: {formatearFecha(pedido.fecha)}</div>
                {pedido.fechaListo && (
                  <div>✅ Listo: {formatearFecha(pedido.fechaListo)}</div>
                )}
                {pedido.fechaEntrega && (
                  <div>🚚 Entregado: {formatearFecha(pedido.fechaEntrega)}</div>
                )}
              </div>
            </div>

            {/* ========== COLUMNA DERECHA: ACCIONES ========== */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Acciones Rápidas</h3>
                
                <div className="space-y-2">
                  {/* Iniciar Preparación */}
                  {pedido.estado === 'pagado' && (
                    <Button
                      onClick={handleIniciarPreparacion}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Iniciar Preparación
                    </Button>
                  )}

                  {/* Marcar como Listo */}
                  {pedido.estado === 'en_preparacion' && (
                    <Button
                      onClick={handleMarcarListo}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Marcar como Listo
                    </Button>
                  )}

                  {/* Marcar como Entregado */}
                  {(pedido.estado === 'listo' || pedido.estadoEntrega === 'en_camino') && (
                    <Button
                      onClick={handleMarcarEntregado}
                      className="w-full bg-green-700 hover:bg-green-800"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Entregado
                    </Button>
                  )}

                  {/* Ver QR */}
                  <Button
                    onClick={() => setMostrarQR(!mostrarQR)}
                    variant="outline"
                    className="w-full"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {mostrarQR ? 'Ocultar' : 'Ver'} Código QR
                  </Button>

                  {/* Imprimir Ticket */}
                  <Button
                    onClick={() => setMostrarTicket(!mostrarTicket)}
                    variant="outline"
                    className="w-full"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    {mostrarTicket ? 'Ocultar' : 'Ver'} Ticket
                  </Button>

                  {/* Cancelar Pedido */}
                  {pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' && (
                    <Button
                      onClick={() => setModalCancelar(true)}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar Pedido
                    </Button>
                  )}
                </div>
              </div>

              {/* QR Code */}
              {mostrarQR && (
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-medium mb-3 text-center">Código QR</h4>
                  <GeneradorQR
                    pedidoId={pedido.id}
                    pedidoNumero={pedido.numero || pedido.id}
                    size={220}
                    showDownload={true}
                  />
                </div>
              )}

              {/* Ticket */}
              {mostrarTicket && (
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-medium mb-3">Vista Previa Ticket</h4>
                  <TicketPedido pedido={pedido} />
                </div>
              )}

              {/* Estado Completado */}
              {pedido.estado === 'entregado' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-700">
                    Pedido Completado
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Entregado el {formatearFecha(pedido.fechaEntrega || pedido.updatedAt)}
                  </p>
                </div>
              )}

              {/* Estado Cancelado */}
              {pedido.estado === 'cancelado' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium text-red-700">Pedido Cancelado</p>
                      {pedido.motivoCancelacion && (
                        <p className="text-sm text-red-600 mt-1">
                          Motivo: {pedido.motivoCancelacion}
                        </p>
                      )}
                      <p className="text-xs text-red-500 mt-1">
                        {formatearFecha(pedido.fechaCancelacion || pedido.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelación */}
      <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              ¿Cancelar Pedido #{pedido.numero || pedido.id.slice(-8)}?
            </DialogTitle>
            <DialogDescription>
              Esta acción notificará al cliente. El pedido no se podrá recuperar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label className="text-sm font-medium">Motivo de cancelación:</label>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              className="w-full p-3 border rounded-lg text-sm"
              rows={4}
              placeholder="Ej: Producto agotado, cliente solicitó cancelación, error en el pedido..."
            />
          </div>

          <DialogFooter>
            <Button 
              onClick={() => {
                setModalCancelar(false);
                setMotivoCancelacion('');
              }} 
              variant="outline"
            >
              Volver
            </Button>
            <Button 
              onClick={handleCancelar} 
              variant="destructive"
              disabled={!motivoCancelacion.trim()}
            >
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}