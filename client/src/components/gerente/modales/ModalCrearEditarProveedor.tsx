import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { toast } from 'sonner@2.0.3';
import { Proveedor } from '../../../data/proveedores';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Euro, 
  Calendar, 
  CreditCard,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';

interface ModalCrearEditarProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (proveedor: Proveedor) => void;
  modo: 'crear' | 'editar';
  proveedorInicial?: Proveedor;
}

const CATEGORIAS_DISPONIBLES = [
  'harinas',
  'lacteos',
  'frutas',
  'verduras',
  'carnes',
  'pescados',
  'bebidas',
  'especias',
  'aceites',
  'conservas',
  'congelados',
  'panaderia',
  'reposteria',
  'limpieza',
  'embalajes'
];

export function ModalCrearEditarProveedor({
  isOpen,
  onClose,
  onGuardar,
  modo,
  proveedorInicial
}: ModalCrearEditarProveedorProps) {
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Datos del proveedor
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [personaContacto, setPersonaContacto] = useState('');
  
  // Dirección
  const [calle, setCalle] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [provincia, setProvincia] = useState('');
  
  // Condiciones comerciales
  const [pedidoMinimo, setPedidoMinimo] = useState('');
  const [diasEntrega, setDiasEntrega] = useState('');
  const [formaPago, setFormaPago] = useState<'efectivo' | 'transferencia' | 'tarjeta' | 'credito'>('transferencia');
  const [plazosPago, setPlazosPago] = useState('');
  
  // Categorías
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  
  // Notas
  const [notas, setNotas] = useState('');

  // Cargar datos si estamos editando
  useEffect(() => {
    if (modo === 'editar' && proveedorInicial) {
      setNombre(proveedorInicial.nombre);
      setTelefono(proveedorInicial.contacto.telefono);
      setEmail(proveedorInicial.contacto.email);
      setPersonaContacto(proveedorInicial.contacto.personaContacto);
      
      setCalle(proveedorInicial.direccion.calle);
      setCiudad(proveedorInicial.direccion.ciudad);
      setCodigoPostal(proveedorInicial.direccion.codigoPostal);
      setProvincia(proveedorInicial.direccion.provincia);
      
      setPedidoMinimo(proveedorInicial.condicionesComerciales.pedidoMinimo.toString());
      setDiasEntrega(proveedorInicial.condicionesComerciales.diasEntrega.toString());
      setFormaPago(proveedorInicial.condicionesComerciales.formaPago);
      setPlazosPago(proveedorInicial.condicionesComerciales.plazosPago);
      
      setCategorias(proveedorInicial.categoria);
      setNotas(proveedorInicial.notas || '');
    } else {
      // Resetear campos al crear
      resetearFormulario();
    }
  }, [modo, proveedorInicial, isOpen]);

  const resetearFormulario = () => {
    setNombre('');
    setTelefono('');
    setEmail('');
    setPersonaContacto('');
    setCalle('');
    setCiudad('');
    setCodigoPostal('');
    setProvincia('');
    setPedidoMinimo('');
    setDiasEntrega('');
    setFormaPago('transferencia');
    setPlazosPago('');
    setCategorias([]);
    setNuevaCategoria('');
    setNotas('');
    setErrores({});
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!telefono.trim()) nuevosErrores.telefono = 'El teléfono es obligatorio';
    if (!email.trim()) nuevosErrores.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nuevosErrores.email = 'Email no válido';
    
    if (!ciudad.trim()) nuevosErrores.ciudad = 'La ciudad es obligatoria';
    if (!provincia.trim()) nuevosErrores.provincia = 'La provincia es obligatoria';
    
    if (!pedidoMinimo || parseFloat(pedidoMinimo) <= 0) {
      nuevosErrores.pedidoMinimo = 'El pedido mínimo debe ser mayor a 0';
    }
    if (!diasEntrega || parseInt(diasEntrega) <= 0) {
      nuevosErrores.diasEntrega = 'Los días de entrega deben ser mayores a 0';
    }
    
    if (categorias.length === 0) {
      nuevosErrores.categorias = 'Debe seleccionar al menos una categoría';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleAgregarCategoria = () => {
    if (nuevaCategoria && !categorias.includes(nuevaCategoria)) {
      setCategorias([...categorias, nuevaCategoria]);
      setNuevaCategoria('');
    }
  };

  const handleEliminarCategoria = (categoria: string) => {
    setCategorias(categorias.filter(c => c !== categoria));
  };

  const handleGuardar = () => {
    if (!validarFormulario()) {
      toast.error('Revisa los campos', {
        description: 'Hay errores en el formulario que debes corregir'
      });
      return;
    }

    const proveedor: Proveedor = {
      id: modo === 'editar' && proveedorInicial ? proveedorInicial.id : `PROV-${Date.now()}`,
      nombre: nombre.trim(),
      categoria: categorias,
      contacto: {
        telefono: telefono.trim(),
        email: email.trim(),
        personaContacto: personaContacto.trim() || nombre.trim()
      },
      direccion: {
        calle: calle.trim(),
        ciudad: ciudad.trim(),
        codigoPostal: codigoPostal.trim(),
        provincia: provincia.trim()
      },
      condicionesComerciales: {
        pedidoMinimo: parseFloat(pedidoMinimo),
        diasEntrega: parseInt(diasEntrega),
        formaPago,
        plazosPago: plazosPago.trim()
      },
      evaluacion: modo === 'editar' && proveedorInicial ? proveedorInicial.evaluacion : {
        puntuacionGeneral: 4,
        calidad: 4,
        puntualidad: 4,
        precio: 4,
        atencionCliente: 4
      },
      estadisticas: modo === 'editar' && proveedorInicial ? proveedorInicial.estadisticas : {
        totalPedidos: 0,
        pedidosCompletados: 0,
        tasaCumplimiento: 100,
        tiempoMedioEntrega: parseInt(diasEntrega),
        gastoTotal: 0
      },
      activo: modo === 'editar' && proveedorInicial ? proveedorInicial.activo : true,
      notas: notas.trim()
    };

    onGuardar(proveedor);
    onClose();
    resetearFormulario();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {modo === 'crear' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          </DialogTitle>
          <DialogDescription>
            {modo === 'crear' 
              ? 'Completa los datos del nuevo proveedor' 
              : 'Modifica los datos del proveedor'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Información Básica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre del Proveedor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Harinas del Norte"
                  className={errores.nombre ? 'border-red-500' : ''}
                />
                {errores.nombre && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errores.nombre}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="personaContacto">Persona de Contacto</Label>
                <Input
                  id="personaContacto"
                  value={personaContacto}
                  onChange={(e) => setPersonaContacto(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contacto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Datos de Contacto</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: +34 600 123 456"
                  className={errores.telefono ? 'border-red-500' : ''}
                />
                {errores.telefono && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errores.telefono}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej: contacto@proveedor.com"
                  className={errores.email ? 'border-red-500' : ''}
                />
                {errores.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errores.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Dirección */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Dirección</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calle">Calle</Label>
                <Input
                  id="calle"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value)}
                  placeholder="Ej: Calle Mayor, 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigoPostal">Código Postal</Label>
                  <Input
                    id="codigoPostal"
                    value={codigoPostal}
                    onChange={(e) => setCodigoPostal(e.target.value)}
                    placeholder="Ej: 28001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">
                    Ciudad <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ciudad"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ej: Madrid"
                    className={errores.ciudad ? 'border-red-500' : ''}
                  />
                  {errores.ciudad && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errores.ciudad}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provincia">
                    Provincia <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="provincia"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    placeholder="Ej: Madrid"
                    className={errores.provincia ? 'border-red-500' : ''}
                  />
                  {errores.provincia && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errores.provincia}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Condiciones Comerciales */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Condiciones Comerciales</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pedidoMinimo">
                  Pedido Mínimo (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pedidoMinimo"
                  type="number"
                  step="0.01"
                  value={pedidoMinimo}
                  onChange={(e) => setPedidoMinimo(e.target.value)}
                  placeholder="Ej: 100"
                  className={errores.pedidoMinimo ? 'border-red-500' : ''}
                />
                {errores.pedidoMinimo && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errores.pedidoMinimo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="diasEntrega">
                  Días de Entrega <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="diasEntrega"
                  type="number"
                  value={diasEntrega}
                  onChange={(e) => setDiasEntrega(e.target.value)}
                  placeholder="Ej: 3"
                  className={errores.diasEntrega ? 'border-red-500' : ''}
                />
                {errores.diasEntrega && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errores.diasEntrega}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="formaPago">Forma de Pago</Label>
                <Select value={formaPago} onValueChange={(val: any) => setFormaPago(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plazosPago">Plazos de Pago</Label>
                <Input
                  id="plazosPago"
                  value={plazosPago}
                  onChange={(e) => setPlazosPago(e.target.value)}
                  placeholder="Ej: 30 días"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Categorías */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">
                Categorías <span className="text-red-500">*</span>
              </h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <Select value={nuevaCategoria} onValueChange={setNuevaCategoria}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_DISPONIBLES
                      .filter(cat => !categorias.includes(cat))
                      .map(cat => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAgregarCategoria}
                  disabled={!nuevaCategoria}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {categorias.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <Badge key={cat} className="bg-teal-100 text-teal-800 capitalize">
                      {cat}
                      <button
                        onClick={() => handleEliminarCategoria(cat)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {errores.categorias && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errores.categorias}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas Adicionales</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Cualquier información adicional sobre el proveedor..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} className="bg-teal-600 hover:bg-teal-700">
            {modo === 'crear' ? 'Crear Proveedor' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
