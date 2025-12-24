/**
 * MODAL CONFIGURACIÓN DE ZONA HORARIA Y VOLCADO DE DATOS
 * 
 * Permite al gerente configurar:
 * - Zona horaria de referencia
 * - Hora de ejecución del volcado automático
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Separator } from '../ui/separator';
import { Clock, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ZONAS_HORARIAS_DISPONIBLES } from '../../config/timezone.config';

interface ModalConfiguracionZonaHorariaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zonaHoraria: string;
  hora: number;
  minuto: number;
  onGuardar: (zonaHoraria: string, hora: number, minuto: number) => void;
}

export function ModalConfiguracionZonaHoraria({
  open,
  onOpenChange,
  zonaHoraria,
  hora,
  minuto,
  onGuardar
}: ModalConfiguracionZonaHorariaProps) {
  const [zonaHorariaTemporal, setZonaHorariaTemporal] = useState(zonaHoraria);
  const [horaTemporal, setHoraTemporal] = useState(hora);
  const [minutoTemporal, setMinutoTemporal] = useState(minuto);

  // Actualizar cuando cambien las props
  useEffect(() => {
    setZonaHorariaTemporal(zonaHoraria);
    setHoraTemporal(hora);
    setMinutoTemporal(minuto);
  }, [zonaHoraria, hora, minuto, open]);

  const handleGuardar = () => {
    onGuardar(zonaHorariaTemporal, horaTemporal, minutoTemporal);
  };

  const horasDisponibles = Array.from({ length: 24 }, (_, i) => i);
  const minutosDisponibles = [0, 15, 30, 45];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            Configurar Volcado Automático de Datos
          </DialogTitle>
          <DialogDescription>
            Configura la zona horaria de referencia y la hora de ejecución del volcado automático diario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información importante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-blue-900">
                <p className="font-semibold mb-2">¿Qué hace el volcado automático?</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Cierra fichajes incompletos automáticamente</li>
                  <li>• Valida fichajes antiguos pendientes</li>
                  <li>• Calcula absentismo de todos los trabajadores</li>
                  <li>• Actualiza distribución de costes por centros de coste</li>
                  <li>• Genera reportes diarios de actividad</li>
                  <li>• Limpia datos antiguos y detecta anomalías</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Zona Horaria de Referencia */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-600" />
              <Label className="font-semibold">Zona Horaria de Referencia</Label>
            </div>
            <p className="text-sm text-gray-600">
              Selecciona la zona horaria principal de tu negocio. El sistema convertirá automáticamente
              esta hora a la zona horaria local de cada usuario.
            </p>
            <Select value={zonaHorariaTemporal} onValueChange={setZonaHorariaTemporal}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una zona horaria" />
              </SelectTrigger>
              <SelectContent>
                {ZONAS_HORARIAS_DISPONIBLES.map((zona) => (
                  <SelectItem key={zona.value} value={zona.value}>
                    {zona.label} ({zona.offset})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Hora de Ejecución */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <Label className="font-semibold">Hora de Ejecución (Zona de Referencia)</Label>
            </div>
            <p className="text-sm text-gray-600">
              Selecciona la hora en la que se ejecutará el volcado automático en la zona horaria de referencia.
              Recomendado: Entre las 2:00 AM y 6:00 AM para minimizar el impacto en el sistema.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Select 
                  value={horaTemporal.toString()} 
                  onValueChange={(value) => setHoraTemporal(parseInt(value))}
                >
                  <SelectTrigger id="hora">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent>
                    {horasDisponibles.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minuto">Minutos</Label>
                <Select 
                  value={minutoTemporal.toString()} 
                  onValueChange={(value) => setMinutoTemporal(parseInt(value))}
                >
                  <SelectTrigger id="minuto">
                    <SelectValue placeholder="Selecciona minutos" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutosDisponibles.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        :{m.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-teal-900 mb-2">Vista Previa</p>
                <div className="space-y-1 text-sm text-teal-800">
                  <p>
                    <span className="font-medium">Zona Horaria:</span>{' '}
                    {ZONAS_HORARIAS_DISPONIBLES.find(z => z.value === zonaHorariaTemporal)?.label || 'No seleccionada'}
                  </p>
                  <p>
                    <span className="font-medium">Hora de Ejecución:</span>{' '}
                    {horaTemporal.toString().padStart(2, '0')}:{minutoTemporal.toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-teal-700 mt-2">
                    ℹ️ Cada usuario verá esta hora convertida a su zona horaria local
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
