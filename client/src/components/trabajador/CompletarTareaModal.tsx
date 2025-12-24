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
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  CheckCircle2, 
  Package, 
  FileText,
  Camera,
  Clock
} from 'lucide-react';
import { AñadirMaterialModal } from './AñadirMaterialModal';
import { toast } from 'sonner@2.0.3';

interface Tarea {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  tiempo: string;
  ordenTrabajo?: string;
  vehiculo?: string;
}

interface CompletarTareaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTareaCompletada: () => void;
  tarea: Tarea;
}

export function CompletarTareaModal({ 
  isOpen, 
  onOpenChange, 
  onTareaCompletada,
  tarea
}: CompletarTareaModalProps) {
  const [paso, setPaso] = useState(1);
  const [materialesRegistrados, setMaterialesRegistrados] = useState<any[]>([]);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [notas, setNotas] = useState('');
  const [fotos, setFotos] = useState<File[]>([]);

  const totalPasos = 3;
  const progreso = (paso / totalPasos) * 100;

  const handleMaterialRegistrado = (material: any) => {
    setMaterialesRegistrados([...materialesRegistrados, material]);
    toast.success('Material registrado');
  };

  const handleSiguiente = () => {
    if (paso < totalPasos) {
      setPaso(paso + 1);
    }
  };

  const handleAnterior = () => {
    if (paso > 1) {
      setPaso(paso - 1);
    }
  };

  const handleSaltarMaterial = () => {
    setPaso(2); // Ir al siguiente paso
  };

  const handleCompletar = () => {
    toast.success('Tarea completada correctamente');
    onTareaCompletada();
    onOpenChange(false);
    
    // Reset
    setPaso(1);
    setMaterialesRegistrados([]);
    setNotas('');
    setFotos([]);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos([...fotos, ...Array.from(e.target.files)]);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Completar tarea
                </DialogTitle>
                <DialogDescription className="text-left">
                  {tarea.titulo}
                </DialogDescription>
              </div>
            </div>

            {/* Indicador de progreso */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Paso {paso} de {totalPasos}</span>
                <span className="text-teal-600 font-medium">{Math.round(progreso)}%</span>
              </div>
              <Progress value={progreso} className="h-2" />
            </div>
          </DialogHeader>

          <div className="py-6">
            {/* Paso 1: Material utilizado */}
            {paso === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Material utilizado
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Registra el material que has utilizado en esta tarea. Puedes añadir varios materiales o saltar este paso.
                </p>

                {/* Lista de materiales registrados */}
                {materialesRegistrados.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <Label>Materiales registrados ({materialesRegistrados.length})</Label>
                    {materialesRegistrados.map((mat, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-green-900">{mat.material}</p>
                          <p className="text-xs text-green-700">
                            Cantidad: {mat.cantidad} · Código: {mat.codigo}
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón añadir material */}
                <Button
                  onClick={() => setMaterialModalOpen(true)}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Package className="w-4 h-4 mr-2" />
                  {materialesRegistrados.length > 0 ? 'Añadir otro material' : 'Añadir material'}
                </Button>
              </div>
            )}

            {/* Paso 2: Notas y observaciones */}
            {paso === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Notas y observaciones
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Añade notas sobre el trabajo realizado</Label>
                  <Textarea
                    id="notas"
                    placeholder="Describe el trabajo realizado, problemas encontrados, recomendaciones..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-gray-500">
                    Estas notas aparecerán en el historial del vehículo y en el informe para el cliente.
                  </p>
                </div>
              </div>
            )}

            {/* Paso 3: Fotos (opcional) */}
            {paso === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Fotos del trabajo (opcional)
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fotos">Adjunta fotos del trabajo realizado</Label>
                  <Input
                    id="fotos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFotoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">
                    Las fotos ayudan a documentar el trabajo y generar confianza con el cliente.
                  </p>
                </div>

                {fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {fotos.map((foto, idx) => (
                      <div 
                        key={idx}
                        className="aspect-square rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center"
                      >
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resumen final */}
            {paso === totalPasos && (
              <div className="mt-6 p-4 rounded-lg bg-teal-50 border border-teal-200">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-teal-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teal-900 mb-1">
                      Tiempo estimado: {tarea.tiempo}
                    </p>
                    <p className="text-xs text-teal-700">
                      Materiales: {materialesRegistrados.length} items · 
                      Notas: {notas ? 'Sí' : 'No'} · 
                      Fotos: {fotos.length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {paso === 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaltarMaterial}
                  className="w-full sm:w-auto"
                >
                  Saltar
                </Button>
                <Button
                  onClick={handleSiguiente}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
                >
                  Siguiente
                </Button>
              </>
            ) : paso < totalPasos ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleAnterior}
                  className="w-full sm:w-auto"
                >
                  Anterior
                </Button>
                <Button
                  onClick={handleSiguiente}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
                >
                  Siguiente
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleAnterior}
                  className="w-full sm:w-auto"
                >
                  Anterior
                </Button>
                <Button
                  onClick={handleCompletar}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completar tarea
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de añadir material */}
      <AñadirMaterialModal
        isOpen={materialModalOpen}
        onOpenChange={setMaterialModalOpen}
        onMaterialRegistrado={handleMaterialRegistrado}
        tareaId={tarea.id.toString()}
        vehiculo={tarea.vehiculo}
        ordenTrabajo={tarea.ordenTrabajo}
      />
    </>
  );
}