import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';
import { 
  CalendarIcon, 
  Upload, 
  AlertCircle, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface NuevaCitaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vehiculos: Array<{ id: string; nombre: string; activo: boolean }>;
  onCitaCreada?: () => void;
  onVerTodasCitas?: () => void;
}

export function NuevaCitaModal({ 
  isOpen, 
  onOpenChange, 
  vehiculos,
  onCitaCreada,
  onVerTodasCitas
}: NuevaCitaModalProps) {
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState<Date>();
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<string>('');
  const [tipoServicio, setTipoServicio] = useState<string>('');
  const [franja, setFranja] = useState<string>('');
  const [taller, setTaller] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [imagenes, setImagenes] = useState<FileList | null>(null);

  // Preseleccionar vehículo activo al abrir
  useState(() => {
    const vehiculoActivo = vehiculos.find(v => v.activo);
    if (vehiculoActivo && !vehiculoSeleccionado) {
      setVehiculoSeleccionado(vehiculoActivo.id);
    }
  });

  const handleConfirmar = async () => {
    if (!vehiculoSeleccionado || !tipoServicio || !fecha || !franja || !taller) {
      toast.error('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    
    // Simular llamada a API
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
      toast.success(
        <div className="flex items-center gap-2">
          <span>Cita creada correctamente</span>
          <button 
            onClick={() => toast.info('Ver cita')}
            className="underline flex items-center gap-1"
          >
            Ver cita <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      );
      onCitaCreada?.();
      
      // Reset form
      setVehiculoSeleccionado('');
      setTipoServicio('');
      setFecha(undefined);
      setFranja('');
      setTaller('');
      setNotas('');
      setImagenes(null);
    }, 1500);
  };

  const handleVerTodasCitas = () => {
    onOpenChange(false);
    toast.info('Navegando a sección de citas...');
    onVerTodasCitas?.();
  };

  const hayVehiculos = vehiculos.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
            Reserva tu próxima visita
          </DialogTitle>
          <DialogDescription>
            Completa los datos para agendar tu cita en el taller
          </DialogDescription>
        </DialogHeader>

        {!hayVehiculos && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-orange-900 mb-1">Añade un vehículo para continuar</p>
              <p className="text-sm text-orange-700">
                Necesitas registrar al menos un vehículo antes de agendar una cita
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Vehículo */}
          <div>
            <Label htmlFor="vehiculo" className="required">
              Vehículo *
            </Label>
            <Select 
              value={vehiculoSeleccionado} 
              onValueChange={setVehiculoSeleccionado}
              disabled={!hayVehiculos}
            >
              <SelectTrigger id="vehiculo" className="min-h-[44px]">
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.nombre} {vehiculo.activo && '(Activo)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Servicio */}
          <div>
            <Label htmlFor="servicio" className="required">
              Tipo de servicio *
            </Label>
            <Select value={tipoServicio} onValueChange={setTipoServicio}>
              <SelectTrigger id="servicio" className="min-h-[44px]">
                <SelectValue placeholder="Selecciona el tipo de servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revision">Revisión periódica</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento general</SelectItem>
                <SelectItem value="reparacion">Reparación</SelectItem>
                <SelectItem value="neumaticos">Cambio de neumáticos</SelectItem>
                <SelectItem value="diagnostico">Diagnóstico electrónico</SelectItem>
                <SelectItem value="otro">Otro servicio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div>
            <Label className="required">Fecha *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left min-h-[44px]",
                    !fecha && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fecha ? format(fecha, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={setFecha}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Franja Horaria */}
          <div>
            <Label htmlFor="franja" className="required">
              Franja horaria *
            </Label>
            <Select value={franja} onValueChange={setFranja}>
              <SelectTrigger id="franja" className="min-h-[44px]">
                <SelectValue placeholder="Selecciona la franja horaria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00-11:00">09:00 - 11:00</SelectItem>
                <SelectItem value="11:00-13:00">11:00 - 13:00</SelectItem>
                <SelectItem value="13:00-15:00">13:00 - 15:00</SelectItem>
                <SelectItem value="15:00-17:00">15:00 - 17:00</SelectItem>
                <SelectItem value="17:00-19:00">17:00 - 19:00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Taller Preferido */}
          <div>
            <Label htmlFor="taller" className="required">
              Taller preferido *
            </Label>
            <Select value={taller} onValueChange={setTaller}>
              <SelectTrigger id="taller" className="min-h-[44px]">
                <SelectValue placeholder="Selecciona el taller" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principal">Taller 360 - Sede Principal</SelectItem>
                <SelectItem value="zona-norte">Taller 360 - Zona Norte</SelectItem>
                <SelectItem value="zona-sur">Taller 360 - Zona Sur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notas">Notas adicionales (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Describe cualquier detalle relevante sobre tu vehículo o el servicio..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Adjuntar Fotos */}
          <div>
            <Label htmlFor="fotos">Adjuntar fotos (opcional)</Label>
            <div className="mt-2">
              <label 
                htmlFor="fotos"
                className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors min-h-[44px]"
              >
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {imagenes && imagenes.length > 0 
                    ? `${imagenes.length} archivo(s) seleccionado(s)` 
                    : 'Haz clic para subir fotos'}
                </span>
              </label>
              <input
                id="fotos"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => setImagenes(e.target.files)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleVerTodasCitas}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Ver todas las citas
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={loading || !hayVehiculos}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 min-h-[44px]"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar cita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}