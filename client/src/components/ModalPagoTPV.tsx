import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreditCard, Banknote, Smartphone, X, Calculator, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ModalPagoTPVProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onConfirmarPago: (metodoPago: 'efectivo' | 'tarjeta' | 'mixto' | 'online', montoEfectivo?: number) => void;
  onAbrirPagoMixto: () => void;
  permitirOnline?: boolean;
}

export function ModalPagoTPV({ 
  isOpen, 
  total, 
  onClose, 
  onConfirmarPago, 
  onAbrirPagoMixto,
  permitirOnline = false 
}: ModalPagoTPVProps) {
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<'efectivo' | 'tarjeta' | 'mixto' | 'online' | null>(null);
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [procesando, setProcesando] = useState(false);

  const calcularCambio = () => {
    const monto = parseFloat(montoEfectivo) || 0;
    return Math.max(0, monto - total);
  };

  const confirmarPago = () => {
    if (!metodoSeleccionado) {
      toast.error('Selecciona un método de pago');
      return;
    }

    if (metodoSeleccionado === 'mixto') {
      onAbrirPagoMixto();
      return;
    }

    if (metodoSeleccionado === 'efectivo') {
      const monto = parseFloat(montoEfectivo);
      if (!monto || monto < total) {
        toast.error('El monto debe ser mayor o igual al total');
        return;
      }
      setProcesando(true);
      setTimeout(() => {
        onConfirmarPago('efectivo', monto);
        setProcesando(false);
        resetear();
      }, 500);
    } else {
      setProcesando(true);
      setTimeout(() => {
        onConfirmarPago(metodoSeleccionado);
        setProcesando(false);
        resetear();
      }, 500);
    }
  };

  const resetear = () => {
    setMetodoSeleccionado(null);
    setMontoEfectivo('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Procesar Pago
          </DialogTitle>
          <DialogDescription>
            Selecciona el método de pago para este pedido
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total del pedido */}
          <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-700">Total del Pedido:</span>
              <span className="text-3xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {total.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Grid de métodos de pago */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Pago en Efectivo */}
            <button
              onClick={() => setMetodoSeleccionado('efectivo')}
              className={`p-4 sm:p-6 border-2 rounded-xl transition-all hover:shadow-lg touch-manipulation active:scale-95 ${
                metodoSeleccionado === 'efectivo'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-green-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  metodoSeleccionado === 'efectivo' ? 'bg-green-500' : 'bg-gray-100'
                }`}>
                  <Banknote className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    metodoSeleccionado === 'efectivo' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Efectivo
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Pago en metálico</p>
                </div>
                {metodoSeleccionado === 'efectivo' && (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                )}
              </div>
            </button>

            {/* Pago con Tarjeta */}
            <button
              onClick={() => setMetodoSeleccionado('tarjeta')}
              className={`p-4 sm:p-6 border-2 rounded-xl transition-all hover:shadow-lg touch-manipulation active:scale-95 ${
                metodoSeleccionado === 'tarjeta'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  metodoSeleccionado === 'tarjeta' ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-6 h-6 sm:w-8 sm:h-8 ${
                    metodoSeleccionado === 'tarjeta' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-base md:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Tarjeta
                  </p>
                  <p className="text-sm text-gray-600">Débito/Crédito</p>
                </div>
                {metodoSeleccionado === 'tarjeta' && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>

            {/* Pago Mixto */}
            <button
              onClick={() => setMetodoSeleccionado('mixto')}
              className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
                metodoSeleccionado === 'mixto'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  metodoSeleccionado === 'mixto' ? 'bg-purple-500' : 'bg-gray-100'
                }`}>
                  <Calculator className={`w-8 h-8 ${
                    metodoSeleccionado === 'mixto' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Pago Mixto
                  </p>
                  <p className="text-sm text-gray-600">Efectivo + Tarjeta</p>
                </div>
                {metodoSeleccionado === 'mixto' && (
                  <Check className="w-5 h-5 text-purple-600" />
                )}
              </div>
            </button>

            {/* Pago Online (si está permitido) */}
            {permitirOnline && (
              <button
                onClick={() => setMetodoSeleccionado('online')}
                className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
                  metodoSeleccionado === 'online'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    metodoSeleccionado === 'online' ? 'bg-orange-500' : 'bg-gray-100'
                  }`}>
                    <Smartphone className={`w-8 h-8 ${
                      metodoSeleccionado === 'online' ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Pago Online
                    </p>
                    <p className="text-sm text-gray-600">Ya pagado</p>
                  </div>
                  {metodoSeleccionado === 'online' && (
                    <Check className="w-5 h-5 text-orange-600" />
                  )}
                </div>
              </button>
            )}
          </div>

          {/* Campo de efectivo cuando se selecciona ese método */}
          {metodoSeleccionado === 'efectivo' && (
            <div className="space-y-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <Label className="font-medium">Monto Recibido (€)</Label>
              <Input
                type="number"
                step="0.01"
                value={montoEfectivo}
                onChange={(e) => setMontoEfectivo(e.target.value)}
                placeholder="Ej: 50.00"
                className="text-lg"
                autoFocus
              />
              {montoEfectivo && parseFloat(montoEfectivo) >= total && (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Cambio a devolver:</span>
                  <span className="text-xl text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {calcularCambio().toFixed(2)}€
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mensaje para pago mixto */}
          {metodoSeleccionado === 'mixto' && (
            <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                Al confirmar, se abrirá el modal de pago mixto donde podrás dividir el importe entre efectivo y tarjeta.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button 
            onClick={confirmarPago}
            disabled={!metodoSeleccionado || procesando}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
          >
            {procesando ? (
              'Procesando...'
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirmar Pago
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
