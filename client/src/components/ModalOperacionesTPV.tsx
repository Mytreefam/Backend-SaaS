import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { 
  Unlock, 
  Lock, 
  Calculator, 
  TrendingDown, 
  Coffee, 
  RotateCcw 
} from 'lucide-react';

interface ModalOperacionesTPVProps {
  isOpen: boolean;
  onClose: () => void;
  onSeleccionarOperacion: (operacion: 'apertura' | 'cierre' | 'arqueo' | 'retirada' | 'consumo_propio' | 'devolucion') => void;
  turnoAbierto: boolean;
  permisos: {
    hacer_retiradas: boolean;
    arqueo_caja: boolean;
    cierre_caja: boolean;
  };
}

export function ModalOperacionesTPV({ 
  isOpen, 
  onClose, 
  onSeleccionarOperacion,
  turnoAbierto,
  permisos
}: ModalOperacionesTPVProps) {

  const operaciones = [
    {
      id: 'apertura',
      label: 'Apertura',
      icon: Unlock,
      color: 'green',
      descripcion: 'Abrir caja con monto inicial',
      disabled: turnoAbierto,
      permiso: true
    },
    {
      id: 'arqueo',
      label: 'Arqueo',
      icon: Calculator,
      color: 'blue',
      descripcion: 'Contar efectivo en caja',
      disabled: !turnoAbierto,
      permiso: permisos.arqueo_caja
    },
    {
      id: 'cierre',
      label: 'Cierre',
      icon: Lock,
      color: 'red',
      descripcion: 'Cerrar caja y finalizar turno',
      disabled: !turnoAbierto,
      permiso: permisos.cierre_caja
    },
    {
      id: 'retirada',
      label: 'Retiradas',
      icon: TrendingDown,
      color: 'orange',
      descripcion: 'Retirar efectivo de caja',
      disabled: !turnoAbierto,
      permiso: permisos.hacer_retiradas
    },
    {
      id: 'consumo_propio',
      label: 'Consumo Propio',
      icon: Coffee,
      color: 'purple',
      descripcion: 'Registrar consumo del personal',
      disabled: !turnoAbierto,
      permiso: true
    },
    {
      id: 'devolucion',
      label: 'Devoluciones',
      icon: RotateCcw,
      color: 'yellow',
      descripcion: 'Registrar devolución a cliente',
      disabled: !turnoAbierto,
      permiso: true
    }
  ];

  const getColorClasses = (color: string, disabled: boolean, noPermiso: boolean) => {
    if (disabled || noPermiso) {
      return 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed';
    }
    
    switch (color) {
      case 'green':
        return 'border-green-500 bg-green-50 hover:bg-green-100 hover:border-green-600 hover:shadow-lg';
      case 'red':
        return 'border-red-500 bg-red-50 hover:bg-red-100 hover:border-red-600 hover:shadow-lg';
      case 'blue':
        return 'border-blue-500 bg-blue-50 hover:bg-blue-100 hover:border-blue-600 hover:shadow-lg';
      case 'orange':
        return 'border-orange-500 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 hover:shadow-lg';
      case 'purple':
        return 'border-purple-500 bg-purple-50 hover:bg-purple-100 hover:border-purple-600 hover:shadow-lg';
      case 'yellow':
        return 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-600 hover:shadow-lg';
      default:
        return 'border-gray-300 bg-white hover:bg-gray-50';
    }
  };

  const getIconColorClass = (color: string, disabled: boolean, noPermiso: boolean) => {
    if (disabled || noPermiso) return 'text-gray-400';
    
    switch (color) {
      case 'green': return 'text-green-600';
      case 'red': return 'text-red-600';
      case 'blue': return 'text-blue-600';
      case 'orange': return 'text-orange-600';
      case 'purple': return 'text-purple-600';
      case 'yellow': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Operaciones de Caja
          </DialogTitle>
          <DialogDescription>
            Selecciona la operación que deseas realizar
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Estado de la caja */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            turnoAbierto 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              {turnoAbierto ? (
                <Unlock className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Estado de Caja: {turnoAbierto ? 'Abierta' : 'Cerrada'}
                </p>
                <p className="text-sm text-gray-600">
                  {turnoAbierto 
                    ? 'Puedes realizar operaciones de caja' 
                    : 'Debes abrir la caja para operar'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Grid de operaciones */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {operaciones.map((op) => {
              const Icon = op.icon;
              const noPermiso = !op.permiso;
              const isDisabled = op.disabled || noPermiso;
              
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    if (!isDisabled) {
                      onSeleccionarOperacion(op.id as any);
                      onClose();
                    }
                  }}
                  disabled={isDisabled}
                  className={`p-6 border-2 rounded-xl transition-all ${getColorClasses(op.color, op.disabled, noPermiso)}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isDisabled ? 'bg-gray-200' : `bg-${op.color}-100`
                    }`}>
                      <Icon className={`w-7 h-7 ${getIconColorClass(op.color, op.disabled, noPermiso)}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {op.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        {op.descripcion}
                      </p>
                      {noPermiso && (
                        <p className="text-xs text-red-600 mt-1">
                          Sin permisos
                        </p>
                      )}
                      {op.disabled && !noPermiso && (
                        <p className="text-xs text-gray-500 mt-1">
                          {turnoAbierto ? 'Caja abierta' : 'Caja cerrada'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}