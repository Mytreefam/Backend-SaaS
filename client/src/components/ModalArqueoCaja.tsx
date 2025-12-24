import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calculator, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CalculadoraEfectivo } from './CalculadoraEfectivo';

interface ModalArqueoCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (efectivoReal: number, tarjetaReal: number, observaciones: string) => void;
  saldoTeorico: number;
}

export function ModalArqueoCaja({ isOpen, onClose, onConfirmar, saldoTeorico }: ModalArqueoCajaProps) {
  const [efectivoReal, setEfectivoReal] = useState('');
  const [tarjetaReal, setTarjetaReal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [showCalculadora, setShowCalculadora] = useState(false);

  const calcularDiferencia = () => {
    const efectivo = parseFloat(efectivoReal) || 0;
    const tarjeta = parseFloat(tarjetaReal) || 0;
    const totalReal = efectivo + tarjeta;
    return totalReal - saldoTeorico;
  };

  const handleConfirmar = () => {
    const efectivo = parseFloat(efectivoReal);
    const tarjeta = parseFloat(tarjetaReal);
    
    if (isNaN(efectivo) || efectivo < 0) {
      toast.error('Ingresa un importe válido para efectivo');
      return;
    }

    if (isNaN(tarjeta) || tarjeta < 0) {
      toast.error('Ingresa un importe válido para tarjeta');
      return;
    }

    onConfirmar(efectivo, tarjeta, observaciones);
    resetear();
  };

  const resetear = () => {
    setEfectivoReal('');
    setTarjetaReal('');
    setObservaciones('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  const diferencia = calcularDiferencia();
  const hayDiferencia = Math.abs(diferencia) > 0.01;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Calculator className="w-5 h-5 text-blue-600" />
            Arqueo de Caja
          </DialogTitle>
          <DialogDescription>
            Cuenta el efectivo y tarjeta real en caja
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Saldo teórico */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 mb-2">Saldo Teórico Esperado:</p>
            <p className="text-2xl text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {saldoTeorico.toFixed(2)}€
            </p>
          </div>

          {/* Efectivo real */}
          <div className="space-y-2">
            <Label htmlFor="efectivo-real">Efectivo Real en Caja (€)</Label>
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
                id="efectivo-real"
                type="number"
                step="0.01"
                value={efectivoReal}
                onChange={(e) => setEfectivoReal(e.target.value)}
                placeholder="Ej: 450.50"
                className="flex-1"
                autoFocus
              />
            </div>
          </div>

          {/* Tarjeta real */}
          <div className="space-y-2">
            <Label htmlFor="tarjeta-real">Total Tarjeta Real (€)</Label>
            <Input
              id="tarjeta-real"
              type="number"
              step="0.01"
              value={tarjetaReal}
              onChange={(e) => setTarjetaReal(e.target.value)}
              placeholder="Ej: 125.00"
              className="text-lg"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Arqueo de medio turno"
              rows={2}
            />
          </div>

          {/* Diferencia */}
          {efectivoReal && tarjetaReal && (
            <div className={`border-2 rounded-lg p-4 ${
              hayDiferencia 
                ? diferencia > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {hayDiferencia && <AlertCircle className="w-4 h-4 text-orange-600" />}
                <p className="text-sm font-medium">
                  {hayDiferencia ? 'Diferencia Detectada' : 'Sin Diferencia'}
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Real:</span>
                  <span className="font-medium">
                    {((parseFloat(efectivoReal) || 0) + (parseFloat(tarjetaReal) || 0)).toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Teórico:</span>
                  <span className="font-medium">{saldoTeorico.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Diferencia:</span>
                  <span className={`text-lg font-medium ${
                    diferencia > 0 ? 'text-green-700' : diferencia < 0 ? 'text-red-700' : 'text-gray-700'
                  }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)}€
                  </span>
                </div>
              </div>
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
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            disabled={!efectivoReal || !tarjetaReal}
          >
            <Check className="w-4 h-4" />
            Confirmar Arqueo
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Calculadora de efectivo */}
      <CalculadoraEfectivo
        isOpen={showCalculadora}
        onClose={() => setShowCalculadora(false)}
        onConfirmar={(total) => {
          setEfectivoReal(total.toFixed(2));
          setShowCalculadora(false);
        }}
        titulo="Calcular Efectivo Real"
      />
    </Dialog>
  );
}
