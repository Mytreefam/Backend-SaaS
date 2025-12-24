import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Plus, 
  Minus, 
  ShoppingCart,
  Coffee
} from 'lucide-react';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  descripcion: string;
  destacado?: boolean;
  imagen?: string;
}

interface ProductoDetalleModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (producto: Producto, cantidad: number, tipo: 'grano' | 'molido', peso: '250g' | '1kg') => void;
}

export function ProductoDetalleModal({ producto, isOpen, onClose, onAddToCart }: ProductoDetalleModalProps) {
  const [cantidad, setCantidad] = useState(1);
  const [tipoCafe, setTipoCafe] = useState<'grano' | 'molido'>('grano');
  const [pesoCafe, setPesoCafe] = useState<'250g' | '1kg'>('250g');

  if (!producto) return null;

  const calcularPrecio = () => {
    let precioBase = producto.precio;
    if (pesoCafe === '1kg') {
      precioBase = precioBase * 3.5;
    }
    return precioBase * cantidad;
  };

  const handleAgregar = () => {
    onAddToCart(producto, cantidad, tipoCafe, pesoCafe);
    // Resetear valores
    setCantidad(1);
    setTipoCafe('grano');
    setPesoCafe('250g');
    onClose();
  };

  const esCafe = producto.categoria === 'Café' || producto.categoria === 'Mezclas';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-teal-600" />
            {producto.nombre}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Detalles del producto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagen y descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
              {producto.imagen ? (
                <ImageWithFallback 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                  <Coffee className="w-16 h-16 text-teal-400" />
                </div>
              )}
              {producto.destacado && (
                <Badge className="absolute top-3 right-3 bg-teal-600 text-white">
                  Destacado
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <Badge variant="outline">{producto.categoria}</Badge>
              <p className="text-gray-600 text-sm">{producto.descripcion}</p>
              
              <div>
                <p className="text-3xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{producto.precio.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">Por 250g</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Stock:</span>
                <span className={producto.stock > 10 ? 'text-green-600' : 'text-orange-600'}>
                  {producto.stock > 10 ? '✓ Disponible' : `Solo ${producto.stock} unidades`}
                </span>
              </div>
            </div>
          </div>

          {/* Opciones de Café */}
          {esCafe && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <Card className="border-teal-200">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tipo de Café:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={tipoCafe === 'grano' ? 'default' : 'outline'}
                      className={tipoCafe === 'grano' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setTipoCafe('grano')}
                    >
                      Grano
                    </Button>
                    <Button
                      variant={tipoCafe === 'molido' ? 'default' : 'outline'}
                      className={tipoCafe === 'molido' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setTipoCafe('molido')}
                    >
                      Molido
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Peso */}
              <Card className="border-teal-200">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Peso:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={pesoCafe === '250g' ? 'default' : 'outline'}
                      className={pesoCafe === '250g' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPesoCafe('250g')}
                    >
                      <div className="text-center">
                        <div>250g</div>
                        <div className="text-xs opacity-80">€{producto.precio.toFixed(2)}</div>
                      </div>
                    </Button>
                    <Button
                      variant={pesoCafe === '1kg' ? 'default' : 'outline'}
                      className={pesoCafe === '1kg' ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPesoCafe('1kg')}
                    >
                      <div className="text-center">
                        <div>1kg</div>
                        <div className="text-xs opacity-80">€{(producto.precio * 3.5).toFixed(2)}</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cantidad */}
          <Card className="border-teal-200">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Cantidad:</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="touch-target h-10 w-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl min-w-[3rem] text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {cantidad}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                  className="touch-target h-10 w-10 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Total y botón agregar */}
          <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
            <div>
              <p className="text-sm text-gray-600">Total:</p>
              <p className="text-2xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                €{calcularPrecio().toFixed(2)}
              </p>
              {esCafe && (
                <p className="text-xs text-gray-500 mt-1">
                  {tipoCafe === 'grano' ? 'Grano' : 'Molido'} • {pesoCafe}
                </p>
              )}
            </div>
            <Button
              onClick={handleAgregar}
              disabled={producto.stock === 0}
              className="bg-teal-600 hover:bg-teal-700 h-12 px-8"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}