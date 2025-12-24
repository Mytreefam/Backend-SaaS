import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Switch } from '../ui/switch';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Store, 
  MapPin, 
  CreditCard, 
  ChevronDown,
  UserPlus,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ModalCrearAgente } from './ModalCrearAgente';
import { guardarMarcasMultiples } from '../../utils/marcasHelper';

interface Marca {
  marcaNombre: string;
  marcaCodigo: string;
  colorIdentidad: string;
  logoUrl?: string; // URL o base64 del logo de la marca
}

interface PuntoVenta {
  pvNombreComercial: string;
  pvDireccion: string;
  marcaId: string;
}

interface CuentaBancaria {
  iban: string;
  aliasCuenta: string;
}

interface ModalCrearEmpresaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalCrearEmpresa({ open, onOpenChange }: ModalCrearEmpresaProps) {
  // Estados para datos fiscales
  const [nombreFiscal, setNombreFiscal] = useState('');
  const [cif, setCif] = useState('');
  const [domicilioFiscal, setDomicilioFiscal] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [logoComercial, setLogoComercial] = useState<string>(''); // Logo del nombre comercial
  const [convenioColectivoId, setConvenioColectivoId] = useState('');
  const [empresaActiva, setEmpresaActiva] = useState(true);

  // Estados para marcas
  const [marcas, setMarcas] = useState<Marca[]>([]);

  // Estados para puntos de venta
  const [puntosVenta, setPuntosVenta] = useState<PuntoVenta[]>([]);

  // Estados para cuentas bancarias
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([]);

  // Estado para modal de agente
  const [modalAgenteOpen, setModalAgenteOpen] = useState(false);

  // Función para generar ID de empresa
  const generarEmpresaId = () => {
    const timestamp = Date.now();
    return `EMP-${timestamp.toString().slice(-6)}`;
  };

  // Función para generar código de marca
  const generarMarcaCodigo = (index: number) => {
    return `MRC-${String(index + 1).padStart(3, '0')}`;
  };

  // Añadir nueva marca
  const añadirMarca = () => {
    const nuevaMarca: Marca = {
      marcaNombre: '',
      marcaCodigo: generarMarcaCodigo(marcas.length),
      colorIdentidad: '#0d9488', // Color teal por defecto
    };
    setMarcas([...marcas, nuevaMarca]);
    toast.success('Marca añadida. Complete los datos.');
  };

  // Eliminar marca
  const eliminarMarca = (index: number) => {
    const marcaAEliminar = marcas[index];
    
    // Verificar si hay puntos de venta vinculados a esta marca
    const puntosVinculados = puntosVenta.filter(
      pv => pv.marcaId === marcaAEliminar.marcaCodigo
    );
    
    if (puntosVinculados.length > 0) {
      toast.error(`No se puede eliminar la marca. Tiene ${puntosVinculados.length} punto(s) de venta vinculado(s).`);
      return;
    }
    
    const nuevasMarcas = marcas.filter((_, i) => i !== index);
    setMarcas(nuevasMarcas);
    toast.success('Marca eliminada correctamente');
  };

  // Actualizar marca
  const actualizarMarca = (index: number, campo: keyof Marca, valor: string) => {
    const nuevasMarcas = [...marcas];
    nuevasMarcas[index] = { ...nuevasMarcas[index], [campo]: valor };
    setMarcas(nuevasMarcas);
  };

