import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Printer, Plus, Trash2, Settings, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Impresora {
  id: string;
  nombre: string;
  activa: boolean;
  categorias: string[];
  ipAddress?: string;
  modelo?: string;
  puntoVentaId: string;
}

interface ConfiguracionImpresorasProps {
  puntoVentaId: string;
}

const CATEGORIAS_DISPONIBLES = [
  'Pizzas',
  'Burguers',
  'Complementos',
  'Bebidas',
  'Postres',
  'Bocadillos',
  'Empanadas',
  'Pan',
  'Bollería',
  'Otros'
];

export function ConfiguracionImpresoras({ puntoVentaId }: ConfiguracionImpresorasProps) {
  const [impresoras, setImpresoras] = useState<Impresora[]>([
    {
      id: 'IMP001',
      nombre: 'Impresora Cocina Principal',
      activa: true,
      categorias: ['Pizzas', 'Burguers', 'Complementos'],
      ipAddress: '192.168.1.100',
      modelo: 'Epson TM-T20III',
      puntoVentaId
    },
    {
      id: 'IMP002',
      nombre: 'Impresora Bebidas',
      activa: true,
      categorias: ['Bebidas', 'Postres'],
      ipAddress: '192.168.1.101',
      modelo: 'Star TSP143III',
      puntoVentaId
    },
    {
      id: 'IMP003',
      nombre: 'Impresora Montaje',
      activa: false,
      categorias: ['Bocadillos', 'Pan', 'Bollería'],
      ipAddress: '192.168.1.102',
      modelo: 'Epson TM-T20III',
      puntoVentaId
    }
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [impresoraEditar, setImpresoraEditar] = useState<Impresora | null>(null);
  const [nombreImpresora, setNombreImpresora] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [modelo, setModelo] = useState('');
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);

  const abrirModalNueva = () => {
    setImpresoraEditar(null);
    setNombreImpresora('');
    setIpAddress('');
    setModelo('');
    setCategoriasSeleccionadas([]);
    setModalAbierto(true);
  };

  const abrirModalEditar = (impresora: Impresora) => {
    setImpresoraEditar(impresora);
    setNombreImpresora(impresora.nombre);
    setIpAddress(impresora.ipAddress || '');
    setModelo(impresora.modelo || '');
    setCategoriasSeleccionadas(impresora.categorias);
    setModalAbierto(true);
  };

  const toggleCategoria = (categoria: string) => {
    if (categoriasSeleccionadas.includes(categoria)) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c !== categoria));
    } else {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, categoria]);
    }
  };

  const guardarImpresora = () => {
    if (!nombreImpresora) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (categoriasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una categoría');
      return;
    }

    if (impresoraEditar) {
      // Editar
      setImpresoras(impresoras.map(imp =>
        imp.id === impresoraEditar.id
          ? {
              ...imp,
              nombre: nombreImpresora,
              ipAddress,
              modelo,
              categorias: categoriasSeleccionadas
            }
          : imp
      ));
      toast.success('Impresora actualizada correctamente');
    } else {
      // Nueva
      const nuevaImpresora: Impresora = {
        id: `IMP${Date.now()}`,
        nombre: nombreImpresora,
        activa: true,
        categorias: categoriasSeleccionadas,
        ipAddress,
        modelo,
        puntoVentaId
      };
      setImpresoras([...impresoras, nuevaImpresora]);
      toast.success('Impresora añadida correctamente');
    }

    setModalAbierto(false);
  };

  const toggleActiva = (id: string) => {
    setImpresoras(impresoras.map(imp =>
      imp.id === id ? { ...imp, activa: !imp.activa } : imp
    ));
    const impresora = impresoras.find(imp => imp.id === id);
    if (impresora) {
      toast.success(`Impresora ${impresora.activa ? 'desactivada' : 'activada'}`);
    }
  };

  const eliminarImpresora = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta impresora?')) {
      setImpresoras(impresoras.filter(imp => imp.id !== id));
      toast.success('Impresora eliminada');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                Configuración de Impresoras
              </CardTitle>
              <CardDescription>
                Gestiona las impresoras y asigna categorías de productos
              </CardDescription>
            </div>
            <Button onClick={abrirModalNueva} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Impresora
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {impresoras.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Printer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay impresoras configuradas</p>
                <p className="text-sm mt-1">Añade una impresora para comenzar</p>
              </div>
            ) : (
              impresoras.map(impresora => (
                <Card key={impresora.id} className={`${impresora.activa ? 'border-2 border-teal-200' : 'border-2 border-gray-200 opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Printer className={`w-5 h-5 ${impresora.activa ? 'text-teal-600' : 'text-gray-400'}`} />
                          <div>
                            <p className="font-medium text-lg">{impresora.nombre}</p>
                            {impresora.modelo && (
                              <p className="text-xs text-gray-600">{impresora.modelo}</p>
                            )}
                            {impresora.ipAddress && (
                              <p className="text-xs text-gray-500">IP: {impresora.ipAddress}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">Categorías asignadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {impresora.categorias.map(cat => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-600">
                            {impresora.activa ? 'Activa' : 'Inactiva'}
                          </Label>
                          <Switch
                            checked={impresora.activa}
                            onCheckedChange={() => toggleActiva(impresora.id)}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModalEditar(impresora)}
                          className="touch-target"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarImpresora(impresora.id)}
                          className="text-red-600 hover:text-red-700 touch-target"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear/editar impresora */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
              {impresoraEditar ? 'Editar Impresora' : 'Nueva Impresora'}
            </DialogTitle>
            <DialogDescription>
              Configura los datos de la impresora y asigna las categorías
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Nombre de la Impresora *</Label>
              <Input
                placeholder="Ej: Impresora Cocina Principal"
                value={nombreImpresora}
                onChange={(e) => setNombreImpresora(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dirección IP</Label>
                <Input
                  placeholder="Ej: 192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  placeholder="Ej: Epson TM-T20III"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Categorías que Imprime *</Label>
              <p className="text-xs text-gray-600">
                Selecciona todas las categorías que esta impresora debe imprimir
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIAS_DISPONIBLES.map(categoria => (
                  <button
                    key={categoria}
                    type="button"
                    onClick={() => toggleCategoria(categoria)}
                    className={`p-3 rounded-lg border-2 text-sm transition-all ${
                      categoriasSeleccionadas.includes(categoria)
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{categoria}</span>
                      {categoriasSeleccionadas.includes(categoria) && (
                        <Check className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {categoriasSeleccionadas.length > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <p className="text-sm text-teal-800">
                  <strong>{categoriasSeleccionadas.length}</strong> categorías seleccionadas
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarImpresora} className="bg-teal-600 hover:bg-teal-700">
              {impresoraEditar ? 'Guardar Cambios' : 'Crear Impresora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
