import { useState } from 'react';
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
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SubirDocumentoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentoSubido: (documento: any) => void;
  vehiculoId: string;
}

export function SubirDocumentoModal({ 
  isOpen, 
  onOpenChange, 
  onDocumentoSubido,
  vehiculoId 
}: SubirDocumentoModalProps) {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [notas, setNotas] = useState('');
  const [numeroPoliza, setNumeroPoliza] = useState('');
  const [aseguradora, setAseguradora] = useState('');
  const [telefonoAsistencia, setTelefonoAsistencia] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubir = () => {
    if (!tipoDocumento) {
      toast.error('Selecciona el tipo de documento');
      return;
    }

    if (!archivo) {
      toast.error('Selecciona un archivo');
      return;
    }

    // Crear objeto documento
    const documento = {
      id: `DOC-${Date.now()}`,
      tipo: tipoDocumento,
      nombre: archivo.name,
      fechaSubida: new Date().toISOString(),
      fechaCaducidad: fechaCaducidad || null,
      notas,
      numeroPoliza: tipoDocumento === 'seguro' ? numeroPoliza : undefined,
      aseguradora: tipoDocumento === 'seguro' ? aseguradora : undefined,
      telefonoAsistencia: tipoDocumento === 'seguro' ? telefonoAsistencia : undefined,
      fechaDesde: tipoDocumento === 'seguro' ? fechaDesde : undefined,
      vehiculoId,
      archivo: URL.createObjectURL(archivo), // Simulación
    };

    onDocumentoSubido(documento);
    toast.success('Documento subido correctamente');
    
    // Reset form
    setTipoDocumento('');
    setArchivo(null);
    setFechaCaducidad('');
    setNotas('');
    setNumeroPoliza('');
    setAseguradora('');
    setTelefonoAsistencia('');
    setFechaDesde('');
    onOpenChange(false);
  };

  const mostrarCarnetAviso = tipoDocumento === 'carnet';
  const mostrarCamposSeguro = tipoDocumento === 'seguro';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              Añadir documento
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Sube la documentación de tu vehículo de forma segura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de documento *</Label>
            <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permiso">Permiso de circulación</SelectItem>
                <SelectItem value="itv">ITV</SelectItem>
                <SelectItem value="seguro">Seguro</SelectItem>
                <SelectItem value="carnet">Carnet de conducir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Aviso legal carnet */}
          {mostrarCarnetAviso && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm text-gray-700">
                <strong>Aviso:</strong> Una foto del carnet no sustituye al soporte físico ni a la app oficial miDGT. Llévalo siempre cuando conduzcas.
              </AlertDescription>
            </Alert>
          )}

          {/* Campos adicionales para Seguro */}
          {mostrarCamposSeguro && (
            <>
              <div className="space-y-2">
                <Label htmlFor="aseguradora">Aseguradora</Label>
                <Input
                  id="aseguradora"
                  placeholder="Ej: Mapfre, Línea Directa..."
                  value={aseguradora}
                  onChange={(e) => setAseguradora(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poliza">Número de póliza</Label>
                <Input
                  id="poliza"
                  placeholder="Ej: 123456789"
                  value={numeroPoliza}
                  onChange={(e) => setNumeroPoliza(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono de asistencia 24/7</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+34 900 123 456"
                  value={telefonoAsistencia}
                  onChange={(e) => setTelefonoAsistencia(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="desde">Vigencia desde</Label>
                  <Input
                    id="desde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hasta">Vigencia hasta</Label>
                  <Input
                    id="hasta"
                    type="date"
                    value={fechaCaducidad}
                    onChange={(e) => setFechaCaducidad(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Fecha caducidad (para otros documentos) */}
          {tipoDocumento && !mostrarCamposSeguro && (
            <div className="space-y-2">
              <Label htmlFor="caducidad">Fecha de caducidad (opcional)</Label>
              <Input
                id="caducidad"
                type="date"
                value={fechaCaducidad}
                onChange={(e) => setFechaCaducidad(e.target.value)}
              />
            </div>
          )}

          {/* Selector de archivo */}
          <div className="space-y-2">
            <Label htmlFor="archivo">Archivo (PDF, JPG, PNG) *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="archivo"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleArchivoChange}
                className="flex-1"
              />
              {archivo && (
                <div className="flex items-center gap-1 text-sm text-teal-600">
                  <Upload className="w-4 h-4" />
                  <span className="truncate max-w-[120px]">{archivo.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Información adicional..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>

          {/* Info sobre seguridad */}
          <Alert className="border-teal-200 bg-teal-50">
            <AlertDescription className="text-sm text-gray-700">
              🔒 Todos los documentos se cifran en tránsito y en reposo. Solo tú puedes acceder a ellos.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubir}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
