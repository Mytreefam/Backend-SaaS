import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { 
  UserPlus, 
  ChevronDown,
  Building2,
  Store,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Marca {
  marcaNombre: string;
  marcaCodigo: string;
  colorIdentidad: string;
}

interface PuntoVenta {
  pvNombreComercial: string;
  pvDireccion: string;
  marcaId: string;
}

interface ModalCrearAgenteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaActual: string;
  marcasDisponibles: Marca[];
  puntosVentaDisponibles: PuntoVenta[];
}

interface Permisos {
  recibirPedidos: boolean;
  entregarAlbaranes: boolean;
  exportarFacturacion: boolean;
  recibirFacturas: boolean;
  verInventario: boolean;
  editarProductos: boolean;
}

export function ModalCrearAgente({
  open,
  onOpenChange,
  empresaActual,
  marcasDisponibles,
  puntosVentaDisponibles,
}: ModalCrearAgenteProps) {
  const [agenteNombre, setAgenteNombre] = useState('');
  const [agenteTipo, setAgenteTipo] = useState<'Proveedor' | 'Gestor' | 'Auditor' | 'Otros'>('Proveedor');
  const [agenteEmail, setAgenteEmail] = useState('');
  const [agenteTelefono, setAgenteTelefono] = useState('');
  const [marcaAsignadaId, setMarcaAsignadaId] = useState<string>('');
  const [puntoVentaAsignadoId, setPuntoVentaAsignadoId] = useState<string>('');
  const [estado, setEstado] = useState(true);

  const [permisos, setPermisos] = useState<Permisos>({
    recibirPedidos: false,
    entregarAlbaranes: false,
    exportarFacturacion: false,
    recibirFacturas: false,
    verInventario: false,
    editarProductos: false,
  });

  // Función para generar ID de agente
  const generarAgenteId = () => {
    const timestamp = Date.now();
    return `AGE-${timestamp.toString().slice(-6)}`;
  };

  // Función para actualizar permisos
  const actualizarPermiso = (permiso: keyof Permisos, valor: boolean) => {
    setPermisos({ ...permisos, [permiso]: valor });
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!agenteNombre.trim()) {
      toast.error('El nombre del agente es obligatorio');
      return false;
    }
    if (!agenteEmail.trim()) {
      toast.error('El email del agente es obligatorio');
      return false;
    }
    if (!agenteTelefono.trim()) {
      toast.error('El teléfono del agente es obligatorio');
      return false;
    }
    return true;
  };

  // Guardar agente
  const guardarAgente = () => {
    if (!validarFormulario()) {
      return;
    }

    const agenteId = generarAgenteId();

    const datosAgente = {
      agenteId,
      agenteNombre,
      agenteTipo,
      agenteEmail,
      agenteTelefono,
      empresaAsignadaId: 'EMP-TEMP', // Se asignará cuando se guarde la empresa
      empresaAsignadaNombre: empresaActual,
      marcaAsignadaId: marcaAsignadaId || null,
      puntoVentaAsignadoId: puntoVentaAsignadoId || null,
      permisos,
      estado,
      fechaCreacion: new Date().toISOString(),
    };

    console.log('👤 Datos de agente a enviar a BBDD:', datosAgente);
    
    // TODO: Aquí el programador debe enviar datosAgente a la API/Base de datos
    // await api.post('/agentes', datosAgente);

    toast.success('Agente externo creado correctamente');
    onOpenChange(false);
    resetearFormulario();
  };

  // Resetear formulario
  const resetearFormulario = () => {
    setAgenteNombre('');
    setAgenteTipo('Proveedor');
    setAgenteEmail('');
    setAgenteTelefono('');
    setMarcaAsignadaId('');
    setPuntoVentaAsignadoId('');
    setEstado(true);
    setPermisos({
      recibirPedidos: false,
      entregarAlbaranes: false,
      exportarFacturacion: false,
      recibirFacturas: false,
      verInventario: false,
      editarProductos: false,
    });
  };

  // Obtener puntos de venta filtrados por marca
  const puntosVentaFiltrados = marcaAsignadaId
    ? puntosVentaDisponibles.filter(pv => pv.marcaId === marcaAsignadaId)
    : puntosVentaDisponibles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <UserPlus className="h-5 w-5 text-teal-600" />
            Crear Agente Externo
          </DialogTitle>
          <DialogDescription>
            Agente para la empresa: <span className="font-medium text-gray-900">{empresaActual}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Información Básica
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agenteNombre">
                  Nombre del Agente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agenteNombre"
                  placeholder="Harinas del Norte S.L."
                  value={agenteNombre}
                  onChange={(e) => setAgenteNombre(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Agente <span className="text-red-500">*</span></Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {agenteTipo}
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setAgenteTipo('Proveedor')}>
                      Proveedor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAgenteTipo('Gestor')}>
                      Gestor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAgenteTipo('Auditor')}>
                      Auditor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setAgenteTipo('Otros')}>
                      Otros
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenteEmail">
                  <Mail className="h-3 w-3 inline mr-1" />
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agenteEmail"
                  type="email"
                  placeholder="contacto@proveedor.com"
                  value={agenteEmail}
                  onChange={(e) => setAgenteEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agenteTelefono">
                  <Phone className="h-3 w-3 inline mr-1" />
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="agenteTelefono"
                  type="tel"
                  placeholder="+34 900 123 456"
                  value={agenteTelefono}
                  onChange={(e) => setAgenteTelefono(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Asignación Empresa / Marca / Punto de Venta */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Asignación
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Empresa asignada:</strong> {empresaActual}
                  <p className="text-xs text-blue-700 mt-1">
                    El agente siempre tendrá acceso a esta empresa. Marca y Punto de Venta son opcionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  <Store className="h-3 w-3 inline mr-1" />
                  Marca Asignada (Opcional)
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {marcaAsignadaId 
                        ? marcasDisponibles.find(m => m.marcaCodigo === marcaAsignadaId)?.marcaNombre 
                        : 'Sin asignar'}
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setMarcaAsignadaId('')}>
                      Sin asignar
                    </DropdownMenuItem>
                    {marcasDisponibles.map((marca) => (
                      <DropdownMenuItem
                        key={marca.marcaCodigo}
                        onClick={() => {
                          setMarcaAsignadaId(marca.marcaCodigo);
                          setPuntoVentaAsignadoId(''); // Reset punto de venta
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: marca.colorIdentidad }}
                          />
                          {marca.marcaNombre}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label>
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Punto de Venta (Opcional)
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      disabled={puntosVentaFiltrados.length === 0}
                    >
                      {puntoVentaAsignadoId
                        ? puntosVentaDisponibles.find(pv => 
                            `${pv.pvNombreComercial}-${pv.marcaId}` === puntoVentaAsignadoId
                          )?.pvNombreComercial
                        : 'Sin asignar'}
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setPuntoVentaAsignadoId('')}>
                      Sin asignar
                    </DropdownMenuItem>
                    {puntosVentaFiltrados.map((pv, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => setPuntoVentaAsignadoId(`${pv.pvNombreComercial}-${pv.marcaId}`)}
                      >
                        {pv.pvNombreComercial} - {pv.pvDireccion}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {puntosVentaFiltrados.length === 0 && (
                  <p className="text-xs text-gray-500">
                    {marcaAsignadaId 
                      ? 'No hay puntos de venta para esta marca' 
                      : 'Selecciona una marca primero'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Permisos */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Permisos de Acceso
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recibirPedidos"
                  checked={permisos.recibirPedidos}
                  onCheckedChange={(checked) => actualizarPermiso('recibirPedidos', checked as boolean)}
                />
                <Label
                  htmlFor="recibirPedidos"
                  className="text-sm font-normal cursor-pointer"
                >
                  Recibir pedidos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="entregarAlbaranes"
                  checked={permisos.entregarAlbaranes}
                  onCheckedChange={(checked) => actualizarPermiso('entregarAlbaranes', checked as boolean)}
                />
                <Label
                  htmlFor="entregarAlbaranes"
                  className="text-sm font-normal cursor-pointer"
                >
                  Entregar albaranes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exportarFacturacion"
                  checked={permisos.exportarFacturacion}
                  onCheckedChange={(checked) => actualizarPermiso('exportarFacturacion', checked as boolean)}
                />
                <Label
                  htmlFor="exportarFacturacion"
                  className="text-sm font-normal cursor-pointer"
                >
                  Exportar facturación
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recibirFacturas"
                  checked={permisos.recibirFacturas}
                  onCheckedChange={(checked) => actualizarPermiso('recibirFacturas', checked as boolean)}
                />
                <Label
                  htmlFor="recibirFacturas"
                  className="text-sm font-normal cursor-pointer"
                >
                  Recibir facturas
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verInventario"
                  checked={permisos.verInventario}
                  onCheckedChange={(checked) => actualizarPermiso('verInventario', checked as boolean)}
                />
                <Label
                  htmlFor="verInventario"
                  className="text-sm font-normal cursor-pointer"
                >
                  Ver inventario
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="editarProductos"
                  checked={permisos.editarProductos}
                  onCheckedChange={(checked) => actualizarPermiso('editarProductos', checked as boolean)}
                />
                <Label
                  htmlFor="editarProductos"
                  className="text-sm font-normal cursor-pointer"
                >
                  Editar productos
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estado */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Estado
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="flex flex-col gap-1">
                <Label htmlFor="estado" className="text-base cursor-pointer">
                  Agente Activo
                </Label>
                <p className="text-sm text-gray-600">
                  Los agentes inactivos no podrán acceder al sistema
                </p>
              </div>
              <Switch
                id="estado"
                checked={estado}
                onCheckedChange={setEstado}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={guardarAgente}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Agente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
