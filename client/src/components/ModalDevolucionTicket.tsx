import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RotateCcw, Check, X, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';

interface Pedido {
  id: string;
  codigo: string;
  cliente: { nombre: string; telefono: string };
  items: { producto: { nombre: string; precio: number }; cantidad: number; subtotal: number }[];
  total: number;
  metodoPago?: string;
  fechaCreacion: Date;
}

interface ModalDevolucionTicketProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (pedidoId: string, itemsDevueltos: string[], motivo: string, importeDevolucion: number) => void;
  pedidos: Pedido[];
}

export function ModalDevolucionTicket({ 
  isOpen, 
  onClose, 
  onConfirmar,
  pedidos 
}: ModalDevolucionTicketProps) {
  const [busquedaTicket, setBusquedaTicket] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [itemsADevolver, setItemsADevolver] = useState<Set<string>>(new Set());
  const [motivo, setMotivo] = useState('');

  const pedidosFiltrados = pedidos.filter(p => 
    p.codigo.toLowerCase().includes(busquedaTicket.toLowerCase()) ||
    p.cliente.nombre.toLowerCase().includes(busquedaTicket.toLowerCase()) ||
    p.cliente.telefono.includes(busquedaTicket)
  );

  const seleccionarPedido = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setItemsADevolver(new Set());
  };

  const toggleItem = (itemIndex: string) => {
    const newSet = new Set(itemsADevolver);
    if (newSet.has(itemIndex)) {
      newSet.delete(itemIndex);
    } else {
      newSet.add(itemIndex);
    }
    setItemsADevolver(newSet);
  };

  const calcularImporteDevolucion = () => {
    if (!pedidoSeleccionado) return 0;
    
    return pedidoSeleccionado.items
      .filter((_, idx) => itemsADevolver.has(idx.toString()))
      .reduce((total, item) => total + item.subtotal, 0);
  };

  const handleConfirmar = () => {
    if (!pedidoSeleccionado) {
      toast.error('Selecciona un ticket');
      return;
    }

    if (itemsADevolver.size === 0) {
      toast.error('Selecciona al menos un producto a devolver');
      return;
    }

    if (!motivo.trim()) {
      toast.error('Especifica el motivo de la devolución');
      return;
    }

    const itemsDevueltosArray = Array.from(itemsADevolver);
    const importeDevolucion = calcularImporteDevolucion();

    onConfirmar(pedidoSeleccionado.id, itemsDevueltosArray, motivo, importeDevolucion);
    resetear();
  };

  const resetear = () => {
    setBusquedaTicket('');
    setPedidoSeleccionado(null);
    setItemsADevolver(new Set());
    setMotivo('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  const importeDevolucion = calcularImporteDevolucion();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <RotateCcw className="w-5 h-5 text-yellow-600" />
            Devolución de Ticket
          </DialogTitle>
          <DialogDescription>
            Busca el ticket y selecciona los productos a devolver
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Panel izquierdo - Buscar ticket */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar Ticket</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código, cliente o teléfono..."
                  value={busquedaTicket}
                  onChange={(e) => setBusquedaTicket(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-[450px] overflow-y-auto bg-gray-50">
              <p className="text-sm font-medium mb-3">Tickets Recientes</p>
              <div className="space-y-2">
                {pedidosFiltrados.slice(0, 15).map(pedido => (
                  <button
                    key={pedido.id}
                    onClick={() => seleccionarPedido(pedido)}
                    className={`w-full bg-white border rounded-lg p-3 hover:shadow-md transition-all text-left ${
                      pedidoSeleccionado?.id === pedido.id ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {pedido.codigo}
                        </p>
                        <p className="text-xs text-gray-600">{pedido.cliente.nombre}</p>
                        <p className="text-xs text-gray-500">{pedido.cliente.telefono}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-yellow-600">
                          {pedido.total.toFixed(2)}€
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {pedido.metodoPago || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(pedido.fechaCreacion).toLocaleString('es-ES')}
                    </p>
                  </button>
                ))}
              </div>
              {pedidosFiltrados.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron tickets</p>
              )}
            </div>
          </div>

          {/* Panel derecho - Detalles y devolución */}
          <div className="space-y-4">
            {!pedidoSeleccionado ? (
              <div className="border rounded-lg p-6 sm:p-8 bg-gray-50 text-center">
                <RotateCcw className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                <p className="text-gray-500">Selecciona un ticket para procesar la devolución</p>
              </div>
            ) : (
              <>
                {/* Información del ticket */}
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">
                      Ticket: {pedidoSeleccionado.codigo}
                    </p>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Cliente:</strong> {pedidoSeleccionado.cliente.nombre}</p>
                    <p><strong>Total Original:</strong> {pedidoSeleccionado.total.toFixed(2)}€</p>
                    <p><strong>Método de Pago:</strong> {pedidoSeleccionado.metodoPago || 'N/A'}</p>
                  </div>
                </div>

                {/* Productos del ticket */}
                <div className="border rounded-lg p-4 bg-white">
                  <p className="text-sm font-medium mb-3">Selecciona productos a devolver:</p>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto">
                    {pedidoSeleccionado.items.map((item, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          itemsADevolver.has(idx.toString()) 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 hover:border-yellow-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={itemsADevolver.has(idx.toString())}
                          onChange={() => toggleItem(idx.toString())}
                          className="w-4 h-4 text-yellow-600"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.producto.nombre}</p>
                          <p className="text-xs text-gray-600">
                            {item.cantidad}x {item.producto.precio.toFixed(2)}€
                          </p>
                        </div>
                        <p className="font-medium text-yellow-600">
                          {item.subtotal.toFixed(2)}€
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Motivo */}
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la Devolución *</Label>
                  <Textarea
                    id="motivo"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: Producto en mal estado, error en el pedido, cliente no satisfecho..."
                    rows={3}
                    required
                  />
                </div>

                {/* Resumen de devolución */}
                {itemsADevolver.size > 0 && (
                  <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50">
                    <p className="text-sm font-medium mb-2 text-yellow-800">Resumen de Devolución</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Productos a devolver:</span>
                        <span className="font-medium">{itemsADevolver.size}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-yellow-300">
                        <span className="font-medium">Importe a devolver:</span>
                        <span className="text-xl text-yellow-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {importeDevolucion.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            className="bg-yellow-600 hover:bg-yellow-700 gap-2"
            disabled={!pedidoSeleccionado || itemsADevolver.size === 0 || !motivo.trim()}
          >
            <Check className="w-4 h-4" />
            Procesar Devolución ({importeDevolucion.toFixed(2)}€)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
