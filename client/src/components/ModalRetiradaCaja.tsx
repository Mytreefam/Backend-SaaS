import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { TrendingDown, Check, X, Calculator } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CalculadoraEfectivo } from './CalculadoraEfectivo';

interface ModalRetiradaCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (importe: number, motivo: string) => void;
  saldoActual: number;
}

export function ModalRetiradaCaja({ isOpen, onClose, onConfirmar, saldoActual }: ModalRetiradaCajaProps) {
  const [importe, setImporte] = useState('');
  const [motivo, setMotivo] = useState('');
  const [showCalculadora, setShowCalculadora] = useState(false);

  const handleConfirmar = () => {
    const monto = parseFloat(importe);
    
    if (!monto || monto <= 0) {
      toast.error('Ingresa un importe válido para la retirada');
      return;
    }

    if (monto > saldoActual) {
      toast.error('El importe de retirada no puede ser mayor al saldo en caja');
      return;
    }

    if (!motivo.trim()) {
      toast.error('Debes especificar un motivo para la retirada');
      return;
    }

    onConfirmar(monto, motivo);
    resetear();
  };

  const resetear = () => {
    setImporte('');
    setMotivo('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  const saldoRestante = saldoActual - (parseFloat(importe) || 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Retirada de Caja
          </DialogTitle>
          <DialogDescription>
            Registra una retirada de efectivo de la caja
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Saldo actual */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-700 mb-2">Saldo Actual en Caja:</p>
            <p className="text-2xl text-orange-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {saldoActual.toFixed(2)}€
            </p>
          </div>

          {/* Importe a retirar */}
          <div className="space-y-2">
            <Label htmlFor="importe-retirada">Importe a Retirar (€)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalculadora(true)}
                className="gap-2 shrink-0"
              >
                <Calculator className="w-4 h-4" />
                Calculadora
              </Button>
              <Input
                id="importe-retirada"
                type="number"
                step="0.01"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                placeholder="Ej: 100.00"
                className="flex-1"
                autoFocus
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo de la Retirada</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Depósito bancario, pago a proveedor, etc."
              rows={3}
              required
            />
          </div>

          {/* Saldo restante */}
          {importe && parseFloat(importe) > 0 && (
            <div className={`border-2 rounded-lg p-4 ${
              saldoRestante >= 0 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className="text-sm mb-2">Saldo después de la retirada:</p>
              <p className={`text-2xl font-medium ${
                saldoRestante >= 0 ? 'text-blue-700' : 'text-red-700'
              }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                {saldoRestante.toFixed(2)}€
              </p>
              {saldoRestante < 0 && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ El importe excede el saldo disponible
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            className="bg-orange-600 hover:bg-orange-700 gap-2"
            disabled={!importe || parseFloat(importe) <= 0 || !motivo.trim() || saldoRestante < 0}
          >
            <Check className="w-4 h-4" />
            Confirmar Retirada
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Calculadora de efectivo */}
      <CalculadoraEfectivo
        isOpen={showCalculadora}
        onClose={() => setShowCalculadora(false)}
        onConfirmar={(total) => {
          setImporte(total.toFixed(2));
          setShowCalculadora(false);
        }}
        titulo="Calcular Importe a Retirar"
      />
    </Dialog>
  );
}
