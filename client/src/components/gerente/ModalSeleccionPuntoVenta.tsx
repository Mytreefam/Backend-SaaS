import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Store, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

interface PuntoVentaOption {
  id: string;
  nombre: string;
  marca: string;
  direccion?: string;
}

interface ModalSeleccionPuntoVentaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmar: (puntoVentaId: string, recordar: boolean) => void;
  terminalId: string;
  puntosVentaDisponibles: PuntoVentaOption[];
}

const STORAGE_KEY_PREFIX = 'tpv_punto_venta_preferido_';

export function ModalSeleccionPuntoVenta({ 
  open, 
  onOpenChange, 
  onConfirmar,
  terminalId,
  puntosVentaDisponibles 
}: ModalSeleccionPuntoVentaProps) {
  const [puntoVentaSeleccionado, setPuntoVentaSeleccionado] = useState<string>('');
  const [recordarSeleccion, setRecordarSeleccion] = useState<boolean>(false);

  // Cargar preferencia guardada al abrir el modal
  useEffect(() => {
    if (open && terminalId) {
      const preferencia = localStorage.getItem(`${STORAGE_KEY_PREFIX}${terminalId}`);
      if (preferencia) {
        const { puntoVentaId } = JSON.parse(preferencia);
        // Verificar que el punto de venta guardado todavía está disponible
        if (puntosVentaDisponibles.some(pv => pv.id === puntoVentaId)) {
          setPuntoVentaSeleccionado(puntoVentaId);
          setRecordarSeleccion(true);
        }
      }
    }
  }, [open, terminalId, puntosVentaDisponibles]);

  const handleConfirmar = () => {
    if (puntoVentaSeleccionado) {
      onConfirmar(puntoVentaSeleccionado, recordarSeleccion);
      onOpenChange(false);
    }
  };

  const handleCancelar = () => {
    onOpenChange(false);
    setPuntoVentaSeleccionado('');
    setRecordarSeleccion(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Store className="h-6 w-6 text-primary" />
            Selección de Punto de Venta
          </DialogTitle>
          <DialogDescription>
            Este terminal puede operar con múltiples puntos de venta. Selecciona con cuál quieres trabajar ahora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Lista de puntos de venta disponibles */}
          <div className="space-y-3">
            <Label className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              Puntos de Venta Disponibles
            </Label>
            <RadioGroup value={puntoVentaSeleccionado} onValueChange={setPuntoVentaSeleccionado}>
              <div className="grid grid-cols-1 gap-3">
                {puntosVentaDisponibles.map((pv) => (
                  <Card
                    key={pv.id}
                    className={`cursor-pointer transition-all ${
                      puntoVentaSeleccionado === pv.id
                        ? 'ring-2 ring-primary border-primary bg-teal-50/50'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setPuntoVentaSeleccionado(pv.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value={pv.id} id={pv.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <Label htmlFor={pv.id} className="cursor-pointer font-medium flex items-center gap-2">
                                {pv.nombre}
                                {puntoVentaSeleccionado === pv.id && (
                                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                )}
                              </Label>
                              {pv.direccion && (
                                <p className="text-sm text-gray-600 mt-1">{pv.direccion}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs bg-white">
                              {pv.marca}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Opción de recordar selección */}
          {puntoVentaSeleccionado && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-in slide-in-from-bottom-2 duration-300">
              <Checkbox
                id="recordar"
                checked={recordarSeleccion}
                onCheckedChange={(checked) => setRecordarSeleccion(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="recordar"
                  className="cursor-pointer font-medium text-sm"
                >
                  Recordar mi selección para este terminal
                </Label>
                <p className="text-xs text-gray-600 mt-1">
                  No volveré a preguntar cuando uses este terminal. Podrás cambiar el punto de venta en cualquier momento desde el TPV.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancelar}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!puntoVentaSeleccionado}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook para gestionar la preferencia de punto de venta
export function usePuntoVentaPreferido(terminalId: string) {
  const getPreferencia = (): string | null => {
    if (!terminalId) return null;
    const preferencia = localStorage.getItem(`${STORAGE_KEY_PREFIX}${terminalId}`);
    if (!preferencia) return null;
    try {
      const { puntoVentaId } = JSON.parse(preferencia);
      return puntoVentaId;
    } catch {
      return null;
    }
  };

  const guardarPreferencia = (puntoVentaId: string) => {
    if (!terminalId) return;
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${terminalId}`,
      JSON.stringify({ puntoVentaId, timestamp: Date.now() })
    );
  };

  const eliminarPreferencia = () => {
    if (!terminalId) return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${terminalId}`);
  };

  return {
    getPreferencia,
    guardarPreferencia,
    eliminarPreferencia,
  };
}
