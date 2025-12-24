import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Eye,
  Plus,
  Edit,
  Save,
  X,
  MessageCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProveedorDetalle {
  id: string;
  nombre: string;
  cif: string;
  razonSocial: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  whatsapp?: string;
  email: string;
  preferenciaContacto: 'email' | 'whatsapp' | 'telefono';
  facturacionAnioActual: number;
  facturacionAnioAnterior: number;
  pedidoMinimo: number;
  leadTime: number;
  estado: 'activo' | 'inactivo' | 'suspendido';
  rating: number;
  compras?: any[];
  acuerdos?: any[];
}

interface ModalProveedorMejoradoProps {
  open: boolean;
  onClose: () => void;
  proveedor: ProveedorDetalle | null;
}

export function ModalProveedorMejorado({ open, onClose, proveedor }: ModalProveedorMejoradoProps) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEditados, setDatosEditados] = useState(proveedor);
  const [nuevoAcuerdo, setNuevoAcuerdo] = useState({
    tipo: 'descuento',
    descripcion: '',
    valor: '',
    fechaInicio: '',
    fechaFin: '',
    condiciones: ''
  });
  const [modalNuevoAcuerdo, setModalNuevoAcuerdo] = useState(false);

  if (!proveedor) return null;

  const handleGuardar = () => {
    console.log('🔌 EVENTO: ACTUALIZAR_PROVEEDOR', {
      proveedorId: proveedor.id,
      datosAnteriores: proveedor,
      datosNuevos: datosEditados,
      endpoint: `PATCH /proveedores/${proveedor.id}`,
      timestamp: new Date()
    });

    toast.success('Proveedor actualizado', {
      description: `Los cambios en ${proveedor.nombre} se han guardado correctamente`
    });

    setModoEdicion(false);
  };

  const crearAcuerdo = () => {
    console.log('🔌 EVENTO: CREAR_ACUERDO', {
      proveedorId: proveedor.id,
      acuerdo: nuevoAcuerdo,
      endpoint: 'POST /proveedores/acuerdo',
      timestamp: new Date()
    });

    toast.success('Acuerdo creado', {
      description: 'El acuerdo se ha registrado correctamente'
    });

    setModalNuevoAcuerdo(false);
    setNuevoAcuerdo({
      tipo: 'descuento',
      descripcion: '',
      valor: '',
      fechaInicio: '',
      fechaFin: '',
      condiciones: ''
    });
  };

  // Datos de ejemplo para compras
  const comprasEjemplo = proveedor.compras || [
    {
      id: 'ORD001',
      fecha: '2024-11-20',
      numeroOrden: 'PED-2024-001',
      importe: 1250.00,
      skus: 15,
      estado: 'recibida'
    },
    {
      id: 'ORD002',
      fecha: '2024-11-10',
      numeroOrden: 'PED-2024-002',
      importe: 890.50,
      skus: 8,
      estado: 'recibida'
    },
    {
      id: 'ORD003',
      fecha: '2024-10-28',
      numeroOrden: 'PED-2024-003',
      importe: 2100.00,
      skus: 22,
      estado: 'recibida'
    }
  ];

  const acuerdosEjemplo = proveedor.acuerdos || [
    {
      id: 'ACU001',
      tipo: 'Descuento por volumen',
      descripcion: '5% descuento en pedidos >1000€',
      estado: 'activo',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    }
  ];

  const totalUltimos30Dias = comprasEjemplo
    .filter(c => new Date(c.fecha) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, c) => sum + c.importe, 0);

  const total12Meses = comprasEjemplo.reduce((sum, c) => sum + c.importe, 0);
  const precioMedio = total12Meses / comprasEjemplo.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {proveedor.nombre}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-2">
                <Badge 
                  variant={proveedor.estado === 'activo' ? 'default' : 'secondary'}
                  className={proveedor.estado === 'activo' ? 'bg-green-600' : ''}
                >
                  {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < proveedor.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!modoEdicion ? (
                <Button 
                  variant="outline"
                  onClick={() => setModoEdicion(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setModoEdicion(false);
                      setDatosEditados(proveedor);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={handleGuardar}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">
              <FileText className="w-4 h-4 mr-2" />
              Información
            </TabsTrigger>
            <TabsTrigger value="historial">
              <TrendingUp className="w-4 h-4 mr-2" />
              Historial de Compras
            </TabsTrigger>
            <TabsTrigger value="acuerdos">
              <DollarSign className="w-4 h-4 mr-2" />
              Acuerdos
            </TabsTrigger>
          </TabsList>

          {/* TAB: INFORMACIÓN */}
          <TabsContent value="info" className="space-y-6 mt-6">
            {/* Datos Fiscales */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Datos Fiscales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CIF</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.cif : proveedor.cif} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, cif: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label>Razón Social</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.razonSocial : proveedor.razonSocial} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, razonSocial: e.target.value} : null)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Dirección */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Dirección
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Dirección Completa</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.direccion : proveedor.direccion} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, direccion: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label>Ciudad</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.ciudad : proveedor.ciudad} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, ciudad: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label>Código Postal</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.codigoPostal : proveedor.codigoPostal} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, codigoPostal: e.target.value} : null)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Contacto */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-600" />
                Contacto
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={modoEdicion ? datosEditados?.telefono : proveedor.telefono} 
                      disabled={!modoEdicion}
                      onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, telefono: e.target.value} : null)}
                    />
                    {!modoEdicion && (
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={modoEdicion ? datosEditados?.whatsapp : proveedor.whatsapp || 'N/A'} 
                      disabled={!modoEdicion}
                      onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, whatsapp: e.target.value} : null)}
                    />
                    {!modoEdicion && proveedor.whatsapp && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-green-50 hover:bg-green-100"
                        onClick={() => {
                          const url = `https://wa.me/${proveedor.whatsapp?.replace(/\D/g, '')}`;
                          console.log('📱 Abrir WhatsApp:', url);
                          // window.open(url, '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={modoEdicion ? datosEditados?.email : proveedor.email} 
                      disabled={!modoEdicion}
                      onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, email: e.target.value} : null)}
                    />
                    {!modoEdicion && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const url = `mailto:${proveedor.email}`;
                          console.log('📧 Abrir Email:', url);
                          // window.location.href = url;
                        }}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Preferencia de Contacto</Label>
                  <Select 
                    value={modoEdicion ? datosEditados?.preferenciaContacto : proveedor.preferenciaContacto}
                    onValueChange={(val: any) => modoEdicion && setDatosEditados(prev => prev ? {...prev, preferenciaContacto: val} : null)}
                    disabled={!modoEdicion}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="telefono">Teléfono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Datos Comerciales */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Datos Comerciales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Facturación Año Actual</p>
                  <p className="text-2xl font-bold text-blue-600">
                    €{proveedor.facturacionAnioActual.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Facturación Año Anterior</p>
                  <p className="text-2xl font-bold text-purple-600">
                    €{proveedor.facturacionAnioAnterior.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Pedido Mínimo</Label>
                  <Input 
                    type="number"
                    value={modoEdicion ? datosEditados?.pedidoMinimo : proveedor.pedidoMinimo} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, pedidoMinimo: Number(e.target.value)} : null)}
                  />
                </div>
                <div>
                  <Label>Lead Time (días)</Label>
                  <Input 
                    type="number"
                    value={modoEdicion ? datosEditados?.leadTime : proveedor.leadTime} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, leadTime: Number(e.target.value)} : null)}
                  />
                </div>
                <div>
                  <Label>Estado del Proveedor</Label>
                  <Select 
                    value={modoEdicion ? datosEditados?.estado : proveedor.estado}
                    onValueChange={(val: any) => modoEdicion && setDatosEditados(prev => prev ? {...prev, estado: val} : null)}
                    disabled={!modoEdicion}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB: HISTORIAL DE COMPRAS */}
          <TabsContent value="historial" className="space-y-6 mt-6">
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Últimos 30 Días</p>
                <p className="text-2xl font-bold text-green-600">
                  €{totalUltimos30Dias.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total 12 Meses</p>
                <p className="text-2xl font-bold text-blue-600">
                  €{total12Meses.toFixed(2)}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Precio Medio Pedido</p>
                <p className="text-2xl font-bold text-purple-600">
                  €{precioMedio.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Lista de Órdenes */}
            <div>
              <h3 className="font-medium text-lg mb-4">Órdenes de Compra</h3>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Nº Orden</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead className="text-center">SKUs</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprasEjemplo.map((compra) => (
                      <TableRow key={compra.id}>
                        <TableCell>{new Date(compra.fecha).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{compra.numeroOrden}</TableCell>
                        <TableCell className="text-right font-bold">€{compra.importe.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{compra.skus} art.</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-600">
                            {compra.estado === 'recibida' ? 'Recibida' : compra.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              console.log('🔌 EVENTO: VER_DETALLE_COMPRA', {
                                proveedorId: proveedor.id,
                                compraId: compra.id,
                                endpoint: `GET /proveedores/${proveedor.id}/compras/${compra.id}`,
                                timestamp: new Date()
                              });
                              toast.info('Ver detalle', {
                                description: 'Mostrando detalles de la orden ' + compra.numeroOrden
                              });
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* TAB: ACUERDOS */}
          <TabsContent value="acuerdos" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Acuerdos Comerciales</h3>
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => setModalNuevoAcuerdo(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Acuerdo
              </Button>
            </div>

            {/* Acuerdos Activos */}
            <div className="space-y-4">
              {acuerdosEjemplo.map((acuerdo) => (
                <div key={acuerdo.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-lg">{acuerdo.tipo}</h4>
                        <Badge className="bg-green-600">
                          <Check className="w-3 h-3 mr-1" />
                          {acuerdo.estado}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{acuerdo.descripcion}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Desde: {new Date(acuerdo.fechaInicio).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Hasta: {new Date(acuerdo.fechaFin).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        console.log('🔌 EVENTO: EDITAR_ACUERDO', {
                          proveedorId: proveedor.id,
                          acuerdoId: acuerdo.id,
                          endpoint: `PATCH /proveedores/acuerdo/${acuerdo.id}`,
                          timestamp: new Date()
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Nuevo Acuerdo */}
            {modalNuevoAcuerdo && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Nuevo Acuerdo</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Acuerdo</Label>
                      <Select 
                        value={nuevoAcuerdo.tipo}
                        onValueChange={(val) => setNuevoAcuerdo({...nuevoAcuerdo, tipo: val})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="descuento">Descuento</SelectItem>
                          <SelectItem value="temporal">Promoción Temporal</SelectItem>
                          <SelectItem value="volumen">Descuento por Volumen</SelectItem>
                          <SelectItem value="pago">Condiciones de Pago</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Textarea 
                        value={nuevoAcuerdo.descripcion}
                        onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, descripcion: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input 
                        value={nuevoAcuerdo.valor}
                        onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, valor: e.target.value})}
                        placeholder="Ej: 5%, 100€, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Fecha Inicio</Label>
                        <Input 
                          type="date"
                          value={nuevoAcuerdo.fechaInicio}
                          onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, fechaInicio: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Fecha Fin</Label>
                        <Input 
                          type="date"
                          value={nuevoAcuerdo.fechaFin}
                          onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, fechaFin: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Condiciones</Label>
                      <Textarea 
                        value={nuevoAcuerdo.condiciones}
                        onChange={(e) => setNuevoAcuerdo({...nuevoAcuerdo, condiciones: e.target.value})}
                        rows={2}
                        placeholder="Condiciones adicionales..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setModalNuevoAcuerdo(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      onClick={crearAcuerdo}
                    >
                      Crear Acuerdo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
