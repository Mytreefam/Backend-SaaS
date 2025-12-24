import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Printer, Check, X, RefreshCw, AlertCircle, RotateCcw, Ban } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Pedido, PermisosTPV } from './TPV360Master';

interface PanelOperativaAvanzadoProps {
  pedidos: Pedido[];
  onCancelar: (pedidoId: string, motivo: string) => void;
  onDevolver: (pedidoId: string, motivo: string) => void;
  permisos: PermisosTPV;
}

export function PanelOperativaAvanzado({ 
  pedidos, 
  onCancelar, 
  onDevolver,
  permisos 
}: PanelOperativaAvanzadoProps) {
  
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalDevolver, setModalDevolver] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [tipoDevolucion, setTipoDevolucion] = useState<'total' | 'parcial'>('total');

  // Motivos predefinidos
  const motivosCancelacion = [
    'Cliente no se presenta',
    'Error en el pedido',
    'Falta de stock',
    'Cliente cancela',
    'Tiempo de espera excesivo',
    'Otro'
  ];

  const motivosDevolucion = [
    'Producto defectuoso',
    'Error en el pedido',
    'Cliente no satisfecho',
    'Producto en mal estado',
    'Pedido incompleto',
    'Otro'
  ];

  const reimprimirTicket = (pedidoId: string, tipo: string) => {
    if (!permisos.reimprimir_tickets) {
      toast.error('No tienes permisos para reimprimir tickets');
      return;
    }
    toast.success(`Reimprimiendo ticket de ${tipo} para pedido ${pedidoId}`);
  };

  const abrirModalCancelar = (pedido: Pedido) => {
    if (!permisos.acceso_operativa) {
      toast.error('No tienes permisos para cancelar pedidos');
      return;
    }
    setPedidoSeleccionado(pedido);
    setMotivoCancelacion('');
    setModalCancelar(true);
  };

  const abrirModalDevolver = (pedido: Pedido) => {
    if (!permisos.acceso_operativa) {
      toast.error('No tienes permisos para procesar devoluciones');
      return;
    }
    setPedidoSeleccionado(pedido);
    setMotivoDevolucion('');
    setTipoDevolucion('total');
    setModalDevolver(true);
  };

  const confirmarCancelacion = () => {
    if (!motivoCancelacion) {
      toast.error('Debes indicar un motivo de cancelación');
      return;
    }

    if (!pedidoSeleccionado) return;

    onCancelar(pedidoSeleccionado.id, motivoCancelacion);
    setModalCancelar(false);
    setPedidoSeleccionado(null);
    setMotivoCancelacion('');
  };

  const confirmarDevolucion = () => {
    if (!motivoDevolucion) {
      toast.error('Debes indicar un motivo de devolución');
      return;
    }

    if (!pedidoSeleccionado) return;

    const motivoCompleto = `${tipoDevolucion === 'total' ? 'TOTAL' : 'PARCIAL'}: ${motivoDevolucion}`;
    onDevolver(pedidoSeleccionado.id, motivoCompleto);
    setModalDevolver(false);
    setPedidoSeleccionado(null);
    setMotivoDevolucion('');
  };

  // Simular estado de impresión
  const obtenerEstadoImpresion = (pedidoId: string): 'ok' | 'error' | 'pendiente' => {
    const random = Math.random();
    if (pedidoId.endsWith('1')) return 'error';
    if (pedidoId.endsWith('2')) return 'pendiente';
    return 'ok';
  };

  // Obtener categorías únicas de cada pedido
  const obtenerCategorias = (items: Pedido['items']): string[] => {
    const categorias = new Set<string>();
    items.forEach(item => {
      if (item.producto.categoria) {
        categorias.add(item.producto.categoria);
      }
    });
    return Array.from(categorias);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_preparacion':
        return <Badge className="bg-yellow-100 text-yellow-800">En Preparación</Badge>;
      case 'listo':
        return <Badge className="bg-green-100 text-green-800">Listo</Badge>;
      case 'entregado':
        return <Badge className="bg-blue-100 text-blue-800">Entregado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      case 'devuelto':
        return <Badge className="bg-purple-100 text-purple-800">Devuelto</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Panel de Operativa Avanzado
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Gestión de impresiones, cancelaciones y devoluciones
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {/* Vista MÓVIL - Cards mejoradas */}
          <div className="block lg:hidden space-y-3">
            {pedidos.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No hay pedidos para mostrar
              </div>
            ) : (
              pedidos.map((pedido) => {
                const categorias = obtenerCategorias(pedido.items);
                const estadoImpresion = obtenerEstadoImpresion(pedido.id);
                
                return (
                  <Card key={pedido.id} className="border-l-4 border-l-teal-600 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      {/* Cabecera: Código, Estado e Impresión */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {pedido.codigo}
                            </span>
                            {getEstadoBadge(pedido.estado)}
                          </div>
                          <div className="text-sm text-gray-700">{pedido.cliente.nombre}</div>
                          <div className="text-xs text-gray-500">{pedido.cliente.telefono}</div>
                        </div>
                        
                        {/* Estado impresión - Esquina */}
                        <div className="flex flex-col items-end gap-1">
                          {estadoImpresion === 'ok' && (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                              <Check className="w-4 h-4" />
                              <span className="text-xs">OK</span>
                            </div>
                          )}
                          {estadoImpresion === 'error' && (
                            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                              <X className="w-4 h-4" />
                              <span className="text-xs">Error</span>
                            </div>
                          )}
                          {estadoImpresion === 'pendiente' && (
                            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              <RefreshCw className="w-4 h-4" />
                              <span className="text-xs">Pend</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Categorías */}
                      {categorias.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {categorias.map(cat => (
                            <Badge key={cat} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Productos - Lista simple */}
                      <div className="border-t pt-2">
                        <div className="text-xs text-gray-700 space-y-1">
                          {pedido.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{item.producto.nombre}</span>
                              <span className="text-gray-500">x{item.cantidad}</span>
                            </div>
                          ))}
                          {pedido.items.length > 3 && (
                            <div className="text-gray-400 italic text-center pt-1">
                              +{pedido.items.length - 3} productos más
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acciones - Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reimprimirTicket(pedido.id, 'Cocina')}
                          disabled={!permisos.reimprimir_tickets}
                          className="h-10 text-xs flex-col gap-1 py-1"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Imprimir</span>
                        </Button>
                        
                        {pedido.estado !== 'cancelado' && pedido.estado !== 'devuelto' && pedido.estado !== 'entregado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirModalCancelar(pedido)}
                            disabled={!permisos.acceso_operativa}
                            className="h-10 text-xs flex-col gap-1 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Ban className="w-4 h-4" />
                            <span>Cancelar</span>
                          </Button>
                        )}
                        
                        {(pedido.estado === 'entregado' || pedido.estado === 'listo') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirModalDevolver(pedido)}
                            disabled={!permisos.acceso_operativa}
                            className="h-10 text-xs flex-col gap-1 py-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Devolver</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Vista DESKTOP - Tabla */}
          <div className="hidden lg:block rounded-lg border overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-teal-600 hover:bg-teal-600">
                  <TableHead className="text-white">Código</TableHead>
                  <TableHead className="text-white">Cliente</TableHead>
                  <TableHead className="text-white">Categorías</TableHead>
                  <TableHead className="text-white">Productos</TableHead>
                  <TableHead className="text-white">Estado</TableHead>
                  <TableHead className="text-white text-center">Impresión</TableHead>
                  <TableHead className="text-white text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No hay pedidos para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  pedidos.map((pedido) => {
                    const categorias = obtenerCategorias(pedido.items);
                    const estadoImpresion = obtenerEstadoImpresion(pedido.id);
                    
                    return (
                      <TableRow key={pedido.id} className="hover:bg-gray-50">
                        <TableCell>
                          <span className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {pedido.codigo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{pedido.cliente.nombre}</p>
                            <p className="text-xs text-gray-600">{pedido.cliente.telefono}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {categorias.length > 0 ? (
                              categorias.map(cat => (
                                <Badge key={cat} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">General</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-gray-600 max-w-[200px]">
                            {pedido.items.slice(0, 2).map((item, idx) => (
                              <div key={idx}>
                                {item.cantidad}x {item.producto.nombre}
                              </div>
                            ))}
                            {pedido.items.length > 2 && (
                              <div className="text-gray-400 italic">
                                +{pedido.items.length - 2} más...
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(pedido.estado)}
                        </TableCell>
                        <TableCell className="text-center">
                          {estadoImpresion === 'ok' && (
                            <div className="flex items-center justify-center gap-1 text-green-600">
                              <Check className="w-4 h-4" />
                              <span className="text-xs">OK</span>
                            </div>
                          )}
                          {estadoImpresion === 'error' && (
                            <div className="flex items-center justify-center gap-1 text-red-600">
                              <X className="w-4 h-4" />
                              <span className="text-xs">Error</span>
                            </div>
                          )}
                          {estadoImpresion === 'pendiente' && (
                            <div className="flex items-center justify-center gap-1 text-orange-600">
                              <RefreshCw className="w-4 h-4" />
                              <span className="text-xs">Pendiente</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-center flex-wrap">
                            {/* Reimpresión */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => reimprimirTicket(pedido.id, 'Cocina')}
                              disabled={!permisos.reimprimir_tickets}
                              className="h-7 px-2 text-xs touch-target"
                            >
                              <Printer className="w-3 h-3 mr-1" />
                              Cocina
                            </Button>
                            
                            {/* Cancelar */}
                            {pedido.estado !== 'cancelado' && pedido.estado !== 'devuelto' && pedido.estado !== 'entregado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalCancelar(pedido)}
                                disabled={!permisos.acceso_operativa}
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 touch-target"
                              >
                                <Ban className="w-3 h-3 mr-1" />
                                Cancelar
                              </Button>
                            )}
                            
                            {/* Devolver */}
                            {(pedido.estado === 'entregado' || pedido.estado === 'listo') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => abrirModalDevolver(pedido)}
                                disabled={!permisos.acceso_operativa}
                                className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 touch-target"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Devolver
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas de impresión */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedidos.filter(p => obtenerEstadoImpresion(p.id) === 'ok').length}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Impresiones OK</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl text-red-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedidos.filter(p => obtenerEstadoImpresion(p.id) === 'error').length}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Errores</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedidos.filter(p => obtenerEstadoImpresion(p.id) === 'pendiente').length}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-lg sm:text-2xl text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {pedidos.length}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">Total Pedidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal Cancelar Pedido */}
      <Dialog open={modalCancelar} onOpenChange={setModalCancelar}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Ban className="w-5 h-5" />
              Cancelar Pedido
            </DialogTitle>
            <DialogDescription>
              {pedidoSeleccionado && (
                <>
                  Pedido: <strong>{pedidoSeleccionado.codigo}</strong> - Cliente: <strong>{pedidoSeleccionado.cliente.nombre}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">¡Atención!</p>
                <p>Esta acción cancelará el pedido permanentemente. Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo de Cancelación *</Label>
              <Select value={motivoCancelacion} onValueChange={setMotivoCancelacion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivosCancelacion.map(motivo => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {motivoCancelacion === 'Otro' && (
              <div className="space-y-2">
                <Label>Especifica el motivo</Label>
                <Textarea
                  placeholder="Describe el motivo de la cancelación..."
                  rows={3}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCancelar(false)}>
              Volver
            </Button>
            <Button 
              onClick={confirmarCancelacion}
              className="bg-red-600 hover:bg-red-700"
            >
              <Ban className="w-4 h-4 mr-2" />
              Confirmar Cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Devolver Pedido */}
      <Dialog open={modalDevolver} onOpenChange={setModalDevolver}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-700">
              <RotateCcw className="w-5 h-5" />
              Procesar Devolución
            </DialogTitle>
            <DialogDescription>
              {pedidoSeleccionado && (
                <>
                  Pedido: <strong>{pedidoSeleccionado.codigo}</strong> - Total: <strong>{pedidoSeleccionado.total.toFixed(2)}€</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">Información</p>
                <p>La devolución procesará el reembolso al cliente según el método de pago original.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Devolución</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tipoDevolucion === 'total' ? 'default' : 'outline'}
                  onClick={() => setTipoDevolucion('total')}
                  className={tipoDevolucion === 'total' ? 'bg-purple-600' : ''}
                >
                  Total
                </Button>
                <Button
                  variant={tipoDevolucion === 'parcial' ? 'default' : 'outline'}
                  onClick={() => setTipoDevolucion('parcial')}
                  className={tipoDevolucion === 'parcial' ? 'bg-purple-600' : ''}
                >
                  Parcial
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo de Devolución *</Label>
              <Select value={motivoDevolucion} onValueChange={setMotivoDevolucion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {motivosDevolucion.map(motivo => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {motivoDevolucion === 'Otro' && (
              <div className="space-y-2">
                <Label>Especifica el motivo</Label>
                <Textarea
                  placeholder="Describe el motivo de la devolución..."
                  rows={3}
                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDevolver(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmarDevolucion}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Procesar Devolución
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
