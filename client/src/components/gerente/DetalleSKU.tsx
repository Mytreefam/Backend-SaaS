import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import {
  Package,
  Edit,
  Minus,
  ShoppingCart,
  ArrowRightLeft,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  FileText,
  Boxes
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DetalleSKUProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  skuId: string;
}

interface Lote {
  id: string;
  numero: string;
  cantidad: number;
  caducidad?: string;
  proveedor: string;
  recepcion: string;
}

interface Movimiento {
  id: string;
  fecha: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  cantidad: number;
  concepto: string;
  responsable: string;
  referencia?: string;
}

interface Proveedor {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  leadTime: number;
  preferente: boolean;
}

interface Sustituto {
  id: string;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

export function DetalleSKU({ isOpen, onOpenChange, skuId }: DetalleSKUProps) {
  const [vistaActual, setVistaActual] = useState<'ficha' | 'lotes' | 'movimientos' | 'proveedores' | 'sustitutos'>('ficha');

  // Datos simulados del SKU
  const sku = {
    id: 'SKU001',
    codigo: 'ACE-5W30-5L',
    nombre: 'Aceite Motor 5W30 - 5L',
    imagen: undefined,
    categoria: 'Lubricantes',
    almacen: '01 Taller',
    ubicacionJerarquica: {
      almacen: '01 Taller',
      pasillo: 'A',
      estanteria: '12',
      hueco: '03'
    },
    unidad: 'Litros',
    disponible: 15,
    comprometido: 3,
    enTransito: 20,
    minimo: 5,
    maximo: 25,
    rop: 10,
    leadTime: 3,
    costoMedio: 24.50,
    costoUltimo: 24.80,
    pvp: 35.90,
    iva: 21,
    margen: 46.5,
    rotacion: 12.5,
    proveedorPreferente: 'Lubricentro SA',
    codigoProveedor: 'LUB-5W30-5L',
    descripcion: 'Aceite sintético para motor de gasolina y diésel. Especificaciones ACEA C3, API SN/CF.',
  };

  const lotes: Lote[] = [
    { id: 'L001', numero: 'L2025-02-01', cantidad: 10, caducidad: '2027-02-15', proveedor: 'Lubricentro SA', recepcion: '2025-02-01' },
    { id: 'L002', numero: 'L2025-01-15', cantidad: 5, caducidad: '2027-01-20', proveedor: 'Lubricentro SA', recepcion: '2025-01-15' },
  ];

  const movimientos: Movimiento[] = [
    { id: 'M001', fecha: '2025-11-11T10:30:00', tipo: 'salida', cantidad: -2, concepto: 'Consumo OT-2025-001', responsable: 'Carlos Méndez', referencia: 'OT-2025-001' },
    { id: 'M002', fecha: '2025-11-10T15:20:00', tipo: 'entrada', cantidad: 20, concepto: 'Recepción Albarán ALB-2025-847', responsable: 'Ana García', referencia: 'ALB-2025-847' },
    { id: 'M003', fecha: '2025-11-09T09:15:00', tipo: 'salida', cantidad: -1, concepto: 'Venta directa', responsable: 'Carlos Méndez', referencia: 'VD-2025-042' },
    { id: 'M004', fecha: '2025-11-08T14:45:00', tipo: 'ajuste', cantidad: -3, concepto: 'Ajuste por inventario', responsable: 'Sistema', referencia: 'INV-2025-11' },
  ];

  const proveedores: Proveedor[] = [
    { id: 'P001', nombre: 'Lubricentro SA', codigo: 'LUB-5W30-5L', precio: 24.50, leadTime: 3, preferente: true },
    { id: 'P002', nombre: 'Distribuidora Aceites Pro', codigo: 'DAP-5W30-5L', precio: 25.20, leadTime: 5, preferente: false },
    { id: 'P003', nombre: 'Mayorista Oil Express', codigo: 'MOE-ACE-5W30', precio: 24.00, leadTime: 7, preferente: false },
  ];

  const sustitutos: Sustituto[] = [
    { id: 'S001', codigo: 'ACE-5W40-5L', nombre: 'Aceite Motor 5W40 - 5L', precio: 36.90, stock: 8 },
    { id: 'S002', codigo: 'ACE-10W40-5L', nombre: 'Aceite Motor 10W40 - 5L', precio: 32.50, stock: 12 },
  ];

  const handleMaterialUsado = () => {
    toast.info('Abriendo formulario para registrar material usado...');
  };

  const handleSolicitarPieza = () => {
    toast.success('Creando pre-pedido para este SKU...');
  };

  const handleTransferir = () => {
    toast.info('Iniciando transferencia entre almacenes...');
  };

  const handleEditar = () => {
    toast.info('Modo edición activado');
  };

  const getTipoMovimientoBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Entrada</Badge>;
      case 'salida':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Salida</Badge>;
      case 'ajuste':
        return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">Ajuste</Badge>;
      case 'transferencia':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Transferencia</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4 mb-2">
            <Avatar className="w-16 h-16">
              <AvatarImage src={sku.imagen} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {sku.codigo.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle style={{ fontFamily: 'Poppins, sans-serif' }}>
                {sku.codigo}
              </DialogTitle>
              <DialogDescription className="text-left">
                {sku.nombre}
              </DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {sku.categoria}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {sku.almacen}
                </Badge>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 flex-wrap pt-4">
            <Button onClick={handleMaterialUsado} size="sm" className="bg-red-600 hover:bg-red-700">
              <Minus className="w-4 h-4 mr-2" />
              Material usado
            </Button>
            <Button onClick={handleSolicitarPieza} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Solicitar pieza
            </Button>
            <Button onClick={handleTransferir} size="sm" variant="outline">
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transferir
            </Button>
            <Button onClick={handleEditar} size="sm" variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={vistaActual} onValueChange={(v) => setVistaActual(v as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ficha">Ficha</TabsTrigger>
            <TabsTrigger value="lotes">Lotes/Series</TabsTrigger>
            <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
            <TabsTrigger value="sustitutos">Sustitutos</TabsTrigger>
          </TabsList>

          {/* ===== FICHA ===== */}
          <TabsContent value="ficha" className="space-y-4 mt-4">
            {/* Indicadores rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Disponible</p>
                      <p className="text-xl font-semibold text-gray-900">{sku.disponible}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Comprometido</p>
                      <p className="text-xl font-semibold text-gray-900">{sku.comprometido}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">En tránsito</p>
                      <p className="text-xl font-semibold text-gray-900">{sku.enTransito}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rotación</p>
                      <p className="text-xl font-semibold text-gray-900">{sku.rotacion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Datos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identificación */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Identificación
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-gray-600">SKU</Label>
                      <p className="font-medium text-gray-900">{sku.codigo}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Unidad</Label>
                      <p className="font-medium text-gray-900">{sku.unidad}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Categoría</Label>
                      <p className="font-medium text-gray-900">{sku.categoria}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Lead Time</Label>
                      <p className="font-medium text-gray-900">{sku.leadTime} días</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-gray-600">Descripción</Label>
                    <p className="text-sm text-gray-900 mt-1">{sku.descripcion}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Ubicación jerárquica
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-gray-600">Almacén</Label>
                      <p className="font-medium text-gray-900">{sku.ubicacionJerarquica.almacen}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Pasillo</Label>
                      <p className="font-medium text-gray-900">{sku.ubicacionJerarquica.pasillo}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Estantería</Label>
                      <p className="font-medium text-gray-900">{sku.ubicacionJerarquica.estanteria}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Hueco</Label>
                      <p className="font-medium text-gray-900">{sku.ubicacionJerarquica.hueco}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-mono text-blue-900">
                      {sku.ubicacionJerarquica.almacen} → 
                      {sku.ubicacionJerarquica.pasillo}-
                      {sku.ubicacionJerarquica.estanteria}-
                      {sku.ubicacionJerarquica.hueco}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Parámetros de stock */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Parámetros de stock
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <Label className="text-gray-600">Mínimo</Label>
                      <p className="text-xl font-semibold text-red-600">{sku.minimo}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Máximo</Label>
                      <p className="text-xl font-semibold text-green-600">{sku.maximo}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">ROP</Label>
                      <p className="text-xl font-semibold text-orange-600">{sku.rop}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-gray-600 mb-2 block">Estado actual</Label>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                        style={{ width: `${(sku.disponible / sku.maximo) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{sku.minimo}</span>
                      <span>{sku.disponible}</span>
                      <span>{sku.maximo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Costos y precios */}
              <Card>
                <CardHeader>
                  <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Costos y precios
                  </h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-gray-600">Costo medio</Label>
                      <p className="text-lg font-semibold text-gray-900">{sku.costoMedio.toFixed(2)} €</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Último costo</Label>
                      <p className="text-lg font-semibold text-gray-900">{sku.costoUltimo.toFixed(2)} €</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">PVP (sin IVA)</Label>
                      <p className="text-lg font-semibold text-gray-900">{sku.pvp.toFixed(2)} €</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">IVA</Label>
                      <p className="text-lg font-semibold text-gray-900">{sku.iva}%</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Margen bruto</span>
                      <span className="font-semibold text-green-900">{sku.margen.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Proveedor preferente */}
            <Card>
              <CardHeader>
                <h3 className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Proveedor preferente
                </h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{sku.proveedorPreferente}</p>
                    <p className="text-sm text-gray-600">Código: {sku.codigoProveedor}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Preferente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== LOTES/SERIES ===== */}
          <TabsContent value="lotes" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Lote</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead>Caducidad</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Recepción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotes.map((lote) => (
                      <TableRow key={lote.id}>
                        <TableCell className="font-mono font-medium">{lote.numero}</TableCell>
                        <TableCell className="text-center font-medium">{lote.cantidad}</TableCell>
                        <TableCell>
                          {lote.caducidad ? (
                            <span className="text-sm">{new Date(lote.caducidad).toLocaleDateString('es-ES')}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{lote.proveedor}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(lote.recepcion).toLocaleDateString('es-ES')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== MOVIMIENTOS ===== */}
          <TabsContent value="movimientos" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Referencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientos.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(mov.fecha).toLocaleDateString('es-ES')}</p>
                            <p className="text-gray-500">
                              {new Date(mov.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getTipoMovimientoBadge(mov.tipo)}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${mov.cantidad > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {mov.cantidad > 0 ? '+' : ''}{mov.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{mov.concepto}</TableCell>
                        <TableCell className="text-sm">{mov.responsable}</TableCell>
                        <TableCell>
                          {mov.referencia && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {mov.referencia}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== PROVEEDORES ===== */}
          <TabsContent value="proveedores" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Lead Time</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proveedores.map((prov) => (
                      <TableRow key={prov.id}>
                        <TableCell className="font-medium">{prov.nombre}</TableCell>
                        <TableCell className="font-mono text-sm">{prov.codigo}</TableCell>
                        <TableCell className="text-right font-medium">{prov.precio.toFixed(2)} €</TableCell>
                        <TableCell className="text-center">{prov.leadTime} días</TableCell>
                        <TableCell>
                          {prov.preferente && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Preferente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SUSTITUTOS ===== */}
          <TabsContent value="sustitutos" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sustitutos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          <Boxes className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p>No hay productos sustitutos definidos</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sustitutos.map((sust) => (
                        <TableRow key={sust.id}>
                          <TableCell className="font-mono font-medium">{sust.codigo}</TableCell>
                          <TableCell>{sust.nombre}</TableCell>
                          <TableCell className="text-right font-medium">{sust.precio.toFixed(2)} €</TableCell>
                          <TableCell className="text-center font-medium">{sust.stock}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">Ver detalle</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
