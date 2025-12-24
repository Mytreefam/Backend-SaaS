import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Unlock, Check, X, Calculator } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CalculadoraEfectivo } from './CalculadoraEfectivo';

interface ModalAperturaCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (importeInicial: number, observaciones: string) => void;
}

export function ModalAperturaCaja({ isOpen, onClose, onConfirmar }: ModalAperturaCajaProps) {
  const [importeInicial, setImporteInicial] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [showCalculadora, setShowCalculadora] = useState(false);

  const handleConfirmar = () => {
    const importe = parseFloat(importeInicial);
    
    if (!importe || importe < 0) {
      toast.error('Ingresa un importe válido para la apertura');
      return;
    }

    onConfirmar(importe, observaciones);
    resetear();
  };

  const resetear = () => {
    setImporteInicial('');
    setObservaciones('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Unlock className="w-5 h-5 text-green-600" />
            Apertura de Caja
          </DialogTitle>
          <DialogDescription>
            Registra el monto inicial de efectivo para iniciar el turno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Importe inicial */}
          <div className="space-y-2">
            <Label htmlFor="importe-inicial">Importe Inicial en Efectivo (€)</Label>
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
                id="importe-inicial"
                type="number"
                step="0.01"
                value={importeInicial}
                onChange={(e) => setImporteInicial(e.target.value)}
                placeholder="Ej: 200.00"
                className="flex-1"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-600">
              Introduce el efectivo que colocas en la caja al inicio del turno
            </p>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Apertura turno mañana"
              rows={3}
            />
          </div>

          {/* Vista previa */}
          {importeInicial && parseFloat(importeInicial) > 0 && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-2">Vista previa:</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Saldo inicial:</span>
                <span className="text-2xl text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {parseFloat(importeInicial).toFixed(2)}€
                </span>
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
            className="bg-green-600 hover:bg-green-700 gap-2"
            disabled={!importeInicial || parseFloat(importeInicial) < 0}
          >
            <Check className="w-4 h-4" />
            Abrir Caja
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Calculadora de efectivo */}
      <CalculadoraEfectivo
        isOpen={showCalculadora}
        onClose={() => setShowCalculadora(false)}
        onConfirmar={(total) => {
          setImporteInicial(total.toFixed(2));
          setShowCalculadora(false);
        }}
        titulo="Calcular Importe Inicial"
      />
    </Dialog>
  );
}
