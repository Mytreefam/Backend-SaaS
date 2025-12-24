import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Separator } from '../../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import {
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  Truck,
  ShoppingCart,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ArticuloDetalle {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca?: string;
  pdv?: string;
  
  // Stock
  disponible: number;
  comprometido: number;
  minimo: number;
  optimo: number;
  ubicacion: string;
  
  // Económico
  costeUnitario: number;
  pvp: number;
  margen: number;
  valorStock: number;
  
  // Proveedor
  proveedorPrincipal: string;
  proveedorId: string;
  leadTime: number;
  puntoReorden: number;
  
  // Análisis
  rotacion: number;
  consumoMedio: number;
  ultimasCompras: any[];
  escandallo?: any[];
}

interface ModalDetalleArticuloProps {
  open: boolean;
  onClose: () => void;
  articulo: ArticuloDetalle | null;
}

export function ModalDetalleArticulo({ open, onClose, articulo }: ModalDetalleArticuloProps) {
  const [seccionExpandida, setSeccionExpandida] = useState({
    informacionBasica: true,
    stock: true,
    ubicacion: false,
    economico: true,
    escandallo: false,
    proveedor: true,
    historial: false,
    analisis: true
  });

  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEditados, setDatosEditados] = useState(articulo);

  if (!articulo) return null;

  const toggleSeccion = (seccion: keyof typeof seccionExpandida) => {
    setSeccionExpandida(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  const handleGuardar = () => {
    console.log('🔌 EVENTO: ACTUALIZAR_ARTICULO', {
      articuloId: articulo.id,
      datosAnteriores: articulo,
      datosNuevos: datosEditados,
      timestamp: new Date()
    });
    
    toast.success('Artículo actualizado', {
      description: `Los cambios en ${articulo.nombre} se han guardado correctamente`
    });
    
    setModoEdicion(false);
  };

  const calcularSugerenciaCompra = () => {
    const cantidad = Math.max(0, articulo.optimo - articulo.disponible);
    return {
      cantidad,
      coste: cantidad * articulo.costeUnitario,
      necesaria: articulo.disponible < articulo.puntoReorden
    };
  };

  const sugerencia = calcularSugerenciaCompra();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {articulo.nombre}
              </DialogTitle>
              <DialogDescription>
                Código: {articulo.codigo}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {!modoEdicion ? (
                <Button 
                  variant="outline"
                  onClick={() => setModoEdicion(true)}
                >
                  Editar
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setModoEdicion(false);
                      setDatosEditados(articulo);
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

        <div className="space-y-4 mt-4">
          {/* 1. INFORMACIÓN BÁSICA */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('informacionBasica')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Información Básica
                </span>
              </div>
              {seccionExpandida.informacionBasica ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.informacionBasica && (
              <div className="p-4 pt-0 grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del artículo</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.nombre : articulo.nombre} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, nombre: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label>Código</Label>
                  <Input value={articulo.codigo} disabled />
                </div>
                <div>
                  <Label>Categoría</Label>
                  <Input 
                    value={modoEdicion ? datosEditados?.categoria : articulo.categoria} 
                    disabled={!modoEdicion}
                    onChange={(e) => modoEdicion && setDatosEditados(prev => prev ? {...prev, categoria: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label>Marca</Label>
                  <Input 
                    value={articulo.marca || 'N/A'} 
                    disabled={!modoEdicion}
                  />
                </div>
                <div>
                  <Label>PDV</Label>
                  <Input 
                    value={articulo.pdv || 'N/A'} 
                    disabled={!modoEdicion}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. STOCK */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('stock')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Stock
                </span>
              </div>
              {seccionExpandida.stock ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.stock && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Disponible</p>
                    <p className="text-2xl font-bold text-blue-600">{articulo.disponible}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Comprometido</p>
                    <p className="text-2xl font-bold text-orange-600">{articulo.comprometido}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Mínimo</p>
                    <p className="text-2xl font-bold text-red-600">{articulo.minimo}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Óptimo</p>
                    <p className="text-2xl font-bold text-green-600">{articulo.optimo}</p>
                  </div>
                </div>
                
                {modoEdicion && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stock Mínimo</Label>
                      <Input 
                        type="number" 
                        value={datosEditados?.minimo || 0}
                        onChange={(e) => setDatosEditados(prev => prev ? {...prev, minimo: Number(e.target.value)} : null)}
                      />
                    </div>
                    <div>
                      <Label>Stock Óptimo</Label>
                      <Input 
                        type="number" 
                        value={datosEditados?.optimo || 0}
                        onChange={(e) => setDatosEditados(prev => prev ? {...prev, optimo: Number(e.target.value)} : null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. UBICACIÓN */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('ubicacion')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Ubicación
                </span>
              </div>
              {seccionExpandida.ubicacion ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.ubicacion && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ubicación</Label>
                    <Input 
                      value={articulo.ubicacion} 
                      disabled={!modoEdicion}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. INFORMACIÓN ECONÓMICA */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('economico')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Información Económica
                </span>
              </div>
              {seccionExpandida.economico ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.economico && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Coste Unitario</Label>
                    <Input 
                      value={`€${articulo.costeUnitario.toFixed(2)}`} 
                      disabled={!modoEdicion}
                    />
                  </div>
                  <div>
                    <Label>PVP</Label>
                    <Input 
                      value={`€${articulo.pvp.toFixed(2)}`} 
                      disabled={!modoEdicion}
                    />
                  </div>
                  <div>
                    <Label>Margen Bruto</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={`€${articulo.margen.toFixed(2)}`} 
                        disabled 
                      />
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {((articulo.margen / articulo.pvp) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Valor Stock Total</Label>
                    <Input 
                      value={`€${articulo.valorStock.toFixed(2)}`} 
                      disabled 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. ESCANDALLO */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('escandallo')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Escandallo (Composición)
                </span>
              </div>
              {seccionExpandida.escandallo ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.escandallo && (
              <div className="p-4 pt-0">
                {articulo.escandallo && articulo.escandallo.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Componente</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Coste</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articulo.escandallo.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{item.nombre}</TableCell>
                          <TableCell className="text-right">{item.cantidad} {item.unidad}</TableCell>
                          <TableCell className="text-right">€{item.coste.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay escandallo definido para este artículo
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 6. PROVEEDOR Y REABASTECIMIENTO */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('proveedor')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Proveedor y Reabastecimiento
                </span>
              </div>
              {seccionExpandida.proveedor ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.proveedor && (
              <div className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Proveedor Principal</Label>
                    <Input value={articulo.proveedorPrincipal} disabled={!modoEdicion} />
                  </div>
                  <div>
                    <Label>Lead Time (días)</Label>
                    <Input value={articulo.leadTime} disabled={!modoEdicion} />
                  </div>
                  <div>
                    <Label>Punto de Reorden (ROP)</Label>
                    <Input 
                      value={articulo.puntoReorden} 
                      disabled 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ROP = Lead Time × Consumo Medio
                    </p>
                  </div>
                  <div>
                    <Label>Consumo Medio Diario</Label>
                    <Input 
                      value={articulo.consumoMedio.toFixed(2)} 
                      disabled 
                    />
                  </div>
                </div>

                {/* Sugerencia de Compra */}
                {sugerencia.necesaria && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-amber-900 mb-2">
                          Sugerencia de Compra Automática
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Cantidad Sugerida</p>
                            <p className="font-bold text-amber-900">{sugerencia.cantidad} uds</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Coste Estimado</p>
                            <p className="font-bold text-amber-900">€{sugerencia.coste.toFixed(2)}</p>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              className="bg-amber-600 hover:bg-amber-700 w-full"
                              onClick={() => {
                                console.log('🔌 EVENTO: CREAR_PEDIDO_AUTOMATICO', {
                                  articuloId: articulo.id,
                                  proveedorId: articulo.proveedorId,
                                  cantidad: sugerencia.cantidad,
                                  costeEstimado: sugerencia.coste,
                                  timestamp: new Date()
                                });
                                toast.success('Pedido creado', {
                                  description: 'Se ha generado un borrador de pedido'
                                });
                              }}
                            >
                              Crear Pedido
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. HISTORIAL DE COMPRAS */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('historial')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-pink-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Historial de Compras
                </span>
              </div>
              {seccionExpandida.historial ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.historial && (
              <div className="p-4 pt-0">
                {articulo.ultimasCompras && articulo.ultimasCompras.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articulo.ultimasCompras.map((compra: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{compra.fecha}</TableCell>
                          <TableCell>{compra.proveedor}</TableCell>
                          <TableCell className="text-right">{compra.cantidad}</TableCell>
                          <TableCell className="text-right">€{compra.precio.toFixed(2)}</TableCell>
                          <TableCell className="text-right">€{compra.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No hay compras registradas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 8. ANÁLISIS Y RECOMENDACIONES */}
          <div className="border rounded-lg">
            <button
              onClick={() => toggleSeccion('analisis')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                <span className="font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Análisis y Recomendaciones
                </span>
              </div>
              {seccionExpandida.analisis ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {seccionExpandida.analisis && (
              <div className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Rotación</p>
                    <p className="text-2xl font-bold text-cyan-600">{articulo.rotacion.toFixed(1)}x</p>
                    <p className="text-xs text-gray-500 mt-1">por mes</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Días de Stock</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {articulo.consumoMedio > 0 ? Math.round(articulo.disponible / articulo.consumoMedio) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">días restantes</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tendencia</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <span className="text-xl font-bold text-gray-900">+12%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">vs. mes anterior</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
