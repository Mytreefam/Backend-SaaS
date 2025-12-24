import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Plus, Minus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EstadoTPVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCerrarTPV: () => void;
}

export function EstadoTPVModal({ isOpen, onClose, onCerrarTPV }: EstadoTPVModalProps) {
  const [operacion, setOperacion] = useState<string>('Apertura');
  const [cantidades, setCantidades] = useState<Record<string, number>>({
    '0.01': 0,
    '0.02': 0,
    '0.05': 0,
    '0.10': 0,
    '0.20': 0,
    '0.50': 0,
    '1': 0,
    '2': 0,
    '5': 0,
    '10': 0,
    '20': 0,
    '50': 0,
    '100': 0,
    '200': 0,
    '500': 0
  });

  const modificarCantidad = (denominacion: string, incremento: number) => {
    setCantidades(prev => ({
      ...prev,
      [denominacion]: Math.max(0, prev[denominacion] + incremento)
    }));
  };

  const calcularTotal = () => {
    return Object.entries(cantidades).reduce((total, [denom, cant]) => {
      return total + (parseFloat(denom) * cant);
    }, 0);
  };

  const confirmarOperacion = () => {
    if (operacion === 'Cierre') {
      onCerrarTPV();
      toast.success('TPV cerrado correctamente');
    } else if (operacion === 'Apertura') {
      toast.success('Apertura registrada correctamente');
    } else if (operacion === 'Arqueo') {
      toast.success('Arqueo registrado correctamente');
    } else if (operacion === 'Consumo Propio') {
      toast.success('Consumo propio registrado');
    } else if (operacion === 'Retiradas') {
      toast.success('Retirada registrada correctamente');
    } else if (operacion === 'Devoluciones') {
      toast.success('Devolución registrada correctamente');
    }
    
    // Resetear cantidades
    setCantidades({
      '0.01': 0,
      '0.02': 0,
      '0.05': 0,
      '0.10': 0,
      '0.20': 0,
      '0.50': 0,
      '1': 0,
      '2': 0,
      '5': 0,
      '10': 0,
      '20': 0,
      '50': 0,
      '100': 0,
      '200': 0,
      '500': 0
    });
    
    onClose();
  };

  const denominacionesMonedas = [
    { valor: '0.01', label: '0.01€' },
    { valor: '0.02', label: '0.02€' },
    { valor: '0.05', label: '0.05€' },
    { valor: '0.10', label: '0.10€' },
    { valor: '0.20', label: '0.20€' },
    { valor: '0.50', label: '0.50€' },
    { valor: '1', label: '1€' },
    { valor: '2', label: '2€' }
  ];

  const denominacionesBilletes = [
    { valor: '5', label: '5€' },
    { valor: '10', label: '10€' },
    { valor: '20', label: '20€' },
    { valor: '50', label: '50€' },
    { valor: '100', label: '100€' },
    { valor: '200', label: '200€' },
    { valor: '500', label: '500€' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Estado TPV
          </DialogTitle>
          <DialogDescription>
            Gestiona las operaciones de caja del terminal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selector de Operación */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Operación</label>
            <Select value={operacion} onValueChange={setOperacion}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apertura">Apertura</SelectItem>
                <SelectItem value="Cierre">Cierre</SelectItem>
                <SelectItem value="Arqueo">Arqueo</SelectItem>
                <SelectItem value="Consumo Propio">Consumo Propio</SelectItem>
                <SelectItem value="Retiradas">Retiradas</SelectItem>
                <SelectItem value="Devoluciones">Devoluciones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contador de Efectivo (solo para Apertura, Cierre, Arqueo, Retiradas y Devoluciones) */}
          {(operacion === 'Apertura' || operacion === 'Cierre' || operacion === 'Arqueo' || operacion === 'Retiradas' || operacion === 'Devoluciones') && (
            <div className="space-y-4">
              {/* Monedas */}
              <div>
                <h3 className="font-medium mb-3">Monedas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {denominacionesMonedas.map((denom) => (
                    <div key={denom.valor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{denom.label}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => modificarCantidad(denom.valor, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {cantidades[denom.valor]}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => modificarCantidad(denom.valor, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <span className="w-20 text-right text-sm text-gray-600">
                          {(parseFloat(denom.valor) * cantidades[denom.valor]).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Billetes */}
              <div>
                <h3 className="font-medium mb-3">Billetes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {denominacionesBilletes.map((denom) => (
                    <div key={denom.valor} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{denom.label}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => modificarCantidad(denom.valor, -1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">
                          {cantidades[denom.valor]}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => modificarCantidad(denom.valor, 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <span className="w-20 text-right text-sm text-gray-600">
                          {(parseFloat(denom.valor) * cantidades[denom.valor]).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Total Efectivo</span>
                  <span className="text-2xl font-bold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {calcularTotal().toFixed(2)}€
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje para Consumo Propio */}
          {operacion === 'Consumo Propio' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Registra consumo de productos del establecimiento para uso interno
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={confirmarOperacion}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {operacion === 'Apertura' ? 'Confirmar Apertura' :
             operacion === 'Cierre' ? 'Cerrar y Finalizar' :
             operacion === 'Arqueo' ? 'Registrar Arqueo' :
             operacion === 'Consumo Propio' ? 'Registrar Consumo' :
             operacion === 'Devoluciones' ? 'Registrar Devolución' :
             'Registrar Retirada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}