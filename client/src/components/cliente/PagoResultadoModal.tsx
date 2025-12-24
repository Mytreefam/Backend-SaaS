/**
 * ✅❌ MODAL DE RESULTADO DE PAGO
 * Muestra éxito o error después de procesar el pago
 */

import { Dialog, DialogContent, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle, FileText, Download } from 'lucide-react';
import { Separator } from '../ui/separator';

interface PagoResultadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exitoso: boolean;
  numeroPedido?: string;
  numeroFactura?: string;
  total?: number;
  metodoPago?: string;
  mensajeError?: string;
  onReintentar?: () => void;
  onVerPedido?: () => void;
}

export function PagoResultadoModal({
  isOpen,
  onClose,
  exitoso,
  numeroPedido,
  numeroFactura,
  total,
  metodoPago,
  mensajeError,
  onReintentar,
  onVerPedido,
}: PagoResultadoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center py-6">
          {/* Icono */}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mb-4
            ${exitoso ? 'bg-green-100' : 'bg-red-100'}
          `}>
            {exitoso ? (
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </div>

          {/* Título */}
          <h3 className={`text-xl font-medium text-center mb-2 ${
            exitoso ? 'text-green-900' : 'text-red-900'
          }`}>
            {exitoso ? '¡Pago realizado con éxito!' : 'Error en el pago'}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {exitoso 
              ? 'Tu pedido ha sido confirmado y está siendo preparado'
              : mensajeError || 'No se pudo procesar el pago. Por favor, inténtalo de nuevo.'
            }
          </p>

          {/* Detalles del pedido (solo si exitoso) */}
          {exitoso && (
            <div className="w-full bg-gray-50 rounded-lg p-4 space-y-3">
              {numeroPedido && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nº Pedido:</span>
                  <span className="font-mono font-medium">{numeroPedido}</span>
                </div>
              )}

              {numeroFactura && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nº Factura:</span>
                  <span className="font-mono font-medium">{numeroFactura}</span>
                </div>
              )}

              {total !== undefined && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total pagado:</span>
                    <span className="text-lg font-bold text-green-600">
                      €{total.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              {metodoPago && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Método de pago:</span>
                  <span className="text-sm font-medium capitalize">
                    {metodoPago === 'tarjeta' ? 'Tarjeta' : metodoPago}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de error detallado */}
          {!exitoso && mensajeError && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {mensajeError}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {exitoso ? (
            <>
              {numeroFactura && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Aquí iría la lógica para descargar la factura
                    toast.info('Descarga de factura en desarrollo');
                  }}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar factura
                </Button>
              )}
              
              <Button
                onClick={() => {
                  if (onVerPedido) {
                    onVerPedido();
                  }
                  onClose();
                }}
                className="w-full sm:w-auto bg-[#ED1C24] hover:bg-red-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver pedido
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              
              <Button
                onClick={() => {
                  if (onReintentar) {
                    onReintentar();
                  }
                  onClose();
                }}
                className="w-full sm:w-auto bg-[#ED1C24] hover:bg-red-700"
              >
                Reintentar pago
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Toast import para el ejemplo
import { toast } from 'sonner@2.0.3';
