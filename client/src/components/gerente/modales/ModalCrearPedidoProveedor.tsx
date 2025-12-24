import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { toast } from 'sonner@2.0.3';
import { 
  Plus, 
  Trash2, 
  Search, 
  Package,
  Calendar,
  User,
  Store,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { proveedores, Proveedor } from '../../../data/proveedores';
import { stockIngredientes } from '../../../data/stock-ingredientes';

interface LineaPedidoTemp {
  id: string;
  articuloId: string;
  articuloNombre: string;
  cantidad: number;
  unidad: 'kg' | 'litros' | 'unidades';
  precioUnitario: number;
  subtotal: number;
}

interface ModalCrearPedidoProveedorProps {
  isOpen: boolean;
  onClose: () => void;
  onCrearPedido?: (pedido: any) => void;
}

export function ModalCrearPedidoProveedor({ isOpen, onClose, onCrearPedido }: ModalCrearPedidoProveedorProps) {
  const [paso, setPaso] = useState(1); // 1: Datos generales, 2: Líneas de pedido, 3: Resumen
  
  // Datos generales
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string>('');
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [pdvDestino, setPdvDestino] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  
  // Líneas de pedido
  const [lineas, setLineas] = useState<LineaPedidoTemp[]>([]);
  const [busquedaArticulo, setBusquedaArticulo] = useState<string>('');
  
  // Cálculos
  const subtotal = lineas.reduce((sum, linea) => sum + linea.subtotal, 0);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;
  
  const proveedor = proveedores.find(p => p.id === proveedorSeleccionado);
  
  // Filtrar artículos disponibles según proveedor seleccionado
  const articulosDisponibles = proveedorSeleccionado 
    ? stockIngredientes.filter(art => 
        art.proveedor === proveedor?.nombre && 
        art.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
      )
    : [];

  const agregarLinea = (articuloId: string) => {
    const articulo = stockIngredientes.find(a => a.id === articuloId);
    if (!articulo) return;
    
    // Verificar si ya está en la lista
    if (lineas.some(l => l.articuloId === articuloId)) {
      toast.error('Este artículo ya está en el pedido');
      return;
    }
    
    const nuevaLinea: LineaPedidoTemp = {
      id: `LP-${Date.now()}`,
      articuloId: articulo.id,
      articuloNombre: articulo.nombre,
      cantidad: 1,
      unidad: articulo.unidad,
      precioUnitario: articulo.precioKg,
      subtotal: articulo.precioKg
    };
    
    setLineas([...lineas, nuevaLinea]);
    setBusquedaArticulo('');
    toast.success(`${articulo.nombre} añadido al pedido`);
  };
  
  const actualizarCantidad = (lineaId: string, cantidad: number) => {
    if (cantidad <= 0) return;
    
    setLineas(lineas.map(linea => 
      linea.id === lineaId 
        ? { ...linea, cantidad, subtotal: cantidad * linea.precioUnitario }
        : linea
    ));
  };
  
  const eliminarLinea = (lineaId: string) => {
    setLineas(lineas.filter(linea => linea.id !== lineaId));
    toast.info('Línea eliminada');
  };
  
  const validarPaso1 = () => {
    if (!proveedorSeleccionado) {
      toast.error('Selecciona un proveedor');
      return false;
    }
    if (!fechaEntrega) {
      toast.error('Indica la fecha de entrega esperada');
      return false;
    }
    if (!pdvDestino) {
      toast.error('Selecciona el punto de venta de destino');
      return false;
    }
    return true;
  };
  
  const validarPaso2 = () => {
    if (lineas.length === 0) {
      toast.error('Añade al menos un artículo al pedido');
      return false;
    }
    return true;
  };
  
  const siguientePaso = () => {
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;
    setPaso(paso + 1);
  };
  
  const anteriorPaso = () => {
    setPaso(paso - 1);
  };
  
  const crearPedido = () => {
    const numeroPedido = `PED-2024-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
    
    const nuevoPedido = {
      id: `PED-${Date.now()}`,
      numero: numeroPedido,
      proveedorId: proveedorSeleccionado,
      proveedorNombre: proveedor?.nombre || '',
      fecha: new Date(),
      fechaEntregaEsperada: new Date(fechaEntrega),
      estado: 'pendiente',
      lineas: lineas.map(l => ({
        ...l,
        cantidadRecibida: undefined
      })),
      subtotal,
      iva,
      total,
      observaciones,
      creadoPor: 'Usuario Actual', // TODO: Obtener del contexto de sesión
      pdvDestino
    };
    
    console.log('📤 EVENTO: CREAR_PEDIDO_PROVEEDOR', nuevoPedido);
    
    if (onCrearPedido) {
      onCrearPedido(nuevoPedido);
    }
    
    toast.success(`Pedido ${numeroPedido} creado correctamente`);
    cerrarModal();
  };
  
  const cerrarModal = () => {
    setPaso(1);
    setProveedorSeleccionado('');
    setFechaEntrega('');
    setPdvDestino('');
    setObservaciones('');
    setLineas([]);
    setBusquedaArticulo('');
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={cerrarModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Nuevo Pedido a Proveedor
          </DialogTitle>
        </DialogHeader>
        
        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`flex items-center gap-2 ${paso === 1 ? 'text-teal-600' : paso > 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${paso === 1 ? 'border-teal-600 bg-teal-50' : paso > 1 ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
              {paso > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm hidden sm:inline">Datos generales</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${paso === 2 ? 'text-teal-600' : paso > 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${paso === 2 ? 'border-teal-600 bg-teal-50' : paso > 2 ? 'border-green-600 bg-green-50' : 'border-gray-300'}`}>
              {paso > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="text-sm hidden sm:inline">Artículos</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className={`flex items-center gap-2 ${paso === 3 ? 'text-teal-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${paso === 3 ? 'border-teal-600 bg-teal-50' : 'border-gray-300'}`}>
              3
            </div>
            <span className="text-sm hidden sm:inline">Resumen</span>
          </div>
        </div>
        
        {/* PASO 1: Datos generales */}
        {paso === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Proveedor */}
              <div>
                <Label>Proveedor *</Label>
                <Select value={proveedorSeleccionado} onValueChange={setProveedorSeleccionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.filter(p => p.activo).map(proveedor => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        <div className="flex items-center gap-2">
                          <span>{proveedor.nombre}</span>
                          <Badge variant="outline" className="text-xs">
                            {proveedor.categoria}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Fecha de entrega */}
              <div>
                <Label>Fecha de entrega esperada *</Label>
                <Input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {/* PDV Destino */}
              <div>
                <Label>Punto de Venta Destino *</Label>
                <Select value={pdvDestino} onValueChange={setPdvDestino}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona destino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiana">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Tiana
                      </div>
                    </SelectItem>
                    <SelectItem value="badalona">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        Badalona
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Información del proveedor seleccionado */}
            {proveedor && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Contacto</p>
                      <p className="font-medium">{proveedor.contacto.nombreResponsable}</p>
                      <p className="text-gray-600">{proveedor.contacto.telefono}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Condiciones</p>
                      <p className="font-medium">Entrega: {proveedor.condicionesComerciales.plazoEntrega} días</p>
                      <p className="text-gray-600">Pedido mín: €{proveedor.condicionesComerciales.pedidoMinimo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Evaluación</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">⭐ {proveedor.evaluacion.calidad}/5</Badge>
                        <Badge variant="outline">🚚 {proveedor.evaluacion.puntualidad}/5</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Observaciones */}
            <div>
              <Label>Observaciones</Label>
              <Textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Añade notas o instrucciones especiales..."
                rows={3}
              />
            </div>
          </div>
        )}
        
        {/* PASO 2: Líneas de pedido */}
        {paso === 2 && (
          <div className="space-y-4">
            {/* Buscador de artículos */}
            <div>
              <Label>Buscar artículo</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={busquedaArticulo}
                    onChange={(e) => setBusquedaArticulo(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Resultados de búsqueda */}
              {busquedaArticulo && articulosDisponibles.length > 0 && (
                <Card className="mt-2 max-h-48 overflow-y-auto">
                  <CardContent className="p-2">
                    {articulosDisponibles.map(articulo => (
                      <div
                        key={articulo.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => agregarLinea(articulo.id)}
                      >
                        <div>
                          <p className="font-medium text-sm">{articulo.nombre}</p>
                          <p className="text-xs text-gray-500">
                            €{articulo.precioKg.toFixed(2)} / {articulo.unidad}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Separator />
            
            {/* Lista de líneas */}
            <div className="space-y-2">
              <Label>Artículos en el pedido ({lineas.length})</Label>
              {lineas.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="py-8 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      No hay artículos en el pedido
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Busca y añade artículos usando el buscador
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {lineas.map(linea => (
                    <Card key={linea.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{linea.articuloNombre}</p>
                            <p className="text-xs text-gray-500">
                              €{linea.precioUnitario.toFixed(2)} / {linea.unidad}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={linea.cantidad}
                              onChange={(e) => actualizarCantidad(linea.id, parseFloat(e.target.value))}
                              className="w-20 text-center"
                              min="0.1"
                              step="0.1"
                            />
                            <span className="text-sm text-gray-500 w-16">{linea.unidad}</span>
                            <span className="text-sm font-semibold w-24 text-right">
                              €{linea.subtotal.toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => eliminarLinea(linea.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            {/* Totales parciales */}
            {lineas.length > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>IVA (21%):</span>
                    <span>€{iva.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-teal-600 text-lg">€{total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* PASO 3: Resumen */}
        {paso === 3 && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Proveedor</p>
                    <p className="font-semibold">{proveedor?.nombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entrega esperada</p>
                    <p className="font-semibold">
                      {new Date(fechaEntrega).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Destino</p>
                    <p className="font-semibold capitalize">{pdvDestino}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Artículos</p>
                    <p className="font-semibold">{lineas.length} líneas</p>
                  </div>
                </div>
                {observaciones && (
                  <div>
                    <p className="text-gray-600 text-sm">Observaciones</p>
                    <p className="text-sm">{observaciones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div>
              <Label className="mb-2 block">Detalle del pedido</Label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lineas.map(linea => (
                  <Card key={linea.id} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{linea.articuloNombre}</p>
                          <p className="text-xs text-gray-500">
                            {linea.cantidad} {linea.unidad} × €{linea.precioUnitario.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">€{linea.subtotal.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Card className="bg-teal-50 border-teal-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (21%):</span>
                    <span>€{iva.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-semibold text-teal-600 text-xl">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {proveedor && total < proveedor.condicionesComerciales.pedidoMinimo && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-amber-900">Atención: Pedido por debajo del mínimo</p>
                    <p className="text-amber-700">
                      Este proveedor requiere un pedido mínimo de €{proveedor.condicionesComerciales.pedidoMinimo}.
                      Faltan €{(proveedor.condicionesComerciales.pedidoMinimo - total).toFixed(2)}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        
        {/* Botones de navegación */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={paso === 1 ? cerrarModal : anteriorPaso}
          >
            {paso === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          
          {paso < 3 ? (
            <Button
              onClick={siguientePaso}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={crearPedido}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Crear Pedido
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
