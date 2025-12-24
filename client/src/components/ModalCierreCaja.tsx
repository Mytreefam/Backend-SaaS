import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Lock, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ModalCierreCajaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (efectivoFinal: number, tarjetaFinal: number, observaciones: string) => void;
  saldoTeorico: number;
  importeApertura: number;
}

export function ModalCierreCaja({ 
  isOpen, 
  onClose, 
  onConfirmar, 
  saldoTeorico,
  importeApertura 
}: ModalCierreCajaProps) {
  const [efectivoFinal, setEfectivoFinal] = useState('');
  const [tarjetaFinal, setTarjetaFinal] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const calcularDiferencia = () => {
    const efectivo = parseFloat(efectivoFinal) || 0;
    const tarjeta = parseFloat(tarjetaFinal) || 0;
    const totalReal = efectivo + tarjeta;
    return totalReal - saldoTeorico;
  };

  const calcularVentasDelTurno = () => {
    return saldoTeorico - importeApertura;
  };

  const handleConfirmar = () => {
    const efectivo = parseFloat(efectivoFinal);
    const tarjeta = parseFloat(tarjetaFinal);
    
    if (isNaN(efectivo) || efectivo < 0) {
      toast.error('Ingresa un importe válido para efectivo');
      return;
    }

    if (isNaN(tarjeta) || tarjeta < 0) {
      toast.error('Ingresa un importe válido para tarjeta');
      return;
    }

    const diferencia = calcularDiferencia();
    if (Math.abs(diferencia) > 50) {
      if (!confirm(`¡ATENCIÓN! Hay una diferencia de ${diferencia.toFixed(2)}€. ¿Deseas continuar con el cierre?`)) {
        return;
      }
    }

    onConfirmar(efectivo, tarjeta, observaciones);
    resetear();
  };

  const resetear = () => {
    setEfectivoFinal('');
    setTarjetaFinal('');
    setObservaciones('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  const diferencia = calcularDiferencia();
  const ventasDelTurno = calcularVentasDelTurno();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Lock className="w-5 h-5 text-red-600" />
            Cierre de Caja
          </DialogTitle>
          <DialogDescription>
            Registra los montos finales y cierra el turno
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumen del turno */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700 mb-1">Apertura</p>
              <p className="text-lg text-blue-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {importeApertura.toFixed(2)}€
              </p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
              <p className="text-xs text-green-700 mb-1">Ventas del Turno</p>
              <p className="text-lg text-green-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {ventasDelTurno.toFixed(2)}€
              </p>
            </div>
          </div>

          {/* Saldo teórico esperado */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">Saldo Teórico Esperado:</p>
            <p className="text-2xl text-gray-800" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {saldoTeorico.toFixed(2)}€
            </p>
          </div>

          {/* Efectivo final */}
          <div className="space-y-2">
            <Label htmlFor="efectivo-final">Efectivo Final en Caja (€)</Label>
            <Input
              id="efectivo-final"
              type="number"
              step="0.01"
              value={efectivoFinal}
              onChange={(e) => setEfectivoFinal(e.target.value)}
              placeholder="Ej: 650.00"
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Tarjeta final */}
          <div className="space-y-2">
            <Label htmlFor="tarjeta-final">Total Tarjeta Final (€)</Label>
            <Input
              id="tarjeta-final"
              type="number"
              step="0.01"
              value={tarjetaFinal}
              onChange={(e) => setTarjetaFinal(e.target.value)}
              placeholder="Ej: 350.00"
              className="text-lg"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones de Cierre (opcional)</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Cierre turno tarde"
              rows={2}
            />
          </div>

          {/* Diferencia final */}
          {efectivoFinal && tarjetaFinal && (
            <div className={`border-2 rounded-lg p-4 ${
              Math.abs(diferencia) < 0.01
                ? 'bg-green-50 border-green-200'
                : diferencia > 0
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {diferencia > 0 ? (
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                ) : diferencia < 0 ? (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                ) : (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                <p className="font-medium">
                  {Math.abs(diferencia) < 0.01 
                    ? 'Caja Cuadrada' 
                    : diferencia > 0 
                      ? 'Sobrante en Caja'
                      : 'Faltante en Caja'
                  }
                </p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Real:</span>
                  <span className="font-medium">
                    {((parseFloat(efectivoFinal) || 0) + (parseFloat(tarjetaFinal) || 0)).toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Teórico:</span>
                  <span className="font-medium">{saldoTeorico.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Diferencia:</span>
                  <span className={`text-xl font-medium ${
                    diferencia > 0 ? 'text-blue-700' : diferencia < 0 ? 'text-red-700' : 'text-green-700'
                  }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {diferencia > 0 ? '+' : ''}{diferencia.toFixed(2)}€
                  </span>
                </div>
              </div>
              {Math.abs(diferencia) > 10 && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs text-orange-700 font-medium">
                    ⚠️ La diferencia es significativa. Revisa el conteo antes de confirmar.
                  </p>
                </div>
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
            className="bg-red-600 hover:bg-red-700 gap-2"
            disabled={!efectivoFinal || !tarjetaFinal}
          >
            <Lock className="w-4 h-4" />
            Cerrar Caja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
