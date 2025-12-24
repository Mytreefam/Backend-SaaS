import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { X, Plus, Minus } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface OpcionPersonalizacion {
  id: string;
  nombre: string;
  precioAdicional?: number;
}

interface GrupoOpciones {
  id: string;
  titulo: string;
  descripcion?: string;
  obligatorio: boolean;
  minSeleccion?: number;
  maxSeleccion?: number;
  opciones: OpcionPersonalizacion[];
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  gruposOpciones?: GrupoOpciones[];
}

interface ProductoPersonalizacionModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  // 🎯 NUEVO: Callback mejorado que recibe opciones en formato estructurado
  onAddToCart: (producto: Producto, opcionesEstructuradas: Array<{
    grupoId: string;
    grupoTitulo: string;
    opciones: Array<{
      opcionId: string;
      nombre: string;
      precioAdicional: number;
    }>;
  }>, cantidad: number) => void;
}

export function ProductoPersonalizacionModal({ 
  producto, 
  isOpen, 
  onClose, 
  onAddToCart 
}: ProductoPersonalizacionModalProps) {
  const [cantidad, setCantidad] = useState(1);
  const [opcionesSeleccionadas, setOpcionesSeleccionadas] = useState<Record<string, string[]>>({});

  if (!producto) return null;

  const handleOpcionChange = (grupoId: string, opcionId: string, multiple: boolean) => {
    setOpcionesSeleccionadas(prev => {
      if (multiple) {
        const current = prev[grupoId] || [];
        const exists = current.includes(opcionId);
        return {
          ...prev,
          [grupoId]: exists 
            ? current.filter(id => id !== opcionId)
            : [...current, opcionId]
        };
      } else {
        return {
          ...prev,
          [grupoId]: [opcionId]
        };
      }
    });
  };

  const calcularPrecioTotal = () => {
    let total = producto.precio * cantidad;
    
    // Sumar precios adicionales de las opciones
    if (producto.gruposOpciones) {
      producto.gruposOpciones.forEach(grupo => {
        const seleccionadas = opcionesSeleccionadas[grupo.id] || [];
        seleccionadas.forEach(opcionId => {
          const opcion = grupo.opciones.find(o => o.id === opcionId);
          if (opcion?.precioAdicional) {
            total += opcion.precioAdicional * cantidad;
          }
        });
      });
    }
    
    return total;
  };

  const validarSeleccion = () => {
    if (!producto.gruposOpciones) return true;
    
    return producto.gruposOpciones.every(grupo => {
      if (!grupo.obligatorio) return true;
      const seleccionadas = opcionesSeleccionadas[grupo.id] || [];
      const minimo = grupo.minSeleccion || 1;
      return seleccionadas.length >= minimo;
    });
  };

  const handleAgregar = () => {
    if (!validarSeleccion()) return;
    
    // 🎯 NUEVO: Preparar opciones en formato estructurado
    const opcionesEstructuradas = producto.gruposOpciones?.map(grupo => {
      const seleccionadas = opcionesSeleccionadas[grupo.id] || [];
      return {
        grupoId: grupo.id,
        grupoTitulo: grupo.titulo,
        opciones: seleccionadas.map(opcionId => {
          const opcion = grupo.opciones.find(o => o.id === opcionId) as OpcionPersonalizacion;
          return {
            opcionId: opcion.id,
            nombre: opcion.nombre,
            precioAdicional: opcion.precioAdicional || 0
          };
        })
      };
    }) || [];

    onAddToCart(producto, opcionesEstructuradas, cantidad);
    
    // Resetear
    setCantidad(1);
    setOpcionesSeleccionadas({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {producto.nombre}
          </DialogTitle>
          <DialogDescription>
            {producto.descripcion}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Imagen del producto */}
          {producto.imagen && (
            <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-100">
              <ImageWithFallback 
                src={producto.imagen} 
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Precio base */}
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <p className="text-sm text-gray-600 mb-1">Precio base</p>
            <p className="text-3xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
              €{producto.precio.toFixed(2)}
            </p>
          </div>

          {/* Grupos de opciones */}
          {producto.gruposOpciones?.map((grupo) => {
            const esMultiple = (grupo.maxSeleccion || 1) > 1;
            const seleccionadas = opcionesSeleccionadas[grupo.id] || [];
            
            return (
              <div key={grupo.id} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {grupo.titulo}
                      {grupo.minSeleccion && (
                        <span className="text-sm">
                          ({grupo.minSeleccion} {grupo.minSeleccion > 1 ? 'unidades' : 'unidad'})
                        </span>
                      )}
                      {grupo.obligatorio && (
                        <Badge variant="destructive" className="text-xs">*</Badge>
                      )}
                    </h3>
                    {grupo.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{grupo.descripcion}</p>
                    )}
                    {grupo.obligatorio && (
                      <p className="text-xs text-gray-500 mt-1">Selección obligatoria</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {esMultiple ? (
                    // Checkboxes para selección múltiple
                    grupo.opciones.map((opcion) => {
                      const isSelected = seleccionadas.includes(opcion.id);
                      return (
                        <button
                          key={opcion.id}
                          onClick={() => handleOpcionChange(grupo.id, opcion.id, true)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-teal-600 bg-teal-50' 
                              : 'border-gray-200 hover:border-teal-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'bg-teal-600 border-teal-600' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none"/>
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{opcion.nombre}</span>
                            </div>
                            {opcion.precioAdicional && opcion.precioAdicional > 0 && (
                              <span className="text-teal-600 font-medium">
                                +€{opcion.precioAdicional.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    // Radio buttons para selección única
                    <RadioGroup
                      value={seleccionadas[0] || ''}
                      onValueChange={(value) => handleOpcionChange(grupo.id, value, false)}
                    >
                      {grupo.opciones.map((opcion) => (
                        <label
                          key={opcion.id}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            seleccionadas[0] === opcion.id
                              ? 'border-teal-600 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={opcion.id} id={opcion.id} />
                            <Label htmlFor={opcion.id} className="cursor-pointer font-medium">
                              {opcion.nombre}
                            </Label>
                          </div>
                          {opcion.precioAdicional && opcion.precioAdicional > 0 && (
                            <span className="text-teal-600 font-medium">
                              +€{opcion.precioAdicional.toFixed(2)}
                            </span>
                          )}
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              </div>
            );
          })}

          {/* Cantidad */}
          <div className="bg-gray-50 p-4 rounded-lg">
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
                onClick={() => setCantidad(cantidad + 1)}
                className="touch-target h-10 w-10 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Total y botón agregar */}
          <div className="sticky bottom-0 bg-white pt-4 border-t-2">
            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
              <div>
                <p className="text-sm text-gray-600">Total:</p>
                <p className="text-3xl font-semibold text-teal-600" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  €{calcularPrecioTotal().toFixed(2)}
                </p>
              </div>
              <Button
                onClick={handleAgregar}
                disabled={!validarSeleccion()}
                className="bg-teal-600 hover:bg-teal-700 h-12 px-8"
              >
                Agregar al carrito
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}