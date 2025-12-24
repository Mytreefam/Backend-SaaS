/**
 * ⏳ MODAL DE PROCESAMIENTO DE PAGO
 * Pantalla de loading mientras se procesa el pago con MONEI
 */

import { Dialog, DialogContent } from '../ui/dialog';
import { Loader2, Lock } from 'lucide-react';

interface PagoProcesamientoModalProps {
  isOpen: boolean;
  metodoPago: 'tarjeta' | 'bizum' | 'efectivo';
}

export function PagoProcesamientoModal({ isOpen, metodoPago }: PagoProcesamientoModalProps) {
  const getTitulo = () => {
    switch (metodoPago) {
      case 'tarjeta':
        return 'Procesando pago con tarjeta...';
      case 'bizum':
        return 'Procesando pago con Bizum...';
      case 'efectivo':
        return 'Confirmando pedido...';
      default:
        return 'Procesando...';
    }
  };

  const getDescripcion = () => {
    switch (metodoPago) {
      case 'tarjeta':
        return 'Verificando tu tarjeta con MONEI';
      case 'bizum':
        return 'Conectando con Bizum';
      case 'efectivo':
        return 'Preparando tu pedido';
      default:
        return 'Por favor espera...';
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideClose>
        <div className="flex flex-col items-center justify-center py-8">
          {/* Spinner animado */}
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-[#ED1C24] border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {metodoPago === 'tarjeta' || metodoPago === 'bizum' ? (
                <Lock className="w-8 h-8 text-[#ED1C24]" />
              ) : (
                <Loader2 className="w-8 h-8 text-[#ED1C24]" />
              )}
            </div>
          </div>

          {/* Título */}
          <h3 className="text-lg font-medium text-center mb-2">
            {getTitulo()}
          </h3>

          {/* Descripción */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {getDescripcion()}
          </p>

          {/* Barra de progreso */}
          <div className="w-full max-w-xs">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#ED1C24] rounded-full animate-progress"></div>
            </div>
          </div>

          {/* Mensaje de seguridad */}
          {(metodoPago === 'tarjeta' || metodoPago === 'bizum') && (
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3 h-3" />
              <span>Conexión segura con MONEI</span>
            </div>
          )}

          {/* Advertencia */}
          <p className="mt-4 text-xs text-center text-gray-500">
            No cierres esta ventana ni actualices la página
          </p>
        </div>

        <style>{`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(400%);
            }
          }
          .animate-progress {
            animation: progress 1.5s ease-in-out infinite;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
