/**
 * 🏢 MODAL EDITAR EMPRESA
 * =======================
 * Modal para editar datos de una empresa existente
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Store, 
  MapPin, 
  CreditCard,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
  Phone,
  Mail,
  Save,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { guardarMarcasMultiples } from '../../utils/marcasHelper';

interface Marca {
  marcaNombre: string;
  marcaCodigo: string;
  colorIdentidad: string;
  logoUrl?: string;
}

interface PuntoVenta {
  puntoVentaId?: string;
  pvNombreComercial: string;
  pvDireccion: string;
  pvTelefono: string;
  pvEmail: string;
  marcasDisponibles: string[]; // Array de códigos de marca
  activo: boolean;
}

interface CuentaBancaria {
  cuentaId?: string;
  iban: string;
  aliasCuenta: string;
}

interface DatosEmpresa {
  empresaId: string;
  nombreFiscal: string;
  cif: string;
  domicilioFiscal: string;
  nombreComercial: string;
  logoComercial?: string;
  convenioColectivoId?: string;
  empresaActiva: boolean;
  marcas: Marca[];
  puntosVenta: PuntoVenta[];
  cuentasBancarias: CuentaBancaria[];
}

interface ModalEditarEmpresaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datosEmpresa: DatosEmpresa;
  onGuardar?: (datos: DatosEmpresa) => void;
}

export function ModalEditarEmpresa({ open, onOpenChange, datosEmpresa, onGuardar }: ModalEditarEmpresaProps) {
  // Estados para datos fiscales
  const [nombreFiscal, setNombreFiscal] = useState('');
  const [cif, setCif] = useState('');
  const [domicilioFiscal, setDomicilioFiscal] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [logoComercial, setLogoComercial] = useState<string>('');
  const [convenioColectivoId, setConvenioColectivoId] = useState('');
  const [empresaActiva, setEmpresaActiva] = useState(true);

  // Estados para marcas
  const [marcas, setMarcas] = useState<Marca[]>([]);

  // Estados para puntos de venta
  const [puntosVenta, setPuntosVenta] = useState<PuntoVenta[]>([]);

  // Estados para cuentas bancarias
  const [cuentasBancarias, setCuentasBancarias] = useState<CuentaBancaria[]>([]);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && datosEmpresa) {
      setNombreFiscal(datosEmpresa.nombreFiscal || '');
      setCif(datosEmpresa.cif || '');
      setDomicilioFiscal(datosEmpresa.domicilioFiscal || '');
      setNombreComercial(datosEmpresa.nombreComercial || '');
      setLogoComercial(datosEmpresa.logoComercial || '');
      setConvenioColectivoId(datosEmpresa.convenioColectivoId || '');
      setEmpresaActiva(datosEmpresa.empresaActiva ?? true);
      setMarcas(datosEmpresa.marcas || []);
      setPuntosVenta(datosEmpresa.puntosVenta || []);
      setCuentasBancarias(datosEmpresa.cuentasBancarias || []);
    }
  }, [open, datosEmpresa]);

  // Función para generar código de marca
  const generarMarcaCodigo = (index: number) => {
    return `MRC-${String(index + 1).padStart(3, '0')}`;
  };

  // ============================================
  // GESTIÓN DE MARCAS
  // ============================================

  const añadirMarca = () => {
    const nuevaMarca: Marca = {
      marcaNombre: '',
      marcaCodigo: generarMarcaCodigo(marcas.length),
      colorIdentidad: '#0d9488',
    };
    setMarcas([...marcas, nuevaMarca]);
    toast.success('Marca añadida');
  };

  const actualizarMarca = (index: number, campo: keyof Marca, valor: string) => {
    const nuevasMarcas = [...marcas];
    nuevasMarcas[index] = { ...nuevasMarcas[index], [campo]: valor };
    setMarcas(nuevasMarcas);
  };

  const eliminarMarca = (index: number) => {
    const marcaAEliminar = marcas[index];
    
    // Verificar si hay puntos de venta usando esta marca
    const pdvsUsandoMarca = puntosVenta.filter(pv => 
      pv.marcasDisponibles.includes(marcaAEliminar.marcaCodigo)
    );

    if (pdvsUsandoMarca.length > 0) {
      toast.error(`No se puede eliminar la marca "${marcaAEliminar.marcaNombre}" porque está asignada a ${pdvsUsandoMarca.length} punto(s) de venta`);
      return;
    }

    const nuevasMarcas = marcas.filter((_, i) => i !== index);
    setMarcas(nuevasMarcas);
    toast.success('Marca eliminada');
  };

  const handleLogoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 2MB');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      actualizarMarca(index, 'logoUrl', base64);
      toast.success('Logo cargado correctamente');
    };
    reader.readAsDataURL(file);
  };

  // ============================================
  // GESTIÓN DE PUNTOS DE VENTA
  // ============================================

  const añadirPuntoVenta = () => {
    const nuevoPDV: PuntoVenta = {
      pvNombreComercial: '',
      pvDireccion: '',
      pvTelefono: '',
      pvEmail: '',
      marcasDisponibles: [],
      activo: true
    };
    setPuntosVenta([...puntosVenta, nuevoPDV]);
    toast.success('Punto de venta añadido');
  };

  const actualizarPuntoVenta = (index: number, campo: keyof PuntoVenta, valor: any) => {
    const nuevosPDVs = [...puntosVenta];
    nuevosPDVs[index] = { ...nuevosPDVs[index], [campo]: valor };
    setPuntosVenta(nuevosPDVs);
  };

  const eliminarPuntoVenta = (index: number) => {
    const nuevosPDVs = puntosVenta.filter((_, i) => i !== index);
    setPuntosVenta(nuevosPDVs);
    toast.success('Punto de venta eliminado');
  };

  const toggleMarcaEnPDV = (pdvIndex: number, marcaCodigo: string) => {
    const pdv = puntosVenta[pdvIndex];
    const marcasActuales = pdv.marcasDisponibles || [];
    
    const nuevasMarcas = marcasActuales.includes(marcaCodigo)
      ? marcasActuales.filter(m => m !== marcaCodigo)
      : [...marcasActuales, marcaCodigo];
    
    actualizarPuntoVenta(pdvIndex, 'marcasDisponibles', nuevasMarcas);
  };

  // ============================================
  // GESTIÓN DE CUENTAS BANCARIAS
  // ============================================

  const añadirCuentaBancaria = () => {
    const nuevaCuenta: CuentaBancaria = {
      iban: '',
      aliasCuenta: ''
    };
    setCuentasBancarias([...cuentasBancarias, nuevaCuenta]);
    toast.success('Cuenta bancaria añadida');
  };

  const actualizarCuentaBancaria = (index: number, campo: keyof CuentaBancaria, valor: string) => {
    const nuevasCuentas = [...cuentasBancarias];
    nuevasCuentas[index] = { ...nuevasCuentas[index], [campo]: valor };
    setCuentasBancarias(nuevasCuentas);
  };

  const eliminarCuentaBancaria = (index: number) => {
    const nuevasCuentas = cuentasBancarias.filter((_, i) => i !== index);
    setCuentasBancarias(nuevasCuentas);
    toast.success('Cuenta bancaria eliminada');
  };

  // ============================================
  // VALIDACIÓN Y GUARDADO
  // ============================================

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

    // Validar marcas
    for (const marca of marcas) {
      if (!marca.marcaNombre.trim()) {
        toast.error(`Falta el nombre de una marca (${marca.marcaCodigo})`);
        return false;
      }
    }

    // Validar puntos de venta
    for (const pdv of puntosVenta) {
      if (!pdv.pvNombreComercial.trim()) {
        toast.error('Falta el nombre de un punto de venta');
        return false;
      }
      if (pdv.marcasDisponibles.length === 0) {
        toast.error(`El punto de venta "${pdv.pvNombreComercial}" debe tener al menos una marca asignada`);
        return false;
      }
    }

    return true;
  };

  const handleGuardar = () => {
    if (!validarFormulario()) {
      return;
    }

    const datosActualizados: DatosEmpresa = {
      empresaId: datosEmpresa.empresaId,
      nombreFiscal,
      cif,
      domicilioFiscal,
      nombreComercial,
      logoComercial,
      convenioColectivoId,
      empresaActiva,
      marcas,
      puntosVenta: puntosVenta.map((pv, index) => ({
        ...pv,
        puntoVentaId: pv.puntoVentaId || `PDV-${String(index + 1).padStart(3, '0')}`
      })),
      cuentasBancarias: cuentasBancarias.map((cuenta, index) => ({
        ...cuenta,
        cuentaId: cuenta.cuentaId || `CTA-${String(index + 1).padStart(3, '0')}`
      }))
    };

    // Guardar marcas en localStorage (Sistema de Marcas MADRE)
    try {
      const nuevasMarcas = marcas.map(marca => ({
        id: marca.marcaCodigo,
        codigo: marca.marcaCodigo,
        nombre: marca.marcaNombre,
        color: marca.colorIdentidad,
        logo: marca.logoUrl || '',
        empresaId: datosEmpresa.empresaId,
        empresaNombre: nombreComercial || nombreFiscal,
        activo: empresaActiva,
        fechaCreacion: new Date().toISOString()
      }));
      
      const guardado = guardarMarcasMultiples(nuevasMarcas);
      
      if (guardado) {
        console.log('✅ Marcas MADRE actualizadas correctamente');
      }
    } catch (error) {
      console.error('❌ Error al actualizar marcas:', error);
    }

    console.log('📦 Datos actualizados:', datosActualizados);
    
    if (onGuardar) {
      onGuardar(datosActualizados);
    }

    toast.success('Empresa actualizada correctamente');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-[#ED1C24]" />
            Editar Datos de la Empresa
          </DialogTitle>
          <DialogDescription>
            Modifica la información de la empresa, marcas, puntos de venta y cuentas bancarias
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="empresa" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="marcas">Marcas ({marcas.length})</TabsTrigger>
            <TabsTrigger value="pdvs">Puntos de Venta ({puntosVenta.length})</TabsTrigger>
            <TabsTrigger value="cuentas">Cuentas ({cuentasBancarias.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: DATOS DE LA EMPRESA */}
          <TabsContent value="empresa" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[#ED1C24]" />
                  <h3 className="font-semibold">Datos Fiscales</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreFiscal">Nombre Fiscal *</Label>
                    <Input
                      id="nombreFiscal"
                      value={nombreFiscal}
                      onChange={(e) => setNombreFiscal(e.target.value)}
                      placeholder="Ej: Disarmink S.L."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cif">CIF *</Label>
                    <Input
                      id="cif"
                      value={cif}
                      onChange={(e) => setCif(e.target.value)}
                      placeholder="Ej: B67284315"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domicilioFiscal">Domicilio Fiscal *</Label>
                  <Input
                    id="domicilioFiscal"
                    value={domicilioFiscal}
                    onChange={(e) => setDomicilioFiscal(e.target.value)}
                    placeholder="Dirección completa"
                  />
                </div>

                <Separator />

                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-5 h-5 text-[#ED1C24]" />
                  <h3 className="font-semibold">Datos Comerciales</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreComercial">Nombre Comercial *</Label>
                    <Input
                      id="nombreComercial"
                      value={nombreComercial}
                      onChange={(e) => setNombreComercial(e.target.value)}
                      placeholder="Ej: Hoy Pecamos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="convenio">Convenio Colectivo (Opcional)</Label>
                    <Input
                      id="convenio"
                      value={convenioColectivoId}
                      onChange={(e) => setConvenioColectivoId(e.target.value)}
                      placeholder="ID del convenio"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="empresaActiva">Estado de la Empresa</Label>
                    <Badge variant={empresaActiva ? 'default' : 'secondary'} className={empresaActiva ? 'bg-green-600' : ''}>
                      {empresaActiva ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <Switch
                    id="empresaActiva"
                    checked={empresaActiva}
                    onCheckedChange={setEmpresaActiva}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: MARCAS */}
          <TabsContent value="marcas" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Gestiona las marcas de la empresa
              </p>
              <Button onClick={añadirMarca} size="sm" className="bg-[#ED1C24] hover:bg-[#C91119]">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Marca
              </Button>
            </div>

            {marcas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No hay marcas añadidas</p>
                  <Button onClick={añadirMarca} variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Primera Marca
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {marcas.map((marca, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {/* Logo Preview */}
                        <div className="flex-shrink-0">
                          <div className="relative w-20 h-20 bg-black rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200">
                            {marca.logoUrl ? (
                              <img
                                src={marca.logoUrl}
                                alt={marca.marcaNombre}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(index, e)}
                            className="hidden"
                            id={`logo-upload-${index}`}
                          />
                          <label
                            htmlFor={`logo-upload-${index}`}
                            className="mt-2 flex items-center justify-center gap-1 text-xs text-[#ED1C24] cursor-pointer hover:underline"
                          >
                            <Upload className="w-3 h-3" />
                            Subir
                          </label>
                        </div>

                        {/* Datos de la Marca */}
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label>Nombre de la Marca *</Label>
                              <Input
                                value={marca.marcaNombre}
                                onChange={(e) => actualizarMarca(index, 'marcaNombre', e.target.value)}
                                placeholder="Ej: Modomio"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Código</Label>
                              <Input
                                value={marca.marcaCodigo}
                                disabled
                                className="bg-gray-100"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label>Color de Identidad</Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={marca.colorIdentidad}
                                onChange={(e) => actualizarMarca(index, 'colorIdentidad', e.target.value)}
                                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                              />
                              <Input
                                value={marca.colorIdentidad}
                                onChange={(e) => actualizarMarca(index, 'colorIdentidad', e.target.value)}
                                placeholder="#000000"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Botón Eliminar */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarMarca(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: PUNTOS DE VENTA */}
          <TabsContent value="pdvs" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Gestiona los puntos de venta de la empresa
              </p>
              <Button onClick={añadirPuntoVenta} size="sm" className="bg-[#ED1C24] hover:bg-[#C91119]">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Punto de Venta
              </Button>
            </div>

            {puntosVenta.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No hay puntos de venta añadidos</p>
                  <Button onClick={añadirPuntoVenta} variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Primer Punto de Venta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {puntosVenta.map((pdv, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-[#ED1C24]" />
                          <h4 className="font-semibold">Punto de Venta #{index + 1}</h4>
                          <Badge variant={pdv.activo ? 'default' : 'secondary'} className={pdv.activo ? 'bg-green-600' : ''}>
                            {pdv.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={pdv.activo}
                            onCheckedChange={(checked) => actualizarPuntoVenta(index, 'activo', checked)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => eliminarPuntoVenta(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Nombre Comercial *</Label>
                          <Input
                            value={pdv.pvNombreComercial}
                            onChange={(e) => actualizarPuntoVenta(index, 'pvNombreComercial', e.target.value)}
                            placeholder="Ej: Tiana"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Dirección *</Label>
                          <Input
                            value={pdv.pvDireccion}
                            onChange={(e) => actualizarPuntoVenta(index, 'pvDireccion', e.target.value)}
                            placeholder="Calle, número, ciudad"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            Teléfono
                          </Label>
                          <Input
                            value={pdv.pvTelefono}
                            onChange={(e) => actualizarPuntoVenta(index, 'pvTelefono', e.target.value)}
                            placeholder="+34 933 456 789"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Email
                          </Label>
                          <Input
                            value={pdv.pvEmail}
                            onChange={(e) => actualizarPuntoVenta(index, 'pvEmail', e.target.value)}
                            placeholder="contacto@ejemplo.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Marcas Disponibles en este PDV *</Label>
                        <div className="flex flex-wrap gap-2">
                          {marcas.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay marcas disponibles. Añade marcas primero.</p>
                          ) : (
                            marcas.map((marca) => (
                              <Badge
                                key={marca.marcaCodigo}
                                variant={pdv.marcasDisponibles?.includes(marca.marcaCodigo) ? 'default' : 'outline'}
                                className="cursor-pointer hover:opacity-80"
                                style={{
                                  backgroundColor: pdv.marcasDisponibles?.includes(marca.marcaCodigo) ? marca.colorIdentidad : 'transparent',
                                  borderColor: marca.colorIdentidad,
                                  color: pdv.marcasDisponibles?.includes(marca.marcaCodigo) ? '#fff' : marca.colorIdentidad
                                }}
                                onClick={() => toggleMarcaEnPDV(index, marca.marcaCodigo)}
                              >
                                {marca.marcaNombre}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: CUENTAS BANCARIAS */}
          <TabsContent value="cuentas" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Gestiona las cuentas bancarias de la empresa
              </p>
              <Button onClick={añadirCuentaBancaria} size="sm" className="bg-[#ED1C24] hover:bg-[#C91119]">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Cuenta
              </Button>
            </div>

            {cuentasBancarias.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No hay cuentas bancarias añadidas</p>
                  <Button onClick={añadirCuentaBancaria} variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir Primera Cuenta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {cuentasBancarias.map((cuenta, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <CreditCard className="w-5 h-5 text-[#ED1C24] mt-2" />
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>IBAN *</Label>
                            <Input
                              value={cuenta.iban}
                              onChange={(e) => actualizarCuentaBancaria(index, 'iban', e.target.value)}
                              placeholder="ES00 0000 0000 00 0000000000"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Alias de la Cuenta *</Label>
                            <Input
                              value={cuenta.aliasCuenta}
                              onChange={(e) => actualizarCuentaBancaria(index, 'aliasCuenta', e.target.value)}
                              placeholder="Ej: Cuenta Principal"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarCuentaBancaria(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            * Campos obligatorios
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} className="bg-[#ED1C24] hover:bg-[#C91119]">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
