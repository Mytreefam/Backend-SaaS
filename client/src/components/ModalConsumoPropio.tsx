import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Coffee, Check, X, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Badge } from './ui/badge';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
}

interface ModalConsumoPropioProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: (productos: { producto: Producto; cantidad: number }[], observaciones: string) => void;
  productosDisponibles: Producto[];
}

export function ModalConsumoPropio({ 
  isOpen, 
  onClose, 
  onConfirmar,
  productosDisponibles 
}: ModalConsumoPropioProps) {
  const [busqueda, setBusqueda] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState<{ producto: Producto; cantidad: number }[]>([]);
  const [observaciones, setObservaciones] = useState('');

  const productosFiltrados = productosDisponibles.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarProducto = (producto: Producto) => {
    const existe = productosSeleccionados.find(p => p.producto.id === producto.id);
    
    if (existe) {
      setProductosSeleccionados(
        productosSeleccionados.map(p => 
          p.producto.id === producto.id 
            ? { ...p, cantidad: p.cantidad + 1 } 
            : p
        )
      );
    } else {
      setProductosSeleccionados([...productosSeleccionados, { producto, cantidad: 1 }]);
    }
    
    toast.success(`${producto.nombre} añadido`);
  };

  const modificarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setProductosSeleccionados(productosSeleccionados.filter(p => p.producto.id !== productoId));
    } else {
      setProductosSeleccionados(
        productosSeleccionados.map(p => 
          p.producto.id === productoId ? { ...p, cantidad } : p
        )
      );
    }
  };

  const calcularTotal = () => {
    return productosSeleccionados.reduce((total, item) => 
      total + (item.producto.precio * item.cantidad), 0
    );
  };

  const handleConfirmar = () => {
    if (productosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }

    onConfirmar(productosSeleccionados, observaciones);
    resetear();
  };

  const resetear = () => {
    setBusqueda('');
    setProductosSeleccionados([]);
    setObservaciones('');
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Coffee className="w-5 h-5 text-purple-600" />
            Consumo Propio - Personal
          </DialogTitle>
          <DialogDescription>
            Registra los productos consumidos por el personal
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* Panel izquierdo - Productos disponibles */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar Productos</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto bg-gray-50">
              <p className="text-sm font-medium mb-3">Productos Disponibles</p>
              <div className="grid grid-cols-2 gap-2">
                {productosFiltrados.slice(0, 20).map(producto => (
                  <button
                    key={producto.id}
                    onClick={() => agregarProducto(producto)}
                    className="bg-white border rounded-lg p-3 hover:shadow-md hover:border-purple-500 transition-all text-left"
                  >
                    <Badge variant="outline" className="text-xs mb-1">
                      {producto.categoria}
                    </Badge>
                    <p className="font-medium text-sm line-clamp-2">{producto.nombre}</p>
                    <p className="text-purple-600 text-xs mt-1">
                      {producto.precio.toFixed(2)}€
                    </p>
                  </button>
                ))}
              </div>
              {productosFiltrados.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron productos</p>
              )}
            </div>
          </div>

          {/* Panel derecho - Productos seleccionados */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
              <p className="text-sm font-medium mb-2 text-purple-800">Productos Seleccionados</p>
              
              {productosSeleccionados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Coffee className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No hay productos seleccionados</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto mb-4">
                    {productosSeleccionados.map(item => (
                      <div key={item.producto.id} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.producto.nombre}</p>
                            <p className="text-xs text-gray-600">{item.producto.precio.toFixed(2)}€ c/u</p>
                          </div>
                          <button
                            onClick={() => modificarCantidad(item.producto.id, 0)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => modificarCantidad(item.producto.id, item.cantidad - 1)}
                              className="touch-target h-6 w-6 p-0"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => modificarCantidad(item.producto.id, item.cantidad + 1)}
                              className="touch-target h-6 w-6 p-0"
                            >
                              +
                            </Button>
                          </div>
                          <p className="font-medium text-purple-600">
                            {(item.producto.precio * item.cantidad).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-purple-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total del consumo:</span>
                      <span className="text-xl text-purple-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {calcularTotal().toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Consumo del turno de mañana, desayuno del equipo..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            className="bg-purple-600 hover:bg-purple-700 gap-2"
            disabled={productosSeleccionados.length === 0}
          >
            <Check className="w-4 h-4" />
            Registrar Consumo ({calcularTotal().toFixed(2)}€)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