  // Manejar carga de imagen del logo comercial
  const handleLogoComercialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    // Convertir a base64 para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoComercial(reader.result as string);
      toast.success('Logo cargado correctamente');
    };
    reader.readAsDataURL(file);
  };

  // Manejar carga de imagen del logo de marca
  const handleLogoMarcaChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 2MB');
      return;
    }

    // Convertir a base64 para preview
    const reader = new FileReader();
    reader.onloadend = () => {
      actualizarMarca(index, 'logoUrl', reader.result as string);
      toast.success('Logo de marca cargado correctamente');
    };
    reader.readAsDataURL(file);
  };

  // Eliminar logo comercial
  const eliminarLogoComercial = () => {
    setLogoComercial('');
    toast.info('Logo eliminado');
  };

  // Eliminar logo de marca
  const eliminarLogoMarca = (index: number) => {
    actualizarMarca(index, 'logoUrl', '');
    toast.info('Logo de marca eliminado');
  };

  // Añadir punto de venta
  const añadirPuntoVenta = () => {
    if (marcas.length === 0) {
      toast.error('Debes crear al menos 1 Marca antes de añadir un Punto de Venta');
      return;
    }

    const nuevoPuntoVenta: PuntoVenta = {
      pvNombreComercial: '',
      pvDireccion: '',
      marcaId: marcas[0].marcaCodigo, // Primera marca por defecto
    };
    setPuntosVenta([...puntosVenta, nuevoPuntoVenta]);
    toast.success('Punto de venta añadido. Complete los datos.');
  };

  // Eliminar punto de venta
  const eliminarPuntoVenta = (index: number) => {
    const nuevosPuntosVenta = puntosVenta.filter((_, i) => i !== index);
    setPuntosVenta(nuevosPuntosVenta);
    toast.success('Punto de venta eliminado');
  };

  // Actualizar punto de venta
  const actualizarPuntoVenta = (index: number, campo: keyof PuntoVenta, valor: string) => {
    const nuevosPuntosVenta = [...puntosVenta];
    nuevosPuntosVenta[index] = { ...nuevosPuntosVenta[index], [campo]: valor };
    setPuntosVenta(nuevosPuntosVenta);
  };

  // Añadir cuenta bancaria
  const añadirCuentaBancaria = () => {
    const nuevaCuenta: CuentaBancaria = {
      iban: '',
      aliasCuenta: '',
    };
    setCuentasBancarias([...cuentasBancarias, nuevaCuenta]);
    toast.success('Cuenta bancaria añadida');
  };

  // Eliminar cuenta bancaria
  const eliminarCuentaBancaria = (index: number) => {
    const nuevasCuentas = cuentasBancarias.filter((_, i) => i !== index);
    setCuentasBancarias(nuevasCuentas);
    toast.success('Cuenta bancaria eliminada');
  };

  // Actualizar cuenta bancaria
  const actualizarCuentaBancaria = (index: number, campo: keyof CuentaBancaria, valor: string) => {
    const nuevasCuentas = [...cuentasBancarias];
    nuevasCuentas[index] = { ...nuevasCuentas[index], [campo]: valor };
    setCuentasBancarias(nuevasCuentas);
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!nombreFiscal.trim()) {
      toast.error('El nombre fiscal es obligatorio');
      return false;
    }
    if (!cif.trim()) {
      toast.error('El CIF es obligatorio');
      return false;
    }
    if (!domicilioFiscal.trim()) {
      toast.error('El domicilio fiscal es obligatorio');
      return false;
    }
    if (!nombreComercial.trim()) {
      toast.error('El nombre comercial es obligatorio');
      return false;
    }
    
    // Validar que todas las marcas tengan nombre
    for (let i = 0; i < marcas.length; i++) {
      if (!marcas[i].marcaNombre.trim()) {
        toast.error(`La marca ${i + 1} debe tener un nombre`);
        return false;
      }
    }
    
    // Validar que todos los puntos de venta tengan datos completos
    for (let i = 0; i < puntosVenta.length; i++) {
      if (!puntosVenta[i].pvNombreComercial.trim()) {
        toast.error(`El punto de venta ${i + 1} debe tener un nombre comercial`);
        return false;
      }
      if (!puntosVenta[i].pvDireccion.trim()) {
        toast.error(`El punto de venta ${i + 1} debe tener una dirección`);
        return false;
      }
    }
    
    // Validar cuentas bancarias
    for (let i = 0; i < cuentasBancarias.length; i++) {
      if (!cuentasBancarias[i].iban.trim()) {
        toast.error(`La cuenta bancaria ${i + 1} debe tener un IBAN`);
        return false;
      }
      if (!cuentasBancarias[i].aliasCuenta.trim()) {
        toast.error(`La cuenta bancaria ${i + 1} debe tener un alias`);
        return false;
      }
    }
    
    return true;
  };

  // Guardar empresa
  const guardarEmpresa = () => {
    if (!validarFormulario()) {
      return;
    }

    const empresaId = generarEmpresaId();

    const datosEmpresa = {
      empresaId,
      nombreFiscal,
      cif,
      domicilioFiscal,
      nombreComercial,
      logoComercial,
      convenioColectivoId,
      empresaActiva,
      marcas: marcas.map(marca => ({
        ...marca,
        empresaId,
      })),
      puntosVenta: puntosVenta.map((pv, index) => ({
        ...pv,
        puntoVentaId: `PDV-${String(index + 1).padStart(3, '0')}`,
        empresaId,
      })),
      cuentasBancarias: cuentasBancarias.map((cuenta, index) => ({
        ...cuenta,
        cuentaId: `CTA-${String(index + 1).padStart(3, '0')}`,
        empresaId,
      })),
    };

    console.log('📦 Datos de empresa a enviar a BBDD:', datosEmpresa);
    
    // ⭐ GUARDAR MARCAS EN LOCALSTORAGE GLOBAL (Sistema de Marcas MADRE)
    try {
      const nuevasMarcas = marcas.map(marca => ({
        id: marca.marcaCodigo,
        codigo: marca.marcaCodigo,
        nombre: marca.marcaNombre,
        color: marca.colorIdentidad,
        logo: marca.logoUrl || '',
        empresaId: empresaId,
        empresaNombre: nombreComercial || nombreFiscal,
        activo: empresaActiva,
        fechaCreacion: new Date().toISOString()
      }));
      
      // Usar helper centralizado para guardar marcas
      const guardado = guardarMarcasMultiples(nuevasMarcas);
      
      if (guardado) {
        console.log('✅ Marcas MADRE guardadas correctamente');
      } else {
        console.error('❌ Error al guardar marcas');
      }
    } catch (error) {
      console.error('❌ Error al guardar marcas en localStorage:', error);
    }
    
    // TODO: Aquí el programador debe enviar datosEmpresa a la API/Base de datos
    // await api.post('/empresas', datosEmpresa);

    toast.success('Empresa creada correctamente');
    onOpenChange(false);
    resetearFormulario();
  };

  // Resetear formulario
  const resetearFormulario = () => {
    setNombreFiscal('');
    setCif('');
    setDomicilioFiscal('');
    setNombreComercial('');
    setConvenioColectivoId('');
    setEmpresaActiva(true);
    setMarcas([]);
    setPuntosVenta([]);
    setCuentasBancarias([]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <Building2 className="h-5 w-5 text-teal-600" />
              Crear Nueva Empresa
            </DialogTitle>
            <DialogDescription>
              Completa los datos para crear una nueva empresa en el sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 1. DATOS FISCALES Y LEGALES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  1. Datos Fiscales y Legales
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreFiscal">
                    Nombre Fiscal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombreFiscal"
                    placeholder="PAU Hostelería S.L."
                    value={nombreFiscal}
                    onChange={(e) => setNombreFiscal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cif">
                    CIF <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cif"
                    placeholder="B12345678"
                    value={cif}
                    onChange={(e) => setCif(e.target.value)}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="domicilioFiscal">
                    Domicilio Fiscal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="domicilioFiscal"
                    placeholder="Av. Diagonal 100, Barcelona"
                    value={domicilioFiscal}
                    onChange={(e) => setDomicilioFiscal(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreComercial">
                    Nombre Comercial <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombreComercial"
                    placeholder="PAU Hostelería"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="logoComercial">
                    Logo del Nombre Comercial (Opcional)
                  </Label>
                  <div className="flex items-start gap-3">
                    {/* Preview del logo */}
                    {logoComercial && (
                      <div className="relative w-20 h-20 rounded-lg border-2 border-gray-300 overflow-hidden bg-white flex-shrink-0">
                        <img 
                          src={logoComercial} 
                          alt="Logo comercial" 
                          className="w-full h-full object-contain p-1"
                        />
                        <button
                          type="button"
                          onClick={eliminarLogoComercial}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    {/* Input file */}
                    <div className="flex-1">
                      <label 
                        htmlFor="logoComercial"
                        className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            {logoComercial ? 'Cambiar logo' : 'Subir logo'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            PNG, JPG hasta 2MB
                          </p>
                        </div>
                      </label>
                      <input
                        id="logoComercial"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoComercialChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="convenioColectivo">Convenio Colectivo (Opcional)</Label>
                  <Input
                    id="convenioColectivo"
                    placeholder="CONV-001"
                    value={convenioColectivoId}
                    onChange={(e) => setConvenioColectivoId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 2. MARCAS DE LA EMPRESA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    2. Marcas de la Empresa
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={añadirMarca}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir Marca
                </Button>
              </div>

              {marcas.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No hay marcas añadidas. Haz clic en "Añadir Marca" para crear una.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {marcas.map((marca, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                            {marca.marcaCodigo}
                          </Badge>
                          <span className="text-sm text-gray-600">Marca {index + 1}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarMarca(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {/* Nombre y Color */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2 col-span-2">
                            <Label>Nombre de la Marca <span className="text-red-500">*</span></Label>
                            <Input
                              placeholder="Ej: PIZZAS"
                              value={marca.marcaNombre}
                              onChange={(e) => actualizarMarca(index, 'marcaNombre', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Color Identidad</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={marca.colorIdentidad}
                                onChange={(e) => actualizarMarca(index, 'colorIdentidad', e.target.value)}
                                className="w-16 h-10 p-1"
                              />
                              <Input
                                value={marca.colorIdentidad}
                                onChange={(e) => actualizarMarca(index, 'colorIdentidad', e.target.value)}
                                placeholder="#0d9488"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Logo de la Marca */}
                        <div className="space-y-2">
                          <Label>Logo de la Marca</Label>
                          <div className="flex items-center gap-3">
                            {/* Preview del logo */}
                            {marca.logoUrl && (
                              <div className="relative w-16 h-16 rounded-lg border-2 border-gray-300 overflow-hidden bg-white flex-shrink-0">
                                <img 
                                  src={marca.logoUrl} 
                                  alt={`Logo ${marca.marcaNombre}`}
                                  className="w-full h-full object-contain p-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => eliminarLogoMarca(index)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                            
                            {/* Input file */}
                            <div className="flex-1">
                              <label 
                                htmlFor={`logoMarca-${index}`}
                                className="flex items-center gap-2 px-3 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                              >
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {marca.logoUrl ? 'Cambiar logo' : 'Subir logo de la marca'}
                                </span>
                              </label>
                              <input
                                id={`logoMarca-${index}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoMarcaChange(index, e)}
                                className="hidden"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* 3. PUNTOS DE VENTA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    3. Puntos de Venta
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={añadirPuntoVenta}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir Punto de Venta
                </Button>
              </div>

              {marcas.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Debes crear al menos 1 Marca antes de poder añadir Puntos de Venta.
                    </p>
                  </div>
                </div>
              )}

              {puntosVenta.length === 0 && marcas.length > 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No hay puntos de venta añadidos.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {puntosVenta.map((pv, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            PDV-{String(index + 1).padStart(3, '0')}
                          </Badge>
                          <span className="text-sm text-gray-600">Punto de Venta {index + 1}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarPuntoVenta(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Nombre Comercial <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Ej: Tiana"
                            value={pv.pvNombreComercial}
                            onChange={(e) => actualizarPuntoVenta(index, 'pvNombreComercial', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Dirección <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Calle Mayor 45"
                            value={pv.pvDireccion}
                            onChange={(e) => actualizarPuntoVenta(index, 'pvDireccion', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Marca Asignada <span className="text-red-500">*</span></Label>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" className="w-full justify-between">
                                {marcas.find(m => m.marcaCodigo === pv.marcaId)?.marcaNombre || 'Seleccionar marca'}
                                <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-full">
                              {marcas.map((marca) => (
                                <DropdownMenuItem
                                  key={marca.marcaCodigo}
                                  onClick={() => actualizarPuntoVenta(index, 'marcaId', marca.marcaCodigo)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: marca.colorIdentidad }}
                                    />
                                    {marca.marcaNombre} ({marca.marcaCodigo})
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* 4. CUENTAS BANCARIAS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    4. Cuentas Bancarias
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={añadirCuentaBancaria}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Añadir Cuenta
                </Button>
              </div>

              {cuentasBancarias.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    No hay cuentas bancarias añadidas (opcional).
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {cuentasBancarias.map((cuenta, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            CTA-{String(index + 1).padStart(3, '0')}
                          </Badge>
                          <span className="text-sm text-gray-600">Cuenta {index + 1}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarCuentaBancaria(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>IBAN <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="ES91 2100 0418 4502 0005 1332"
                            value={cuenta.iban}
                            onChange={(e) => actualizarCuentaBancaria(index, 'iban', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Alias de la Cuenta <span className="text-red-500">*</span></Label>
                          <Input
                            placeholder="Cuenta principal"
                            value={cuenta.aliasCuenta}
                            onChange={(e) => actualizarCuentaBancaria(index, 'aliasCuenta', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* 5. EMPRESA ACTIVA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  5. Estado de la Empresa
                </h3>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="empresaActiva" className="text-base cursor-pointer">
                    Empresa Activa
                  </Label>
                  <p className="text-sm text-gray-600">
                    Las empresas inactivas no aparecerán en los filtros principales
                  </p>
                </div>
                <Switch
                  id="empresaActiva"
                  checked={empresaActiva}
                  onCheckedChange={setEmpresaActiva}
                />
              </div>
            </div>

            <Separator />

            {/* 6. AÑADIR AGENTE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  6. Agentes Externos (Opcional)
                </h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  Puedes añadir agentes externos (proveedores, gestores, auditores) después de crear la empresa, 
                  o hacerlo ahora desde aquí.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setModalAgenteOpen(true)}
                  className="gap-2 border-blue-300 hover:bg-blue-100"
                >
                  <UserPlus className="h-4 w-4" />
                  Añadir Agente Externo
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={guardarEmpresa}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Crear Empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Crear Agente */}
      <ModalCrearAgente
        open={modalAgenteOpen}
        onOpenChange={setModalAgenteOpen}
        empresaActual={nombreComercial || 'Nueva Empresa'}
        marcasDisponibles={marcas}
        puntosVentaDisponibles={puntosVenta}
      />
    </>
  );
}