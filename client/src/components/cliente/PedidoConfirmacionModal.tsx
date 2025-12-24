/**
 * ✅ MODAL DE CONFIRMACIÓN DE PEDIDO
 * 
 * Muestra los detalles del pedido recién creado
 * con información útil para el cliente.
 */

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  FileText,
  Download,
  Share2,
  ExternalLink
} from 'lucide-react';
import { Pedido } from '../../services/pedidos.service';

interface PedidoConfirmacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedido: Pedido | null;
}

export function PedidoConfirmacionModal({ isOpen, onClose, pedido }: PedidoConfirmacionModalProps) {
  if (!pedido) return null;

  const handleDescargarFactura = () => {
    // TODO: Implementar descarga de factura PDF
    console.log('Descargar factura:', pedido.facturaId);
  };

  const handleCompartir = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pedido ${pedido.numero}`,
          text: `He realizado un pedido en Udar Edge. Nº: ${pedido.numero}`,
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              ¡Pedido Realizado!
            </DialogTitle>
            <DialogDescription>
              Tu pedido ha sido confirmado y está siendo preparado
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Número de pedido */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-1">Número de Pedido</p>
            <p className="text-2xl font-medium text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedido.numero}
            </p>
          </div>

          {/* Detalles */}
          <div className="space-y-3">
            {/* Tiempo estimado */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Tiempo estimado</p>
                <p className="text-sm text-gray-600">
                  {pedido.tiempoPreparacion} minutos
                </p>
              </div>
            </div>

            {/* Tipo de entrega */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                {pedido.tipoEntrega === 'recogida' ? (
                  <Package className="w-5 h-5 text-purple-600" />
                ) : (
                  <MapPin className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {pedido.tipoEntrega === 'recogida' ? 'Recogida en tienda' : 'Entrega a domicilio'}
                </p>
                <p className="text-sm text-gray-600">
                  {pedido.tipoEntrega === 'recogida' 
                    ? 'Te avisaremos cuando esté listo'
                    : pedido.direccionEntrega
                  }
                </p>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Estado</p>
                <Badge variant="outline" className="mt-1">
                  {pedido.estado === 'pagado' ? 'Pagado' : 'Pendiente de pago'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumen del pedido */}
          <div>
            <p className="text-sm font-medium mb-2">Resumen</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Productos ({pedido.items.length})</span>
                <span>€{pedido.subtotal.toFixed(2)}</span>
              </div>
              {pedido.descuento > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-€{pedido.descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">IVA</span>
                <span>€{pedido.iva.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{pedido.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Factura */}
          {pedido.facturaId && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">Factura disponible</p>
                    <p className="text-xs text-gray-600">{pedido.facturaId}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDescargarFactura}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCompartir}
            className="w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartir
          </Button>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
