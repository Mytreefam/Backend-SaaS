import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { CreditCard, Banknote, Calculator, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ModalPagoMixtoProps {
  total: number;
  onClose: () => void;
  onConfirmar: (metodo1: string, monto1: number, metodo2: string, monto2: number) => void;
}

export function ModalPagoMixto({ total, onClose, onConfirmar }: ModalPagoMixtoProps) {
  const [metodo1, setMetodo1] = useState<'efectivo' | 'tarjeta'>('efectivo');
  const [monto1, setMonto1] = useState('');
  const [metodo2, setMetodo2] = useState<'efectivo' | 'tarjeta'>('tarjeta');
  const [monto2, setMonto2] = useState('');

  // Calcular automáticamente el monto2 cuando cambia monto1
  useEffect(() => {
    if (monto1) {
      const valor1 = parseFloat(monto1) || 0;
      const valor2 = Math.max(0, total - valor1);
      setMonto2(valor2.toFixed(2));
    } else {
      setMonto2('');
    }
  }, [monto1, total]);

  const validarYConfirmar = () => {
    const valor1 = parseFloat(monto1) || 0;
    const valor2 = parseFloat(monto2) || 0;
    const suma = valor1 + valor2;

    if (valor1 <= 0) {
      toast.error('El primer monto debe ser mayor a 0');
      return;
    }

    if (Math.abs(suma - total) > 0.01) {
      toast.error(`La suma debe ser ${total.toFixed(2)}€`);
      return;
    }

    if (metodo1 === metodo2) {
      toast.error('Los métodos de pago deben ser diferentes');
      return;
    }

    onConfirmar(metodo1, valor1, metodo2, valor2);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto" onEscapeKeyDown={onClose} onPointerDownOutside={onClose}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Pago Mixto
          </DialogTitle>
          <DialogDescription>
            Divide el pago entre dos métodos diferentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Total del pedido */}
          <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total del Pedido:</span>
              <span className="text-2xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {total.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Dos columnas para los métodos */}
          <div className="grid grid-cols-2 gap-4">
            {/* Método 1 */}
            <div className="space-y-3 p-4 border-2 rounded-lg bg-gray-50">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Método 1
              </Label>
              
              <Select value={metodo1} onValueChange={(v) => setMetodo1(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="tarjeta">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Tarjeta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Importe</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={monto1}
                  onChange={(e) => setMonto1(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>
            </div>

            {/* Método 2 */}
            <div className="space-y-3 p-4 border-2 rounded-lg bg-gray-50">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Método 2
              </Label>
              
              <Select value={metodo2} onValueChange={(v) => setMetodo2(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="tarjeta">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Tarjeta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Importe (auto)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={monto2}
                  onChange={(e) => setMonto2(e.target.value)}
                  className="text-lg font-medium bg-blue-50"
                />
              </div>
            </div>
          </div>

          {/* Validación visual */}
          {monto1 && monto2 && (
            <div className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
              Math.abs((parseFloat(monto1) + parseFloat(monto2)) - total) <= 0.01
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-red-50 border-red-300 text-red-700'
            }`}>
              {Math.abs((parseFloat(monto1) + parseFloat(monto2)) - total) <= 0.01 ? (
                <>
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white">
                    ✓
                  </div>
                  <span className="text-sm font-medium">
                    Suma correcta: {(parseFloat(monto1) + parseFloat(monto2)).toFixed(2)}€
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium">
                    Suma incorrecta: {(parseFloat(monto1) + parseFloat(monto2)).toFixed(2)}€ 
                    (Debe ser {total.toFixed(2)}€)
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={validarYConfirmar}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirmar Pago Mixto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
