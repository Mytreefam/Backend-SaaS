import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
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
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  Clock,
  Euro,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileText,
  BarChart3
} from 'lucide-react';
import { proveedores, articulosProveedores, getArticulosByProveedor, type Proveedor } from '../../../data/proveedores';
import { toast } from 'sonner@2.0.3';

interface ModalGestionProveedoresProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalGestionProveedores({ isOpen, onOpenChange }: ModalGestionProveedoresProps) {
  const [tabActiva, setTabActiva] = useState<'lista' | 'articulos'>('lista');
  const [busqueda, setBusqueda] = useState('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [vistaDetalle, setVistaDetalle] = useState(false);

  const proveedoresFiltrados = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.some(c => c.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-green-100 text-green-700">Activo</Badge>;
      case 'inactivo':
        return <Badge variant="outline" className="text-gray-600">Inactivo</Badge>;
      case 'bloqueado':
        return <Badge className="bg-red-100 text-red-700">Bloqueado</Badge>;
      default:
        return null;
    }
  };

  const getCalidadEstrellas = (calidad: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < calidad ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const handleVerDetalles = (proveedor: Proveedor) => {
    setProveedorSeleccionado(proveedor);
    setVistaDetalle(true);
    console.log('📤 EVENTO: VER_PROVEEDOR', { id_proveedor: proveedor.id });
  };

  const handleNuevoPedido = (proveedor: Proveedor) => {
    console.log('📤 EVENTO: NUEVO_PEDIDO_PROVEEDOR', { id_proveedor: proveedor.id });
    toast.success(`Creando pedido para ${proveedor.nombre}`);
    // Aquí se abriría el modal de Nuevo Pedido con el proveedor preseleccionado
  };

  if (vistaDetalle && proveedorSeleccionado) {
    const articulosProveedor = getArticulosByProveedor(proveedorSeleccionado.id);
    
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{proveedorSeleccionado.nombre}</DialogTitle>
                <DialogDescription className="mt-2">
                  Código: {proveedorSeleccionado.codigo} • {proveedorSeleccionado.categoria.join(', ')}
                </DialogDescription>
              </div>
              <Button variant="ghost" onClick={() => setVistaDetalle(false)}>
                Volver
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Estado y métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {getEstadoBadge(proveedorSeleccionado.estado)}
                    </div>
                    <p className="text-sm text-gray-600">Estado</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex justify-center gap-1 mb-2">
                      {getCalidadEstrellas(proveedorSeleccionado.metricas.calidad)}
                    </div>
                    <p className="text-sm text-gray-600">Calidad</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">{proveedorSeleccionado.metricas.puntualidad}%</p>
                    <p className="text-sm text-gray-600">Puntualidad</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600">{proveedorSeleccionado.metricas.tiempo_entrega_medio}d</p>
                    <p className="text-sm text-gray-600">Entrega media</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información de contacto y dirección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{proveedorSeleccionado.contacto.nombre}</p>
                      <p className="text-sm text-gray-600">Responsable de cuenta</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <p className="text-sm">{proveedorSeleccionado.contacto.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm">{proveedorSeleccionado.contacto.telefono}</p>
                      {proveedorSeleccionado.contacto.telefono_secundario && (
                        <p className="text-sm text-gray-600">{proveedorSeleccionado.contacto.telefono_secundario}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dirección</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div className="text-sm">
                      <p>{proveedorSeleccionado.direccion.calle}</p>
                      <p>{proveedorSeleccionado.direccion.cp} {proveedorSeleccionado.direccion.ciudad}</p>
                      <p>{proveedorSeleccionado.direccion.provincia}, {proveedorSeleccionado.direccion.pais}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Condiciones comerciales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Condiciones Comerciales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Forma de pago</p>
                    <p className="font-medium">{proveedorSeleccionado.condiciones.forma_pago.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pedido mínimo</p>
                    <p className="font-medium">{proveedorSeleccionado.condiciones.pedido_minimo}€</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gastos envío</p>
                    <p className="font-medium">{proveedorSeleccionado.condiciones.gastos_envio}€</p>
                  </div>
                  {proveedorSeleccionado.condiciones.envio_gratis_desde && (
                    <div>
                      <p className="text-sm text-gray-600">Envío gratis desde</p>
                      <p className="font-medium">{proveedorSeleccionado.condiciones.envio_gratis_desde}€</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Catálogo de artículos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Catálogo de Artículos ({articulosProveedor.length})</CardTitle>
                <Button size="sm" onClick={() => handleNuevoPedido(proveedorSeleccionado)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Artículo</TableHead>
                      <TableHead className="text-center">Stock</TableHead>
                      <TableHead className="text-center">Precio</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articulosProveedor.map((art) => (
                      <TableRow key={art.id}>
                        <TableCell className="font-mono text-sm">{art.codigo_interno}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{art.nombre}</p>
                            <p className="text-sm text-gray-600">{art.descripcion}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div>
                            <p className={`font-medium ${art.stock_actual <= art.stock_minimo ? 'text-red-600' : 'text-green-600'}`}>
                              {art.stock_actual} {art.unidad_medida}
                            </p>
                            <p className="text-xs text-gray-500">Min: {art.stock_minimo}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <p className="font-medium">{art.precio_unitario.toFixed(2)}€</p>
                          <p className="text-xs text-gray-500">IVA {art.iva}%</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {art.activo ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {proveedorSeleccionado.notas && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{proveedorSeleccionado.notas}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Gestión de Proveedores</DialogTitle>
          <DialogDescription>
            Administra tus proveedores y su catálogo de productos
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tabActiva} onValueChange={(v: any) => setTabActiva(v)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">
              <Users className="w-4 h-4 mr-2" />
              Proveedores ({proveedores.length})
            </TabsTrigger>
            <TabsTrigger value="articulos">
              <Package className="w-4 h-4 mr-2" />
              Artículos ({articulosProveedores.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, código o categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </div>

            {/* Tabla de proveedores */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Categorías</TableHead>
                      <TableHead className="text-center">Calidad</TableHead>
                      <TableHead className="text-center">Puntualidad</TableHead>
                      <TableHead className="text-center">Entrega</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proveedoresFiltrados.map((proveedor) => (
                      <TableRow key={proveedor.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{proveedor.nombre}</p>
                            <p className="text-sm text-gray-600 font-mono">{proveedor.codigo}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {proveedor.categoria.slice(0, 2).map((cat, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                            {proveedor.categoria.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{proveedor.categoria.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-0.5">
                            {getCalidadEstrellas(proveedor.metricas.calidad)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {proveedor.metricas.puntualidad >= 95 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{proveedor.metricas.puntualidad}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{proveedor.metricas.tiempo_entrega_medio}d</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getEstadoBadge(proveedor.estado)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalles(proveedor)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleNuevoPedido(proveedor)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articulos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Catálogo Completo de Artículos</CardTitle>
                <CardDescription>
                  Todos los artículos disponibles de todos los proveedores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Artículo</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-center">Stock Actual</TableHead>
                      <TableHead className="text-center">Stock Mínimo</TableHead>
                      <TableHead className="text-center">Precio</TableHead>
                      <TableHead className="text-center">Ubicación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articulosProveedores.filter(a => a.activo).map((art) => {
                      const proveedor = proveedores.find(p => p.id === art.proveedor_id);
                      const stockBajo = art.stock_actual <= art.stock_minimo;
                      
                      return (
                        <TableRow key={art.id} className={stockBajo ? 'bg-red-50' : ''}>
                          <TableCell className="font-mono text-sm">{art.codigo_interno}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{art.nombre}</p>
                              <p className="text-sm text-gray-600">{art.categoria}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{proveedor?.nombre}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-medium ${stockBajo ? 'text-red-600' : 'text-green-600'}`}>
                              {art.stock_actual} {art.unidad_medida}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-gray-600">
                              {art.stock_minimo} {art.unidad_medida}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {art.precio_unitario.toFixed(2)}€
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {art.ubicacion_almacen || 'N/A'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
