import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calculator, Check, X, RotateCcw } from 'lucide-react';

interface CalculadoraEfectivoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (total: number) => void;
  titulo?: string;
}

interface Denominacion {
  valor: number;
  cantidad: number;
  tipo: 'billete' | 'moneda';
}

export function CalculadoraEfectivo({ isOpen, onClose, onConfirmar, titulo = 'Calculadora de Efectivo' }: CalculadoraEfectivoProps) {
  const [denominaciones, setDenominaciones] = useState<Denominacion[]>([
    // Billetes
    { valor: 500, cantidad: 0, tipo: 'billete' },
    { valor: 200, cantidad: 0, tipo: 'billete' },
    { valor: 100, cantidad: 0, tipo: 'billete' },
    { valor: 50, cantidad: 0, tipo: 'billete' },
    { valor: 20, cantidad: 0, tipo: 'billete' },
    { valor: 10, cantidad: 0, tipo: 'billete' },
    { valor: 5, cantidad: 0, tipo: 'billete' },
    // Monedas
    { valor: 2, cantidad: 0, tipo: 'moneda' },
    { valor: 1, cantidad: 0, tipo: 'moneda' },
    { valor: 0.50, cantidad: 0, tipo: 'moneda' },
    { valor: 0.20, cantidad: 0, tipo: 'moneda' },
    { valor: 0.10, cantidad: 0, tipo: 'moneda' },
    { valor: 0.05, cantidad: 0, tipo: 'moneda' },
    { valor: 0.02, cantidad: 0, tipo: 'moneda' },
    { valor: 0.01, cantidad: 0, tipo: 'moneda' },
  ]);

  const calcularTotal = () => {
    return denominaciones.reduce((total, denom) => {
      return total + (denom.valor * denom.cantidad);
    }, 0);
  };

  const actualizarCantidad = (index: number, cantidad: string) => {
    const cantidadNum = parseInt(cantidad) || 0;
    const nuevasDenominaciones = [...denominaciones];
    nuevasDenominaciones[index].cantidad = cantidadNum >= 0 ? cantidadNum : 0;
    setDenominaciones(nuevasDenominaciones);
  };

  const reiniciar = () => {
    setDenominaciones(denominaciones.map(d => ({ ...d, cantidad: 0 })));
  };

  const handleConfirmar = () => {
    const total = calcularTotal();
    onConfirmar(total);
    reiniciar();
  };

  const handleClose = () => {
    reiniciar();
    onClose();
  };

  const total = calcularTotal();
  const billetes = denominaciones.filter(d => d.tipo === 'billete');
  const monedas = denominaciones.filter(d => d.tipo === 'moneda');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Calculator className="w-5 h-5 text-teal-600" />
            {titulo}
          </DialogTitle>
          <DialogDescription>
            Introduce la cantidad de billetes y monedas para calcular el total
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Total calculado */}
          <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-700">Total Calculado:</span>
              <span className="text-3xl text-teal-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {total.toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Billetes */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              💶 Billetes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {billetes.map((denom, index) => {
                const originalIndex = denominaciones.findIndex(d => d.valor === denom.valor && d.tipo === 'billete');
                return (
                  <div key={`billete-${denom.valor}`} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 w-16">
                        {denom.valor}€
                      </span>
                      <span className="text-xs text-gray-500">×</span>
                      <Input
                        type="number"
                        min="0"
                        value={denom.cantidad || ''}
                        onChange={(e) => actualizarCantidad(originalIndex, e.target.value)}
                        className="h-8 w-20 text-center"
                        placeholder="0"
                      />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-medium text-gray-900">
                        {(denom.valor * denom.cantidad).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monedas */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              🪙 Monedas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {monedas.map((denom, index) => {
                const originalIndex = denominaciones.findIndex(d => d.valor === denom.valor && d.tipo === 'moneda');
                return (
                  <div key={`moneda-${denom.valor}`} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 w-16">
                        {denom.valor.toFixed(2)}€
                      </span>
                      <span className="text-xs text-gray-500">×</span>
                      <Input
                        type="number"
                        min="0"
                        value={denom.cantidad || ''}
                        onChange={(e) => actualizarCantidad(originalIndex, e.target.value)}
                        className="h-8 w-20 text-center"
                        placeholder="0"
                      />
                    </div>
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-medium text-gray-900">
                        {(denom.valor * denom.cantidad).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button 
            variant="outline" 
            onClick={reiniciar} 
            className="gap-2 w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="gap-2 flex-1 sm:flex-initial"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmar}
              className="bg-teal-600 hover:bg-teal-700 gap-2 flex-1 sm:flex-initial"
              disabled={total === 0}
            >
              <Check className="w-4 h-4" />
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
